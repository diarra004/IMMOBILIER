
import './SummaryCards.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

const SummaryCards = () => {
    const [totalLocataires, setTotalLocataires] = useState(0);
    const [totalProprietaires, setTotalProprietaires] = useState(0);
    const [totalPropriete, setTotalPropriete] = useState(0);
    const [latePaymentsCount, setLatePaymentsCount] = useState(0);

    useEffect(() => {
        fetchTotalLocataires();
        fetchTotalProprietaires();
        fetchTotalProprietes();
        fetchLatePaymentsCount(); // Appel pour récupérer le nombre de paiements en retard
    }, []);

    const fetchTotalLocataires = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/locataires/count');
            setTotalLocataires(response.data.total);
        } catch (error) {
            console.error('Erreur lors du chargement du nombre de locataires:', error);
        }
    };

    const fetchTotalProprietaires = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/proprietaires/count');
            setTotalProprietaires(response.data.total);
        } catch (error) {
            console.error('Erreur lors du chargement du nombre de propriétaires:', error);
        }
    };

    const fetchTotalProprietes = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/propriete/count');
            setTotalPropriete(response.data.total);
        } catch (error) {
            console.error('Erreur lors du chargement du nombre de propriétés:', error);
        }
    };

    const fetchLatePaymentsCount = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/arrieres/count');
            console.log('Nombre d\'arriérés récupéré:', response.data.total); // Afficher le nombre récupéré dans la console
            setLatePaymentsCount(response.data.total); // Mettre à jour le nombre de paiements en retard
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de paiements en retard :', error);
        }
    };
    return (
        <div className="summary-cards">
            <div className="card">
                <h3>Locataires</h3>
                <p>Total Locataires: {totalLocataires}</p>
            </div>
            <div className="card">
                <h3>Propriétaires</h3>
                <p>Total Propriétaires: {totalProprietaires}</p>
            </div>
            <div className="card">
                <h3>Propriétés</h3>
                <p>Propriétés en Location: {totalPropriete}</p>
            </div>
            <div className="card">
                <h3>Arriérés</h3>
                <p>Paiements en Retard: {latePaymentsCount}</p>
            </div>
        </div>
    );
};

export default SummaryCards;
