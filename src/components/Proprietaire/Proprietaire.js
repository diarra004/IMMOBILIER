import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Proprietaire.css';

const Proprietaire = () => {
  const [newOwner, setNewOwner] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    phoneNumber: '',
    email: '',
    service:''
  });
  const [successMessage, setSuccessMessage] = useState(''); // Ensure successMessage is declared
  const [propriete, setProperties] = useState([{ adresse: '', surface: '', valeur: '' }]);
  const [editingOwner, setEditingOwner] = useState(null);
  const [owners, setOwners] = useState([]);
  const [showOwners, setShowOwners] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (showOwners) {
      fetchOwners();
    }
  }, [showOwners]);

  const fetchOwners = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/proprietaires');
      setOwners(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des propriétaires:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOwner({ ...newOwner, [name]: value });
  };

  const handlePropertyChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProperties = [...propriete];
    updatedProperties[index][name] = value;
    setProperties(updatedProperties);
  };

  const addPropertyField = () => {
    setProperties([...propriete, { adresse: '', surface: '', valeur: '' ,service:''}]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOwner) {
        await axios.put(`http://localhost:3001/api/proprietaires/${editingOwner.id}`, { ...newOwner, propriete });
        setEditingOwner(null);
      } else {
        await axios.post('http://localhost:3001/api/proprietaires', { ...newOwner, propriete: propriete });
        setSuccessMessage('Propriétaire ajouté avec succès !');
      }
      setNewOwner({ nom: '', prenom: '', adresse: '', phoneNumber: '', email: '',service:'' });
      setProperties([{ adresse: '', surface: '', valeur: '',service:'' }]);
      fetchOwners();
       // Actualiser la liste des locataires après ajout
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.error);
      } else {
        console.error('Erreur lors de l\'ajout ou de la modification du propriétaire:', error);
      }
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setNewOwner(owner);
    // Fetch properties associated with the owner if necessary
  };

  const handleDelete = async (owner) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${owner.nom} ?`)) {
        try {
            const id = owner.id;
            const token = localStorage.getItem('token');
            console.log('Token:', token); // Vérifiez que le token est bien récupéré
            const response = await axios.delete(`http://localhost:3001/api/proprietaires/${id}`, {
                headers: {
                    'x-access-token': token
                }
            });
            console.log('Response:', response); // Vérifiez la réponse du serveur
            if (response.status === 200) {
                const updatedOwners = owners.filter((t) => t !== owner);
                setOwners(updatedOwners);
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
        <h2>Veuillez saisir les informations du propriétaire</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom du propriétaire:</label>
          <input
            type="text"
            name="nom"
            value={newOwner.nom}
            onChange={handleInputChange}
            placeholder="Nom"
            required
          />
          <label>Prénom du propriétaire:</label>
          <input
            type="text"
            name="prenom"
            value={newOwner.prenom}
            onChange={handleInputChange}
            placeholder="Prénom"
            required
          />
          <label>Email du propriétaire:</label>
          <input
            type="email"
            name="email"
            value={newOwner.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
          />
          <label>Numéro de téléphone du propriétaire:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={newOwner.phoneNumber}
            onChange={handleInputChange}
            placeholder="Numéro de téléphone"
            required
          />
          <label>Adresse:</label>
          <input
            type="text"
            name="adresse"
            value={newOwner.adresse}
            onChange={handleInputChange}
            placeholder="Adresse"
            required
          />

          <h3>Détails des propriétés:</h3>
          {propriete.map((property, index) => (
            <div key={index}>
              <label>Adresse de la propriété:</label>
              <input
                type="text"
                name="adresse"
                value={property.adresse}
                onChange={(e) => handlePropertyChange(index, e)}
                placeholder="Adresse"
                required
              />
              <label>Service de la propriété:</label>
<select
  name="service"
  value={property.service}
  onChange={(e) => handlePropertyChange(index, e)}
  required
>
  <option value="">Sélectionnez le service</option>
  <option value="Appartement">Appartement</option>
  <option value="Studio">Studio</option>
  <option value="Villa">Villa</option>
  {/* Ajoutez d'autres options si nécessaire */}
</select>

              <label>Surface de la propriété:</label>
              <input
                type="text"
                name="surface"
                value={property.surface}
                onChange={(e) => handlePropertyChange(index, e)}
                placeholder="Surface"
                required
              />
              <label>Valeur de la propriété:</label>
              <input
                type="text"
                name="valeur"
                value={property.valeur}
                onChange={(e) => handlePropertyChange(index, e)}
                placeholder="Valeur"
                required
              />
            </div>
          ))}
          <button type="button" onClick={addPropertyField}>Ajouter une propriété</button>
          <button type="submit">{editingOwner ? 'Modifier' : 'Ajouter'}</button>
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
      <div className="owners-container">
        <button onClick={() => setShowOwners(!showOwners)}>Afficher tous les propriétaires</button>
        {showOwners && (
          <ul>
            {owners.map((owner, index) => (
              <div key={index} className="owner-row">
                <li>
                  Nom: {owner.nom}, Prénom: {owner.prenom}, Numéro de téléphone: {owner.phoneNumber}, Nombre de propriétés: {owner.PropertiesCount}
                </li>
                <li>
                  <button onClick={() => handleEdit(owner)}>Modifier</button>
                  <button onClick={() => handleDelete(owner)}>Supprimer</button>
                </li>
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Proprietaire;