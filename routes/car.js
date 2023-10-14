// J'importe les modules dont j'aurai besoin
const express = require('express');
const router = express.Router();
const { getCars, getCar, getCarById, addCar, createCar, updateCar, modifyCar, removeCar, deleteCar } = require('../controllers/cars_controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { verifUser } = require('../middlewares/verifUser');

// Créer un véhicule (get => afficher la page, post => validation formulaire de création)
router.get('/cars/create', authMiddleware, verifUser, addCar);
router.post('/cars/create/add', authMiddleware, verifUser, createCar);

// Liste des véhicule (get => afficher la page)
router.get('/cars', authMiddleware, verifUser, getCars);

// Informations d'un véhicule spécifique (get => afficher la page)
router.get('/cars/:id', authMiddleware, verifUser, getCarById, getCar);

// Mise à jour d'un véhicule (get => afficher la page, put => validation formulaire de mise à jour)
router.get('/cars/:id/update', authMiddleware, verifUser, getCarById, modifyCar);
router.put('/cars/:id/update', authMiddleware, verifUser, updateCar);

// Supprimer un véhicule (get => afficher la page, delete => validation formulaire suppression)
router.get('/cars/:id/delete', authMiddleware, verifUser, getCarById, removeCar);
router.delete('/cars/:id/delete', authMiddleware, verifUser, deleteCar);

// J'exporte le router pour relier mes différentes routes au projet
module.exports = router;