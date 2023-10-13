// J'importe les modules dont j'aurai besoin
const express = require('express');
const path = require('path');
const router = express.Router();

// Je définis ensuite mes routes ou "ressources" => http://localhost:3001/contact => protocole://domaine:port/ressource
// Le chemin "/" est la route dite "racine" celle sur laquelle on arrive sur l'adresse url de base d'un site (sans ressource précise), généralement la page d'accueil du site
router.get('/', (req, res) => {
    // Ici aucune requête n'est envoyé, mais je traite la réponse (response => res) que le serveur doit envoyé au client
    // J'indique également le status correspondant à la réponse (200 => tout va c'est bien passé)
    // J'affiche les données de mon fichier index.ejs grâce à la méthode render
    const userConnected = req.session.userConnected ? req.session.userConnected : null;
    const isConnected = req.session.isConnected ? req.session.isConnected : false ;
    res.status(200).render(path.join(__dirname, '../index.ejs'), { isConnected, userConnected });
});

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;