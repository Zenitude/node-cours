// Ce middleware vérifie si un utilisateur est connecté

exports.verifSign = (req, res, next) => {
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    
    // Si l'utilisateur est connecté il est redirigé vers l'accueil
    // => Empêche l'accès aux pages de connexion, inscription
    if(isConnected) { 
        req.session.userNotAuthorised = `Vous n'êtes pas autorisé à accéder à cette page.`;
        res.redirect('/');

    // Si l'utilisateur n'est pas connecté il peut accéder à la suite
    // => Connexion ou Inscription
    } else {
        next(); 
    }
}