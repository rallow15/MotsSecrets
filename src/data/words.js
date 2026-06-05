// ═════════════════════════════════════════════════════════════
// BASE DE DONNÉES DES MOTS PAR CATÉGORIE
// ═════════════════════════════════════════════════════════════
//
// Les catégories ANIMAUX et FOOTBALL utilisent des sous-catégories
// invisibles (_subcategories) pour que les mots tirés soient cohérents.
// Les autres catégories restent des listes plates (tableaux de strings).
// ═════════════════════════════════════════════════════════════

export const CATEGORIES_FR = {
  // ═══════════════════════════════════════════════════════════
  // ⚽ FOOTBALL
  // ═════════════════════════════════════════════════════════════
  FOOTBALL: {
    _subcategories: {
      'Attaquants/Buteurs': ["Messi", "Ronaldo (CR7)", "Neymar", "Mbappé", "Haaland", "Salah", "Kane", "Benzema", "Lewandowski", "Aguero", "Higuain", "Dybala", "Tevez", "Lukaku", "Son Heung-min", "Henry", "Ronaldinho", "R9", "Maradona", "Pelé", "Trezeguet", "Romario", "Rooney"],
      'Ailiers': ["Hazard", "Mané", "Dembélé", "Vinicius Jr", "Foden", "Saka", "Lamine Yamal", "Ribéry", "Robben"],
      'Milieux': ["Zidane", "Iniesta", "Xavi", "Pirlo", "Beckham", "Lampard", "Gerrard", "Modric", "Toni Kroos", "De Bruyne", "Bellingham", "Pogba", "Griezmann", "Pedri", "Gavi"],
      'Milieux défensifs': ["Matuidi", "Kanté", "Casemiro", "Tchouameni", "Valverde", "Rakitic"],
      'Défenseurs': ["Varane", "Ramos", "Pepe", "Marcelo", "Dani Alves", "Van Dijk", "De Ligt", "Davies", "Alaba", "Roberto Carlos", "Eder Militao", "Lahm", "Boateng", "Hummels", "Cafu"],
      'Gardiens': ["Alisson", "Ederson", "Courtois", "Ter Stegen", "Donnarumma", "Navas", "Oblak", "Neuer"],
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 🏀 BASKETBALL
  // ═════════════════════════════════════════════════════════════
  BASKETBALL: {
    _subcategories: {
      'Meneurs': ["Stephen Curry", "Chris Paul", "Kyrie Irving", "Damian Lillard", "Russell Westbrook", "Tony Parker"],
      'Arrières/Scoreurs': ["Michael Jordan", "Kobe Bryant", "Dwyane Wade", "Allen Iverson", "James Harden", "Tracy McGrady", "Manu Ginóbili", "Paul George", "Carmelo Anthony"],
      'Ailiers/Polyvalents': ["LeBron James", "Kevin Durant", "Kawhi Leonard", "Giannis Antetokounmpo", "Luka Dončić", "Scottie Pippen", "Larry Bird", "Magic Johnson"],
      'Intérieurs/Pivots': ["Shaquille O'Neal", "Tim Duncan", "Nikola Jokić", "Yao Ming", "Dirk Nowitzki", "Pau Gasol", "Dennis Rodman"],
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 🌟 PERSONNES CONNUES
  // ═════════════════════════════════════════════════════════════
  PERSONNES_CONNUES: {
    _subcategories: {
      'Action/Héros': ["Vin Diesel", "Dwayne Johnson", "The Rock", "Jason Statham", "Bruce Willis", "John Cena", "Dave Bautista"],
      'Comédie/Action': ["Will Smith", "Jamie Foxx", "Marlon Wayans", "Martin Lawrence", "Idris Elba", "Chris Rock", "Michael B. Jordan"],
      'R&B/Pop': ["Michael Jackson", "Prince", "Bruno Mars", "The Weeknd", "Chris Brown", "Usher", "Justin Timberlake"],
      'Rap/Hip-Hop': ["Lil Wayne", "Snoop Dogg", "Future", "Wiz Khalifa", "Young Thug", "Lil Baby", "Travis Scott", "Drake", "Eminem", "Kanye West", "Tupac", "The Notorious B.I.G."],
      'Arts martiaux': ["Bruce Lee", "Jackie Chan", "Jet Li", "Jean-Claude Van Damme", "Donnie Yen", "Michael Jai White", "Steven Seagal"],
      'Pop/Divas': ["Madonna", "Beyoncé", "Mariah Carey", "Rihanna", "Lady Gaga", "Britney Spears", "Celine Dion", "Whitney Houston", "Janet Jackson"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 👷 MÉTIERS
  // ═════════════════════════════════════════════════════════════
  METIERS: {
    _subcategories: {
      'Médical': ["Médecin", "Infirmier", "Chirurgien", "Pharmacien", "Dentiste", "Vétérinaire", "Kinésithérapeute", "Sage-femme", "Ambulancier", "Psychiatre"],
      'Éducation': ["Professeur", "Instituteur", "Directeur d\'école", "Surveillant", "Animateur", "Éducateur", "Documentaliste"],
      'Justice/Sécurité': ["Policier", "Pompier", "Avocat", "Juge", "Gendarme", "Détective", "Garde du corps", "Agent de sécurité", "Douanier"],
      'Cuisine': ["Chef cuisinier", "Pâtissier", "Boulanger", "Boucher", "Sommelier", "Barman", "Serveur"],
      'BTP/Manuel': ["Plombier", "Électricien", "Menuisier", "Peintre", "Couturier", "Soudeur", "Carreleur", "Maçon", "Couvreur", "Mécanicien"],
      'Art/Média': ["Journaliste", "Photographe", "Réalisateur", "Acteur", "Musicien", "Dessinateur", "Tatoueur", "Styliste", "Architecte"],
      'Commerce/Finance': ["Vendeur", "Commercial", "Banquier", "Comptable", "Chef d\'entreprise", "Agent immobilier", "Assureur", "Négociant"],
      'Tech/Science': ["Ingénieur", "Informaticien", "Développeur", "Chercheur", "Astronaute", "Pilote", "Météorologue", "Archéologue"],
      'Transport': ["Chauffeur", "Pilote", "Marin", "Contrôleur", "Livreur", "Conducteur de train"],
      'Agriculture': ["Agriculteur", "Éleveur", "Pêcheur", "Vigneron", "Paysagiste", "Bûcheron"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🌍 PAYS
  // ═════════════════════════════════════════════════════════════
  PAYS: {
    _subcategories: {
      'Europe de l\'Ouest': ["France", "Allemagne", "Espagne", "Italie", "Royaume-Uni", "Portugal", "Belgique", "Pays-Bas", "Suisse", "Autriche", "Luxembourg", "Andorre", "Monaco", "Liechtenstein"],
      'Europe du Nord': ["Suède", "Norvège", "Danemark", "Finlande", "Islande", "Irlande", "Écosse"],
      'Europe de l\'Est': ["Pologne", "République Tchèque", "Hongrie", "Roumanie", "Bulgarie", "Ukraine", "Biélorussie", "Lituanie", "Lettonie", "Estonie", "Slovaquie", "Géorgie", "Arménie", "Azerbaïdjan"],
      'Balkans & Méditerranée': ["Grèce", "Turquie", "Croatie", "Serbie", "Slovénie", "Bosnie", "Monténégro", "Macédoine", "Albanie", "Chypre", "Malte", "Saint-Marin", "Vatican"],
      'Asie de l\'Est': ["Japon", "Chine", "Corée du Sud", "Corée du Nord", "Mongolie", "Taïwan", "Hong Kong"],
      'Asie du Sud-Est': ["Thaïlande", "Vietnam", "Cambodge", "Laos", "Birmanie", "Malaisie", "Singapour", "Indonésie", "Philippines"],
      'Asie du Sud': ["Inde", "Pakistan", "Bangladesh", "Kazakhstan", "Afghanistan"],
      'Amérique du Nord': ["États-Unis", "Canada", "Mexique", "Cuba", "Jamaïque", "Haïti", "Porto Rico", "Bahamas"],
      'Amérique Centrale & Caraïbes': ["Guatemala", "Belize", "Costa Rica", "Panama", "République Dominicaine", "Barbade", "Trinité-et-Tobago"],
      'Amérique du Sud': ["Colombie", "Venezuela", "Suriname", "Brésil", "Équateur", "Pérou", "Bolivie", "Paraguay", "Uruguay", "Argentine", "Chili"],
      'Afrique du Nord': ["Égypte", "Maroc", "Algérie", "Tunisie", "Libye", "Soudan", "Mauritanie"],
      'Afrique de l\'Est': ["Éthiopie", "Kenya", "Ouganda", "Tanzanie", "Rwanda", "Burundi", "Djibouti", "Somalie", "Érythrée"],
      'Afrique de l\'Ouest': ["Sénégal", "Mali", "Niger", "Guinée", "Côte d\'Ivoire", "Ghana", "Nigéria", "Bénin", "Togo", "Sierra Leone", "Libéria", "Guinée-Bissau", "Gambie", "Cap-Vert", "Burkina Faso", "Tchad", "Cameroun"],
      'Afrique Centrale & Sud': ["Afrique du Sud", "Congo", "RDC", "Gabon", "Angola", "Zambie", "Zimbabwe", "Botswana", "Namibie", "Lesotho", "Eswatini", "Madagascar", "Maurice", "Comores", "Seychelles"],
      'Moyen-Orient': ["Israël", "Palestine", "Jordanie", "Liban", "Syrie", "Irak", "Iran", "Arabie Saoudite", "Yémen", "Oman", "Émirats Arabes Unis", "Qatar", "Bahreïn", "Koweït"],
      'Océanie': ["Australie", "Nouvelle-Zélande", "Fidji", "Papouasie", "Vanuatu"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🦁 ANIMAUX
  // ═════════════════════════════════════════════════════════════
  ANIMAUX: {
    _subcategories: {
      'Équidés': ["Cheval", "Âne", "Zèbre", "Poney"],
      'Félins': ["Lion", "Tigre", "Léopard", "Guépard", "Jaguar", "Puma", "Chat"],
      'Canidés': ["Chien", "Loup", "Renard", "Coyote", "Chacal"],
      'Oiseaux de proie': ["Aigle", "Faucon", "Vautour", "Hibou", "Chouette", "Corbeau"],
      'Oiseaux communs': ["Pigeon", "Moineau", "Perroquet"],
      'Oiseaux d\'eau': ["Mouette", "Flamant rose", "Cygne", "Pélican", "Pingouin"],
      'Troupeau': ["Vache", "Taureau", "Mouton", "Chèvre", "Buffle", "Bison"],
      'Ferme': ["Poule", "Canard", "Oie"],
      'Maison': ["Lapin", "Hamster", "Cochon d'Inde", "Écureuil", "Hérisson"],
      'Savane': ["Éléphant", "Girafe", "Rhinocéros", "Hippopotame"],
      'Forêt': ["Sanglier", "Cerf", "Chevreuil", "Cochon", "Gazelle"],
      'Marins': ["Dauphin", "Baleine", "Orque", "Phoque", "Otarie", "Requin"],
      'Mer': ["Crabe", "Homard", "Crevette", "Poulpe", "Calamar", "Étoile de mer"],
      'Reptiles': ["Crocodile", "Serpent", "Lézard", "Caméléon", "Iguane", "Tortue"],
      'Singes': ["Singe", "Gorille", "Orang-outan", "Chimpanzé", "Babouin", "Ours", "Kangourou", "Koala", "Panda"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎮 JEUX VIDÉO
  // ═════════════════════════════════════════════════════════════
  JEUX_VIDEO: {
    _subcategories: {
      'Monde ouvert': ["Grand Theft Auto V (GTA V)", "Grand Theft Auto: San Andreas", "Grand Theft Auto: Vice City", "Grand Theft Auto IV (GTA IV)", "Saints Row", "Sleeping Dogs", "Watch Dogs", "Red Dead Redemption 2"],
      'Plateforme': ["Super Mario Bros.", "Sonic", "Donkey Kong", "Crash Bandicoot", "Rayman"],
      'Classiques/Casual': ["Tetris", "Minecraft", "Pokémon Go", "Animal Crossing: New Horizons"],
      'FPS/Shooters': ["Call of Duty: Warzone", "Counter-Strike: Global Offensive (CS:GO)", "Halo", "Apex Legends", "Overwatch", "Fortnite", "PlayerUnknown's Battlegrounds (PUBG)"],
      'RPG/Aventure': ["The Legend of Zelda: Breath of the Wild", "The Elder Scrolls V: Skyrim", "The Witcher 3: Wild Hunt", "Final Fantasy VII", "Diablo III"],
      'Sport ballon': ["FIFA", "Pro Evolution Soccer (PES)", "NBA 2K", "Madden NFL", "Rugby 22", "Handball 21"],
      'Sport course': ["Gran Turismo", "Forza Horizon", "Need for Speed", "Mario Kart", "F1", "WRC"],
      'En ligne/Esport': ["League of Legends (LoL)", "World of Warcraft (WoW)", "Valorant", "Rocket League", "Destiny 2", "Among Us"],
    },
  },


  // ═════════════════════════════════════════════════════════════
  // 🎵 MUSIQUE
  // ═════════════════════════════════════════════════════════════
  MUSIQUE: {
    _subcategories: {
      'Rap/Hip-Hop': ["Trap", "Boom Bap", "Cloud Rap", "Drill", "Old School", "Rap français", "Gangsta Rap", "Lo-Fi Rap", "Conscious Rap", "Mumble Rap"],
      'Pop/Variété': ["Synthpop", "Electropop", "Indie Pop", "K-Pop", "Dance-Pop", "Variété française", "Dream Pop", "Bubblegum Pop", "Art Pop"],
      'Rock': ["Hard Rock", "Punk Rock", "Grunge", "Indie Rock", "Progressive Rock", "Psychédélique", "Post-Punk", "Glam Rock", "Stoner Rock"],
      'Électronique': ["Techno", "House", "Trance", "Dubstep", "Drum and Bass", "Ambient", "EDM", "Deep House", "Tech House", "Electro"],
      'R&B/Soul/Funk': ["Neo-Soul", "Funk", "Disco", "Motown", "Gospel", "Quiet Storm", "Contemporary R&B"],
      'Jazz/Blues': ["Bebop", "Smooth Jazz", "Swing", "Delta Blues", "Cool Jazz", "Free Jazz", "Big Band"],
      'Classique': ["Symphonie", "Concerto", "Opéra", "Sonate", "Ballet", "Fugue", "Oratorio"],
      'Reggae/Ska': ["Reggae", "Dancehall", "Ska", "Dub", "Ragga"],
      'Latine': ["Salsa", "Bachata", "Reggaeton", "Samba", "Tango", "Cumbia", "Bossa Nova", "Merengue"],
      'Métal': ["Heavy Metal", "Death Metal", "Black Metal", "Thrash Metal", "Power Metal", "Doom Metal", "Metalcore"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🚗 VOITURES
  // ═════════════════════════════════════════════════════════════
  VOITURES: {
    _subcategories: {
      'Supercars': ["Ferrari", "Lamborghini", "Bugatti", "McLaren", "Maserati", "Pagani", "Koenigsegg"],
      'Luxe': ["Rolls-Royce", "Bentley", "Aston Martin", "Mercedes-Benz", "Jaguar", "Lexus", "Range Rover"],
      'Sport/Premium': ["Porsche", "BMW", "Audi", "Alfa Romeo", "Lotus"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 👜 MARQUES
  // ═════════════════════════════════════════════════════════════
  MARQUES: {
    _subcategories: {
      'Haute couture': ["Louis Vuitton", "Chanel", "Gucci", "Hermès", "Prada", "Dior", "Saint Laurent", "Balenciaga", "Fendi", "Burberry"],
      'Joaillerie/Montres': ["Rolex", "Cartier", "Bvlgari", "Tom Ford", "Omega", "TAG Heuer"],
      'Sport/Streetwear': ["Nike", "Adidas", "Puma", "New Balance", "Reebok", "Vans", "Converse", "Supreme", "Under Armour", "Fila"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎌 MANGA
  // ═════════════════════════════════════════════════════════════
  MANGA: {
    _subcategories: {
      'Naruto': ["Naruto", "Sasuke", "Kakashi", "Itachi", "Madara", "Obito", "Jiraya", "Orochimaru", "Hashirama", "Minato", "Pain", "Gaara"],
      'Dragon Ball': ["Goku", "Vegeta", "Broly", "Black Goku", "Gohan", "Trunks", "Bardock", "Gogeta", "Vegeto", "Roi Vegeta", "Gotenks", "Raditz"],
      'One Piece': ["Luffy", "Zoro", "Sanji", "Shanks", "Barbe Blanche", "Kaido", "Big Mom", "Barbe Noire", "Gol D. Roger", "Ace", "Sabo"],
      'Divers/Légendaires': ["Saitama", "Krillin", "Tortue Géniale", "Kratos", "Nappa"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎬 FILMS / SÉRIES
  // ═════════════════════════════════════════════════════════════
  FILMS_SERIES: {
    _subcategories: {
      'Super-héros/Action': ["Avengers", "Spider-Man", "Batman", "Fast & Furious", "Jurassic World"],
      'Science-Fiction/Épopée': ["Star Wars", "Avatar", "Titanic", "Dune", "Interstellar", "Matrix"],
      'Séries à succès': ["Game of Thrones", "Stranger Things", "The Last of Us", "Squid Game", "One Piece", "Breaking Bad", "La Casa de Papel", "Wednesday"],
      'Action/Espionnage': ["Mission: Impossible", "James Bond", "Jason Bourne", "Die Hard", "Taken"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 📦 OBJETS
  // ═════════════════════════════════════════════════════════════
  OBJETS: {
    _subcategories: {
      'Téléphones & Audio': ["Téléphone", "Tablette", "Casque", "Écouteurs", "Enceinte", "Chargeur", "Batterie"],
      'Écran & Photo': ["Ordinateur", "Appareil photo", "Télévision", "Télécommande"],
      'Ustensiles de table': ["Fourchette", "Cuillère", "Couteau", "Assiette", "Verre", "Tasse", "Bouteille"],
      'Cuisine & Cuisson': ["Poêle", "Casserole", "Micro-ondes", "Grille-pain", "Cafetière", "Bouilloire", "Mixeur", "Robot culinaire"],
      'Meubles': ["Canapé", "Table", "Chaise", "Lit", "Armoire", "Commode", "Bureau", "Étagère"],
      'Literie': ["Coussin", "Couverture", "Drap", "Oreiller", "Matelas", "Cadre de lit"],
      'Déco': ["Tapis", "Vase", "Miroir", "Rideau", "Lampe", "Horloge", "Réveil"],
      'Sacs & Affaires': ["Clé", "Portefeuille", "Sac à main", "Valise", "Parapluie", "Lunettes", "Montre"],
      'Écriture & Bureau': ["Stylo", "Cahier", "Livre", "Serviette en papier"],
      'Nettoyage': ["Balai", "Aspirateur", "Seau", "Chiffon", "Produit ménager", "Torchon", "Éponge"],
      'Bricolage & Divers': ["Bougie", "Allumette", "Briquet", "Ciseaux", "Colle", "Ruban adhésif"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🏠 LIEUX (Mode Spyfall)
  // ═════════════════════════════════════════════════════════════
  LIEUX: {
    _subcategories: {
      'Urbain': ["Restaurant", "Cinéma", "Supermarché", "Banque", "Bibliothèque", "Musée", "Hôtel", "Théâtre", "Opéra", "Marché", "Centre commercial", "Club de nuit"],
      'Transport': ["Gare", "Aéroport", "Avion", "Bateau de croisière", "Sous-marin", "Caravane"],
      'Nature': ["Plage", "Pôle Nord", "Désert", "Forêt tropicale", "Île déserte", "Volcan", "Montagne"],
      'Institutions publiques': ["École", "Église", "Prison", "Ambassade", "Camp militaire"],
      'Scientifique/Industriel': ["Hôpital", "Laboratoire", "Usine", "Station spatiale"],
      'Loisirs': ["Parc d\'attractions", "Stade", "Casino", "Cirque", "Stade olympique", "Spa", "Festival", "Phare", "Château", "Station de ski", "Zoo"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 💼 TRAVAIL (Mode Spyfall - images)
  // ═════════════════════════════════════════════════════════════
  TRAVAIL: ["Acteur", "Avocat", "Entraîneur de football", "Gendarme", "Infirmier", "Journaliste", "Juge", "Livreur", "Médecin", "Militaire", "Policier", "Pompier", "Professeur"],

  // ═════════════════════════════════════════════════════════════
  // 🏅 SPORT (Mode Spyfall - images)
  // ═════════════════════════════════════════════════════════════
  SPORT: ["Baseball", "Basketball", "Boxe", "Catch", "Football américain", "Football", "Futsal", "Handball", "Karaté", "MMA", "Natation", "Rugby", "Tennis", "Volleyball", "Water-polo"],


  // ═════════════════════════════════════════════════════════════
  // 🏰 AGE OF EMPIRE 4
  // ═════════════════════════════════════════════════════════════
  AGE_OF_EMPIRE_4: {
    _subcategories: {
      'Civilisations': [
        "Dynastie Jin", "Horde d'Or", "Dynastie macédonienne", "Sengoku Daimyo",
        "Dynastie Tughlaq", "Maison de Lancastre", "Templiers", "Ayyoubides",
        "Jeanne d'Arc", "Ordre du Dragon", "Héritage de Zhu Xi", "Byzantins",
        "Japonais", "Anglais", "Français", "Saint-Empire romain germanique",
        "Rus", "Mongols", "Chinois", "Sultanat de Delhi",
        "Dynastie abbasside", "Ottomans", "Maliens",
      ],
      'Unités piquier': [
        "Lancier", "Limitanei", "Donso", "Lancier doré", "Atgeirmaðr",
      ],
      'Cavalerie': [
        "Éclaireur", "Cavalier", "Chevalier", "Pilleur Ghazi", "Chevalier Royal",
        "Cataphracte", "Lancier de Feu", "Cavalier chameau", "Archer chameau",
        "Éléphant de guerre", "Éléphant tour", "Mangudai", "Keshik", "Khan",
        "Archer à cheval", "Moine Guerrier", "Sipahi", "Akinji", "Éclaireur Guerrier",
        "Sofa", "Samouraï Monté", "Cavalier Doré", "Chevalier Doré",
        "Hobelar", "Demilancier", "Garde du Comte", "Chevalier Confrère",
        "Frère Templier", "Jinete", "Cavalier Noir", "Pilleur du Désert",
        "Lancier Chamelier", "Derviche", "Torguud", "Archer Kipchak",
        "Cavalerie Yari", "Daimyo", "Pilleur Yuan", "Éléphant de combat",
        "Cavalier de Jeanne",
      ],
      'Bâtiments': [
        "Hôtel de ville", "Maison", "Moulin", "Camp de bûcherons", "Campement minier",
        "Dock", "Caserne", "Palissade", "Avant-poste", "Camp de tir à l'arc",
        "Écurie", "Forge", "Marché", "Muraille de pierre", "Tour",
        "Forteresse", "Atelier de siège", "Monastère", "Université", "Ferme",
        "Merveille", "Comptoir commercial", "Site sacré", "Porte de palissade",
        "Porte de muraille", "Muraille",
        "Maison de la Sagesse", "Aqueduc", "Citerne", "Maison de mercenaires", "Olivierie",
        "Village", "Grenier", "Pagode", "Feu de camp",
        "Tente dorée", "Ovoo", "Yourte", "Parc à bétail", "Campement de bergers",
        "Manoir", "Temple bouddhiste", "Temple shintoïste", "Château japonais",
        "Forge japonaise", "Domaine du Daimyo", "Matsuri",
        "Quartier général templier", "Forteresse templier", "Port templier",
        "Arsenal varègue", "Bastion varègue", "Camp de guerre varègue",
        "Ranch bovin", "Mine à ciel ouvert", "École militaire",
        "Cabane de chasse", "Forteresse en bois", "Palissade fortifiée",
        "Fort Tughlaqabad", "Éléphant ouvrier",
        "Council Hall", "Abbey of Kings", "White Tower", "King's Palace",
        "Berkshire Palace", "Wynguard Palace", "Barbican of the Sun", "Imperial Academy",
        "Imperial Palace", "Astronomical Clocktower", "Great Wall Gatehouse", "Spirit Way",
        "School of Cavalry", "Chamber of Commerce", "Royal Institute", "Guild Hall",
        "Red Palace", "College of Artillery", "Meinwerk Palace", "Aachen Chapel",
        "Burgrave Palace", "Regnitz Cathedral", "Palace of Swabia", "Elzbach Palace",
        "Deer Stones", "Silver Tree", "Kurultai", "Steppe Redoubt",
        "Khaganate Palace", "White Stupa", "Golden Gate", "Kremlin",
        "High Trade House", "Abbey of the Trinity", "Spasskaya Tower", "High Armory",
        "Tower of Victory", "Dome of the Faith", "House of Learning",
        "Compound of the Defender", "Palace of the Sultan", "Hisar Academy",
      ],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // ⭐ SPÉCIALE
  // ═════════════════════════════════════════════════════════════
  SPECIALE: [
    "AUCUN",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🖼️ MIMER (Images à mimer - paires avec indice pour Mister White)
  // ═════════════════════════════════════════════════════════════
  MIMER: [
    {
      nom: "football",
      images: ["Coupe Du monde 2018.jpg", "Coupe Du monde 1998.jpg"],
      indice: "Sport avec un ballon rond - Coupe du monde",
      hintEn: "Sport with a round ball - World Cup",
    },
    {
      nom: "covid",
      images: ["Covid 19.png", "Passe Vaccinal.jpg"],
      indice: "2020",
      hintEn: "2020",
    },
    {
      nom: "football",
      images: ["OM 93.png", "PSG 25.png"],
      indice: "football",
      hintEn: "football",
    },
    {
      nom: "one_piece",
      images: ["La mort de ace.png", "sacrifice de zoro.png"],
      indice: "One Piece - Scènes émouvantes",
      hintEn: "One Piece - Emotional scenes",
    },
    {
      nom: "jeux_olympiques",
      images: ["jeux olympique d'été.jpg", "jeux olympique d'hiver.png"],
      indice: "Médaille",
      hintEn: "Medal",
    },
  ],

};

// ═════════════════════════════════════════════════════════════
// ENGLISH VERSION - CATEGORIES
// ═════════════════════════════════════════════════════════════

export const CATEGORIES_EN = {
  // ═════════════════════════════════════════════════════════════
  // ⚽ FOOTBALL
  // ═════════════════════════════════════════════════════════════
  FOOTBALL: {
    _subcategories: {
      'Strikers': ["Messi", "Ronaldo (CR7)", "Neymar", "Mbappé", "Haaland", "Salah", "Kane", "Benzema", "Lewandowski", "Aguero", "Higuain", "Dybala", "Tevez", "Lukaku", "Son Heung-min", "Henry", "Ronaldinho", "R9", "Maradona", "Pelé", "Trezeguet", "Romario", "Rooney"],
      'Wingers': ["Hazard", "Mané", "Dembélé", "Vinicius Jr", "Foden", "Saka", "Lamine Yamal", "Ribéry", "Robben"],
      'Midfielders': ["Zidane", "Iniesta", "Xavi", "Pirlo", "Beckham", "Lampard", "Gerrard", "Modric", "Toni Kroos", "De Bruyne", "Bellingham", "Pogba", "Griezmann", "Pedri", "Gavi"],
      'Defensive Midfielders': ["Matuidi", "Kanté", "Casemiro", "Tchouameni", "Valverde", "Rakitic"],
      'Defenders': ["Varane", "Ramos", "Pepe", "Marcelo", "Dani Alves", "Van Dijk", "De Ligt", "Davies", "Alaba", "Roberto Carlos", "Eder Militao", "Lahm", "Boateng", "Hummels", "Cafu"],
      'Goalkeepers': ["Alisson", "Ederson", "Courtois", "Ter Stegen", "Donnarumma", "Navas", "Oblak", "Neuer"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🏀 BASKETBALL
  // ═════════════════════════════════════════════════════════════
  BASKETBALL: {
    _subcategories: {
      'Point Guards': ["Stephen Curry", "Chris Paul", "Kyrie Irving", "Damian Lillard", "Russell Westbrook", "Tony Parker"],
      'Shooting Guards': ["Michael Jordan", "Kobe Bryant", "Dwyane Wade", "Allen Iverson", "James Harden", "Tracy McGrady", "Manu Ginóbili", "Paul George", "Carmelo Anthony"],
      'Forwards': ["LeBron James", "Kevin Durant", "Kawhi Leonard", "Giannis Antetokounmpo", "Luka Dončić", "Scottie Pippen", "Larry Bird", "Magic Johnson"],
      'Bigs/Centers': ["Shaquille O'Neal", "Tim Duncan", "Nikola Jokić", "Yao Ming", "Dirk Nowitzki", "Pau Gasol", "Dennis Rodman"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🌟 STARS
  // ═════════════════════════════════════════════════════════════
  STARS: {
    _subcategories: {
      'Action/Heroes': ["Vin Diesel", "Dwayne Johnson", "Jason Statham", "Bruce Willis", "John Cena", "Dave Bautista"],
      'Comedy/Action': ["Will Smith", "Jamie Foxx", "Marlon Wayans", "Martin Lawrence", "Idris Elba", "Chris Rock", "Michael B. Jordan"],
      'R&B/Pop': ["Michael Jackson", "Prince", "Bruno Mars", "The Weeknd", "Chris Brown", "Usher", "Justin Timberlake"],
      'Rap/Hip-Hop': ["Lil Wayne", "Snoop Dogg", "Future", "Wiz Khalifa", "Young Thug", "Lil Baby", "Travis Scott", "Drake", "Eminem", "Kanye West", "Tupac", "The Notorious B.I.G."],
      'Martial Arts': ["Bruce Lee", "Jackie Chan", "Jet Li", "Jean-Claude Van Damme", "Donnie Yen", "Michael Jai White", "Steven Seagal"],
      'Pop/Divas': ["Madonna", "Beyoncé", "Mariah Carey", "Rihanna", "Lady Gaga", "Britney Spears", "Celine Dion", "Whitney Houston", "Janet Jackson"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 👷 PROFESSIONS
  // ═════════════════════════════════════════════════════════════
  PROFESSIONS: {
    _subcategories: {
      'Medical': ["Doctor", "Nurse", "Surgeon", "Pharmacist", "Dentist", "Veterinarian", "Physiotherapist", "Midwife", "Paramedic", "Psychiatrist"],
      'Education': ["Teacher", "Primary School Teacher", "Principal", "Supervisor", "Youth Worker", "Educator", "Librarian"],
      'Law/Security': ["Police Officer", "Firefighter", "Lawyer", "Judge", "Military Police", "Detective", "Bodyguard", "Security Guard", "Customs Officer"],
      'Culinary': ["Chef", "Pastry Chef", "Baker", "Butcher", "Sommelier", "Bartender", "Waiter"],
      'Trades/Manual': ["Plumber", "Electrician", "Carpenter", "Painter", "Tailor", "Welder", "Tiler", "Bricklayer", "Roofer", "Mechanic"],
      'Art/Media': ["Journalist", "Photographer", "Director", "Actor", "Musician", "Illustrator", "Tattoo Artist", "Fashion Designer", "Architect"],
      'Business/Finance': ["Salesperson", "Sales Rep", "Banker", "Accountant", "Entrepreneur", "Real Estate Agent", "Insurance Agent", "Trader"],
      'Tech/Science': ["Engineer", "IT Specialist", "Developer", "Researcher", "Astronaut", "Pilot", "Meteorologist", "Archaeologist"],
      'Transport': ["Driver", "Pilot", "Sailor", "Ticket Inspector", "Delivery Driver", "Train Driver"],
      'Agriculture': ["Farmer", "Breeder", "Fisherman", "Winemaker", "Landscaper", "Lumberjack"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🌍 COUNTRIES
  // ═════════════════════════════════════════════════════════════
  COUNTRIES: {
    _subcategories: {
      'Western Europe': ["France", "Germany", "Spain", "Italy", "United Kingdom", "Portugal", "Belgium", "Netherlands", "Switzerland", "Austria", "Luxembourg", "Andorra", "Monaco", "Liechtenstein"],
      'Northern Europe': ["Sweden", "Norway", "Denmark", "Finland", "Iceland", "Ireland", "Scotland"],
      'Eastern Europe': ["Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Ukraine", "Belarus", "Lithuania", "Latvia", "Estonia", "Slovakia", "Georgia", "Armenia", "Azerbaijan"],
      'Balkans & Mediterranean': ["Greece", "Turkey", "Croatia", "Serbia", "Slovenia", "Bosnia", "Montenegro", "North Macedonia", "Albania", "Cyprus", "Malta", "San Marino", "Vatican"],
      'East Asia': ["Japan", "China", "South Korea", "North Korea", "Mongolia", "Taiwan", "Hong Kong"],
      'Southeast Asia': ["Thailand", "Vietnam", "Cambodia", "Laos", "Myanmar", "Malaysia", "Singapore", "Indonesia", "Philippines"],
      'South Asia': ["India", "Pakistan", "Bangladesh", "Kazakhstan", "Afghanistan"],
      'North America & Caribbean': ["United States", "Canada", "Mexico", "Cuba", "Jamaica", "Haiti", "Dominican Republic", "Puerto Rico", "Bahamas", "Barbados", "Trinidad and Tobago"],
      'Central America': ["Guatemala", "Belize", "Costa Rica", "Panama"],
      'South America': ["Colombia", "Venezuela", "Suriname", "Brazil", "Ecuador", "Peru", "Bolivia", "Paraguay", "Uruguay", "Argentina", "Chile"],
      'North Africa': ["Egypt", "Morocco", "Algeria", "Tunisia", "Libya", "Sudan", "Mauritania"],
      'East Africa': ["Ethiopia", "Kenya", "Uganda", "Tanzania", "Rwanda", "Burundi", "Djibouti", "Somalia", "Eritrea"],
      'West Africa': ["Senegal", "Mali", "Niger", "Guinea", "Ivory Coast", "Ghana", "Nigeria", "Benin", "Togo", "Sierra Leone", "Liberia", "Guinea-Bissau", "Gambia", "Cape Verde", "Burkina Faso", "Chad", "Cameroon"],
      'Central & Southern Africa': ["South Africa", "Congo", "DR Congo", "Gabon", "Angola", "Zambia", "Zimbabwe", "Botswana", "Namibia", "Lesotho", "Eswatini", "Madagascar", "Mauritius", "Comoros", "Seychelles"],
      'Middle East': ["Israel", "Palestine", "Jordan", "Lebanon", "Syria", "Iraq", "Iran", "Saudi Arabia", "Yemen", "Oman", "United Arab Emirates", "Qatar", "Bahrain", "Kuwait"],
      'Oceania': ["Australia", "New Zealand", "Fiji", "Papua New Guinea", "Vanuatu"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🦁 ANIMALS
  // ═════════════════════════════════════════════════════════════
  ANIMALS: {
    _subcategories: {
      'Equines': ["Horse", "Donkey", "Zebra", "Pony"],
      'Felines': ["Lion", "Tiger", "Leopard", "Cheetah", "Jaguar", "Puma", "Cat"],
      'Canines': ["Dog", "Wolf", "Fox", "Dingo"],
      'Birds of Prey': ["Phoenix", "Eagle", "Falcon", "Vulture", "Owl", "Horned Owl", "Crow"],
      'Common Birds': ["Pigeon", "Sparrow", "Parrot"],
      'Water Birds': ["Seagull", "Flamingo", "Swan", "Pelican", "Penguin"],
      'Herd': ["Cow", "Bull", "Sheep", "Goat", "Buffalo", "Bison"],
      'Farm': ["Chicken", "Duck", "Goose"],
      'Pets': ["Rabbit", "Hamster", "Guinea Pig", "Squirrel", "Hedgehog"],
      'Safari': ["Elephant", "Giraffe", "Rhinoceros", "Hippopotamus"],
      'Forest': ["Boar", "Deer", "Pig", "Gazelle"],
      'Marine': ["Dolphin", "Whale", "Orca", "Seal", "Sea Lion", "Shark"],
      'Seafood': ["Crab", "Lobster", "Shrimp", "Octopus", "Squid", "Starfish"],
      'Reptiles': ["Crocodile", "Snake", "Lizard", "Chameleon", "Iguana", "Turtle"],
      'Primates': ["Monkey", "Gorilla", "Orangutan", "Chimpanzee", "Baboon", "Bear", "Kangaroo", "Koala", "Panda"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎮 VIDEO GAMES
  // ═════════════════════════════════════════════════════════════
  VIDEO_GAMES: {
    _subcategories: {
      'Open World': ["Grand Theft Auto V (GTA V)", "Grand Theft Auto: San Andreas", "Grand Theft Auto: Vice City", "Grand Theft Auto IV (GTA IV)", "Saints Row", "Sleeping Dogs", "Watch Dogs", "Red Dead Redemption 2"],
      'Platform': ["Super Mario Bros.", "Sonic", "Donkey Kong", "Crash Bandicoot", "Rayman"],
      'Classics/Casual': ["Tetris", "Minecraft", "Pokémon Go", "Animal Crossing: New Horizons"],
      'FPS/Shooters': ["Call of Duty: Warzone", "Counter-Strike: Global Offensive (CS:GO)", "Halo", "Apex Legends", "Overwatch", "Fortnite", "PlayerUnknown's Battlegrounds (PUBG)"],
      'RPG/Adventure': ["The Legend of Zelda: Breath of the Wild", "The Elder Scrolls V: Skyrim", "The Witcher 3: Wild Hunt", "Final Fantasy VII", "Diablo III"],
      'Ball Sports': ["FIFA", "Pro Evolution Soccer (PES)", "NBA 2K", "Madden NFL", "Rugby 22", "Handball 21"],
      'Racing': ["Gran Turismo", "Forza Horizon", "Need for Speed", "Mario Kart", "F1", "WRC"],
      'Online/Esport': ["League of Legends (LoL)", "World of Warcraft (WoW)", "Valorant", "Rocket League", "Destiny 2", "Among Us"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎵 MUSIC
  // ═════════════════════════════════════════════════════════════
  MUSIC: {
    _subcategories: {
      'Rap/Hip-Hop': ["Trap", "Boom Bap", "Cloud Rap", "Drill", "Old School", "French Rap", "Gangsta Rap", "Lo-Fi Rap", "Conscious Rap", "Mumble Rap"],
      'Pop': ["Synthpop", "Electropop", "Indie Pop", "K-Pop", "Dance-Pop", "Dream Pop", "Bubblegum Pop", "Art Pop", "Chamber Pop"],
      'Rock': ["Hard Rock", "Punk Rock", "Grunge", "Indie Rock", "Progressive Rock", "Psychedelic Rock", "Post-Punk", "Glam Rock", "Stoner Rock"],
      'Electronic': ["Techno", "House", "Trance", "Dubstep", "Drum and Bass", "Ambient", "EDM", "Deep House", "Tech House", "Electro"],
      'R&B/Soul/Funk': ["Neo-Soul", "Funk", "Disco", "Motown", "Gospel", "Quiet Storm", "Contemporary R&B"],
      'Jazz/Blues': ["Bebop", "Smooth Jazz", "Swing", "Delta Blues", "Cool Jazz", "Free Jazz", "Big Band"],
      'Classical': ["Symphony", "Concerto", "Opera", "Sonata", "Ballet", "Fugue", "Oratorio"],
      'Reggae/Ska': ["Reggae", "Dancehall", "Ska", "Dub", "Ragga"],
      'Latin': ["Salsa", "Bachata", "Reggaeton", "Samba", "Tango", "Cumbia", "Bossa Nova", "Merengue"],
      'Metal': ["Heavy Metal", "Death Metal", "Black Metal", "Thrash Metal", "Power Metal", "Doom Metal", "Metalcore"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🚗 CARS
  // ═════════════════════════════════════════════════════════════
  CARS: {
    _subcategories: {
      'Supercars': ["Ferrari", "Lamborghini", "Bugatti", "McLaren", "Maserati", "Pagani", "Koenigsegg"],
      'Luxury': ["Rolls-Royce", "Bentley", "Aston Martin", "Mercedes-Benz", "Jaguar", "Lexus", "Range Rover"],
      'Sport/Premium': ["Porsche", "BMW", "Audi", "Alfa Romeo", "Lotus"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 👜 BRANDS
  // ═════════════════════════════════════════════════════════════
  BRANDS: {
    _subcategories: {
      'High Fashion': ["Louis Vuitton", "Chanel", "Gucci", "Hermès", "Prada", "Dior", "Saint Laurent", "Balenciaga", "Fendi", "Burberry"],
      'Jewelry/Watches': ["Rolex", "Cartier", "Bvlgari", "Tom Ford", "Omega", "TAG Heuer"],
      'Sport/Streetwear': ["Nike", "Adidas", "Puma", "New Balance", "Reebok", "Vans", "Converse", "Supreme", "Under Armour", "Fila"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🍥 MANGA
  // ═════════════════════════════════════════════════════════════
  MANGA: {
    _subcategories: {
      'Naruto': ["Naruto", "Sasuke", "Kakashi", "Itachi", "Madara", "Obito", "Jiraya", "Orochimaru", "Hashirama", "Minato", "Pain", "Gaara"],
      'Dragon Ball': ["Goku", "Vegeta", "Broly", "Black Goku", "Gohan", "Trunks", "Bardock", "Gogeta", "Vegeto", "King Vegeta", "Gotenks", "Raditz"],
      'One Piece': ["Luffy", "Zoro", "Sanji", "Shanks", "Barbe Blanche", "Kaido", "Big Mom", "Barbe Noire", "Gol D. Roger", "Ace", "Sabo"],
      'Misc/Legends': ["Saitama", "Krillin", "Master Roshi", "Kratos", "Nappa"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎬 MOVIES / SERIES
  // ═════════════════════════════════════════════════════════════
  MOVIES_SERIES: {
    _subcategories: {
      'Superheroes/Action': ["Avengers", "Spider-Man", "Batman", "Fast & Furious", "Jurassic World"],
      'Sci-Fi/Epic': ["Star Wars", "Avatar", "Titanic", "Dune", "Interstellar", "Matrix"],
      'Hit Series': ["Game of Thrones", "Stranger Things", "The Last of Us", "Squid Game", "One Piece", "Breaking Bad", "La Casa de Papel", "Wednesday"],
      'Action/Espionage': ["Mission: Impossible", "James Bond", "Jason Bourne", "Die Hard", "Taken"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 📦 OBJECTS
  // ═════════════════════════════════════════════════════════════
  OBJECTS: {
    _subcategories: {
      'Phones & Audio': ["Phone", "Tablet", "Headphones", "Earbuds", "Speaker", "Charger", "Battery"],
      'Screen & Photo': ["Computer", "Camera", "Television", "Remote Control"],
      'Tableware': ["Fork", "Spoon", "Knife", "Plate", "Glass", "Mug", "Bottle"],
      'Cooking': ["Pan", "Pot", "Microwave", "Toaster", "Coffee Maker", "Kettle", "Blender", "Food Processor"],
      'Furniture': ["Sofa", "Table", "Chair", "Bed", "Wardrobe", "Dresser", "Desk", "Shelf"],
      'Bedding': ["Cushion", "Blanket", "Sheet", "Pillow", "Mattress", "Bed Frame"],
      'Decor': ["Rug", "Vase", "Mirror", "Curtain", "Lamp", "Clock", "Alarm Clock"],
      'Bags & Personal': ["Key", "Wallet", "Handbag", "Suitcase", "Umbrella", "Glasses", "Watch"],
      'Writing & Office': ["Pen", "Notebook", "Book", "Paper Napkin"],
      'Cleaning': ["Broom", "Vacuum", "Bucket", "Rag", "Cleaning Product", "Dishcloth", "Sponge"],
      'DIY & Misc': ["Candle", "Match", "Lighter", "Scissors", "Glue", "Duct Tape"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🏠 LOCATIONS (Spyfall Mode)
  // ═════════════════════════════════════════════════════════════
  LOCATIONS: {
    _subcategories: {
      'Urban': ["Restaurant", "Cinema", "Supermarket", "Bank", "Library", "Museum", "Hotel", "Theater", "Opera", "Market", "Shopping Mall", "Nightclub"],
      'Transport': ["Train Station", "Airport", "Airplane", "Cruise Ship", "Submarine", "Caravan"],
      'Nature': ["Beach", "North Pole", "Desert", "Rainforest", "Desert Island", "Volcano", "Mountain"],
      'Public Institutions': ["School", "Church", "Prison", "Embassy", "Military Camp"],
      'Science/Industrial': ["Hospital", "Laboratory", "Factory", "Space Station"],
      'Entertainment': ["Amusement Park", "Stadium", "Casino", "Circus", "Olympic Stadium", "Spa", "Festival", "Lighthouse", "Castle", "Ski Resort", "Zoo"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 💼 JOBS (Spyfall Mode - images)
  // ═════════════════════════════════════════════════════════════
  JOBS: ["Actor", "Lawyer", "Football Coach", "Gendarme", "Nurse", "Journalist", "Judge", "Delivery Driver", "Doctor", "Soldier", "Police Officer", "Firefighter", "Teacher"],

  // ═════════════════════════════════════════════════════════════
  // 🏅 SPORT (Spyfall Mode - images)
  // ═════════════════════════════════════════════════════════════
  SPORT: ["Baseball", "Basketball", "Boxing", "Wrestling", "American Football", "Football", "Futsal", "Handball", "Karate", "MMA", "Swimming", "Rugby", "Tennis", "Volleyball", "Water Polo"],

  // ═════════════════════════════════════════════════════════════
  // 🏰 AGE OF EMPIRE 4
  // ═════════════════════════════════════════════════════════════
  AGE_OF_EMPIRE_4: {
    _subcategories: {
      'Civilizations': [
        "Jin Dynasty", "Golden Horde", "Macedonian Dynasty", "Sengoku Daimyo",
        "Tughlaq Dynasty", "House of Lancaster", "Knights Templar", "Ayyubids",
        "Joan of Arc", "Order of the Dragon", "Zhu Xi's Legacy", "Byzantines",
        "Japanese", "English", "French", "Holy Roman Empire",
        "Rus", "Mongols", "Chinese", "Delhi Sultanate",
        "Abbasid Dynasty", "Ottomans", "Malians",
      ],
      'Pikeman Units': [
        "Spearman", "Limitanei", "Donso", "Gilded Spearman", "Atgeirmaðr",
      ],
      'Cavalry': [
        "Scout", "Horseman", "Knight", "Ghazi Raider", "Royal Knight",
        "Cataphract", "Fire Lancer", "Camel Rider", "Camel Archer",
        "War Elephant", "Tower Elephant", "Mangudai", "Keshik", "Khan",
        "Horse Archer", "Warrior Monk", "Sipahi", "Akinji", "Warrior Scout",
        "Sofa", "Mounted Samurai", "Gilded Horseman", "Gilded Knight",
        "Hobelar", "Demilancer", "Earl's Guard", "Chevalier Confrere",
        "Templar Brother", "Genitour", "Black Rider", "Desert Raider",
        "Camel Lancer", "Dervish", "Torguud", "Kipchak Archer",
        "Yari Cavalry", "Daimyo", "Yuan Raider", "Raider Elephant",
        "Jeanne's Rider",
      ],
      'Buildings': [
        "Town Center", "House", "Mill", "Lumber Camp", "Mining Camp",
        "Dock", "Barracks", "Palisade Wall", "Outpost", "Archery Range",
        "Stable", "Blacksmith", "Market", "Stone Wall", "Tower",
        "Keep", "Siege Workshop", "Monastery", "University", "Farm",
        "Wonder", "Trade Post", "Sacred Site", "Palisade Gate",
        "Stone Wall Gate", "Stone Wall Tower",
        "House of Wisdom", "Aqueduct", "Cistern", "Mercenary House", "Olive Grove",
        "Village", "Granary", "Pagoda", "Campfire",
        "Golden Tent", "Ovoo", "Ger", "Pasture", "Livestock Pen",
        "Manor", "Buddhist Temple", "Shinto Shrine", "Japanese Castle",
        "Forge", "Daimyo Estate", "Matsuri",
        "Templar Headquarters", "Fortress", "Harbor",
        "Varangian Arsenal", "Varangian Stronghold", "Varangian Warcamp",
        "Cattle Ranch", "Pit Mine", "Military School",
        "Hunting Cabin", "Wooden Fortress", "Fortified Palisade Gate",
        "Tughlaqabad Fort", "Worker Elephant",
        "Council Hall", "Abbey of Kings", "White Tower", "King's Palace",
        "Berkshire Palace", "Wynguard Palace", "Barbican of the Sun", "Imperial Academy",
        "Imperial Palace", "Astronomical Clocktower", "Great Wall Gatehouse", "Spirit Way",
        "School of Cavalry", "Chamber of Commerce", "Royal Institute", "Guild Hall",
        "Red Palace", "College of Artillery", "Meinwerk Palace", "Aachen Chapel",
        "Burgrave Palace", "Regnitz Cathedral", "Palace of Swabia", "Elzbach Palace",
        "Deer Stones", "Silver Tree", "Kurultai", "Steppe Redoubt",
        "Khaganate Palace", "White Stupa", "Golden Gate", "Kremlin",
        "High Trade House", "Abbey of the Trinity", "Spasskaya Tower", "High Armory",
        "Tower of Victory", "Dome of the Faith", "House of Learning",
        "Compound of the Defender", "Palace of the Sultan", "Hisar Academy",
      ],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // ⭐ SPECIAL
  // ═════════════════════════════════════════════════════════════
  SPECIALE: [
    "NONE",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🖼️ MIMER (Images à mimer - paires avec indice pour Mister White)
  // ═════════════════════════════════════════════════════════════
  MIMER: [
    {
      nom: "football",
      images: ["Coupe Du monde 2018.jpg", "Coupe Du monde 1998.jpg"],
      indice: "Sport avec un ballon rond - Coupe du monde",
      hintEn: "Sport with a round ball - World Cup",
    },
    {
      nom: "covid",
      images: ["Covid 19.png", "Passe Vaccinal.jpg"],
      indice: "2020",
      hintEn: "2020",
    },
    {
      nom: "football",
      images: ["OM 93.png", "PSG 25.png"],
      indice: "football",
      hintEn: "football",
    },
    {
      nom: "one_piece",
      images: ["La mort de ace.png", "sacrifice de zoro.png"],
      indice: "One Piece - Scènes émouvantes",
      hintEn: "One Piece - Emotional scenes",
    },
    {
      nom: "jeux_olympiques",
      images: ["jeux olympique d'été.jpg", "jeux olympique d'hiver.png"],
      indice: "Médaille",
      hintEn: "Medal",
    },
  ],

};


// ═════════════════════════════════════════════════════════════
// HELPERS - Extraction des mots (plat) depuis les catégories
// ═════════════════════════════════════════════════════════════

// Extrait la liste plate de mots d'une catégorie (string[] ou { _subcategories })
function getFlatWords(categoryData) {
  if (Array.isArray(categoryData)) return categoryData;
  if (categoryData && typeof categoryData === 'object' && categoryData._subcategories) {
    const subs = categoryData._subcategories;
    const allWords = [];
    for (const key of Object.keys(subs)) {
      allWords.push(...subs[key]);
    }
    return allWords;
  }
  return [];
}

// Extrait les sous-catégories d'une catégorie, ou null si c'est une liste plate
function getSubcategories(categoryData) {
  if (categoryData && typeof categoryData === 'object' && categoryData._subcategories) {
    return categoryData._subcategories;
  }
  return null;
}

// Get categories based on language
export const CATEGORIES = (lang) => {
  return lang === 'en' ? CATEGORIES_EN : CATEGORIES_FR;
};

// Default export for backward compatibility (French)
export const CATEGORIES_DEFAULT = CATEGORIES_FR;

// Export pour gameLogic.js — structure { cat, words: string[], subcategories?: object }
export const WORD_DB = Object.keys(CATEGORIES_FR).map(cat => {
  const data = CATEGORIES_FR[cat];
  return {
    cat,
    words: getFlatWords(data),
    ...(getSubcategories(data) ? { subcategories: getSubcategories(data) } : {}),
  };
});

export const WORD_DB_EN = Object.keys(CATEGORIES_EN).map(cat => {
  const data = CATEGORIES_EN[cat];
  return {
    cat,
    words: getFlatWords(data),
    ...(getSubcategories(data) ? { subcategories: getSubcategories(data) } : {}),
  };
});

export const WORD_CLUES = {};
Object.keys(CATEGORIES_FR).forEach(cat => {
  if (cat === 'MIMER') return;
  const words = getFlatWords(CATEGORIES_FR[cat]);
  words.forEach(word => {
    WORD_CLUES[word] = [];
  });
});

// ─── Indices pour le mode Facile Spyfall ───
export const SPYFALL_HINTS_FR = {
  // Urbain
  'Restaurant': 'Service',
  'Cinéma': 'Obscurité',
  'Supermarché': 'Rayon',
  'Banque': 'Compte',
  'Bibliothèque': 'Retour',
  'Musée': 'Cadre',
  'Hôtel': 'Clé',
  'Théâtre': 'Rideau',
  'Opéra': 'Vibrations',
  'Marché': 'Étiquette',
  // Transport
  'Gare': 'Quai',
  'Aéroport': 'Transit',
  'Avion': 'Cabine',
  'Bateau de croisière': 'Pont',
  'Sous-marin': 'Pression',
  'Caravane': 'Étape',
  // Nature
  'Plage': 'Coquillage',
  'Pôle Nord': 'Nuit',
  'Désert': 'Mirage',
  'Forêt tropicale': 'Canopée',
  'Île déserte': 'Signal',
  'Volcan': 'Cendres',
  // Institutions publiques
  'École': 'Sonnette',
  'Église': 'Vitrail',
  'Prison': 'Matricule',
  'Ambassade': 'Passeport',
  'Camp militaire': 'Rangement',
  // Scientifique/Industriel
  'Hôpital': 'Blouse',
  'Laboratoire': 'Gel',
  'Usine': 'Chaîne',
  'Station spatiale': 'Orbite',
  // Loisirs
  "Parc d'attractions": 'File',
  'Stade': 'Vague',
  'Casino': 'Jeton',
  'Cirque': 'Filet',
  'Stade olympique': 'Podium',
  'Spa': 'Bougie',
  'Festival': 'Bracelet',
  'Phare': 'Signal',
  'Château': 'Douves',
  'Centre commercial': 'Étalage',
  'Club de nuit': 'Néon',
  'Montagne': 'Altitude',
  'Station de ski': 'Remontée',
  'Zoo': 'Enclos',
  // TRAVAIL
  // SPORT
  'Baseball': 'Batte',
  'Basketball': 'Panier',
  'Boxe': 'Gant',
  'Catch': 'Ring',
  'Football américain': 'Casque',
  'Football': 'Hors-jeu',
  'Futsal': 'Terrain',
  'Handball': 'But',
  'Karaté': 'Ceinture',
  'MMA': 'Octogone',
  'Natation': 'Ligne',
  'Rugby': 'Mêlée',
  'Tennis': 'Raquette',
  'Volleyball': 'Filet',
  'Water-polo': 'Bonnet',
  // TRAVAIL
  'Acteur': 'Scène',
  'Avocat': 'Plaidoirie',
  'Entraîneur de football': 'Terrain',
  'Gendarme': 'Radar',
  'Infirmier': 'Pouls',
  'Journaliste': 'Titre',
  'Juge': 'Marteau',
  'Livreur': 'Colis',
  'Médecin': 'Ordonnance',
  'Militaire': 'Caserne',
  'Policier': 'Amende',
  'Pompier': 'Lance',
  'Professeur': 'Craie',
};

export const SPYFALL_HINTS_EN = {
  // Urban
  'Restaurant': 'Service',
  'Cinema': 'Darkness',
  'Supermarket': 'Aisle',
  'Bank': 'Account',
  'Library': 'Return',
  'Museum': 'Frame',
  'Hotel': 'Keycard',
  'Theater': 'Curtain',
  'Opera': 'Vibrations',
  'Market': 'Price tag',
  // Transport
  'Train Station': 'Platform',
  'Airport': 'Transit',
  'Airplane': 'Cabin',
  'Cruise Ship': 'Deck',
  'Submarine': 'Pressure',
  'Caravan': 'Stop',
  // Nature
  'Beach': 'Seashell',
  'North Pole': 'Night',
  'Desert': 'Mirage',
  'Rainforest': 'Canopy',
  'Desert Island': 'Signal',
  'Volcano': 'Ashes',
  // Public Institutions
  'School': 'Bell',
  'Church': 'Stained glass',
  'Prison': 'Number',
  'Embassy': 'Passport',
  'Military Camp': 'Formation',
  // Science/Industrial
  'Hospital': 'Gown',
  'Laboratory': 'Gel',
  'Factory': 'Line',
  'Space Station': 'Orbit',
  // Entertainment
  'Amusement Park': 'Queue',
  'Stadium': 'Wave',
  'Casino': 'Chip',
  'Circus': 'Net',
  'Olympic Stadium': 'Podium',
  'Spa': 'Candle',
  'Festival': 'Wristband',
  'Lighthouse': 'Beam',
  'Castle': 'Moat',
  'Shopping Mall': 'Aisle',
  'Nightclub': 'Neon',
  'Mountain': 'Altitude',
  'Ski Resort': 'Lift',
  'Zoo': 'Enclosure',
  // JOBS
  // SPORT
  'Baseball': 'Bat',
  'Basketball': 'Hoop',
  'Boxing': 'Glove',
  'Wrestling': 'Ring',
  'American Football': 'Helmet',
  'Football': 'Offside',
  'Futsal': 'Court',
  'Handball': 'Goal',
  'Karate': 'Belt',
  'MMA': 'Octagon',
  'Swimming': 'Lane',
  'Rugby': 'Scrum',
  'Tennis': 'Racket',
  'Volleyball': 'Net',
  'Water Polo': 'Cap',
  // JOBS
  'Actor': 'Stage',
  'Lawyer': 'Pleading',
  'Football Coach': 'Pitch',
  'Gendarme': 'Radar',
  'Nurse': 'Pulse',
  'Journalist': 'Headline',
  'Judge': 'Gavel',
  'Delivery Driver': 'Package',
  'Doctor': 'Prescription',
  'Soldier': 'Barracks',
  'Police Officer': 'Fine',
  'Firefighter': 'Hose',
  'Teacher': 'Chalk',
};