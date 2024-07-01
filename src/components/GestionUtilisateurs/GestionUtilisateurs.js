import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gestionnaire.css'

const GestionUtilisateurs = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [showAgentsList, setShowAgentsList] = useState(false);
    const [role, setRole] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs :', error);
        }
    };

    const addUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/users', { ...newUser, role: 'agent_immobilier' });
            setSuccessMessage('Agent ajouté avec succès.');
            // Ne pas actualiser automatiquement la liste des utilisateurs ici
            setTimeout(() => {
                setSuccessMessage('');
              }, 3000);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
        }
    };

    const updateUser = async (id, updatedUser) => {
        try {
            await axios.put(`http://localhost:3001/api/users/${id}`, updatedUser);
            fetchUsers(); // Actualiser la liste des utilisateurs après modification
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur avec l'ID ${id} :`, error);
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/users/${id}`);
            fetchUsers(); // Actualiser la liste des utilisateurs après suppression
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'utilisateur avec l'ID ${id} :`, error);
        }
    };

    const toggleAgentsList = () => {
        setShowAgentsList(!showAgentsList); // Inverser l'état actuel de l'affichage de la liste
        if (!showAgentsList) {
            fetchUsers(); // Charger la liste des utilisateurs si elle n'est pas déjà chargée
        }
    };

    // Vérification de l'authentification et du rôle
    if (role !== 'admin') {
        // Redirection ou message d'erreur par exemple
        return <p>Accès non autorisé</p>;
    }

    return (
        <div className="gestion-utilisateurs">
            <h2>Gestion des agents immobiliers</h2>

            {/* Formulaire pour ajouter un nouvel utilisateur */}
            <form onSubmit={addUser} className="form-utilisateur">
                <h3>Ajouter un Agent</h3>
                <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Nom d'utilisateur"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Mot de passe"
                        required
                    />
                </div>
                <button type="submit" className="btn-add">Ajouter Agent</button>
            </form>

            {/* Affichage du message de succès */}
            {successMessage && (
  <div className="success-message">
    {successMessage}
  </div>
)}

            {/* Bouton pour afficher/masquer la liste des agents */}
            <button onClick={toggleAgentsList} className="btn-toggle-list">
                {showAgentsList ? 'Masquer la liste des agents' : 'Lister les agents'}
            </button>

            {/* Liste des utilisateurs */}
            {showAgentsList && (
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user.id} className="user-item">
                            <span>{user.username}</span>
                            <button onClick={() => updateUser(user.id, { ...user, role: 'agent_immobilier' })}>Modifier</button>
                            <button onClick={() => deleteUser(user.id)}>Supprimer</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
export default GestionUtilisateurs;
