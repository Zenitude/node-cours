// J'importe tous les modèles et packages dont j'aurai besoin pour mes middlewares
const AddressUser = require('../models/AddressUser');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const path = require('path');
const bcrypt = require('bcrypt');

// verifInput va verifier la conformité des données et les sécuriser 
const verifInputs = (req, res) => {
    body('lastname', 'Le nom est obligatoire').isString().notEmpty();
    body('firstname', 'Le prénom est obligatoire').isString().notEmpty();
    body('email', 'L\'email est obligatoire').isEmail().notEmpty();
    body('password', 'Le mot de passe est obligatoire').isString().notEmpty();
    body('confirm', 'La confirmation du mot de passe est obligatoire').isString().notEmpty();
    body('street', 'Le numéro et nom de voie est obligatoire').isString().notEmpty();
    body('zipcode', 'Le code postal est obligatoire').isPostalCode('FR').notEmpty();
    body('city', 'La ville est obligatoire').isString().notEmpty();

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
}

// Fonction vérifier si un utilisateur existe déjà dans la base de données
const findUserByMail = async (req) => {
    return await User.findOne({ email: req.body.email });
}

// Fonction pour vérifier si une adresse existe déjà dans la base de données
const findAddress = async (req) => {
    return await AddressUser.findOne({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    })
}

// Fonction pour ajouter une adresse dans la base de données
const createAddress = async (req) => {
    const newAddress = new AddressUser({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    });
    return await newAddress.save();
}

// Fonction pour ajouter un nouvel utilisateur dans la base de données
const newUser = async (idAddress, req, res) => {
    // Hashage du mot de passe grâce à la méthode hash du package bcrypt
    const hash = await bcrypt.hash(req.body.password, 10);
    
    // Création d'un nouvel utilisateur (new User) avec les données du formulaire (req.body)
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        address: idAddress
    });

    /* Sauvegarde des données du nouvel utilisateur dans la base de données grâce à la méthode .save de mongoose */
    user.save().then(result => {
        /* On crée une variable de session pour pouvoir l'utiliser sur un autre type de requête http (post => get) */
        req.session.successCreateUser = `Utilisateur ${result.lastname} ${result.firstname} créé avec succès.`
        /* On redirige vers la page de création d'un utilisateur */
        res.status(200).redirect('/users/create');
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

// Middleware pour récupérer les informations d'un utilisateur grâce à son id (:id) qui se trouve dans les paramètre de l'url (/users/:id)
exports.getUserById = async (req, res, next) => {
    try{
        /* Pour récupérer un paramètre d'url on utilise la propriété params de l'objet request */
        const user = await User.findOne({_id: req.params.id }).populate('address');
        /* 
            On stocke les données de l'utilisateur localement avec la propriété locals de l'objet request  
            qui permet de transférer des informations d'une requête vers elle-même (get /users/:id => get /users/:id)
        */
        res.locals.detailsUser = user;
        /* Comme le middleware se situera au milieu d'une requête on utilise next pour passer au middleware suivant */
        next();
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

// Middleware pour afficher la page "Créer un utilisateur"
exports.addUser = (req, res) => {
    /* On récupère si c'est le cas, la variable de session successCreateUSer pour afficher son contenu dans la page */
    const successCreateUser = req.session.successCreateUser ? req.session.successCreateUser : null;
    res.status(200).render(path.join(__dirname, '../views/management/users/create-user.ejs'), { successCreateUser });
}

// Middleware de validation du formulaire de la page "Créer un utilisateur"
exports.createUser = (req, res) => {
    try {
        /* On vérifie et sécurise les données qui sont envoyées */
        verifInputs(req, res);

        /* On vérifie si l'utilisateur existe déjà dans la base de données */
        findUserByMail(req)
        .then(user => {
            /* Si l'utilise existe */
            if(user) {
                return res.status(409).json({message: 'User already exists'});

            /* Si l'utilisateur n'existe pas */
            } else {
                /* On vérifie si l'adresse existe déjà dans la base de données */
                findAddress(req)
                .then(address => {
                    /* Si l'adresse existe, on crée directement un nouvel utilisateur */
                    if(address) {
                        newUser(address._id, req, res);
                    
                    /* Si l'adresse n'existe pas, on crée la nouvelle adresse puis on crée ensuite le nouvel utilisateur */
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

    } catch(error) {
        console.log('try error', error);
    }
}

// Middleware pour afficher la page "Liste des utilisateurs"
exports.getUsers = async (req, res, next) => {
    try{
        /* On récupère les informations de l'utilisateur (find) en oubliant pas de relier la collection addressusers (populate) */
        const users = await User.find().populate('address');
        res.status(200).render(path.join(__dirname, '../views/management/users/list-users.ejs'), { users })
    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

// Middleware pour afficher la page "Détails d'un utilisateur"
exports.getUser = (req, res) => {
    /* On récupère les informations issue du middleware getUserById en les stockant dans une variable */
    const detailsUser = res.locals.detailsUser ? res.locals.detailsUser : null;
    res.status(200).render(path.join(__dirname, '../views/management/users/detail-user.ejs'), { detailsUser });
}

// Middleware pour afficher la page "Mise à jour d'un utilisateur"
exports.modifyUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/update-user.ejs'))
}

// Middleware de validation du formulaire de la page "Mise à jour d'un utilisateur"
exports.updateUser = () => {}

// Middleware pour afficher la page "Supprimer un utilisateur"
exports.removeUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/delete-user.ejs'))
}

// Middleware de validation du formulaire de la page "Supprimer un utilisateur"
exports.deleteUser = () => {}

// équivaut à
// module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser }


/*
 req.locals => permet de récupérer des informations afin de les stocker d'une requête http vers elle-même (get > get)
 req.session => permet de récupérer des informations afin de les stocker entre deux type de requête différent (post => get, put => get, delete => get)
*/

/*
    Méthodes mongoose
    ----------------------
    .save() => sauvegarder les nouvels données pour créer un nouvel élément dans une collection
    .find() => récupérer toutes les informations d'une collection
    .findOne({propriete: valeur}) => récupérer toutes les informations d'une collection en fonction d'une valeur spécifique
*/