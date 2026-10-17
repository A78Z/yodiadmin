# Gestion de la galerie — Preview refonte

## Périmètre

La demande est de publier manuellement des photos et vidéos dans la galerie de la boutique, sans dépendre de l’accès Meta. Aucun envoi à Facebook n’est effectué.

Nouvelle page : `/dashboard/gallery`, entrée « Galerie du site » dans la navigation de la seule Preview `refonte`. La page et ses API refusent tout autre environnement. Le catalogue, les clients, commandes et paiements ne sont pas modifiés.

## Parcours

1. Choisir une photo JPG/PNG/WebP (8 Mo maximum) ou une vidéo MP4/WebM (100 Mo maximum).
2. Pour une vidéo, choisir une couverture photo ; donner une description accessible au média.
3. Vérifier l’aperçu puis cliquer sur « Publier dans la galerie Preview ».
4. Le fichier est envoyé directement au stockage public Vercel Blob avec un jeton temporaire borné au chemin et au type/poids autorisés. La clé serveur n’est jamais envoyée au navigateur.
5. Une requête authentifiée distincte contrôle les fichiers existants puis enregistre les métadonnées dans `yodi_gallery_preview_refonte`. Les doublons de publication du même fichier ont un identifiant déterministe.
6. La boutique lit uniquement les 24 derniers médias publiés ; cache serveur 60 secondes. Les photos du catalogue restent en repli si aucun média de galerie n’est disponible.
7. « Masquer » retire le média de la galerie ; le fichier n’est pas supprimé du stockage public. L’opération est réversible.

Les métadonnées sont dans une nouvelle collection isolée de la base existante ; aucun document produit/client/commande n’est écrit. La boutique et l’admin doivent être reliés à la même base pour cette collection.

## Accès et configuration à terminer

L’authentification existante de l’admin ne contient aucun rôle administrateur vérifiable. Pour ces nouvelles fonctions uniquement, une liste d’adresses autorisées est donc exigée en plus de la session NextAuth. Aucun compte simplement connecté n’obtient automatiquement l’accès.

Variables serveur du projet `yodiadmin`, portée **Preview / branche refonte exclusivement** :

- `GALLERY_ADMIN_EMAILS` : adresses administrateur autorisées, séparées par des virgules. L’adresse du compte à autoriser est encore attendue.
- `BLOB_READ_WRITE_TOKEN` : clé du nouveau stockage Blob public dédié à cette galerie Preview. Ne pas communiquer cette valeur dans le chat ni la versionner.
- `GALLERY_BLOB_HOST` : hôte public exact du stockage, sous la forme `…public.blob.vercel-storage.com`.

Sur le projet boutique `yodi-store.com`, même portée Preview / refonte :

- `GALLERY_BLOB_HOST` : même hôte public ; la boutique n’a pas besoin du jeton d’écriture Blob.

Le stockage Blob n’a pas encore été créé/connecté ; il nécessite une configuration Vercel et peut entraîner une consommation facturable de stockage et de trafic. Aucun achat, aucune acceptation de conditions ou extension d’accès n’a été réalisé. La publication reste indisponible tant que les réglages manquent.

L’authentification, les variables MongoDB et NextAuth existantes restent en place. Next.js est aligné sur 15.5.9, version actuellement utilisée par la boutique Preview ; aucun script de migration n’est lancé.

Documentation officielle utilisée : https://vercel.com/docs/vercel-blob/client-upload . Authentification vérifiée avant tout jeton, contraintes de fichier, transfert direct pour les vidéos qui dépassent les limites des requêtes serveur.

## Validation

- Cinq tests de politique : fermeture hors Preview refonte, refus des comptes sans autorisation, chemins/types bornés, hôte du stockage et origine des requêtes.
- TypeScript admin : aucune erreur.
- ESLint ciblé : aucune erreur, deux avertissements sur les images des aperçus administrateur. Les imports inutilisés de la barre latérale modifiée ont été retirés.
- Boutique : 52 tests réussis ; ESLint ciblé réussi ; neuf erreurs TypeScript préexistantes hors galerie.
- Pas de serveur ni de build local lancé.
- Tests réels d’envoi/publication/masquage et lecteur vidéo à terminer une fois le stockage et le compte connectés. Aucun média de démonstration ni donnée personnelle ne sont publiés pour simuler ce parcours.

Premier build Vercel `e0c73f3` : échec sur un accès préexistant à `orders[0].valueCurrency` lorsque la liste est vide pendant le prérendu de `/dashboard`. Correction minimale : accès optionnel `orders[0]?.valueCurrency`, même valeur de repli existante. Aucune commande n’est modifiée. Le callback Blob inutile a aussi été retiré : la publication reste une action authentifiée distincte et ne nécessite aucun contournement de la protection Vercel.

Le build suivant a révélé le second accès de ce même bloc à `orders[0].selectedCurrency`. Les deux accès à la première commande sont désormais protégés ; le libellé de repli pour une liste vide est FCFA.

## Déploiement vérifié

La Preview admin du commit `45919e0` est **Ready** : https://yodiadmin-g02q2xzoq-a78zs-projects.vercel.app/dashboard/gallery . Déploiement : https://vercel.com/a78zs-projects/yodiadmin/3fkg9hGaFPbkVHDLBQMpfWYn1Vxh .

Les noms des variables serveur du projet Vercel ont été contrôlés sans révéler leurs valeurs : aucune variable Blob ou galerie n’est configurée. L’activation reste en attente de l’adresse administrateur autorisée et de l’accord explicite pour créer le stockage public dédié. La validation automatique a refusé la poursuite du configurateur Blob, car elle peut provisionner une ressource persistante et potentiellement facturable sans accord ; aucun stockage n’a été créé.

Contrôle navigateur de `/dashboard/gallery` sur cette Preview : en l’absence de session admin, redirection effective vers le formulaire de connexion. Aucune tentative de connexion ni transmission de mot de passe effectuée. Le formulaire d’envoi et le lecteur de médias réels restent à tester après configuration et connexion autorisées.
