// Ce middleware va vérifier qu'un utilisateur est authentifié

exports.verifUser = (req, res, next) => {
    const userId = req.decodedToken.userId ? req.decodedToken.userId : null;
    // Si un id de token est trouvé l'utilisateur peut accéder à la suite
    // => Liste des utilisateurs, Créer un utilisateur, Modifier un utilisateur, Supprimer un utilisateur
    // => Dashboard Admin
    if(userId) { 
        next(); 

    // Sinon, l'utilisateur n'est pas authentifié, il est redirigé vers l'accueil
    // => Empêche l'accès aux pages pour Créer, Lister, Modifier et Supprimer les utilisateurs ainsi que l'accès à la page admin
    } else {
        res.session.userNotAuthorised = `Vous n'êtes pas autorisé à accéder à cette page.`;
        res.redirect('/');
    }
}