# Utiliser MyLinks

## Collections

Une collection regroupe des liens apparentés (par projet, par sujet, ou comme vous organisez vos propres favoris). Un lien peut appartenir à plusieurs collections à la fois.

Chaque compte possède une collection impossible à supprimer : l'**Inbox**. C'est là qu'arrive un lien enregistré sans collection explicite, et là que retombe un lien si la dernière collection qui le contenait est supprimée.

Chaque collection a une visibilité :

- **Privé** : visible uniquement par vous.
- **Public** : accessible à toute personne disposant du lien, sans compte de son côté. Voir [Partage](#partage).

## Liens

Un lien a un nom, une description facultative, une URL et les collections auxquelles il appartient. Marquer un lien comme favori l'épingle dans la vue **Favoris**.

Ouvrir un lien compte un clic, enregistré en arrière-plan pendant que la page s'ouvre. Les clics servent à classer vos liens les plus utilisés en premier : plus vous ouvrez un lien, plus il remonte.

## Réorganisation

Faites glisser une collection dans la barre latérale, ou un lien à l'intérieur d'une collection, pour définir votre propre ordre ; il est conservé d'un rechargement à l'autre. Seul l'auteur d'une collection peut réordonner ses liens ; les abonnés voient l'ordre de l'auteur.

Déposer un lien sur une collection dans la barre latérale le déplace vers celle-ci, en le retirant de la collection d'où vous l'avez glissé. Maintenez **Maj** en déposant pour l'ajouter à la collection cible au lieu de le déplacer, sans toucher à la source.

Au clavier : placez le focus sur une carte déplaçable, appuyez sur Espace pour la saisir, sur les touches fléchées pour la déplacer, de nouveau sur Espace pour la déposer, ou sur Échap pour annuler.

## Recherche

La recherche en texte intégral porte à la fois sur les collections et sur les liens, d'après le nom et l'URL. Elle est disponible partout dans l'application, et depuis le panneau de l'extension de navigateur grâce à un raccourci clavier (voir [Extension de navigateur](/fr/guide/browser-extension)).

## Partage

Toute collection définie comme **Public** obtient une URL de partage unique. Toute personne qui l'ouvre peut parcourir les liens de la collection sans se connecter. Rendre de nouveau la collection privée ferme immédiatement cette URL à tout le monde sauf vous.

### Suivre une collection publique

Une fois connecté, vous pouvez **suivre** la collection publique d'une autre personne depuis sa page partagée : le bouton **Suivre** en haut de la page devient **Ne plus suivre** dès que vous l'avez utilisé. Vos propres collections ne peuvent pas être suivies, et un visiteur non connecté ne fait que consulter la collection.

Les collections suivies apparaissent dans leur propre section **Collections suivies** de votre barre latérale, où vous pouvez les faire glisser dans l'ordre que vous préférez. Cet ordre n'appartient qu'à vous. Dans une collection suivie, vous voyez les liens de l'auteur dans l'ordre de l'auteur, et ils restent synchronisés avec ses modifications. Le suivi est en lecture seule : vous ne pouvez ni modifier la collection ni réordonner ses liens.

Si l'auteur rend de nouveau la collection privée, elle disparaît de vos collections suivies en même temps que l'URL de partage.

## Export et import

Vos liens s'exportent à tout moment en JSON brut, depuis les paramètres de votre compte. La même page accepte ce JSON en retour, si bien que passer d'une instance à une autre (ou simplement conserver une copie hors ligne) ne dépend jamais de la disponibilité de MyLinks.
