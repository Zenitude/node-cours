// J'importe les modèles et modules dont j'aurai besoin
const AddressUser = require('../models/AddressUser');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Fonction de vérification des inputs de formulaire
const verifInputs = (req, res) => {
    body('lastname', 'Le nom est obligatoire').isString().notEmpty();
    body('firstname', 'Le prénom est obligatoire').isString().notEmpty();
    body('email', 'L\'email est obligatoire').isEmail().notEmpty();
    body('password', 'Le mot de passe est obligatoire').isString().notEmpty();
    body('passwordConfirm', 'La confirmation du mot de passe est obligatoire').isString().notEmpty();
    body('street', 'Le numéro et nom de voie est obligatoire').isString().notEmpty();
    body('zipcode', 'Le code postal est obligatoire').isPostalCode('FR').notEmpty();
    body('city', 'La ville est obligatoire').isString().notEmpty();

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
}

// Fonction pour récupérer les informations d'un utilisateur grâce à son email
const findUserByMail = async (req) => {
    return await User.findOne({ email: req.body.email });
}

// Fonction pour récupérer les informations d'une adresse d'un utilisateur grâce à toutes les informations d'une adresse
const findAddress = async (req) => {
    return await AddressUser.findOne({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    })
}

// Fonction pour créer une nouvelle addresse d'utilisateur et sauvegarder celle-ci sur la base de données MongoDb
const createAddress = async (req) => {
    const newAddress = new AddressUser({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    });
    return await newAddress.save();
}

// Fonction pour créer un nouvel utilisateur et sauvegarder celui-ci sur la base de données MongoDb
const newUser = async (idAddress, req, res) => {
    
    const hash = await bcrypt.hash(req.body.password, 10); // Hashage du mot de passe
    
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        address: idAddress
    });

    user.save().then(result => {
        res.status(200).json({message: result});
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

// Middleware pour afficher la page "Créer un utilisateur"
exports.addUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/create-user.ejs'))
}

// Middleware de validation du formulaire de la page "Créer un utilisateur"
exports.createUser = (req, res) => {
    try {
        verifInputs(req, res);

        if(req.body.password === req.body.confirm) {

            findUserByMail(req)
            .then(user => {
                if(user) {
                    return res.status(409).json({message: 'User already exists'});
                } else {
                    findAddress(req)
                    .then(address => {
                        if(address) {
                            newUser(address._id, req, res);
                        } else {
                            createAddress(req)
                            .then(result => {
                                newUser(result.id, req, res);
                            })
                            .catch(error => {
                                console.log('Erreur createAddress', error);
                                res.status(500).json({error: error})
                            })
                        }
                    })
                    .catch(error => {
                        console.log('Erreur findAddress', error);
                        res.status(500).json({error: error});
                    })
                }
            })
            .catch(error => {
                console.log('Erreur findUserByMail', error);
                res.status(500).json({error: error});
            })

        } else {
            res.status(401).redirect('/users/create');
        }
    } catch(error) {
        console.log('try error', error);
    }
}

// Middleware pour afficher la page "Liste des utilisateurs"
exports.getUsers = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/list-users.ejs'))
}

// Middleware pour afficher la page "Profil d'un utilisateur"
exports.getUserById = () => {}

// Middleware pour afficher la page "Mise à jour d'un utilisateur"
exports.modifyUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/update-user.ejs'))
}

// Middleware de validation du formualaire de la page "Mise à jour d'un utilisateur"
exports.updateUser = () => {}

// Middleware pour afficher la page "Supprimer un utilisateur"
exports.removeUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/delete-user.ejs'))
}

// Middleware de validation du formualaire de la page "Supprimer un utilisateur"
exports.deleteUser = () => {}

// équivaut à
// module.exports = { createUser, addUser, getUsers, getUserById, updateUser, modifyUser, deleteUser, removeUser }