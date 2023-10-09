const { body, validationResult } = require('express-validator');

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

module.exports = verifInputs;