import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Paiement.css';

const Paiement = () => {
  const [commission, setCommission] = useState('');

  const [caution, setCaution] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [locataireInfo, setLocataireInfo] = useState(null);
  const [montantLocation, setMontantLocation] = useState(''); // Ajout de l'état pour le montant de la location
  const [error, setError] = useState('');
  const [totalDue, setTotalDue] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paiements, setPaiements] = useState(Array(12).fill().map(() => ({ id: null, montant: '', etat: '' })));
  const [successMessage, setSuccessMessage] = useState('');
// Effet pour recalculer la commission lorsque le montant est modifié
useEffect(() => {
  if (montantLocation !== '' && commission === '') {
    calculateCommission();
  }
}, [montantLocation]);


// Fonction pour calculer la commission
const calculateCommission = () => {
  const montant = parseFloat(montantLocation);
  const commissionAmount = montant * 0.15; // Calcul de la commission (15% du montant)
  setCommission(commissionAmount);
};



  useEffect(() => {
    if (locataireInfo) {
      fetchPreviousPayments(locataireInfo.id);
      setMontantLocation(locataireInfo.montantLocation); // Mettre à jour le montant de la location
    }
  }, [locataireInfo]);

  // Fonction pour récupérer les paiements précédents du locataire
  const fetchPreviousPayments = async (locataire_id) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/paiements/${locataire_id}`);
      console.log("Données récupérées des paiements précédents :", response.data);
      // Initialisation des valeurs de paiements avec les données précédentes
      const initialPaiements = Array(12).fill().map((_, index) => {
        const paiement = response.data.find(p => p.mois === mois[index]);
        return {
          id: paiement ? paiement.id : null,
          montant: paiement ? paiement.montant : '',
          etat: paiement ? paiement.etat : ''
        };
      });
      setPaiements(initialPaiements);
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements précédents:', error);
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  // Fonction pour rechercher le locataire par numéro de téléphone
  const searchLocataire = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/locataires/${phoneNumber}`);
      if (response.data) {
        console.log(response.data)
        setLocataireInfo(response.data);
        setError('');
      } else {
        setLocataireInfo(null);
        setError('Ce locataire n\'existe pas');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du locataire:', error);
      setLocataireInfo(null);
      setError('Erreur lors de la recherche du locataire');
    }
  };

  const handleTotalDueChange = (e) => {
    setTotalDue(e.target.value);
  };
  
  

