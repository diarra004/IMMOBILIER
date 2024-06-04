// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const userData = await response.json(); // Récupérer les données de l'utilisateur depuis la réponse
            console.log('User data from server:', userData); // Vérifiez les données utilisateur reçues du serveur
            if (response.ok) {
                localStorage.setItem('token', userData.token);
                localStorage.setItem('username', userData.username); // Stocker le nom d'utilisateur dans le localStorage
                localStorage.setItem('role', userData.role);
                setAuth(true);
                navigate('/dashboard');
            } else {
                if (response.status === 404) {
                    setError('Utilisateur non trouvé');
                } else if (response.status === 401) {
                    setError('Mot de passe invalide');
                } else {
                    setError('Erreur lors de la connexion, veuillez réessayer.');
                }
            }
        } catch (err) {
            setError('Erreur lors de la connexion, veuillez réessayer.');
            console.error(err);
        }
    };

    return (
        <div className="login-container"> {/* Ajoutez une classe pour la mise en forme globale */}
            <img className="login-image" src="/logo.jpeg" alt="Logo" />
            <div className="login-box"> {/* Ajoutez une classe pour la mise en forme de la boîte du formulaire */}
                <div className="login-form"> {/* Ajoutez une classe pour le formulaire */}
                    <h2>CONNEXION</h2>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div>
                            <label>Nom d'utilisateur:</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Mot de passe :</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </div>
                <div className="login-imag"></div> {/* Ajoutez une classe pour l'image à droite */}
            </div>
        </div>
    );
};

export default Login;
