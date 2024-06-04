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


// Route pour ajouter un locataire
app.post('/api/locataires', (req, res) => {
    const { name, email, phoneNumber, entryDate, proprietaire, montantLocation, adresse, service } = req.body;
    
    // Vérification si l'email existe déjà
    db.query('SELECT * FROM locataires WHERE email = ?', email, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Veuillez renseigner un autre email, cet email existe déjà.' });
        }

        // Vérification si le numéro de téléphone existe déjà
        db.query('SELECT * FROM locataires WHERE phoneNumber = ?', phoneNumber, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (rows.length > 0) {
                return res.status(400).json({ error: 'Veuillez renseigner un autre numéro de téléphone, ce numéro de téléphone existe déjà.' });
            }

            // Insertion du locataire si l'email et le numéro de téléphone sont uniques
            const sql = 'INSERT INTO locataires (name, email, phoneNumber, entryDate, proprietaire, montantLocation, adresse, service) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [name, email, phoneNumber, entryDate, proprietaire,montantLocation, adresse, service], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.status(201).send('Locataire ajouté');
            });
        });
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

// Route pour obtenir le nombre de propriétés
app.get('/api/propriete/count', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM propriete';
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json({ total: result[0].total });
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

app.delete('/api/proprietaires/:id', (req, res) => {
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
