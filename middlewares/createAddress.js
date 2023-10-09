const AddressUser = require('../models/AddressUser');

const createAddress = async (req) => {
    const newAddress = new AddressUser({
        street: req.body.street,
        zipcode: req.body.zipcode,
        city: req.body.city
    });
    return await newAddress.save();
}

module.exports = createAddress;