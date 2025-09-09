# 📚 CPGE Vocabulaire - Application d'apprentissage

Une application web simple et efficace pour aider les étudiants de CPGE à apprendre le vocabulaire en anglais et allemand.

## 🚀 Fonctionnalités

### Gestion des listes de vocabulaire
- ✅ Créer des listes de vocabulaire personnalisées
- ✅ Choisir entre anglais et allemand
- ✅ Ajouter/modifier/supprimer des mots
- ✅ Modifier et supprimer des listes existantes

### Système de quiz interactif
- ✅ Quiz avec questions aléatoires
- ✅ Questions bidirectionnelles (français → langue étrangère et vice versa)
- ✅ Feedback immédiat sur les réponses
- ✅ Score en temps réel
- ✅ Résultats détaillés à la fin

### Design optimisé mobile
- ✅ Interface responsive adaptée aux téléphones
- ✅ Design moderne avec Tailwind CSS
- ✅ Animations fluides
- ✅ Navigation intuitive

## 🛠️ Installation et utilisation

### Méthode simple (serveur local)
1. Téléchargez les fichiers `index.html` et `app.js`
2. Ouvrez un terminal dans le dossier contenant les fichiers
3. Lancez un serveur local :
   ```bash
   python3 -m http.server 8000
   ```
4. Ouvrez votre navigateur à l'adresse : `http://localhost:8000`

### Utilisation directe
Vous pouvez aussi simplement ouvrir le fichier `index.html` directement dans votre navigateur.

## 📱 Guide d'utilisation

### 1. Créer une liste de vocabulaire
1. Cliquez sur "Nouvelle Liste"
2. Donnez un nom à votre liste (ex: "Chapitre 1 - La famille")
3. Choisissez la langue (Anglais ou Allemand)
4. Ajoutez vos mots de vocabulaire :
   - Colonne de gauche : mot en français
   - Colonne de droite : traduction
5. Cliquez sur "+ Ajouter un mot" pour plus de mots
6. Sauvegardez votre liste

### 2. Modifier une liste existante
1. Dans l'onglet "Mes Listes", cliquez sur l'icône ✏️ à côté de la liste
2. Modifiez le nom, ajoutez/supprimez des mots
3. Sauvegardez les modifications

### 3. Faire un quiz
1. Allez dans l'onglet "Quiz"
2. Sélectionnez une liste de vocabulaire
3. Répondez aux questions :
   - Tapez votre réponse dans le champ de texte
   - Appuyez sur "Valider" ou la touche Entrée
   - Utilisez "Passer" si vous ne connaissez pas la réponse
4. Consultez vos résultats à la fin

## 💾 Stockage des données

L'application utilise le stockage local de votre navigateur (localStorage) pour sauvegarder vos listes de vocabulaire. Vos données restent privées et sont stockées uniquement sur votre appareil.

## 🎯 Conseils d'utilisation

- **Pour les révisions** : Créez des listes thématiques (famille, école, nourriture, etc.)
- **Pour les examens** : Utilisez le quiz régulièrement pour mémoriser
- **Organisation** : Nommez vos listes clairement (ex: "Anglais - Chapitre 3")
- **Progression** : Refaites les quiz jusqu'à obtenir 100%

## 🔧 Fonctionnalités techniques

- **Framework** : HTML5, CSS3, JavaScript vanilla
- **Styling** : Tailwind CSS via CDN
- **Stockage** : localStorage du navigateur
- **Responsive** : Optimisé pour mobile et desktop
- **Compatibilité** : Tous les navigateurs modernes

## 📝 Structure des fichiers

```
cpge-vocab-app/
├── index.html          # Interface utilisateur
├── app.js             # Logique de l'application
└── README.md          # Documentation
```

## 🚀 Améliorations futures possibles

- Export/import des listes en JSON
- Statistiques de progression
- Mode sombre
- Support audio pour la prononciation
- Partage de listes entre utilisateurs

---

**Développé pour les étudiants de CPGE** 🎓

Bonne révision ! 📖✨
