# Extension de navigateur

L'extension officielle fonctionne avec **n'importe quelle** instance MyLinks : l'instance publique sur [mylinks.app](https://www.mylinks.app) ou votre propre déploiement auto-hébergé. Elle cible Chromium (MV3) et Firefox (MV2) à partir d'une seule base de code.

- Un **panneau latéral** (barre latérale sur Firefox) et une **page de nouvel onglet** pour parcourir, créer et modifier des collections et des liens.
- **Capture rapide** depuis la barre d'outils ou le menu contextuel, avec détection des doublons.
- **Recherche**, accessible de partout avec `Ctrl+Shift+K` (`Alt+Shift+K` sur Firefox, modifiable dans le navigateur).
- **Tolérante au mode hors ligne** : la dernière synchronisation est mise en cache, les données obsolètes sont signalées, un jeton expiré demande une reconnexion au lieu d'échouer silencieusement. Les collections sont actualisées toutes les 5 minutes, ainsi qu'au changement d'onglet ou au focus d'une fenêtre.
- **Comptage des clics** : ouvrir un lien depuis l'extension mène directement à la cible et enregistre le clic en arrière-plan, de sorte qu'il alimente le même classement qu'un clic dans l'application web.
- **Synchronisation facultative des favoris** : synchronisation bidirectionnelle entre vos collections et les favoris natifs du navigateur (voir [ci-dessous](#synchronisation-des-favoris)).

## Installation

Installez-la depuis la boutique de votre navigateur :

- **Chrome et autres navigateurs Chromium** : [Chrome Web Store](https://chromewebstore.google.com/detail/my-links-extension/agkmlplihacolkakgeccnbhphnepphma)
- **Firefox** : [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/mylinks-extension/)

Pour essayer une version qui n'est pas encore dans les boutiques, voir [Side-loading a build](https://github.com/my-links/my-links/blob/main/apps/extension/README.md#side-loading-a-build) (en anglais).

## Connexion à une instance

1. Ouvrez la page d'options de l'extension.
2. Saisissez l'URL de votre instance (`https://mylinks.app`, ou votre propre domaine ; les versions de développement utilisent par défaut `http://localhost:3333`) et cliquez sur **Connect**.
3. Le navigateur demande l'autorisation d'accéder à cette origine. Les instances auto-hébergées sont des origines arbitraires : l'autorisation est donc demandée à l'exécution plutôt que figée dans l'extension.
4. Vous êtes redirigé vers l'instance pour vous connecter, qui renvoie ensuite un jeton d'API à l'extension. Le jeton transite dans le fragment de l'URL, il n'atteint donc aucun serveur.

**Disconnect** efface le jeton et tous les éléments mis en cache, y compris la correspondance des favoris : la reconnexion peut très bien se faire avec un autre compte, et une correspondance périmée ferait pointer les favoris natifs vers le mauvais.

::: warning
Firefox bloque le contenu mixte : une instance servie en `http://` simple sur une adresse de réseau local ne se chargera pas depuis l'extension. Servez-la en HTTPS.
:::

## Synchronisation des favoris

Désactivée par défaut, elle s'active depuis la page d'options, moment où est aussi demandée la permission facultative `bookmarks`. On ne touche pas à votre barre de favoris dans votre dos.

Une fois activée :

- Les collections sont reflétées dans un unique dossier **Collections** maintenu au début de la barre de favoris, et les favoris de MyLinks sont épinglés sur la barre elle-même, classés selon la fréquence à laquelle vous les ouvrez (recalculée chaque jour, ou lorsque l'ensemble des favoris change).
- La synchronisation est **bidirectionnelle** : renommer un dossier renomme la collection, glisser un favori d'un dossier de collection à un autre déplace le lien, déposer un favori dans un dossier de collection l'enregistre comme lien, et ajouter une page aux favoris l'adopte.
- Seuls les éléments créés par l'extension elle-même sont modifiés ou supprimés. Les favoris que vous avez rangés à la main sont laissés tranquilles, y compris ceux placés dans un dossier de collection, et tout ce qui se trouvait déjà sur la barre avant l'activation de la synchronisation n'est jamais adopté.
- La désactiver arrête la synchronisation et laisse tout en place. La page d'options peut en plus supprimer les favoris ajoutés par MyLinks (uniquement ceux qui sont associés).

## Confidentialité

L'extension ne communique qu'avec l'instance à laquelle vous l'avez connectée et ne contacte aucun tiers. Tant que vous ne vous êtes pas connecté, elle n'effectue aucune requête réseau. Ce qu'elle envoie une fois connectée est détaillé dans [Confidentialité](/self-hosting/privacy#browser-extension) (en anglais).

## Permissions

| Permission                          | Raison                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `storage`                           | Jeton, collections en cache, suivi de la synchronisation                                                                                   |
| `sidePanel` _(Chromium uniquement)_ | Le panneau latéral. Ajoutée par la compilation à partir du point d'entrée du panneau latéral ; Firefox utilise `sidebar_action` à la place |
| `identity`                          | L'URL de rappel de la transmission d'authentification                                                                                      |
| `alarms`                            | Synchronisation périodique en arrière-plan                                                                                                 |
| `contextMenus`, `notifications`     | La capture rapide et son retour d'information                                                                                              |
| `tabs`                              | Titre et URL de l'onglet actif pour l'ajout rapide                                                                                         |
| `bookmarks` _(facultative)_         | Demandée uniquement lorsque la synchronisation des favoris est activée                                                                     |
| Accès à l'hôte _(facultatif)_       | Demandé à l'exécution pour l'instance à laquelle vous vous connectez                                                                       |

## Différences connues entre navigateurs

- **Firefox ne peut pas donner le focus à sa propre barre latérale.** Le raccourci clavier l'ouvre, mais le curseur ne se place pas dans le champ de recherche : une extension ne peut pas forcer le focus dans une barre latérale qu'elle vient d'ouvrir. Cliquez une fois sur le champ pour le sélectionner.
- **CORS** : sur Chromium, détenir une permission d'hôte contourne entièrement CORS. Sur Firefox, les requêtes passent par le CORS inter-origines ordinaire, géré par l'instance pour `/api/v1/*`.
- **La page d'arrière-plan de Firefox est persistante**, alors que le service worker MV3 de Chromium est suspendu entre deux événements ; l'alarme de synchronisation périodique existe précisément pour couvrir le cas de Chromium.
