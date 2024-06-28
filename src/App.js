import React, { useState ,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Locataire from './components/Locataire/Locataire';
import Proprietaire from './components/Proprietaire/Proprietaire';
import Rapport from './components/Rapport/Rapport';
import Paiement from './components/Paiement/Paiement';
import Quittance from './components/Quittance/Quittance';
import Arrieres from './components/Arrieres/Arrieres';

import './App.css';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
          setRole(storedRole);
        }
      }, []);
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route
                        path="/login"
                        element={<Login setAuth={setIsLoggedIn} />}
                    />
                    {isLoggedIn ? (
                        <Route
                            path="/*"
                            element={
                                <MainLayout>
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/locataire" element={<Locataire />} />
                                        <Route path="/proprietaire" element={<Proprietaire />} />
                                        <Route path="/rapport" element={<Rapport />} />
                                        <Route path="/paiement" element={<Paiement />} />
                                        <Route path="/quittance" element={<Quittance />} />
                                        <Route path="/arrieres" element={<Arrieres />} />
                                        {/* Ajoutez d'autres routes ici si nécessaire */}
                                       
                                    </Routes>
                                </MainLayout>
                            }
                        />
                    ) : null}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
