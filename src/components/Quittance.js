import React, { useState } from 'react';
import axios from 'axios';
import './Quittance.css';

function Quittance() {
  const [userId, setUserId] = useState('');
  const [quittance, setQuittance] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setUserId(e.target.value);
  };

  const fetchQuittance = async () => {
    try {
      setError(null);
      const response = await axios.get(`http://localhost:3001/quittance/${userId}`);
      setQuittance(response.data.quittance);
    } catch (err) {
      setError('Erreur lors de la récupération de la quittance.');
    }
  };

  return (
    <div className="quittance">
      <header className="quittance-header">
        <h1>Quittance</h1>
        <div className="input-container">
          <input
            type="text"
            placeholder="Entrez l'ID utilisateur"
            value={userId}
            onChange={handleInputChange}
          />
          <button onClick={fetchQuittance}>Obtenir la Quittance</button>
        </div>
        {error && <p className="error">{error}</p>}
        {quittance !== null && (
          <div className="receipt">
            <div className="header">
              <h2>Quittance</h2>
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Utilisateur ID: {userId}</p>
            </div>
            <div className="details">
              <h3>Détails de la facture</h3>
              <p>Montant total des factures payées : {quittance} €</p>
            </div>
            <div className="total">
              <h3>Total</h3>
              <p>Montant total à payer : {quittance} €</p>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
