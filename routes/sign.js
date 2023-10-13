// J'importe les modules dont j'aurai besoin
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { verifSign } = require('../middlewares/verifSign');

const { signup, createUser, signin, login, logout, disconnect } =
require('../controllers/sign_controller');

// Connexion (get => afficher la page, post => validation formulaire connexion)
router.get('/signin', verifSign, signin);
router.post('/signin/login', verifSign, login);

// Inscription (get => afficher la page, post => validation formulaire inscription)
router.get('/signup', verifSign, signup);
router.post('/signup/create', verifSign, createUser);

// Déconnexion (post => validation formulaire déconnexion)
router.get('/logout', authMiddleware, logout)
router.post('/logout/disconnect', authMiddleware, disconnect);

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;