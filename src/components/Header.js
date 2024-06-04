// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';


import './Header.css';

const Header = () => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        console.log('Stored username:', storedUsername); // Vérifiez la valeur du nom d'utilisateur stocké dans le stockage local
        console.log('Stored role:', storedRole);
        if (storedUsername) {
            setUsername(storedUsername);
        }
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);
    
    
    return (
        <header className="app-header">
            <div className="logo-section">
                <img src="/logo.jpeg" alt="Company Logo" className="logo" />
                <h1 className="app-name">TGI-Immobilier</h1>
            </div>
            <div className="menu-section">
                <FontAwesomeIcon icon={faBell} className="icon" />
                <div className="user-info">
                    <FontAwesomeIcon icon={faUserCircle} className="icon" />
                    <span>{`Bienvenue, ${username}`}</span> {/* Affiche le nom d'utilisateur */}
                    <span>{`( rôle :  ${role})`}</span> {/* Affiche le nom d'utilisateur */}
                </div>
            </div>

        </header>
    );
};

export default Header;
