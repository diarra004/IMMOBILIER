// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Locataire from './components/Locataire/Locataire'; 




import './App.css';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Header />
                <div className="main">
                <Sidebar />
                <div className="content">
                <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/locataire" element={<Locataire />} />
            {/* Ajoutez d'autres routes ici si nécessaire */}
          </Routes>
                 
                </div>
                </div>
            </div>
        </Router>
    );
};

export default App;
