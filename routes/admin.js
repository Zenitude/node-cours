// J'importe les modules dont j'aurai besoin
const express = require('express');
const path = require('path');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

// Dès qu'une information est précisé derrière le "/" il s'agit d'une ressource, ici on demande la ressource "admin"
router.get('/admin', authMiddleware, (req, res) => {
    // Pour cette ressource je traite la réponse adéquate
    // J'indique le status de la réponse (200)
    // J'affiche les données du fichier admin.ejs
    const userConnected = req.session.userConnected ? req.session.userConnected : null ;
    res.status(200).render(path.join(__dirname, '../views/management/admin.ejs'), { userConnected });
});

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;