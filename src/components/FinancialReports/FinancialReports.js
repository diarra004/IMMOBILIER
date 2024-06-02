// src/components/FinancialReports.js
import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({ month: '', year: '', total: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addReport = () => {
    setReports([...reports, { ...formData }]);
    setFormData({ month: '', year: '', total: '' });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reports');
    XLSX.writeFile(wb, 'financial_reports.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({ html: '#reportsTable' });
    doc.save('financial_reports.pdf');
  };

  return (
    <div>
      <h1>Rapports Financiers</h1>
      <div>
        <input
          type="text"
          name="month"
          value={formData.month}
          onChange={handleInputChange}
          placeholder="Mois"
        />
        <input
          type="text"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          placeholder="Année"
        />
        <input
          type="number"
          name="total"
          value={formData.total}
          onChange={handleInputChange}
          placeholder="Total Encaissé"
        />
        <button onClick={addReport}>Ajouter</button>
      </div>
      <button onClick={exportToExcel}>Exporter en Excel</button>
      <button onClick={exportToPDF}>Exporter en PDF</button>
      <table id="reportsTable">
        <thead>
          <tr>
            <th>Mois</th>
            <th>Année</th>
            <th>Total Encaissé</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index}>
              <td>{report.month}</td>
              <td>{report.year}</td>
              <td>{report.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialReports;
