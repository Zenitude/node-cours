# App.js

C'est le fichier qui contient le serveur qu'on peut séparer en 4 parties
* Les différents modules requis pour le faire marcher 
    * const = require('nom-module')

* La partie configuration du serveur
    * express.json
    * express.urlencoded
    * express-session
    * method-override
    * dotenv
    * cors
    * ...

* Les différentes routes avec en dernier la route d'erreur
    * app.use(routes)

* L'écoute du serveur sur un port donné
    * app.listen(port, () => { console.log(message à afficher) })

# Les fichiers Routes

Ce sont les fichiers dans lesquels indique les différents type de requêtes (GET, POST, PUT, DELETE)
* .get() : utilisé pour récupérer des informations et les afficher
    * Les méthodes mongoose qui y sont généralement associés pour récupérer des données sont .find() et .findOne()

    * En générale on utilise très peu .render() puisque les frameworks front-end (react, next, angular, ...) s'occupe de l'affichage

    * Avec les frameworks on utilisera surtout la méthode .json() puis côté framework on utilisera la fonction fetch() sur l'url de l'api 
        * fetch(http:localhost:3001/users) pour récupérer la liste des utilisateurs côté framework

* .post() : utilisé pour créer un nouvel élément dans une base de données
    * La méthode mongoose qui y est associé est .save()

* .put() : utilisé pour mettre à jour un élément existant dans une base de données
    * La méthode mongoose qui y est généralement associé est la méthode .updateOne()

* .delete() : utilisé pour supprimer un élément existant dans une base de données
    * La méthode mongoose qui y est généralement associé est la méthode .deleteOne()

### Comment s'organise le fichier ?
* On appel en premier les modules nécessaires (express, path, router)

* On définit les différentes routes
    * Pour les pages affichant simplement des données une route .get() est suffisant
    * Pour les création, mise à jour et suppression, chacunes de ces requêtes aura deux routes 
        * .get() pour afficher la page permettant de faire l'action
        * et une route pour la méthode correspondant à l'action voulu .post/.put/.delete

* Puis on exporte le router pour appeler les routes sur le fichier App.js

# Les fichiers Models (Schémas)

Servent à indiquer à MongoDB la configuration des documents d'une collection
* On commence par appeler mongoose

* Puis on définit le schéma à l'aide de la méthode .Schema() de mongoose qui prend un objet en tant que paramètre
    * L'objet comportera des propriétés (nom des données) auxquelles on indiquera par exemple le type de valeur attendu (String, Number, ...)
    * La valeur des propriétés sera définit au moment des création (post) et mise à jour (put)

* Enfin on définit le model grâce à la méthode .model() de mongoose qui prend 3 paramètres
    * Le nom du model : écrit en PascalCase (User)
    * Le nom du schéma correspondant : écrit en camelCase (userSchema)
    * Le nom de la collection : écrit en fatcase (users)
        * Si la collection n'est pas indiqué, mongoose va rechercher le nom du model écrit en minuscule et mis au pluriel (User > user > users)

# Les fichiers controller

Ces fichiers vont contenir toutes les fonctions middlewares qui seront exécutés au moment de l'appel d'une ressource (http://domaine:port/ressource => http:localhost:3001/users)

* On commence par appeler les différents models et modules dont on aurait besoin pour nos middlewares
* Puis on définit les fonctions qui seront potentiellement utiles dans plusieurs middlewares
* On définit ensuite nos middelware en les exportant directement pour pouvoir les appeler dans les fichiers routeur

# Le dossier Public

Contient tous les fichiers dit "static" qui seront accessibles au publique
Il s'agit généralement des feuilles de style (css), des scripts (js) et des différents assets (images, audios, videos)

# Le fichier .env et .gitignore

Le fichier .env contiendra toutes les variables d'environnement, ces variables sont généralement des donénes dit "sensible", comme des clé Api, des mot de passe, des clé de cryptage (token, session), ...

On indiquera dans le fichier .gitignore, tous les dossiers et fichiers qui ne doivent pas être envoyés sur Github au moment du push d'un commit.

# Le dossier node_modules et le fichier package.json

Contient tous les modules qui ont été installé pour faire fonctionner le serveur, ces modules sont référencés dans le fichier package.json

* Au moment du push d'un commit avec Git, le dossier node_modules n'est pas envoyé vers Github

* Quand on récupère un projet depuis Github, on ne récupèrera donc pas le dossier node_modules

* Pour réinstaller nos modules, on utilisera "npm install" qui installera les modules référencés dans le fichier package.json