const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const Locataire = require('./src/components/Locataire/Locataire'); // Importez le fichier Locataire

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Configurer la connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'root', 
    database: 'IMMOBILIER' 
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connecté à la base de données MySQL');
});

// Secret key for JWT
const JWT_SECRET = 'a623ef4e24ef45c8fbcdd6ed29dffb57a6232f848a7fc940cdc691fe663cc3b99f87b6fee55c8aa1e853cb77ea3f8f544e0116718f9b9b4f1e52aa0e0091f54c';

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = results[0];
        if (password !== user.password) {
            return res.status(401).json({ auth: false, token: null, error: 'Mot de passe invalide' });
        }
       

        const token = jwt.sign({ id: user.id  , role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        // Si la connexion réussit
res.status(200).json({ auth: true, token, username: user.username , role: user.role,  });

    });
});

const verifyJWT = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({ auth: false, message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).json({ auth: false, message: 'Failed to authenticate token' });
        }
        console.log('Token vérifié, utilisateur ID:', decoded.id, 'Rôle:', decoded.role);
        req.userId = decoded.id;
        req.user = { role: decoded.role };  // Assurez-vous que le rôle est bien ajouté à req.user
        next();
    });
};
// Exemple de calcul de date d'échéance pour chaque paiement
app.post('/api/paiements', (req, res) => {
    const { locataire_id, mois, montant, etat, caution, mode_paiement } = req.body;
    const datePaiement = new Date(); // Utilisation de la date actuelle, ou récupération de la date de paiement depuis req.body
    let dateEcheance;

    // Calcul de la date d'échéance basée sur le mois
    const moisCorrespondance = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };

    if (moisCorrespondance.hasOwnProperty(mois.toLowerCase())) {
        const moisIndex = moisCorrespondance[mois.toLowerCase()];
        if (moisIndex >= 0 && moisIndex <= 10) {
            dateEcheance = new Date(datePaiement.getFullYear(), moisIndex + 1, 1);
        } else {
            // Pour décembre, la date d'échéance sera le 1er janvier de l'année suivante
            dateEcheance = new Date(datePaiement.getFullYear() + 1, 0, 1);
        }
    } else {
        return res.status(400).json({ error: 'Mois invalide' });
    }

    // Insertion du paiement dans la base de données
    const query = 'INSERT INTO Paiements (locataire_id, mois, montant, etat, date_paiement, caution, mode_paiement, date_echeance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [locataire_id, mois, montant, etat, datePaiement, caution, mode_paiement, dateEcheance], (err, result) => {
        if (err) {
            console.error('Erreur lors de l\'insertion du paiement:', err);
            res.status(500).send('Erreur lors de l\'enregistrement du paiement');
            return;
        }
        console.log('Paiement enregistré avec succès');
        res.status(200).send('Paiement enregistré avec succès');
    });
});

// Route GET pour récupérer les paiements en retard
app.get('/api/arrieres', async (req, res) => {
    try {
        const query = `
            SELECT l.id, l.name, l.email, p.montant, p.date_paiement, p.date_echeance, p.mois
            FROM Locataires l
            JOIN Paiements p ON l.id = p.locataire_id
            WHERE p.date_echeance < CURDATE() AND p.etat != 'payé'
        `;
        db.query(query, (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération des arriérés:', err);
                res.status(500).send('Erreur lors de la récupération des arriérés');
                return;
            }
            res.status(200).json(result);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des arriérés:', error);
        res.status(500).send('Erreur lors de la récupération des arriérés');
    }
});

// Exemple de route protégée
app.get('/api/me', verifyJWT, (req, res) => {
    const query = 'SELECT username, role FROM users WHERE id = ?';
    db.query(query, [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        res.setHeader('Content-Type', 'application/json'); // Définition du type de contenu JSON
        res.json(user);
    });
});


app.post('/api/locataires', (req, res) => {
    const { name, email, phoneNumber, entryDate, proprietaire_id, proprieteLoueeId, montantLocation, service } = req.body;
    console.log('Requête POST pour ajouter un locataire reçue');
    console.log('Paramètres reçus:', req.body);

    // Vérification si l'email existe déjà
    db.query('SELECT * FROM locataires WHERE email = ?', [email], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email:', err);
            return res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'email' });
        }
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé, veuillez en choisir un autre.' });
        }

        // Vérification si le numéro de téléphone existe déjà
        db.query('SELECT * FROM locataires WHERE phoneNumber = ?', [phoneNumber], (err, rows) => {
            if (err) {
                console.error('Erreur lors de la vérification du numéro de téléphone:', err);
                return res.status(500).json({ error: 'Erreur serveur lors de la vérification du numéro de téléphone' });
            }
            if (rows.length > 0) {
                return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé, veuillez en choisir un autre.' });
            }

            // Insertion du locataire si l'email et le numéro de téléphone sont uniques
            const sql = 'INSERT INTO locataires (name, email, phoneNumber, entryDate, proprietaire_id, proprieteLoueeId, montantLocation, service) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [name, email, phoneNumber, entryDate, proprietaire_id, proprieteLoueeId, montantLocation, service], (err, result) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion du locataire:', err);
                    return res.status(500).json({ error: 'Erreur serveur lors de l\'insertion du locataire' });
                }
                res.status(201).send('Locataire ajouté avec succès');
            });
        });
    });
});


