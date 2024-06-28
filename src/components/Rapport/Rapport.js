import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Rapport.css';

const Rapport = () => {
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState('');
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    if (year) {
      fetchReports();
    }
  }, [year]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/rapport/mensuel?year=${year}`);
      console.log(response.data);
      setReports(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports financiers mensuels:', error);
    }
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const calculateTotalAnnual = () => {
    return reports.reduce((sum, report) => sum + (parseFloat(report.total_encaisse) || 0), 0).toFixed(2);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports.map(({ mois, total_encaisse }) => ({ Mois: mois, Total: total_encaisse })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapports');

    // Ajouter le titre, l'année et le total annuel
    XLSX.utils.sheet_add_aoa(ws, [['RAPPORT FINANCIER DE TGI IMMOBILIER']], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(ws, [['Année', year]], { origin: 'A2' });
    XLSX.utils.sheet_add_aoa(ws, [['Total Annuel', calculateTotalAnnual()]], { origin: 'B2' });

    XLSX.writeFile(wb, 'rapports_financiers.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('RAPPORT FINANCIER DE TGI IMMOBILIER', 20, 20);
    doc.text(`Année: ${year}`, 20, 30);
    doc.autoTable({
      startY: 40,
      head: [['Mois', 'Total Encaissé']],
      body: reports.map(({ mois, total_encaisse }) => [mois, total_encaisse])
    });
    doc.text(`Total Annuel: ${calculateTotalAnnual()}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save('rapports_financiers.pdf');
  };

  return (
    <div className='fontt'>
      <h1>Rapports Financiers</h1>
      <div>
        <input
          type="text"
          name="year"
          value={year}
          onChange={handleYearChange}
          placeholder="Année"
        />
      </div>
      <button onClick={exportToExcel}>Exporter en Excel</button>
      <button onClick={exportToPDF}>Exporter en PDF</button>

      <h2>Détails des Rapports</h2>
      <table id="reportsTable">
        <thead>
          <tr>
            <th>Mois</th>
            <th>Total Encaissé</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => {
            const report = reports.find(r => r.mois === month) || { total_encaisse: 0 };
            return (
              <tr key={index}>
                <td>{month}</td>
                <td>{parseFloat(report.total_encaisse).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h3>Total Annuel: {calculateTotalAnnual()}</h3>
    </div>
  );
};

export default Rapport;
