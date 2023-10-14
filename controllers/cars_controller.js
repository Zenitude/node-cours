// J'importe tous les modèles et packages dont j'aurai besoin pour mes middlewares
const Brand = require('../models/Brand');
const Car = require('../models/Car');
const path = require('path');

// J'importe les middlewares dont j'ai besoin
const verifInputs = require('../middlewares/verifInputs');

// Fonction pour trouver un véhicule selon son immatriculation
const findCarByImmat = async (req) => {
    return await Car.findOne({immat: req.body.immat});
}

// Fonction pour trouver une marque dans la base de données
const findBrand = async (req) => {
    return await Brand.findOne({
        name: req.body.brand
    });
}

// Fonction pour ajouter une nouvelle marque dans la base de données
const newBrand = async (req) => {
    const newBrand = new Brand({
        name: req.body.brand
    });
    return await newBrand.save();
}

// Fonction pour ajouter un nouveau véhicule dans la base de données
const newCar = async (req) => {
    // Conversion des données pour la climatisation (string > boolean)
    const clim = req.body.clim === "0" ? false : true;

    // Création d'un nouveau véhicule (new Car) avec les données du formulaire (req.body)
    const car = new Car({
        immat: req.body.immat,
        model: req.body.model,
        doors: req.body.doors,
        clim: clim,
        brand: req.body.brand
    });

    /* Sauvegarde des données du nouveau véhicule dans la base de données grâce à la méthode .save de mongoose */
    car.save().then(result => {
        /* On crée une variable de session pour pouvoir l'utiliser sur un autre type de requête http (post => get) */
        req.session.successCreateCar = `Véhicule ${result.brand} ${result.model} créé avec succès.`
        /* On redirige vers la page de création d'un véhicule */
        res.status(200).redirect('/cars/create');
    }).catch(error => {
        res.status(500).json({message: 'Erreur création véhicule : ' + error})
    })
}

// Fonction pour mettre à jour un véhicule
const refreshCar = async (idBrand, req, res) => {
    // Conversion des données pour la climatisation (string > boolean)
    const clim = req.body.clim === "0" ? false : true;

    // On récupère toutes les informations du véhicule venant du formulaire (req.body), de l'url (req.params), ...
    const updatedCar = {
        _id: req.params.id,
        immat: req.body.immat,
        model: req.body.model,
        doors: req.body.doors,
        clim: clim,
        brand: idBrand
    }
    
    // On utilise la méthode updateOne de mongoose pour effectuer la mise à jour
    await Car.updateOne({ _id: req.params.id}, {...updatedCar})
    .then(result => {
        // Quand la mise à jour s'effectue on enregistre un message de succès
        req.session.successUpdateCar = `Véhicule ${updatedCar.brand} ${updatedCar.model} mis à jour avec succès.`;
        
        // Puis on redirige vers la page de mise à jour pour voir le message
        res.redirect(`/cars/${req.params.id}/update`);
    }).catch(error => {
        console.log(error.message)
        res.status(500).json({message: 'Erreur mise à jour véhicule : ' + error})
    })
}

// Middleware pour récupérer les informations d'un véhicule grâce à son id (:id) qui se trouve dans les paramètre de l'url (/cars/:id)
exports.getCarById = async (req, res, next) => {
    try {
        /* Pour récupérer un paramètre d'url on utilise la propriété params de l'objet request */
        const car = await Car.findOne({_id: req.params.id}).populate('brand');

        /* 
            On stocke les données du véhicule localement avec la propriété locals de l'objet request   
            qui permet de transférer des informations d'une requête vers elle-même (get /users/:id => get /users/:id)
        */
        req.locals.detailsCar = car;

        /* Comme le middleware se situera au milieu d'une requête on utilise next pour passer au middleware suivant */
        next();
    } catch(error) {
        console.log('Try car error', error);
        res.status(500).json({message: 'Erreur find Car id ' + error});
    }
}

// Middleware pour afficher la page "Créer un véhicule"
exports.addCar = async (req, res) => {
    /* On récupère si c'est le cas, la variable de session successCreateCar pour afficher son contenu dans la page */
    const successCreateCar = req.session.successCreateCar ? req.session.successCreateCar : null;
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    res.status(200).render(path.join(__dirname, '../views/management/cars/create-car.ejs'), { isConnected, successCreateCar });
}

