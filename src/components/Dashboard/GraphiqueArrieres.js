import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const GraphiqueArrieres = ({ donnees }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (canvasRef && canvasRef.current && donnees) {
      if (chartRef.current !== null) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: donnees.map(entry => entry.date),
          datasets: [{
            label: 'Arriérés cumulés',
            data: donnees.map(entry => entry.cumul),
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)',
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
    }
  }, [donnees]);

  return <canvas ref={canvasRef} />;
};

export default GraphiqueArrieres;
