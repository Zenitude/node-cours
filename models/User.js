// J'importe les modules et les potentiels modèles nécessaires
const mongoose = require('mongoose');
const AddressUser = require('./AddressUser');

// J'utilise la méthode Schema pour définir le model de document pour la collection users
const userSchema = mongoose.Schema({
    lastname: { type: String, required: true, trim: true },
    firstname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    address: { type: mongoose.Schema.Types.ObjectId, ref: AddressUser}
});

// J'exporte mon model en lui donnant un nom, lui associant son schéma ainsi que la collection de la base de données
module.exports = mongoose.model('User', userSchema, 'users');

/*
    Exemple d'un Document de la collection users
 {
    "_id": klladb77510aa78
    "lastname": "Doe",
    "firstname": "John",
    "mail": "jd@mail.com",
    "password": "qsfqsfsqf",
    "address": "qASD2487FDQlllk"
 }

*/