// Middleware de validation du formulaire de la page "Créer un véhicule"
exports.createCar = async (req, res) => {
    try {
        /* On vérifie et sécurise les données qui sont envoyées */
        verifInputs(req, res);

        /* On vérifie si l'véhicule existe déjà dans la base de données */
        findCarByImmat(req)
        .then(car => {
            /* Si l'utilise existe */
            if(car) {
                return res.status(409).json({message: 'Car already exists'});

            /* Si l'véhicule n'existe pas */
            } else {
                /* On vérifie si l'adresse existe déjà dans la base de données */
                findBrand(req)
                .then(brand => {
                    /* Si l'adresse existe, on crée directement un nouvel véhicule */
                    if(brand) {
                        newCar(brand._id, req, res);
                    
                    /* Si l'adresse n'existe pas, on crée la nouvelle adresse puis on crée ensuite le nouvel véhicule */
                    } else {
                        newBrand(req)
                        .then(result => {
                            newCar(result.id, req, res);
                        })
                        .catch(error => {
                            console.log('Erreur newBrand :', error);
                            res.status(500).json({message: 'Erreur nouvelle marque : ' + error})
                        })
                    }
                })
                .catch(error => {
                    console.log('Erreur findBrand', error);
                    res.status(500).json({message: 'Erreur recherche marque : ' + error});
                })
            }
        })
        .catch(error => {
            console.log('Erreur findCarByImmat', error);
            res.status(500).json({message: 'Erreur recherche véhicule : ' + error});
        })

    } catch(error) {
        console.log('try createCar error', error);
    }
}

// Middleware pour afficher la page "Liste des véhicules"
exports.getCars = async (req, res) => {
    try{
        const successDeleteCar = req.session.successDeleteCar ? req.session.successDeleteCar : null;
        const isConnected = req.session.isConnected ? req.session.isConnected : false;
        /* On récupère les informations du véhicule (find) en oubliant pas de relier la collection brands (populate) */
        const cars = await Car.find().populate('brand');
        res.status(200).render(path.join(__dirname, '../views/management/cars/list-cars.ejs'), { cars, successDeleteCar, isConnected })
    }
    catch(error){
        console.log('Try Error getCars : ' + error.message);
        res.status(500).json({message: 'Try Liste véhicules : ' + error.message});
    }
}

// Middleware pour afficher la page "Détails d'un véhicule"
exports.getCar = async (req, res) => {
    /* On récupère les informations issue du middleware getCarById en les stockant dans une variable */
    const detailsCar = res.locals.detailsCar ? res.locals.detailsCar : null;
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    res.status(200).render(path.join(__dirname, '../views/management/cars/details-car.ejs'), { isConnected, detailsCar });
}

// Middleware pour afficher la page "Modifier un véhicule"
exports.modifyCar = async (req, res) => {
    const detailsCar = res.locals.detailsCar;
    
    const successUpdateCar = req.session.successUpdateCar
    ? req.session.successUpdateCar : null;

    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    
    res.status(200).render(path.join(__dirname, `../views/management/cars/update-car.ejs`), { detailsCar, successUpdateCar, isConnected });
}

// Middleware de validation du formulaire de la page "Modifier un véhicule"
exports.updateCar = async (req, res) => {
    try{
        /* On vérifie et sécurise les données qui sont envoyées */
        verifInputs(req, res);
        
        // On vérifie si le véhicule existe
        await findCarById(req.params.id).then(car => {
            // S'il existe on vérifie si la marque existe
            findBrand(req).then(brand => {
                // Si la marque existe déjà, on met directement à jour le véhicule
                if(brand) { refreshCar(brand._id, req, res, car); }
                else { 
                // Si la marque n'existe pas, on crée la marque puis on met à jour le véhicule
                    newBrand(req).then(newBrand => {
                    refreshCar(newBrand.id, req, res, car);
                })}
            }).catch(error => {
                res.status(404).json({message: 'Erreur recherche marque : ' + error.message});
            })
        }).catch(error => {
            res.status(404).json({message: 'Erreur recherche véhicule : ' + error.message});
        })
    }catch(error){
        console.error(error.message);
        res.status(500).json({message: 'Erreur try maj véhicule : ' + error.message});
    }
}

// Middleware pour afficher la page "Supprimer un véhicule"
exports.removeCar = async (req, res) => {
    const detailsCar = res.locals.detailsCar ? res.locals.detailsCar : null ;
    const isConnected = req.session.isConnected ? req.session.isConnected : false;
    res.status(200).render(path.join(__dirname, `../views/management/cars/delete-car.ejs`), { isConnected, detailsCar })
}

// Middleware de validation du formulaire de la page "Supprimer un véhicule"
exports.deleteCar = async (req, res) => {
    try{
        // On vérifie le véhicule existe
        await findCarById(req.params.id).then(car => {
            // S'il n'existe pas on retourne un message d'erreur
            if(!car) {res.status(404).send('Car not found');}
            else {
                // S'il existe on utilise la méthode deleteOne pour le supprimer en fonction de son identifiant qu'on récupère depuis les paramètres de l'url (req.params)
                car.deleteOne({_id: req.params.id}).then(() => {
                    // On stocke au niveau de la session un message de succès
                    req.session.successDeleteCar = `Véhicule ${car.brand} ${car.model} supprimé avec succès.`;
                    // On redirige vers la liste des véhicules pour voir le message apparaître
                    res.redirect(`/cars`);
                }).catch(error => res.status(400).send('Error Delete Car ' + error.message))
            }
        }).catch(error =>
            res.status(400).send('Error Find Car ' + error.message)
        )
    } catch(error) {res.status(404).send('Error delete' + error.message);}
}