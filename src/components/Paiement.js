import React from 'react';
import axios from 'axios';
import "./Paiement.css"

export default function Paiement() {
    // Afficher le formulaire d'ajout de paiement
    const handleSubmit = ({form}) => {
        form.preventDefault();
        axios.post("http://localhost:3001/paiement", form)
        .then((res) => {
            data = res.json();
            if(data["success"]){
                alert(data["success"]);
            }
        })
        .catch((err) => {
            console.log("Erreur serveur: " + err);
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit()}>
                <input type="text" name="locataire" />
                <input type="date" name="mois" />
                <input type="number" name="montant" />
                <select>
                    <option value="wave">Wave</option>
                    <option value="om">Orange Money</option>
                    <option value="paiement">Espece</option>
                </select>
                <input type="submit" />
            </form>
        </>
    )
}