// Fonction pour gérer le changement de montant payé
const handleAmountPaidChange = (e) => {
  const amount = e.target.value;
  setAmountPaid(amount);
};


  const handleCautionChange = (e) => {
    setCaution(e.target.value);
  };

  const handleModePaiementChange = (e) => {
    setModePaiement(e.target.value);
  };

  // Fonction pour gérer le changement de paiement pour chaque mois
  const handlePaiementChange = async (index, field, value) => {
    const newPaiements = [...paiements];
    newPaiements[index][field] = value;
    setPaiements(newPaiements);

    if (locataireInfo) {
      const paiementId = newPaiements[index].id;

      if (paiementId) {
        // Mettre à jour le paiement existant
        await updatePaiement(paiementId, {
          locataire_id: locataireInfo.id,
          mois: mois[index],
          montant: newPaiements[index].montant,
          etat: newPaiements[index].etat
        });
      }
    }
  };

  // Fonction pour mettre à jour un paiement
  const updatePaiement = async (paiementId, updatedPaiement) => {
    try {
      await axios.put(`http://localhost:3001/api/paiements/${paiementId}`, updatedPaiement);
      console.log('Paiement mis à jour avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
    }
  };

  // Fonction pour soumettre les paiements
  const handlePaiementSubmit = async () => {
    try {
      for (let index = 0; index < paiements.length; index++) {
        const { id, montant, etat } = paiements[index];
  
        if (montant !== '' || etat !== '') {
          if (id) {
            await axios.put(`http://localhost:3001/api/paiements/${id}`, {
              locataire_id: locataireInfo.id,
              mois: mois[index],
              montant: montant,
              etat: etat,
              // Ici, vérifiez l'état pour déterminer si la caution et le mode de paiement doivent être inclus
              ...(etat === 'reste à payer' ? {} : { caution: caution, mode_paiement: modePaiement })
            });
            setSuccessMessage('Paiements mis à jour avec succès !');
          } else {
            const response = await axios.post('http://localhost:3001/api/paiements', {
              locataire_id: locataireInfo.id,
              mois: mois[index],
              montant: montant,
              etat: etat,
              // Même logique ici pour déterminer si la caution et le mode de paiement doivent être inclus
              ...(etat === 'reste à payer' ? {} : { caution: caution, mode_paiement: modePaiement })
            });
            paiements[index].id = response.data.id;

            // Après avoir enregistré le paiement, enregistrer le versement
            const commissionAmount = montant * 0.15;
            const montantVersement = montant - commissionAmount;

            await axios.post('http://localhost:3001/api/versements', {
              locataire_id: locataireInfo.id,
              nom_proprietaire: locataireInfo.nomProprietaire,
              montant: montantVersement,
              date_versement: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
  
      console.log('Paiements enregistrés avec succès');
      setSuccessMessage('Paiements enregistrés avec succès !');
      setPaiements(Array(12).fill().map(() => ({ id: null, montant: '', etat: '' })));
      setError('');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des paiements:', error);
      setError('Erreur lors de l\'enregistrement des paiements');
    }
  };
  
  // Tableau contenant les noms des mois
  const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  return (
    <div>
      <h2>Saisir un Paiement</h2>
      <div>
        <label htmlFor="phoneNumber">Numéro de téléphone du locataire:</label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          required
        />
        <button onClick={searchLocataire}>Rechercher</button>
      </div>
      {error && (
        <div className="error-dialog">
          <p>{error}</p>
          <button onClick={() => setError('')}>Fermer</button>
        </div>
      )}
      {locataireInfo && (
        <div>
          <h3>Informations du locataire:</h3>
          <p>Nom et prenom du proprietaire: {locataireInfo.nomProprietaire} {locataireInfo.prenomProprietaire}</p>
          <p>Nom: {locataireInfo.name}</p>
          <p>Email: {locataireInfo.email}</p>
          <p>Montant de la location : {locataireInfo.montantLocation}</p>
          <p>Service de la location : {locataireInfo.service}</p>
          <p>Adresse du locataire :{locataireInfo.adressePropriete}</p>
          
        </div>
      )}
      <hr />
      {locataireInfo && (
        <div>
          <h3>Saisir le paiement pour chaque mois</h3>
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>Montant</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {mois.map((mois, index) => (
                <tr key={index}>
                  <td>{mois}</td>
                  <td>
                    <input
                      type="number"
                      value={paiements[index].montant}
                      onChange={(e) => handlePaiementChange(index, 'montant', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={paiements[index].etat}
                      onChange={(e) => handlePaiementChange(index, 'etat', e.target.value)}
                    >
                      <option value="">Sélectionnez</option>
                      <option value="payé">Payé</option>
                      <option value="reste à payer">Reste à payer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <h3>Finaliser Paiement</h3>
            <div>
              <label htmlFor="caution">Caution:</label>
              <input
                type="number"
                id="caution"
                value={caution}
                onChange={handleCautionChange}
              />
            </div>
            <div>
              <label htmlFor="commission">Commission (15%):</label>
              <input
                type="number"
                id="commission"
                value={commission}
                disabled // La commission est calculée automatiquement, donc l'entrée est désactivée
              />
            </div>
            <div>
              <label htmlFor="modePaiement">Mode de Paiement:</label>
              <select
                id="modePaiement"
                value={modePaiement}
                onChange={handleModePaiementChange}
              >
                <option value="">Sélectionnez</option>
                <option value="wave">Wave</option>
                <option value="orange_money">Orange Money</option>
                <option value="carte_bancaire">Carte Bancaire</option>
              </select>
            </div>
            <div>
              <label htmlFor="totalDue">Reste à payer (Total):</label>
              <input
                type="number"
                id="totalDue"
                value={totalDue}
                onChange={handleTotalDueChange}
              />
            </div>
            <div>
              <label htmlFor="amountPaid">Montant réglé:</label>
              <input
                type="number"
                id="amountPaid"
                value={amountPaid}
                onChange={handleAmountPaidChange}
              />
            </div>
          </div>
          <button onClick={handlePaiementSubmit}>Ajouter Paiement</button>
        </div>
      )}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Paiement;
