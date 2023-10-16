// J'importe les modules et les potentiels modèles nécessaires
const mongoose = require('mongoose');
const Brand = require('./Brand');
const uniqueValidator = require('mongoose-unique-validator');

// J'utilise la méthode Schema pour définir le model de document pour la collection cars
const carSchema = mongoose.Schema({
    immat: { type: String, required: true, trim: true, unique: true},
    model: { type: String, required: true, trim: true },
    doors: { type: Number, required: true, trim: true },
    clim: { type: Boolean, required: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: Brand}
});

carSchema.plugin(uniqueValidator);

// J'exporte mon model en lui donnant un nom, lui associant son schéma ainsi que la collection de la base de données
module.exports = mongoose.model('Car', carSchema, 'cars');