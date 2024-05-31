
import './SummaryCards.css';
import axios from 'axios';
import React, { useState, useEffect } from 'react';


const SummaryCards = () => {
    const [totalLocataires, setTotalLocataires] = useState(0);

    useEffect(() => {
        fetchTotalLocataires();
    }, []);

    const fetchTotalLocataires = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/locataires/count');
            setTotalLocataires(response.data.total);
        } catch (error) {
            console.error('Erreur lors du chargement du nombre de locataires:', error);
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
                <p>Total Propriétaires: 50</p>
            </div>
            <div className="card">
                <h3>Propriétés</h3>
                <p>Propriétés en Location: 200</p>
            </div>
            <div className="card">
                <h3>Paiements en Retard</h3>
                <p>Paiements En Retard: 10</p>
            </div>
        </div>
    );
};

export default SummaryCards;
