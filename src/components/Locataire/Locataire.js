import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Locataire.css';



const Locataire = () => {
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    entryDate: '',
    proprietaire_id: '',
    proprieteLoueeId: '',
    montantLocation: '',
    service: ''
  });
  const [proprietaires, setProprietaires] = useState([]);
  const [editingTenant, setEditingTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [showTenants, setShowTenants] = useState(false);
  const [proprieteLouee, setProprieteLouee] = useState([]);
  const [propertyServices, setPropertyServices] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Ensure successMessage is declared

  useEffect(() => {
    if (showTenants) {
      fetchTenants();
    }
  }, [showTenants]);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/locataires');
      setTenants(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des locataires:', error);
    }
  };

  useEffect(() => {
    fetchProprietaires();
  }, []);

  const fetchProprietaires = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/proprietaires');
      setProprietaires(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétaires:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [newTenant.proprietaire_id]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/propriete?proprietaireId=${newTenant.proprietaire_id}`);
      setProprieteLouee(response.data);
      const services = {};
      response.data.forEach(property => {
        services[property.id] = property.service;
      });
      setPropertyServices(services);
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "proprieteLoueeId") {
      const selectedProperty = proprieteLouee.find((prop) => prop.id === parseInt(value));
      setNewTenant({
        ...newTenant,
        [name]: value,
        montantLocation: selectedProperty ? selectedProperty.valeur : '' ,// Mettre à jour le montant de la location
        service: selectedProperty ? selectedProperty.service : '' // Mise à jour du service
      });
    } else {
      setNewTenant({ ...newTenant, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTenant) {
      try {
        await axios.put(`http://localhost:3001/api/locataires/${editingTenant.id}`, newTenant);
        setEditingTenant(null);
        setNewTenant({
          name: '',
          email: '',
          phoneNumber: '',
          entryDate: '',
          proprietaire_id: '',
          proprieteLoueeId: '',
          montantLocation: '',
       
          service: ''
        });
        fetchTenants(); // Actualiser la liste des locataires après modification
      } catch (error) {
        console.error('Erreur lors de la modification du locataire:', error);
      }
    } else {
      try {
        await axios.post('http://localhost:3001/api/locataires', newTenant);
        setSuccessMessage('Locataire ajouté avec succès !');
        setNewTenant({
          name: '',
          email: '',
          phoneNumber: '',
          entryDate: '',
          proprietaire_id: '',
          proprieteLoueeId: '',
          montantLocation: '',
         
          service: ''
        });
        fetchTenants(); // Actualiser la liste des locataires après ajout
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setErrorMessage(error.response.data.error);
        } else {
          console.error('Erreur lors de l\'ajout du locataire:', error);
        }
      }
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setNewTenant(tenant);
  };

  const handleDelete = async (tenant) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${tenant.name} ?`)) {
      try {
        const id = tenant.id;
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:3001/api/locataires/${id}`, {
          headers: { 'x-access-token': token }
        });
        if (response.status === 200) {
          const updatedTenants = tenants.filter((t) => t !== tenant);
          setTenants(updatedTenants);
        } else {
          setErrorMessage(response.data.error);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du locataire:', error);
        setErrorMessage('Vous n\'êtes pas autorisé à effectuer cette action.');
      }
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Veuillez saisir les informations du client </h2>
        <form onSubmit={handleSubmit}>
          <label>Nom du locataire : </label>
          <input type="text" name="name" value={newTenant.name} onChange={handleInputChange} required />
          <label>Email du locataire :</label>
          <input type="email" name="email" value={newTenant.email} onChange={handleInputChange} required />
          <label>Numéro de téléphone du locataire : </label>
          <input type="tel" name="phoneNumber" value={newTenant.phoneNumber} onChange={handleInputChange} required />
          <label>Date d'entrée du locataire : </label>
          <input type="date" name="entryDate" value={newTenant.entryDate} onChange={handleInputChange} required />
          <label>Propriétaire de la propriété :</label>
          <select name="proprietaire_id" value={newTenant.proprietaire_id} onChange={handleInputChange} required>
            <option value="">Sélectionnez un propriétaire</option>
            {proprietaires.map((proprietaire) => (
              <option key={proprietaire.id} value={proprietaire.id}>
                {proprietaire.nom} {proprietaire.prenom}
              </option>
            ))}
          </select>
          <label>Propriété louée :</label>
          <select name="proprieteLoueeId" value={newTenant.proprieteLoueeId} onChange={handleInputChange}>
            <option value="">Sélectionnez une propriété</option>
            {proprieteLouee.map((propriete) => (
              <option key={propriete.id} value={propriete.id}>
                {propriete.adresse}
              </option>
            ))}
          </select>
          <label>Montant de la location : </label>
          <input type="number" name="montantLocation" value={newTenant.montantLocation}  disabled />
         
          <label>Service :</label>
          <input type="text" name="service" value={newTenant.service} disabled />

          <button type="submit">{editingTenant ? 'Modifier' : 'Ajouter'}</button>
        </form>
      </div>
      {errorMessage && (
        <div className="error-dialog">
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}>Fermer</button>
        </div>
      )}
      {successMessage && (
  <div className="success-message">
    {successMessage}
  </div>
)}

      <div className="tenants-container">
        <button onClick={() => setShowTenants(!showTenants)}>Afficher tous les locataires</button>
        {showTenants && (
          <ul>
            {tenants.map((tenant, index) => (
              <div key={index} className="tenant-row">
                <li>Nom: {tenant.name}, Numéro de téléphone: {tenant.phoneNumber}</li>
                <li>
                  <button onClick={() => handleEdit(tenant)}>Modifier</button>
                  <button onClick={() => handleDelete(tenant)}>Supprimer</button>
                </li>
              </div>
            ))}
          </ul>
        )}
      </div>
     
    </div>
  );
};

export default Locataire;
