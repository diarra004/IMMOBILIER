import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard/Dashboard';
import Locataire from './Locataire/Locataire';
import Proprietaire from './Proprietaire/Proprietaire';
import Rapport from './Rapport/Rapport';

import './MainLayout.css';

const MainLayout = () => {
    return (
       
        <div className="App">
            <Header />
            <div className="main">
                <Sidebar />
                
                <div className="content">
                    <Routes>
                        
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/locataire" element={<Locataire />} />
                        <Route path="/proprietaire" element={<Proprietaire />} />
                        <Route path="/rapport" element={<Rapport />} />
                        {/* Ajoutez d'autres routes ici si nécessaire */}
                    </Routes>
                </div>
            </div>
        </div>
     
    );
};

export default MainLayout;
