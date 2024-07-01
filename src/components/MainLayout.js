import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard/Dashboard';
import Locataire from './Locataire/Locataire';
import Proprietaire from './Proprietaire/Proprietaire';
import Rapport from './Rapport/Rapport';
import Paiement from './Paiement/Paiement';
import Quittance from './Quittance/Quittance';
import Arrieres from './Arrieres/Arrieres';
import Versement from './Versement/Versement';
import GestionUtilisateurs from './GestionUtilisateurs/GestionUtilisateurs'; // Assurez-vous d'importer le composant pour la gestion des utilisateurs
import './MainLayout.css';

const MainLayout = () => {
    const [role, setRole] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    return (
        <div className="App">
            <Header />
            <div className="main">
                <Sidebar role={role} /> {/* Passez le prop role à Sidebar */}
                <div className="content">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/locataire" element={<Locataire />} />
                        <Route path="/proprietaire" element={<Proprietaire />} />
                        <Route path="/rapport" element={<Rapport />} />
                        <Route path="/paiement" element={<Paiement />} />
                        <Route path="/quittance" element={<Quittance />} />
                        <Route path="/versement" element={<Versement />} />
                        <Route path="/arrieres" element={<Arrieres />} />
                        {role === 'admin' && (
                            <Route path="/gestionUtilisateurs" element={<GestionUtilisateurs />} />
                        )}
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
