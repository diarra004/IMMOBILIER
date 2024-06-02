// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Locataire from './components/Locataire/Locataire';
import FinancialReports from './components/FinancialReports/FinancialReports'; // Import du composant FinancialReports

import './App.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Header />
                <div className="main">
                    <Sidebar />
                    <div className="content">
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/locataire" element={<Locataire />} />
                            <Route path="/financial-reports" element={<FinancialReports />} /> {/* Ajout de la route pour FinancialReports */}
                            {/* Ajoutez d'autres routes ici si nécessaire */}
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
};

export default App;
