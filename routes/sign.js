// J'importe les modules dont j'aurai besoin
const express = require('express');
const router = express.Router();
const { signup, createUser, signin, login, logout } = require('../controllers/sign_controller');

// Connexion (get => afficher la page, post => validation formulaire connexion)
router.get('/signin', signin);
router.post('/login', login);

// Inscription (get => afficher la page, post => validation formulaire inscription)
router.get('/signup', signup);
router.post('/signup/create', createUser);

// Déconnexion (post => validation formulaire déconnexion)
router.post('/logout', logout);

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;