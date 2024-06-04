import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Rapport.css';

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const Rapport = () => {
  const [reports, setReports] = useState(months.map(month => ({ month, total: '' })));
  const [year, setYear] = useState('');

  const handleInputChange = (e, month) => {
    const { value } = e.target;
    setReports(reports.map(report => report.month === month ? { ...report, total: value } : report));
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const calculateTotalAnnual = () => {
    return reports.reduce((sum, report) => sum + (parseFloat(report.total) || 0), 0).toFixed(2);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports.map(({ month, total }) => ({ Mois: month, Total: total })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');

    // Add title, year, and total annual
    XLSX.utils.sheet_add_aoa(ws, [['RAPPORT FINANCIER DE TGI IMMOBILIER']], { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(ws, [['Année', year]], { origin: 'A2' });
    XLSX.utils.sheet_add_aoa(ws, [['Total Annuel', calculateTotalAnnual()]], { origin: 'B2' });

    XLSX.writeFile(wb, 'financial_reports.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('RAPPORT FINANCIER DE TGI IMMOBILIER', 20, 20);
    doc.text(`Année: ${year}`, 20, 30);
    doc.autoTable({
      startY: 40,
      head: [['Mois', 'Total Encaissé']],
      body: reports.map(({ month, total }) => [month, total])
    });
   
    doc.text(`Total Annuel: ${calculateTotalAnnual()}`, 20, doc.lastAutoTable.finalY + 10);
    doc.save('financial_reports.pdf');
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
        {months.map((month) => (
          <div key={month}>
            <input
              type="number"
              name={month}
              value={reports.find(report => report.month === month).total}
              onChange={(e) => handleInputChange(e, month)}
              placeholder={month}
            />
          </div>
        ))}
      </div>
      <button onClick={exportToExcel}>Exporter en Excel</button>
      <button onClick={exportToPDF}>Exporter en PDF</button>
      
      <h2>Détails des Rapports</h2>
      <table id="reportsTable">
        <thead>
          <tr>
            {months.map((month, index) => (
              <th key={index}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {reports.map((report, index) => (
              <td key={index}>{parseFloat(report.total).toFixed(2)}</td>
            ))}
          </tr>
        </tbody>
      </table>
      <h3>Total Annuel: {calculateTotalAnnual()}</h3>
    </div>
  );
};

export default Rapport;
