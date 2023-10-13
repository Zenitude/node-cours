// J'importe les modèles et modules dont j'aurai besoin
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifInputs = require('../middlewares/verifInputs');
const findUserByMail = require('../middlewares/findUserByMail');
const findAddress = require('../middlewares/findAddress');
const createAddress = require('../middlewares/createAddress');
const path = require('path');
const jwt = require('jsonwebtoken');

const signUser = async (idAddress, req, res) => {
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
        // Je crée mes variable de session (userConnected => message accueil, isConnected => navigation header dynamique)
        req.session.userConnected = `Bienvenue ${result.lastname} ${result.firstname}.`
        req.session.isConnected = true;
        
        // Je crée mon token d'authentification grâce à JsonWebToken, en lui définissant un id utilisateur, une clé de décryptage, et la durée d'existance du token
        const token = jwt.sign(
            { userId: result._id},
            process.env.SECRET_KEY_TOKEN,
            { expiresIn: '7d'}
        );

        // Je crée mon cookie, en lui définissant un nom, en lui donnant son contenu (le token crée juste au dessus), puis je définis ses options
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 604800000
        });
        
        /* On redirige vers la page de création d'un utilisateur */
        res.status(200).redirect('/');
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

// Middleware d'affichage de la page d'inscription
exports.signup = async (req, res) => {
    const isConnected = req.session.isConnected
    ? req.session.isConnected
    : false;

    // Si l'utilisateur est connecté je redirige vers l'accueil
    if(isConnected) {
        res.status(300).redirect(`/`);

    // Si l'utilisateur n'est pas connecté il peut accéder à la page d'inscription
    } else {
        res.status(200).render(path.join(__dirname, `../views/sign/signup.ejs`), { isConnected });
    }
    
};

// Middleware de validation de formulaire d'inscription
exports.createUser = async (req, res) => {
    try{
        // On vérifie que le Mot de passe et la confirmation soient identique
        if(req.body.password === req.body.confirm) {
            // On sécurise les données envoyées
            verifInputs(req, res);

            // On commence par vérifier si l'utilisateur existe en fonction de son email
            await findUserByMail(req).then(user => {
                // Si l'utilisateur existe on envois un message
                if(user) { res.status(400).send('User Already Exist'); }

                // Si l'utilisateur n'existe pas on continue
                else {
                    // On vérifie si l'adresse saisie existe
                    findAddress(req).then(address => {
                        // Si l'adresse existe déjà on inscrit l'utilisateur
                        if(address) { signUser(address.id, req, res) }

                        // Si l'adresse n'existe pas on crée d'abord l'adresse puis on inscrit l'utilisateur
                        else {
                            createAddress(req)
                            .then(result => signUser(result.id, req, res))
                            .catch(error => res.status(400).send('Erreur Create Address ' + error.message))
                        }
                    }).catch(error => res.status(400).send('Erreur Find Address ' + error.message))
                }
            }).catch(error => res.status(404).send('User Already Exist : ' + error.message))
        }
        else {
            res.status(500).send('Les mots de passe ne sont pas identique')
        }
    } catch(error) {
        res.status(500).send('Erreur Sign CreateUser Try ' + error.message)
    }
}

// Middleware d'affichage de la page de connexion
exports.signin = async (req, res) => {
    const isConnected = req.session.isConnected
    ? req.session.isConnected
    : false;

    // Si l'utilisateur est connecté je le redirige vers l'accueil
    if(isConnected) {
        res.status(300).redirect(`/`);

    // Si l'utilisateur n'est pas connecté il peut accéder à la page de connexion
    } else {
        res.status(200).render(path.join(__dirname, `../views/sign/signin.ejs`), { isConnected });
    }
};

// Middleware de validation de formulaire de connexion
exports.login = async (req, res) => {
    try {
        // On vérifie si l'utilisateur existe grâce à son email
        await findUserByMail(req).then(user => {
            // Si l'utilisateur existe on continue
            if(user) {
                // On compare le mot de passe qui a été saisie et celui qui est stocké dans la base de données
                const compare = bcrypt.compare(req.body.password, user.password);

                // Si la comparaison est valide on valide la connexion et on redirige vers l'accueil
                if(compare) {
                    // Je crée mes variable de session (userConnected => message accueil, isConnected => navigation header dynamique)
                    req.session.userConnected = `Bienvenue ${user.lastname} ${user.firstname}`;
                    req.session.isConnected = true;
                    
                    // Je crée mon token d'authentification grâce à JsonWebToken, en lui définissant un id utilisateur, une clé de décryptage, et la durée d'existance du token
                    const token = jwt.sign(
                        { userId: user._id},
                        process.env.SECRET_KEY_TOKEN,
                        { expiresIn: '7d'}
                    );

                    // Je crée mon cookie, en lui définissant un nom, en lui donnant son contenu (le token crée juste au dessus), puis je définis ses options
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 604800000 // millisecondes
                    });
                    
                    // Je redirige vers l'accueil
                    res.status(200).redirect('/');
                
                // Si la comparaison échoue on affiche un message
                }   else {
                    res.status(401).send('Mot de passe ou Email incorrect');
                }
            // Si l'utilisateur n'existe pas on affiche un message
            } else {
                res.status(401).send('Mot de passe ou Email incorrect');
            } 
        })
        .catch(error => res.status(404).send('User not found ' + error.message))
    }
    catch(error) {
        console.log(error);
    }
}

// Middleware pour afficher la page "Déconnexion"
exports.logout = (req, res) => {
    // Je récupère l'id de l'utilisateur stocké dans la propriété decodedToken qui contient l'id du token d'authentification
    const userId = req.decodedToken.userId ? req.decodedToken.userId : null;
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    
    // Si l'utilisateur est connecté il peut accéder à la page de déconnexion
    if(userId) {
        res.status(200).render(path.join(__dirname, `../views/sign/logout.ejs`), { isConnected })

    // Dans le cas contraire il est redirigé vers la page d'accueil
    } else {
        res.status(300).redirect(`/`);
    }
};

// Middleware de validation de formulaire de déconnexion
exports.disconnect = async (req, res, next) => {
    try{
        // Je nettoies tous les cookies qui ont été créés avec la méthode clearCookie
        res.clearCookie('token');

        // Je supprime toutes les variables de session qui ont été créé en détruisant la session avec la méthode destroy
        req.session.destroy();

        // Je redirige vers l'accueil
        res.redirect('/');
    } catch(error) {
        res.status(500).send('Erreur Inscription Try ' + error.message)
    }
}
