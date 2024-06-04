const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// Route pour supprimer un locataire
app.delete('/api/locataires/:id', (req, res) => {
    const locataireId = req.params.id;
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

app.get('/quittance/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT SUM(amount) as totalAmount
        FROM invoices
        WHERE user_id = ? AND paid = TRUE
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête:', err);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }

        const totalAmount = results[0].totalAmount;

        res.json({
            userId: userId,
            quittance: totalAmount
        });
    });
});

app.post('/paiement', (req, res) => {
    // l'admin envoie un formulaire contenant les champs suivant:
    // Locataire, montant paiement, mois du paiement, mode de paiement(Wave, OM, Espece...etc)
    const form = req.body;

    query = `INSERT INTO Paiement (Locataire, MoisPaiement, Montant, Mode) VALUES (${form.locataire}, ${form.mois}, ${form.montant}, ${form.mode})`;

    db.query(query, (err, results) => {
        if(err) {
            console.error("Erreur: " + err);
            return res.status(500).json({error: 'Erreur interne 501'});
        }

        res.json(
            {"succes": "Paiement ajoute"});
    })
});
