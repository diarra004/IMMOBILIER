import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import './Arrieres.css';

const Arrieres = () => {
  const [arrieres, setArrieres] = useState([]);

  useEffect(() => {
    fetchArrieres();
  }, []);

  const fetchArrieres = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/arrieres');
      console.log(response.data)
      setArrieres(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des arriérés:', error);
    }
  };

  const handleRappel = async (locataireId) => {
    try {
      await axios.post('http://localhost:3001/api/arrieres/rappel', { locataireId });
      alert('Rappel généré avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération du rappel:', error);
    }
  };

  return (
    <div className="arrieres">
      <h2>Gestion des Arriérés</h2>
      <table>
        <thead>
          <tr>
           
            <th>Nom</th>
            <th>Email</th>
            <th>Montant En Retard</th>
           
            <th>Date d'Échéance</th>
            <th>Mois</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {arrieres.map(locataire => (
            <tr key={locataire.id}>
            
              <td>{locataire.name}</td>
              <td>{locataire.email}</td>
              <td>{locataire.montant}</td>
              <td>{locataire.date_echeance}</td>
              <td>{locataire.mois}</td>
              <td>
                <button onClick={() => handleRappel(locataire.id)}>Générer un Rappel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Arrieres;
