const express = require('express');
const path = require('path');
const router = express.Router();

// Quand une ressource incorrect est saisie dans l'url => http://localhost:3001/qshfms, on doit également traiter ce cas de figure
// Ici il ne s'agit d'aucune ressource précise on utilise donc le middlewaire use sans indiquer de route précise en utilisant directement la callback
router.use((req, res) => {
    // Je traite la réponse à envoyer si une mauvaise ressource apparaît
    // J'indique le status de la réponse (404)
    // J'affiche les données du fichier error.html
    res.status(404).render(path.join(__dirname, '../views/error.ejs'));
});

module.exports = router;