exports.verifUser = (req, res, next) => {
    const userId = req.decodedToken.userId ? req.decodedToken.userId : null;
    
    if(userId) { 
        next(); 
    } else {
        res.session.userNotConnected = `Vous n'êtes pas autorisé à accéder à cette page.`;
        res.redirect('/');
    }
}