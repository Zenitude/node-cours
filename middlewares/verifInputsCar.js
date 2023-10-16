// appel des méthodes liées à express-validator
const { body, validationResult } = require('express-validator');

// verifInputs va verifier la conformité des données et les sécuriser 
const verifInputsCar = (req, res) => {
    body('brand', 'La marque est obligatoire').isString().notEmpty();
    body('model', 'Le model est obligatoire').isString().notEmpty();
    body('immat', 'Imattriculation est obligatoire').isString().notEmpty();
    body('doors', 'Nombre de portes est obligatoire').isNumeric().notEmpty();
    body('clim', 'Climatisation est obligatoire').isString().notEmpty();


    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
}

// Export du middleware
module.exports = verifInputsCar;