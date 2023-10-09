// J'importe les modèles et modules dont j'aurai besoin
const User = require('../models/User');
const bcrypt = require('bcrypt');
const verifInputs = require('../middlewares/verifInputs');
const findUserByMail = require('../middlewares/findUserByMail');
const findAddress = require('../middlewares/findAddress');
const createAddress = require('../middlewares/createAddress');
const path = require('path');

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
        /* On crée une variable de session pour pouvoir l'utiliser sur un autre type de requête http (post => get) */
        req.session.userConnected = `Bienvenue ${result.lastname} ${result.firstname}.`
        /* On redirige vers la page de création d'un utilisateur */
        res.status(200).redirect('/');
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

// Middleware d'affichage de la page d'inscription
exports.signup = async (req, res) => {
    const userConnected = req.session.userConnected
    ? req.session.userConnected
    : null;
    res.status(200).render(path.join(__dirname, `../views/sign/signup.ejs`), { userConnected });
};

// Middleware de validation de formulaire d'inscription
exports.createUser = async (req, res) => {
    try{
        if(req.body.password === req.body.confirm) {
            verifInputs(req, res);

            await findUserByMail(req).then(user => {
                if(user) { res.status(400).send('User Already Exist'); }
                else {
                    findAddress(req).then(address => {
                        if(address) { signUser(address.id, req, res) }
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
    const userConnected = req.session.userConnected
    ? req.session.userConnected
    : null;

    if(userConnected) {
        res.status(300).redirect(`/`);
    } else {
        res.status(200).render(path.join(__dirname, `../views/sign/signin.ejs`));
    }
};

// Middleware de validation de formulaire de connexion
exports.login = async (req, res) => {
    try {
        await findUserByMail(req).then(user => {
            const compare = bcrypt.compare(req.body.password, user.password);
            if(compare) {
                req.session.userConnected = `Bienvenue ${user.lastname} ${user.firstname}`;
                res.status(200).redirect('/');
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

// Middleware de validation de formulaire de déconnexion
exports.logout = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/sign/logout.ejs'))
}

exports.disconnect = (req, res) => {}
