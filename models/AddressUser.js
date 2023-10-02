// J'importe les modules et les potentiels modèles nécessaires
const mongoose = require('mongoose');

// J'utilise la méthode Schema pour définir le model de document pour la collection addressusers
const addressUserSchema = mongoose.Schema({
    street: { type: String, required: true, trim: true },
    zipcode: { type: Number, required: true, trim: true },
    city: { type: String, required: true, trim: true }
});

// J'exporte mon model en lui donnant un nom, lui associant son schéma ainsi que la collection de la base de données
module.exports = mongoose.model('AddressUser', addressUserSchema, 'addressusers')

/*
    Exemple d'un Document de la collection addressusers
 {
    "_id": "a792adFDFQF",
    "street": "1 rue des Does",
    "zipcode": 59400,
    "city": "Cambrai",
 }

*/