// J'importe les modules dont j'aurai besoin
const express = require('express');
const router = express.Router();
const { getUsers, getUser, getUserById, addUser, createUser, updateUser, modifyUser, removeUser, deleteUser } = require('../controllers/users_controller');

// Créer un utilisateur (get => afficher la page, post => validation formulaire de création)
router.get('/users/create', addUser);
router.post('/users/create/add', createUser);

// Liste des utilisateur (get => afficher la page)
router.get('/users', getUsers);

// Informations d'un utilisateur spécifique (get => afficher la page)
router.get('/users/:id', getUserById, getUser);

// Mise à jour d'un utilisateur (get => afficher la page, put => validation formulaire de mise à jour)
router.get('/users/:id/update', getUserById, modifyUser);
router.put('/users/:id/update', updateUser);

// Supprimer un utilisateur (get => afficher la page, delete => validation formulaire suppression)
router.get('/users/:id/delete', getUserById, removeUser);
router.delete('/users/:id/delete', deleteUser);

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;