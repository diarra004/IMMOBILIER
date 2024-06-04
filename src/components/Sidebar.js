// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <nav className="sidebar">
            <h2 className="sidebar-title">Menu</h2>
            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/dashboard" activeClassName="active-link">Tableau de Bord</NavLink>
                </li>
                <li>
                    <NavLink to="/locataire" activeClassName="active-link">Gestion des Locataires</NavLink>
                </li>
                <li>
                    <NavLink to="/proprietaire" activeClassName="active-link">Gestion des Propriétaires</NavLink>
                </li>
                <li>
                    <NavLink to="/paiement" activeClassName="active-link">Paiements</NavLink>
                </li>
                <li>
                    <NavLink to="/financial-reports" activeClassName="active-link">Rapports Financiers</NavLink> {/* Corriger l'URL */}
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
