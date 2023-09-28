const express = require('express');
const path = require('path');
const router = express.Router();

// Dès qu'une information est précisé derrière le "/" il s'agit d'une ressource, ici on demande la ressource "contact"
router.get('/contact', (req, res) => {
    // Pour cette ressource je traite la réponse adéquate
    // J'indique le status de la réponse (200)
    // J'affiche les données du fichier contact.html
    res.status(200).render(path.join(__dirname, '../views/contact.ejs'));
});

module.exports = router;