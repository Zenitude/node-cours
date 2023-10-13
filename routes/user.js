// J'importe les modules dont j'aurai besoin
const express = require('express');
const router = express.Router();
const { getUsers, getUser, getUserById, addUser, createUser, updateUser, modifyUser, removeUser, deleteUser } = require('../controllers/users_controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { verifUser } = require('../middlewares/verifUser');

// Créer un utilisateur (get => afficher la page, post => validation formulaire de création)
router.get('/users/create', authMiddleware, verifUser, addUser);
router.post('/users/create/add', authMiddleware, verifUser, createUser);

// Liste des utilisateur (get => afficher la page)
router.get('/users', authMiddleware, verifUser, getUsers);

// Informations d'un utilisateur spécifique (get => afficher la page)
router.get('/users/:id', authMiddleware, verifUser, getUserById, getUser);

// Mise à jour d'un utilisateur (get => afficher la page, put => validation formulaire de mise à jour)
router.get('/users/:id/update', authMiddleware, verifUser, getUserById, modifyUser);
router.put('/users/:id/update', authMiddleware, verifUser, updateUser);

// Supprimer un utilisateur (get => afficher la page, delete => validation formulaire suppression)
router.get('/users/:id/delete', authMiddleware, verifUser, getUserById, removeUser);
router.delete('/users/:id/delete', authMiddleware, verifUser, deleteUser);

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;