// Appel du model User
const User = require('../models/User');

// Fonction pour vérifier si un utilisateur existe déjà dans la base de données
const findUserByMail = async (req) => {
    return await User.findOne({ email: req.body.email });
}

// Export du middleware
module.exports = findUserByMail;