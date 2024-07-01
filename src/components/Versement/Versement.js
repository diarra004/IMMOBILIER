import React, { useState } from 'react';
import axios from 'axios';
import './Versement.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Versement = () => {
  const [versements, setVersements] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [nomProprietaire, setNomProprietaire] = useState('');

  const fetchVersements = async (phoneNumber) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/versements?phoneNumber=${phoneNumber}`);
      if (response.data.length === 0) {
        setVersements([]);
        setErrorMessage('Aucun versement trouvé pour ce numéro.');
        setNomProprietaire('');
      } else {
        setVersements(response.data);
        setErrorMessage('');
        // Récupérer le nom du propriétaire à partir du premier versement trouvé
        if (response.data[0] && response.data[0].nom_proprietaire) {
          setNomProprietaire(response.data[0].nom_proprietaire);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des versements :', error);
      setVersements([]);
      setErrorMessage('Erreur lors de la récupération des versements.');
      setNomProprietaire('');
    }
  };

  const handleSearch = () => {
    fetchVersements(phoneNumber);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Renvoie la partie YYYY-MM-DD de la date
  };

  const generatePDF = () => {
    if (versements.length === 0) {
      setErrorMessage('Aucun versement à exporter en PDF.');
      return;
    }

    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(18);
    doc.text('Bulletins de Versement', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Nom du propriétaire
    if (nomProprietaire) {
      doc.setFontSize(12);
      doc.text(`Nom du propriétaire : ${nomProprietaire}`, 15, 30);
    }

    // Tableau des versements
    const tableData = versements.map((versement) => [
      versement.nom_locataire,
      versement.service_locataire,
      versement.montant,
      formatDate(versement.date_versement),
    ]);

    doc.autoTable({
      startY: 40,
      head: [['Nom du Locataire', 'Service', 'Montant', 'Date de Versement']],
      body: tableData,
    });

    // Générer le nom du fichier PDF
    const fileName = `Bulletins_de_Versement_${Date.now()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="versement-container">
      <h2>Bulletins de Versement</h2>
      <div>
        <label htmlFor="phoneNumber">Numéro de téléphone du propriétaire :</label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={handleSearch}>Rechercher</button>
      </div>
      {errorMessage && (
        <div className="error-dialog">
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>Fermer</button>
        </div>
      )}
       {nomProprietaire && <p>Nom du propriétaire : {nomProprietaire}</p>}
      {versements.length > 0 && (
        <div>
          <table border="1">
            <thead>
              <tr>
                <th>Nom du Locataire</th>
                <th>Service</th>
                <th>Montant</th>
                <th>Date de Versement</th>
              </tr>
            </thead>
            <tbody>
              {versements.map((versement) => (
                <tr key={versement.id}>
                  <td>{versement.nom_locataire}</td>
                  <td>{versement.service_locataire}</td>
                  <td>{versement.montant}</td>
                  <td>{formatDate(versement.date_versement)}</td>
                </tr>
              ))}
            </tbody>
          </table>


          <button onClick={generatePDF}>Exporter en PDF</button>
        </div>
      )}
    </div>
  );
};

export default Versement;
