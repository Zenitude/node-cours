const mongoose = require('mongoose');
const AddressUser = require('./AddressUser');

const userSchema = mongoose.Schema({
    lastname: { type: String, required: true, trim: true },
    firstname: { type: String, required: true, trim: true },
    mail: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    birth: { type: String, required: true, trim: true},
    address: { type: mongoose.Schema.Types.ObjectId, ref: AddressUser}
});

module.exports = mongoose.model('User', userSchema, 'users');

/*
 {
    _id: a792adFDFQF,
    lastname: Doe,
    firstname: John,
    mail: jd@mail.com,
    password: qsfqsfsqf,
    birth: 28/09/2023,
    address: qASD2487FDQlllk
 }

*/