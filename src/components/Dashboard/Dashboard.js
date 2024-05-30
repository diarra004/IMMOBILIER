import React from 'react';
import SummaryCards from './SummaryCards'; // Assurez-vous que le chemin est correct en fonction de votre structure de répertoires

const Dashboard = () => {
    return (
        <div className="dashboard">
          
            <div className="dashboard-content">
                <SummaryCards />
                {/* Ajoutez d'autres composants ou contenu ici */}
            </div>
        </div>
    );
};

export default Dashboard;
