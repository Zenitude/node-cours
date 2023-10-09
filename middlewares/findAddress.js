// Appel du modèle AddressUser
const AddressUser = require('../models/AddressUser');

// Fonction pour vérifier si une adresse existe déjà dans la base de données
const findAddress = async (req) => {
    return await AddressUser.findOne({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    })
}

// Export du middleware
module.exports = findAddress;