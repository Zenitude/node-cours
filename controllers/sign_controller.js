// J'importe les modèles et modules dont j'aurai besoin
const AddressUser = require('../models/AddressUser');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Middleware d'affichage de la page d'inscription
exports.signup = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/sign/signup.ejs'))
}

// Middleware de validation de formulaire d'inscription
exports.createUser = (req, res) => {}

// Middleware d'affichage de la page de connexion
exports.signin = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/sign/signin.ejs'))
}

// Middleware de validation de formulaire de connexion
exports.login = (req, res) => {}

// Middleware de validation de formulaire de déconnexion
exports.logout = (req, res) => {}
