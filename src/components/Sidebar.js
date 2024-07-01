// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role }) => {
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
                    <NavLink to="/rapport" activeClassName="active-link">Rapports</NavLink>
                </li>
                <li>
                    <NavLink to="/quittance" activeClassName="active-link">Quittances </NavLink>
                </li>
              
                <li>
                    <NavLink to="/arrieres" activeClassName="active-link">Arrierer</NavLink>
                </li>
                <li>
                    <NavLink to="/versement" activeClassName="active-link">Bulletins de versements</NavLink>
                </li>
                
                {role === 'admin' && (
                    <li>
                        <NavLink to="/gestionUtilisateurs" activeClassName="active-link">Gestion des Utilisateurs</NavLink>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Sidebar;
