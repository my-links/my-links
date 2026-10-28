# Compte

## Connexion

Un compte se connecte avec un mot de passe, avec Google, ou avec les deux ; une instance auto-hébergée propose ou non la connexion Google selon que `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` sont définis ou non (voir [Authentification](/self-hosting/authentication), en anglais).

Au moins une méthode de connexion doit rester sur un compte à tout moment. Vous pouvez ajouter un mot de passe à un compte Google uniquement, ou lier Google à un compte avec mot de passe, mais vous ne pouvez pas retirer la dernière méthode : ce refus existe pour qu'aucune action depuis la page des paramètres ne puisse vous enfermer hors de votre propre compte.

## Changer votre mot de passe

Définir un premier mot de passe et remplacer un mot de passe existant passent par le même formulaire. Remplacer un mot de passe déconnecte toutes les autres sessions de navigateur et tous les jetons d'extension du compte, car une session qui survivrait à un changement de mot de passe irait à l'encontre de son but.

## Changer votre adresse e-mail

L'adresse de votre compte est aussi celle qui reçoit les liens de récupération ; la changer demande donc une confirmation des deux parties : la nouvelle adresse doit confirmer le changement avant qu'il ne prenne effet, et l'adresse actuelle est prévenue pour que vous puissiez annuler un changement que vous n'avez pas demandé.

Sur une instance sans envoi d'e-mails configuré, l'adresse e-mail ne peut pas être changée depuis la page des paramètres ; un opérateur peut tout de même le faire avec `node ace user:*`, voir [Commandes console](/self-hosting/console-commands) (en anglais).

## Mode sudo

Changer un mot de passe, changer une adresse e-mail, ou lier/délier un fournisseur de connexion sont tous protégés par le **mode sudo** : une reconfirmation récente de votre identité, distincte du simple fait d'avoir une session active. Accéder à l'une de ces actions sans confirmation récente redirige vers une courte invite (saisir de nouveau votre mot de passe, ou reconfirmer avec Google) avant de poursuivre ce que vous étiez en train de faire.

C'est ce qui empêche qu'une session laissée ouverte sur un appareil partagé ou volé suffise, à elle seule, à prendre le contrôle du compte auquel elle appartient.

## Sessions

La liste **Sessions actives** de vos paramètres montre chaque navigateur connecté à votre compte : son adresse IP, son appareil (navigateur), sa date de création, sa date d'expiration, et laquelle est la session que vous êtes en train d'utiliser. Déconnecter une session la révoque immédiatement ; déconnecter la session courante vous déconnecte de ce navigateur. Les sessions durent sept jours.

Changer votre mot de passe, ou supprimer votre compte, déconnecte aussi toutes les autres sessions.

## Jetons API

La section **Jetons API** de vos paramètres crée les jetons porteurs (bearer) que d'autres clients utilisent pour accéder à vos données via l'[API REST](/api/) et le [serveur MCP](/api/mcp) (en anglais). Chaque jeton a un nom et un niveau d'accès :

- **Accès complet** peut tout lire et tout écrire.
- **Lecture seule** ne peut rien créer, modifier ni supprimer.

Le secret n'est affiché qu'une seule fois, juste après la création du jeton. Révoquez un jeton depuis la même liste dès que vous n'en avez plus besoin. L'extension de navigateur reçoit son propre jeton à accès complet, nommé _Browser extension_, lorsque vous la connectez, voir [Extension de navigateur](/fr/guide/browser-extension). Remplacer votre mot de passe révoque tous les jetons.

## Page par défaut

La préférence **Page par défaut** de vos paramètres décide de l'endroit où MyLinks s'ouvre après votre connexion : vos **Favoris** (qui basculent sur l'**Inbox** tant que vous n'en avez aucun) ou votre **Inbox**. Elle suit votre compte, contrairement à la langue et au thème, qui s'appliquent à l'appareil sur lequel vous les avez définis.

## Supprimer votre compte

**Supprimer le compte** dans vos paramètres n'efface rien immédiatement. Cela démarre un **délai de grâce de 30 jours** :

1. Le compte est désactivé et toutes ses sessions et tous ses jetons sont révoqués, si bien que vous êtes déconnecté partout.
2. Si l'instance a l'envoi d'e-mails configuré, un e-mail de confirmation vous informe que la suppression a été programmée et qu'une nouvelle connexion l'annule. Sans envoi d'e-mails, aucun message n'est envoyé.
3. Lorsque vous vous connectez pendant le délai de grâce, avec votre mot de passe ou avec Google, MyLinks vous demande s'il faut **réactiver** le compte au lieu d'ouvrir une session. Confirmer annule la suppression et vous connecte ; refuser maintient la suppression programmée et vous renvoie à la page de connexion.
4. Une fois les 30 jours écoulés, un balayage de maintenance quotidien supprime définitivement le compte et tout ce qu'il contient. Il n'y a plus de retour en arrière possible ensuite.

### Comptes inactifs

Un compte qui n'a pas été vu depuis **365 jours** (décomptés depuis sa création s'il ne s'est jamais connecté) passe automatiquement par le même délai de grâce, avec le même e-mail lorsque l'envoi d'e-mails est configuré, rédigé comme un avis d'inactivité. Se reconnecter pendant le délai de grâce propose la même réactivation. Les comptes administrateur ne sont jamais signalés.

### Suppression par un administrateur

Lorsqu'un administrateur supprime un compte, le même délai de grâce s'applique, avec deux différences : aucun e-mail n'est envoyé, et se connecter ne propose pas la réactivation, ni avec un mot de passe ni avec Google (la connexion est refusée comme n'importe quelle autre tentative échouée, sans en donner la raison). Seul un administrateur peut restaurer le compte, voir [Administration](/self-hosting/administration#deleting-and-restoring-accounts) (en anglais).
