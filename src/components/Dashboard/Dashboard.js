import React from 'react';
import SummaryCards from './SummaryCards'; // Assurez-vous que le chemin est correct en fonction de votre structure de répertoires
import GraphiquePaiementsMensuels from './GraphiquePaiementsMensuels';
import GraphiqueArrieres from './GraphiqueArrieres';
import'./Dashboard.css';


const Dashboard = () => {
  // Exemple de données fictives pour les paiements mensuels et les arriérés
  const donnéesPaiementsMensuels = [
    { mois: 'Jan', montant: 363565 },
    { mois: 'Fév', montant:350253 },
    { mois: 'Mar', montant: 355671 },
    { mois: 'Avr', montant: 350001 },
    { mois: 'Mai', montant: 24 },
    // Ajoutez d'autres mois et montants au besoin
  ];
  const arrieresData = [
    { date: '2024-01', cumul: 100 },
    { date: '2024-02', cumul: 150 },
    { date: '2024-03', cumul: 200 },
    // Ajoutez d'autres données au besoin
  ];

  

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="graphiques-container">
          <div className="graphique">
            <h2>Graphique des Paiements Mensuels</h2>
            <GraphiquePaiementsMensuels donnéesPaiements={donnéesPaiementsMensuels} />
          </div>
          <div className="graphique">
            <h2>Graphique des arriérés cumulés</h2>
            <GraphiqueArrieres donnees={arrieresData} />
          </div>
        </div>
        <SummaryCards/>
      </div>
    </div>
  );
  
};

export default Dashboard;
