// J'importe les modules et les potentiels modèles nécessaires
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// J'utilise la méthode Schema pour définir le model de document pour la collection brands
const brandSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
});

brandSchema.plugin(uniqueValidator);

// J'exporte mon model en lui donnant un nom, lui associant son schéma ainsi que la collection de la base de données
module.exports = mongoose.model('Brand', brandSchema, 'brands')