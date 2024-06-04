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
    <div className="App">
      <header className="App-header">
        <h1>Calculer la Quittance</h1>
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
        {quittance !== null ? (
          <div className="result">
            <h2>Quittance pour l'utilisateur {userId}</h2>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur ID</th>
                  <th>Montant total des factures payées (€)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{userId}</td>
                  <td>{quittance}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p>Aucune donnée disponible pour cet utilisateur.</p>
        )}
      </header>
    </div>
  );
}

export default App;

