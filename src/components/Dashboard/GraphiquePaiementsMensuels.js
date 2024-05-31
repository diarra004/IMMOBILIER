import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const GraphiquePaiementsMensuels = ({ donnéesPaiements }) => {
  const référenceGraphique = useRef(null);
  const graphiqueRef = useRef(null); // Référence pour le graphique

  useEffect(() => {
    if (référenceGraphique && référenceGraphique.current && donnéesPaiements) {
      // Détruire le graphique existant s'il y en a un
      if (graphiqueRef.current !== null) {
        graphiqueRef.current.destroy();
      }

      const ctx = référenceGraphique.current.getContext('2d');

      // Créer un nouveau graphique
      const nouveauGraphique = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: donnéesPaiements.map(entry => entry.mois),
          datasets: [{
            label: 'Paiements reçus',
            data: donnéesPaiements.map(entry => entry.montant),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Conserver une référence du graphique pour le détruire plus tard
      graphiqueRef.current = nouveauGraphique;
    }
  }, [donnéesPaiements]);

  return <canvas ref={référenceGraphique} />;
};

export default GraphiquePaiementsMensuels;
