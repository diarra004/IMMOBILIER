import React from 'react';
import './SummaryCards.css'

const SummaryCards = () => {
    return (
        <div className="summary-cards">
            <div className="card">
                <h3>Locataires</h3>
                <p>Total Locataires: 100</p>
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
