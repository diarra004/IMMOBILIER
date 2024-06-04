import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Locataire.css';

const Locataire = () => {
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    entryDate: '',
    proprietaire: '',
    montantLocation: '',
    adresse: '',
    service: ''
  });

  const [editingTenant, setEditingTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [showTenants, setShowTenants] = useState(false); // Ajoutez un état pour contrôler l'affichage des locataires

  useEffect(() => {
    if (showTenants) {
      fetchTenants();
    }
  }, [showTenants]); // Appelez fetchTenants() uniquement lorsque showTenants change

  const fetchTenants = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/locataires');
      setTenants(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des locataires:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTenant({ ...newTenant, [name]: value });
  };

  const [errorMessage, setErrorMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTenant) {
      try {
        await axios.put(`http://localhost:3001/api/locataires/${editingTenant.id}`, newTenant);
        setEditingTenant(null); // Réinitialiser le formulaire de modification
        setNewTenant({ name: '', email: '', phoneNumber: '', entryDate: '', proprietaire: '', montantLocation: '', adresse: '', service: '' });
      } catch (error) {
        console.error('Erreur lors de la modification du locataire:', error);
      }
    } else {
      try {
        await axios.post('http://localhost:3001/api/locataires', newTenant);
        setNewTenant({ name: '', email: '', phoneNumber: '', entryDate: '', proprietaire: '', montantLocation: '', adresse: '', service: '' });
      } catch (error) {
        if (error.response.status === 400) {
          // Affichage du message d'erreur dans une boîte de dialogue
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
            console.log('Token:', token); // Vérifiez que le token est bien récupéré
            const response = await axios.delete(`http://localhost:3001/api/locataires/${id}`, {
                headers: {
                    'x-access-token': token
                }
            });
            console.log('Response:', response); // Vérifiez la réponse du serveur
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
    {errorMessage && (
      <div className="error-dialog">
        <p>{errorMessage}</p>
        <button onClick={() => setErrorMessage('')}>Fermer</button>
      </div>
    )}
    
};

  return (
    <div className="container">
      <div className="form-container">
      <h2>Veuillez saisir les informations du client </h2>
      <form onSubmit={handleSubmit}>
        <label>Nom du locataire : </label>
        <input
          type="text"
          name="name"
          value={newTenant.name}
          onChange={handleInputChange}
         
          required
        />
        <label>Email du locataire :</label>
        <input
          type="email"
          name="email"
          value={newTenant.email}
          onChange={handleInputChange}
       
          required
        />
        <label>Numéro de téléphone du locataire : </label>
        <input
          type="tel"
          name="phoneNumber"
          value={newTenant.phoneNumber}
          onChange={handleInputChange}
        
          required
        />
        <label>Date d'entrée du locataire : </label>
        <input
          type="date"
          name="entryDate"
          value={newTenant.entryDate}
          onChange={handleInputChange}
       
          required
        />
        <label>Propriétaire de la propriété : </label>
        <input
          type="text"
          name="proprietaire"
          value={newTenant.proprietaire}
          onChange={handleInputChange}
        
          required
        />
        <label>Montant de la location : </label>
        <input
          type="number"
          name="montantLocation"
          value={newTenant.montantLocation}
          onChange={handleInputChange}
          
          required
        />
        <label>Adresse</label>
        <input
          type="text"
          name="adresse"
          value={newTenant.adresse}
          onChange={handleInputChange}
          placeholder="Adresse"
          required
        />
        <label>Service</label>
        <select
          name="service"
          value={newTenant.service}
          onChange={handleInputChange}
          required
        >
          <option value="">Sélectionnez un service</option>
          <option value="Appartement">Appartement</option>
          <option value="Villa">Villa</option>
          <option value="Maison">Maison</option>
          <option value="Studio">Studio</option>
        </select>
        <button type="submit">{editingTenant ? 'Modifier' : 'Ajouter'}</button>
      </form>
      </div>
      {errorMessage && (
  <div className="error-dialog">
    <p>{errorMessage}</p>
    <button onClick={() => setErrorMessage('')}>Fermer</button>
  </div>
)}
      <div className="tenants-container">
      <button onClick={() => setShowTenants(!showTenants)}>Afficher tous les locataires</button> {/* Bouton pour afficher/cacher les locataires */}
     
        
      {showTenants && (
    <ul>
      {tenants.map((tenant, index) => (
        <div key={index} className="tenant-row">
          <li>
            Nom: {tenant.name},  Numéro de téléphone: {tenant.phoneNumber}
          </li>
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


