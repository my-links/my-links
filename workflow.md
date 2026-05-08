Voilà le workflow que je souhaite avoir :

1. Authentification

- Lorsque l'extension est installée, il faut ouvrir la page des options de l'extension
- Une fois fait, on demande à l'utilisateur s'il souhaite utiliser l'instance publique de MyLinks ou une instance privée, auquel cas il faudra lui demander l'URL de l'instance privée
- Une fois que l'utilisateur aura comfirmé, il faut rediriger l'utilisateur vers une route de l'instance voulue, pour générer et stocker un token dans le stockage interne de l'extension

2. Initialisation

- Une fois l'utilisateur authentifié, il faut sauvegarder tous les favoris de l'utilisateur dans un dossier du gestionnaire de favoris (pour pouvoir tout récupérer plus tard si besoin)
- Il faut initialiser tuyau et transmit avec le token de l'utilisateur et l'URL de l'instance voulue
- Il faut initialiser les subscriptions de transmit avec le userId de l'utilisateur
- Il faut récuperer les collections/liens/favoris de l'utilisateur et les sauvegarder dans la barre des favoris

3. Gestion des favoris

- Lorsqu'un utilisateur souhaite ajouter la page courante sur MyLinks, il doit pouvoir le faire en faisant clic droit sur la page ou en cliquant sur l'icône de l'extension, dans les deux cas, ça ne doit pas ouvrir la popup de l'extension mais une page dédiée
- Si l'utilisateur met en favori la page courante, l'extension doit faire du requête vers le backend pour ajouter la page courante en favori (un lien doit forcément être associé à une collection, faut trouver une solution pour gérer ça)

Attention :

- La gestion des favoris ne fonctionne pas de la même façon entre Chrome et Firefox ainsi que d'autres fonctionnalités, tu seras peut-être amené à utiliser des pollyfills (seulement si des features ne sont pas supportées par le browser baseline)
- S'il manque des features dans la webapp, tu peux les ajouter
- On ne va pas tout faire d'un coup, on va tout faire étape par étape
