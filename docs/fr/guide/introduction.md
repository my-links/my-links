# Introduction

MyLinks est un gestionnaire de favoris libre et gratuit. Il organise les liens en collections, les rend consultables par la recherche et vous permet de partager ceux que vous souhaitez.

![Tableau de bord MyLinks](/screenshots/ml_dashboard_dark.png)

## Deux façons de l'utiliser

**L'instance hébergée.** [mylinks.app](https://www.mylinks.app) est l'instance publique, exploitée pour vous. Créez un compte et commencez à enregistrer des liens, sans rien installer ni configurer.

**L'auto-hébergement.** Faites tourner votre propre instance avec Docker en quelques minutes. Vous êtes propriétaire des données, et vous pouvez désactiver les inscriptions une fois votre compte créé. Consultez l'[auto-hébergement](/self-hosting/docker) (en anglais) pour commencer.

Les deux reposent sur la même [API REST](/api/) (en anglais) et la même [extension de navigateur](/fr/guide/browser-extension) : une instance auto-hébergée n'est pas un déploiement au rabais, c'est la même application branchée sur votre propre base de données.

## Fonctionnalités principales

- **Collections** : regroupez vos liens par projet ou par sujet. Un lien peut appartenir à plusieurs collections à la fois, et un lien enregistré sans collection arrive dans votre **Inbox**.
- **Recherche** : retrouvez un lien ou une collection par son nom ou son URL au lieu de fouiller dans des dossiers.
- **Partage** : une collection peut être publique ou privée, collection par collection.
- **Extension de navigateur** : enregistrez et recherchez des liens depuis un panneau latéral dans Chromium et Firefox, avec une synchronisation bidirectionnelle facultative avec vos favoris natifs.
- **Classement par clics** : ouvrir un lien compte comme un clic, si bien que vos liens les plus utilisés remontent en premier.
- **Respect de la vie privée et open source** : aucun suivi, et chaque requête qu'une instance adresse à un tiers est documentée.

## Pour aller plus loin

- Vous découvrez MyLinks ? Commencez par [Utiliser MyLinks](/fr/guide/using-mylinks).
- Vous voulez l'extension ? Consultez [Extension de navigateur](/fr/guide/browser-extension).
- Vous hébergez votre propre instance ? Commencez par [Docker & compose](/self-hosting/docker) (en anglais).
- Vous développez avec l'API ? Consultez la [référence de l'API](/api/) (en anglais).
