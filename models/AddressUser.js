const mongoose = require('mongoose');

const addressUserSchema = mongoose.Schema({
    street: { type: String, required: true, trim: true },
    zipcode: { type: Number, required: true, trim: true },
    city: { type: String, required: true, trim: true }
});

module.exports = mongoose.model('AddressUser', addressUserSchema, 'addressusers')