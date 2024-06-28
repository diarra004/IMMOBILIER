import React, { useState,useEffect } from 'react';
import './Quittance.css';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const Quittance = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [locataireInfo, setLocataireInfo] = useState(null);
  const [paiements, setPaiements] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [pdfButtonClicked, setPdfButtonClicked] = useState(false);
  const [arrieres, setArrieres] = useState([]);

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleMonthChange = (e) => {
    const selected = e.target.value;
    setSelectedMonth(selected);
    const payment = paiements.find(p => p.mois === selected);
    setSelectedPayment(payment);
  };

  const searchLocataire = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/locataires/${phoneNumber}`);
      if (response.data) {
        setLocataireInfo(response.data);
        fetchPaiements(response.data.id);
        setErrorMessage('');
      } else {
        setLocataireInfo(null);
        setPaiements([]);
        setErrorMessage('Ce locataire n\'existe pas.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du locataire:', error);
      setLocataireInfo(null);
      setPaiements([]);
      setErrorMessage('Erreur lors de la recherche du locataire.');
    }
  };
  useEffect(() => {
    fetchArrieres();
}, [selectedPayment]);
  const fetchArrieres = async () => {
    try {
        if (!locataireInfo) return;

        const response = await axios.get(`http://localhost:3001/api/arrieres/${locataireInfo.id}`);
        setArrieres(response.data);
    } catch (error) {
        console.error('Erreur lors de la récupération des arriérés:', error);
        setArrieres([]);
        setErrorMessage('Erreur lors de la récupération des arriérés.');
    }
};

  const fetchPaiements = async (locataireId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/paiements/${locataireId}`);
      setPaiements(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      setPaiements([]);
      setErrorMessage('Erreur lors de la récupération des paiements.');
    }
  };

  const generateQuittancePDF = () => {
    try {
      if (!locataireInfo) {
        setErrorMessage('Veuillez d\'abord rechercher un locataire.');
        return;
      }

      if (!selectedMonth) {
        setErrorMessage('Veuillez sélectionner un mois.');
        return;
      }

      if (!selectedPayment) {
        setErrorMessage('Aucun paiement trouvé pour le mois sélectionné.');
        return;
      }

      const doc = new jsPDF();

      // Titre du document centré en haut avec l'adresse du locataire
      doc.setFontSize(18);
      doc.text('QUITTANCE DE LOYER', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Adresse du locataire: ${locataireInfo.adressePropriete}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      doc.text(`Service: ${locataireInfo.service}`, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

      // Tableau des informations : Propriétaire, Nom du locataire et Date du paiement
      const tableInfo = [
        ['Propriétaire', 'Nom du locataire', 'Date du paiement'],
        [`${locataireInfo.nomProprietaire} ${locataireInfo.prenomProprietaire}`, locataireInfo.name, selectedPayment.date_paiement],
      ];
      doc.autoTable({
        startY: 40,
        body: tableInfo,
        theme: 'grid', // Utilisation du thème 'grid' pour afficher les bordures
        headStyles: { fillColor: [192, 192, 192] }, // Gris pour l'entête
        styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: {},
          2: {},
        },
        // Fonction didDrawCell pour dessiner les bordures de chaque cellule
        didDrawCell: (data) => {
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
        },
      });

      // Tableau des détails du paiement : Mois, Montant payé
      const tablePaiement = [
        ['Détails du paiement', 'Montant', 'Caution', 'Mode de paiement'],
        [`${selectedPayment.mois}`, `${selectedPayment.montant} FCFA`, `${selectedPayment.caution}`, `${selectedPayment.mode_paiement}`],
      ]
      doc.autoTable({
        startY: doc.previousAutoTable.finalY + 10,
        body: tablePaiement,
        theme: 'grid', // Utilisation du thème 'grid' pour afficher les bordures
        headStyles: { fillColor: [192, 192, 192] }, // Gris pour l'entête
        styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: {},
        },
        // Fonction didDrawCell pour dessiner les bordures de chaque cellule
        didDrawCell: (data) => {
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
        },
      });
     // Tableau des arriérés spécifiques au locataire
if (arrieres.length > 0) {
  const tableArrieres = [
    [{ content: 'ARRIÉRÉS', colSpan: 3, styles: { halign: 'center', fillColor: [192, 192, 192] } }],
    ['Mois', 'Montant de retard', 'Date d\'échéance'],
    ...arrieres.map(arriere => [
      arriere.mois,
      `${arriere.montant} FCFA`,
      arriere.date_echeance,
    ])
  ];

  doc.autoTable({
    startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 40,
    body: tableArrieres,
    theme: 'grid', // Utilisation du thème 'grid' pour afficher les bordures
    headStyles: { fillColor: [192, 192, 192] }, // Gris pour l'entête
    styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: {},
      2: {},
    },
    // Fonction didDrawCell pour dessiner les bordures de chaque cellule
    didDrawCell: (data) => {
      doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
    },
  });
}

    


      // Sauvegarde du document
      doc.save(`Quittance_${locataireInfo.name}_${selectedMonth}.pdf`);

      setSuccessMessage('Quittance générée avec succès !');
      setErrorMessage('');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la génération de la quittance de loyer en PDF:', error);
      setErrorMessage('Erreur lors de la génération de la quittance de loyer en PDF.');
    }
  };
 
    return (
    <div className="quittance-container">
      <h1>Génération de Quittance de Loyer</h1>
      <div className="form-group">
        <label htmlFor="phoneNumber">Numéro de Téléphone du Locataire:</label>
        <input type="text" id="phoneNumber" value={phoneNumber} onChange={handlePhoneNumberChange} />
        <button onClick={searchLocataire}>Rechercher</button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {locataireInfo && (
        <div>
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div id="quittance-content">
            <div className="company-info">
              <h3>Informations de l'entreprise</h3>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Nom de la société:</strong></td>
                    <td>TGI Immobilier</td>
                  </tr>
                  <tr>
                    <td><strong>Adresse:</strong></td>
                    <td>123 Rue des Locataires, Ville</td>
                  </tr>
                  <tr>
                    <td><strong>Téléphone:</strong></td>
                    <td>01 23 45 67 89</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>contact@tgi-immobilier.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {locataireInfo && (
              <div className="tenant-info">
                <h3>Informations du locataire</h3>
                <table>
                  <tbody>
                    <tr>
                      <td><strong>Nom du locataire:</strong></td>
                      <td>{locataireInfo.name}</td>
                    </tr>
                    <tr>
                      <td><strong>Adresse du locataire:</strong></td>
                      <td>{locataireInfo.adressePropriete}</td>
                    </tr>
                    
                    <tr>
                      <td><strong>Nom et prénom du propriétaire:</strong></td>
                      <td>{locataireInfo.nomProprietaire} {locataireInfo.prenomProprietaire}</td>
                    </tr>
                    <tr>
                      <td><strong>Service de la location:</strong></td>
                      <td>{locataireInfo.service}</td>
                    </tr>
                    <tr>
                      <td><strong>Montant de location:</strong></td>
                      <td>{locataireInfo.montantLocation} €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="month">Sélectionner le Mois:</label>
              <select id="month" value={selectedMonth} onChange={handleMonthChange}>
                <option value="">Sélectionnez un mois</option>
                {paiements.map((paiement, index) => (
                  <option key={index} value={paiement.mois}>{paiement.mois}</option>
                ))}
              </select>
            </div>
            {selectedPayment && (
              <div className="payment-details">
                <h3>Détails du Paiement</h3>
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Mois</th>
                      <th>Date de paiement</th>
                      <th>Montant payé (€)</th>
                      <th>Caution</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{selectedPayment.mois}</td>
                      <td>{selectedPayment.date_paiement}</td>
                      <td>{selectedPayment.montant}</td>
                      <td>{selectedPayment.caution}</td>
                      <td>{selectedPayment.mode_paiement}</td>
                    </tr>
                  </tbody>
                </table>
                {arrieres.length > 0 && (
  <div className="arrieres-table">
    <h3>Arriérés</h3>
    <table className="arrieres-table">
      <thead>
        <tr>
          <th>Mois</th>
          <th>Montant de retard</th>
          <th>Date d'échéance</th>
        </tr>
      </thead>
      <tbody>
        {arrieres.map(arriere => (
          <tr key={arriere.id}>
            <td>{arriere.mois}</td>
            <td>{`${arriere.montant} FCFA`}</td>
            <td>{arriere.date_echeance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

                <button onClick={() => setPdfButtonClicked(true)}>Générer Quittance PDF</button>
              </div>
            )}
          </div>
          
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
          {pdfButtonClicked && (
            <div>
              <button onClick={generateQuittancePDF}>Confirmer la génération du PDF</button>
              <button onClick={() => setPdfButtonClicked(false)}>Annuler</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quittance;