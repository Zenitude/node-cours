// J'importe tous les modèles et packages dont j'aurai besoin pour mes middlewares
const User = require('../models/User');
const path = require('path');
const bcrypt = require('bcrypt');

// J'importe les middlewares dont j'ai besoin
const verifInputs = require('../middlewares/verifInputs');
const findUserByMail = require('../middlewares/findUserByMail');
const findAddress = require('../middlewares/findAddress');
const createAddress = require('../middlewares/createAddress');

// Fonction pour récupérer les informations d'un utilisateur grâce à son identifiant
const findUserById = async (id) => {
    return await User.findOne({ _id: id});
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

// Fonction pour mettre à jour un utilisateur
const refreshUser = async (idAddress, req, res, user) => {
    // On récupère toutes les informations de l'utilisateur venant du formulaire (req.body), de l'url (req.params), ...
    const updatedUser = {
        _id: req.params.id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: user.password,
        address: idAddress
    }
    
    // On utilise la méthode updateOne de mongoose pour effectuer la mise à jour
    await User.updateOne({ _id: req.params.id}, {...updatedUser})
    .then(result => {
        // Quand la mise à jour s'effectue on enregistre un message de succès
        req.session.successUpdateUser = `Utilisateur ${updatedUser.lastname} ${updatedUser.firstname} mis à jour avec succès.`;
        
        // Puis on redirige vers la page de mise à jour pour voir le message
        res.redirect(`/users/${req.params.id}/update`);
    }).catch(error => {
        console.log(error.message)
        console.log('utilisateur non mis à jour Address trouvé');
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
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    res.status(200).render(path.join(__dirname, '../views/management/users/create-user.ejs'), { isConnected, successCreateUser });
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
        const successDeleteUser = req.session.successDeleteUser ? req.session.successDeleteUser : null;
        const isConnected = req.session.isConnected ? req.session.isConnected : false;
        /* On récupère les informations de l'utilisateur (find) en oubliant pas de relier la collection addressusers (populate) */
        const users = await User.find().populate('address');
        res.status(200).render(path.join(__dirname, '../views/management/users/list-users.ejs'), { users, successDeleteUser, isConnected })
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
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    res.status(200).render(path.join(__dirname, '../views/management/users/detail-user.ejs'), { isConnected, detailsUser });
}

// Middleware pour afficher la page "Mise à jour d'un utilisateur"
exports.modifyUser = async (req, res, next) => {
    const detailsUser = res.locals.detailsUser;
    
    const successUpdateUser = req.session.successUpdateUser
    ? req.session.successUpdateUser : null;
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    
    res.status(200).render(path.join(__dirname, `../views/management/users/update-user.ejs`),    { detailsUser, successUpdateUser, isConnected });
};

// Middleware de validation du formulaire de la page "Mise à jour d'un utilisateur"
exports.updateUser = async (req, res) => {
    try{
        /* On vérifie et sécurise les données qui sont envoyées */
        verifInputs(req, res);
        
        // On vérifie si l'utilisateur existe
        await findUserById(req.params.id).then(user => {
            // S'il existe on vérifie si l'adresse existe
            findAddress(req).then(address => {
                // Si l'adresse existe déjà, on met directement à jour l'utilisateur
                if(address) { refreshUser(address._id, req, res, user); }
                else { 
                // Si l'adresse n'existe pas, on crée l'adresse puis on met à jour l'utilisateur
                    createAddress(req).then(newAddress => {
                    refreshUser(newAddress.id, req, res, user);
                })}
            }).catch(error => {
                res.status(404).send('Error Find Address' + error.message);
            })
        }).catch(error => {
            res.status(404).send('Error Find User' + error.message);
        })
    }catch(error){
        console.error(error.message);
        res.status(500).send('Server Error controller');
    }
}

// Middleware pour afficher la page "Supprimer un utilisateur"
exports.removeUser = async (req, res, next) => {
    const detailsUser = res.locals.detailsUser;
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    res.status(200).render(path.join(__dirname, `../views/management/users/delete-user.ejs`), { isConnected, detailsUser })
}

// Middleware de validation du formulaire de la page "Supprimer un utilisateur"
exports.deleteUser = async (req, res) => {
    try{
        // On vérifie si l'utilisateur existe
        await findUserById(req.params.id).then(user => {
            // S'il n'existe pas on retourne un message d'erreur
            if(!user) {res.status(404).send('User not found');}
            else {
                // S'il existe on utilise la méthode deleteOne pour le supprimer en fonction de son identifiant qu'on récupère depuis les paramètres de l'url (req.params)
                user.deleteOne({_id: req.params.id}).then(() => {
                    // On stocke au niveau de la session un message de succès
                    req.session.successDeleteUser = `Utilisateur ${user.lastname} ${user.firstname} supprimé avec succès.`;
                    // On redirige vers la liste des utilisateurs pour voir le message apparaître
                    res.redirect(`/users`);
                }).catch(error => res.status(400).send('Error Delete User ' + error.message))
            }
        }).catch(error =>
            res.status(400).send('Error Find User ' + error.message)
        )
    } catch(error) {res.status(404).send('Error delete' + error.message);}
}

// équivaut à
// module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser }
// module.exports = { verifInputs, findUserByMail, findAddress, createAddress}

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