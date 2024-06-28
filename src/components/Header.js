// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // Importer axios pour les requêtes HTTP
import './Header.css';

const Header = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [latePaymentsCount, setLatePaymentsCount] = useState(0); // Nombre de paiements en retard

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        if (storedUsername) {
            setUsername(storedUsername);
        }
        if (storedRole) {
            setRole(storedRole);
        }

        // Appel à une fonction pour récupérer le nombre de paiements en retard
        fetchLatePaymentsCount();
    }, []);

    // Fonction pour récupérer le nombre de paiements en retard
    const fetchLatePaymentsCount = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/arrieres');
            setLatePaymentsCount(response.data.length); // Mettre à jour le nombre de paiements en retard
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements en retard :', error);
        }
    };

    return (
        <header className="app-header">
            <div className="logo-section">
                <img src="/logo.jpeg" alt="Company Logo" className="logo" />
                <h1 className="app-name">TGI-Immobilier</h1>
            </div>
            <div className="menu-section">
                {/* Icône de notification avec badge pour afficher le nombre de paiements en retard */}
                <FontAwesomeIcon icon={faBell} className="icon">
                    {latePaymentsCount > 0 && <span className="notification-badge">{latePaymentsCount}</span>}
                </FontAwesomeIcon>
                <div className="user-info">
                    <FontAwesomeIcon icon={faUserCircle} className="icon" />
                    <span>{`Bienvenue, ${username}`}</span>
                    <span>{`( rôle : ${role})`}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
