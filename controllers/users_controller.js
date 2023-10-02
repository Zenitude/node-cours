const AddressUser = require('../models/AddressUser');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const path = require('path');
const bcrypt = require('bcrypt');

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

const findUserByMail = async (req) => {
    return await User.findOne({ email: req.body.email });
}

const findAddress = async (req) => {
    return await AddressUser.findOne({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    })
}

const createAddress = async (req) => {
    const newAddress = new AddressUser({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    });
    return await newAddress.save();
}

const newUser = async (idAddress, req, res) => {
    const hash = await bcrypt.hash(req.body.password, 10);
    
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        address: idAddress
    });

    user.save().then(result => {
        req.session.successCreateUser = `Utilisateur ${result.lastname} ${result.firstname} créé avec succès.`
        res.status(200).redirect('/users/create');
    }).catch(error => {
        res.status(500).json({error: error})
    })
}

exports.getUserById = async (req, res, next) => {
    try{
        const user = await User.findOne({_id: req.params.id }).populate('address');
        res.locals.detailsUser = user;
        next();
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

exports.addUser = (req, res) => {
    const successCreateUser = req.session.successCreateUser ? req.session.successCreateUser : null;
    res.status(200).render(path.join(__dirname, '../views/management/users/create-user.ejs'), { successCreateUser });
}

exports.createUser = (req, res) => {
    try {
        verifInputs(req, res);

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

    } catch(error) {
        console.log('try error', error);
    }
}

exports.getUsers = async (req, res, next) => {
    try{
        const users = await User.find().populate('address');
        res.status(200).render(path.join(__dirname, '../views/management/users/list-users.ejs'), { users })
    }
    catch(error){
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}

exports.getUser = (req, res) => {
    const detailsUser = res.locals.detailsUser ? res.locals.detailsUser : null;
    res.status(200).render(path.join(__dirname, '../views/management/users/detail-user.ejs'), { detailsUser });
}

exports.modifyUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/update-user.ejs'))
}
exports.updateUser = () => {}

exports.removeUser = (req, res) => {
    res.status(200).render(path.join(__dirname, '../views/management/users/delete-user.ejs'))
}

exports.deleteUser = () => {}

// équivaut à
// module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser }