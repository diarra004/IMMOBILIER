// src/components/Header.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = () => {
    return (
        <header className="app-header">
            <div className="logo-section">
                <img src="/logo.jpeg" alt="Company Logo" className="logo" />
                <h1 className="app-name">TGI-Immobilier</h1>
            </div>
            <div className="menu-section">
                <FontAwesomeIcon icon={faBell} className="icon" />
                <FontAwesomeIcon icon={faUserCircle} className="icon" />
            </div>
        </header>
    );
};

export default Header;
