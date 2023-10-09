const User = require('../models/User');

const findUserByMail = async (req) => {
    return await User.findOne({ email: req.body.email });
}

module.exports = findUserByMail;