app.get('/api/locataires/:phoneNumber', (req, res) => {
    const phoneNumber = req.params.phoneNumber;

    const sql = `
        SELECT 
            l.id,
            l.name,
            l.email,
            l.montantLocation,
            l.service,
            p.adresse AS adressePropriete,
            pr.nom AS nomProprietaire,
            pr.prenom AS prenomProprietaire
        FROM locataires l
        LEFT JOIN propriete p ON l.proprieteLoueeId = p.id
        LEFT JOIN proprietaires pr ON l.proprietaire_id = pr.id
        WHERE l.phoneNumber = ?
    `;
    
    db.query(sql, [phoneNumber], (err, result) => {
        if (err) {
            console.error('Erreur lors de la requête SQL:', err);
            return res.status(500).send(err);
        }

        if (result.length === 0) {
            return res.status(404).send("Locataire non trouvé");
        }

        const { id, name, email, montantLocation, service, adressePropriete, nomProprietaire, prenomProprietaire } = result[0];
        res.json({ id, name, email, montantLocation, service, adressePropriete, nomProprietaire, prenomProprietaire });
    });
});




// Route pour obtenir les locataires
app.get('/api/locataires', (req, res) => {
    const sql = 'SELECT * FROM locataires';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});
// Route pour obtenir le nombre de locataires
app.get('/api/locataires/count', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM locataires';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ total: result[0].total });
    });
});
//route pour supprimer un locataire 
// Route pour supprimer un locataire
app.delete('/api/locataires/:id', verifyJWT, (req, res) => {
    const locataireId = req.params.id;
    
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à effectuer cette action.' });
    }
    
    const sql = 'DELETE FROM locataires WHERE id = ?';
    db.query(sql, locataireId, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send('Locataire supprimé');
    });
});




app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
// Route pour modifier un locataire
app.put('/api/locataires/:id', (req, res) => {
    const locataireId = req.params.id;
    const { name, email, phoneNumber, entryDate, proprietaire, montantLocation, adresse, service } = req.body;
    
    // Vérification si l'id du locataire est valide
    db.query('SELECT * FROM locataires WHERE id = ?', locataireId, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Locataire non trouvé' });
        }

        // Mettre à jour les données du locataire
        const sql = 'UPDATE locataires SET name = ?, email = ?, phoneNumber = ?, entryDate = ?, proprietaire = ?, montantLocation = ?, adresse = ?, service = ? WHERE id = ?';
        db.query(sql, [name, email, phoneNumber, entryDate, proprietaire, montantLocation, adresse, service, locataireId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.status(200).send('Locataire modifié');
        });
    });
});
app.post('/api/proprietaires', (req, res) => {
    const { nom, prenom, adresse, phoneNumber, email, propriete } = req.body;

    db.query('SELECT * FROM proprietaires WHERE email = ?', [email], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Veuillez renseigner un autre email, cet email existe déjà.' });
        }

        db.query('SELECT * FROM proprietaires WHERE phoneNumber = ?', [phoneNumber], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (rows.length > 0) {
                return res.status(400).json({ error: 'Veuillez renseigner un autre numéro de téléphone, ce numéro de téléphone existe déjà.' });
            }

            const sql = 'INSERT INTO proprietaires (nom, prenom, adresse, phoneNumber, email, PropertiesCount) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sql, [nom, prenom, adresse, phoneNumber, email, propriete.length], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                const proprietaireId = result.insertId;
                const propertyQueries = propriete.map(property => {
                    return new Promise((resolve, reject) => {
                        const propertySql = 'INSERT INTO propriete (proprietaireId, adresse, surface, valeur,service) VALUES (?, ?, ?, ?,?)';
                        db.query(propertySql, [proprietaireId, property.adresse, property.surface, property.valeur,property.service], (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });

                Promise.all(propertyQueries)
                    .then(() => res.status(201).send('Propriétaire et propriétés ajoutés'))
                    .catch(err => res.status(500).json({ error: err }));
            });
        });
    });
});

app.get('/api/proprietaires', (req, res) => {
    const sql = `
        SELECT p.*, (
            SELECT COUNT(*) FROM propriete pr WHERE pr.proprietaireId = p.id
        ) AS PropertiesCount
        FROM proprietaires p
    `;
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});


// Route pour obtenir la liste des propriétés disponibles
app.get('/api/propriete', (req, res) => {
    const proprietaireId = req.query.proprietaireId;
    let sql = 'SELECT * FROM propriete';
    if (proprietaireId) {
        sql += ` WHERE proprietaireId = ${proprietaireId}`;
    }
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(result);
    });
});






app.get('/api/proprietaires/count', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM proprietaires';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ total: result[0].total });
    });
});

