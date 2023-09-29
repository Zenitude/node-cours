// J'importe les modules dont j'aurai besoin
const express = require('express');
const path = require('path');
const router = express.Router();

// Dès qu'une information est précisé derrière le "/" il s'agit d'une ressource, ici on demande la ressource "admin"
router.get('/admin', (req, res) => {
    // Pour cette ressource je traite la réponse adéquate
    // J'indique le status de la réponse (200)
    // J'affiche les données du fichier admin.ejs
    res.status(200).render(path.join(__dirname, '../views/management/admin.ejs'));
});

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;