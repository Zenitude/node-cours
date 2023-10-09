// Appel du modèle AddressUser
const AddressUser = require('../models/AddressUser');

// Fonction pour ajouter une adresse dans la base de données
const createAddress = async (req) => {
    const newAddress = new AddressUser({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    });
    return await newAddress.save();
}

// Export du middleware
module.exports = createAddress;