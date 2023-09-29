// J'importe les différents modules dont j'ai besoin pour mon serveur
const express = require('express'); // express pour faciliter la création du serveur
const dotenv = require('dotenv'); // dotenv pour accéder aux variables d'environnement du fichier .env
const morgan = require('morgan'); // morgan pour afficher des informations au moment des requêtes
const mongoose = require('mongoose'); // mongoose va permettre ici de se connecter à la base de données
const app = express(); // J'initialise le serveur de mon application avec la fonction express.
dotenv.config(); // J'utilise la méthode config de dotenv pour connecter mon fichier .env et accéder à ses variables

// J'importe toutes les routes de mon projet
const homeRoutes = require('./routes/home');
const contactRoutes = require('./routes/contact');
const errorRoutes = require('./routes/error');
const usersRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const signRoutes = require('./routes/sign');

// J'utilise la méthode json pour pouvoir "parser" les données de formulaires, afin de les récupérer grâce à req.body
app.use(express.json());

// Je me connecte à la base de donnée
mongoose.connect(process.env.URL_DATABASE)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.log(`${error}`));

// Je configure l'accès aux données dites "publique" de mon serveur grâce à la méthode static d'express
app.use('/images', express.static(`${__dirname}/public/images/`)); // les liens des images commenceront maintenant par "/images/" => "/images/monImage.jpg"
app.use('/styles', express.static(`${__dirname}/public/styles/`)); // les liens vers mes feuilles de style commenceront maintenant par "/styles" => "/styles/monStyle.css"

// Avant qu'une requête soit envoyer je veux configurer quelques middlewares qui afficheront des informations utiles comme la date/heure de la requête, ou encore le status/type de la requête
// Avec ce middleware, je veux afficher la date de la requête 
app.use((req, res, next) => {
    console.log(new Date().toLocaleDateString());
    next();
});

// Avec le middleware morgan j'affiche le status et le type de requête, sa vitesse d'exécution et la quantité de données traitées
app.use(morgan('dev'));

// Mes différentes routes sont des middlewares, j'utilise donc ici la méthode use comme pour un middleware personnalisé/externe
app.use(homeRoutes);
app.use(contactRoutes);
app.use(adminRoutes);
app.use(usersRoutes);
app.use(signRoutes);
app.use(errorRoutes);

// J'écoute les informations émis par mon application (app) avec la méthode listen, sans cette méthode le serveur ne peut fonctionner
app.listen((process.env.PORT || 3000), () => {
    console.log(`Le site est disponible à l'adresse http://${process.env.HOST ? process.env.HOST : 'localhost'}:${process.env.PORT ? process.env.PORT : 3000}`)
});

/*
    app.use    => pour utiliser des middleware, configurer des informations (dossier public), ou traiter des informations sans ressource spécifique
    app.listen => le serveur va être "écouté" sur un certain port
    app.get    => une donnée va être lu sur une ressource spécifique (/users => liste des utilisateurs)
    app.post   => une donnée va être créé sur une ressource spécifique (/users/create => créer un utilisateur)
    app.put    => une donnée va être modifié sur une ressource spécifique (/users/:id/update => mettre à jour un utilisateur)
    app.delete => une donnée va être supprimée sur une ressource spécifique (/users/:id/delete => supprimer un utilisateur)
*/