app.delete('/api/proprietaires/:id',verifyJWT, (req, res) => {
    const proprietaireId = req.params.id;
    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à effectuer cette action.' });
    }

    const deletePropertiesSql = 'DELETE FROM propriete WHERE proprietaireId = ?';
    db.query(deletePropertiesSql, [proprietaireId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }

        const deleteOwnerSql = 'DELETE FROM proprietaires WHERE id = ?';
        db.query(deleteOwnerSql, [proprietaireId], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(200).send('Propriétaire et propriétés supprimés');
        });
    });
});


app.put('/api/proprietaires/:id', (req, res) => {
    const proprietaireId = req.params.id;
    const { nom, prenom, adresse, phoneNumber, email, propriete } = req.body;

    db.query('SELECT * FROM proprietaires WHERE id = ?', [proprietaireId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Propriétaire non trouvé' });
        }

        const sql = 'UPDATE proprietaires SET nom = ?, prenom = ?, adresse = ?, phoneNumber = ?, email = ? WHERE id = ?';
        db.query(sql, [nom, prenom, adresse, phoneNumber, email, proprietaireId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            const deletePropertiesSql = 'DELETE FROM propriete WHERE proprietaireId = ?';
            db.query(deletePropertiesSql, [proprietaireId], (err) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }

                const propertyQueries = propriete.map(property => {
                    return new Promise((resolve, reject) => {
                        const propertySql = 'INSERT INTO propriete (proprietaireId, adresse, surface, valeur) VALUES (?, ?, ?, ?)';
                        db.query(propertySql, [proprietaireId, property.adresse, property.surface, property.valeur], (err, result) => {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });

                Promise.all(propertyQueries)
                    .then(() => {
                        const newPropertiesCount = propriete.length;
                        const updatePropertiesCountSql = 'UPDATE proprietaires SET PropertiesCount = ? WHERE id = ?';
                        db.query(updatePropertiesCountSql, [newPropertiesCount, proprietaireId], (err, result) => {
                            if (err) {
                                return res.status(500).json({ error: err });
                            }
                            res.status(200).send('Propriétaire et propriétés modifiés');
                        });
                    })
                    .catch(err => res.status(500).json({ error: err }));
            });
        });
    });
});
//r le nombre de propriétés
app.get('/api/propriete/count', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM propriete';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ total: result[0].total });
    });
});
app.get('/api/paiements/:locataire_id', (req, res) => {
    const locataire_id = req.params.locataire_id;

    const query = 'SELECT * FROM Paiements WHERE locataire_id = ?';
    db.query(query, [locataire_id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des paiements précédents:', err);
            res.status(500).send('Erreur lors de la récupération des paiements précédents');
            return;
        }
        res.status(200).json(results);
    });
});

// API pour mettre à jour un paiement existant
app.put('/api/paiements/:id', (req, res) => {
    const paiementId = req.params.id;
    const { locataire_id, mois, montant, etat } = req.body;

    const updateQuery = `
        UPDATE Paiements 
        SET locataire_id = ?, mois = ?, montant = ?, etat = ?
        WHERE id = ?
    `;

    db.query(updateQuery, [locataire_id, mois, montant, etat, paiementId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du paiement:', err);
            res.status(500).send('Erreur lors de la mise à jour du paiement');
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send('Paiement non trouvé');
        } else {
            res.status(200).json({ id: paiementId, locataire_id, mois, montant, etat });
        }
    });
});
app.get('/api/rapport/mensuel', async (req, res) => {
    const year = req.query.year;
    try {
      const query = 'SELECT mois, SUM(montant) AS total_encaisse FROM Paiements WHERE YEAR(date_paiement) = ? GROUP BY mois';
      db.query(query, [year], (err, result) => {
        if (err) {
          console.error('Erreur lors de la récupération du rapport mensuel:', err);
          res.status(500).send('Erreur lors de la récupération du rapport mensuel');
          return;
        }
        res.status(200).json(result);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du rapport mensuel:', error);
      res.status(500).send('Erreur lors de la récupération du rapport mensuel');
    }
  });
  // Exemple de route GET pour récupérer les paiements en retard d'un locataire spécifique
app.get('/api/arrieres/:locataireId', async (req, res) => {
    const locataireId = req.params.locataireId;
    try {
        const query = `
            SELECT l.id, l.name, l.email, p.montant, p.date_paiement, p.date_echeance, p.mois
            FROM Locataires l
            JOIN Paiements p ON l.id = p.locataire_id
            WHERE l.id = ? AND p.date_echeance < CURDATE() AND p.etat != 'payé'
        `;
        db.query(query, [locataireId], (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération des arriérés:', err);
                res.status(500).json({ error: 'Erreur lors de la récupération des arriérés.' });
                return;
            }
            res.status(200).json(result);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des arriérés:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des arriérés.' });
    }
});
app.get('/api/arrieres/count', (req, res) => {
    const query = `
      SELECT COUNT(*) AS total
      FROM Paiements
      WHERE date_echeance < CURDATE() AND etat != 'payé'
    `;
    db.query(query, (err, result) => {
      if (err) {
        console.error('Erreur lors de la récupération du nombre de paiements en retard:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération du nombre de paiements en retard' });
        return;
      }
      console.log('SQL Result:', result); // Ajouté pour debug
      res.json({ total: result[0].total });
    });
});
