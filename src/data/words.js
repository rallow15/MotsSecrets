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
      'Stars mondiales': ["Messi", "Ronaldo (CR7)", "Neymar", "Mbappé", "Zidane", "Ronaldinho", "Maradona", "Pelé", "R9", "Henry"],
      'Attaquants': ["Benzema", "Lewandowski", "Salah", "Haaland", "Kane", "Son Heung-min", "Lukaku", "Aguero", "Higuain", "Dybala", "Tevez"],
      'Ailiers': ["Hazard", "Mané", "Dembélé", "Vinicius Jr", "Foden", "Saka", "Lamine Yamal", "Pedri", "Gavi"],
      'Milieux': ["Iniesta", "Xavi", "Pirlo", "Beckham", "Lampard", "Gerrard", "Modric", "Toni Kroos", "De Bruyne", "Bellingham", "Pogba", "Griezmann"],
      'Milieux défensifs': ["Matuidi", "Kanté", "Casemiro", "Tchouameni", "Valverde", "Rakitic"],
      'Défenseurs': ["Varane", "Ramos", "Pepe", "Marcelo", "Dani Alves", "Van Dijk", "De Ligt", "Davies", "Alaba", "Roberto Carlos", "Eder Militao"],
      'Gardiens': ["Alisson", "Ederson", "Courtois", "Ter Stegen", "Donnarumma", "Navas", "Oblak", "Neuer"],
      'Légendes': ["Cafu", "Trezeguet", "Ribéry", "Robben", "Lahm", "Boateng", "Hummels", "Muller", "Romario", "Rooney"],
    },
  },

  // ═══════════════════════════════════════════════════════════
  // 🏀 BASKETBALL
  // ═════════════════════════════════════════════════════════════
  BASKETBALL: [
    "Michael Jordan", "LeBron James", "Kobe Bryant", "Shaquille O'Neal",
    "Allen Iverson", "Stephen Curry", "Kevin Durant", "Magic Johnson",
    "Larry Bird", "Tim Duncan", "Dwyane Wade", "Carmelo Anthony",
    "Chris Paul", "Russell Westbrook", "James Harden", "Kawhi Leonard",
    "Giannis Antetokounmpo", "Luka Dončić", "Nikola Jokić", "Kyrie Irving",
    "Yao Ming", "Dirk Nowitzki", "Tony Parker", "Manu Ginóbili",
    "Pau Gasol", "Tracy McGrady", "Scottie Pippen", "Dennis Rodman",
    "Paul George", "Damian Lillard",
  ],

  // ═══════════════════════════════════════════════════════════
  // 🎬 ACTEURS
  // ═════════════════════════════════════════════════════════════
  ACTEURS: [
    "Leonardo DiCaprio", "Tom Cruise", "Will Smith", "Brad Pitt", "Johnny Depp",
    "Robert Downey Jr.", "Dwayne Johnson", "Tom Hanks", "Keanu Reeves", "Morgan Freeman",
    "Christian Bale", "Hugh Jackman", "Matt Damon", "Ben Affleck", "Mark Wahlberg",
    "Jason Statham", "Vin Diesel", "Samuel L. Jackson", "Robert De Niro", "Al Pacino",
    "Tom Holland", "Chuck Norris", "Wesley Snipes", "Michael B. Jordan", "Omar Sy",
    "Jean Dujardin", "Denzel Washington", "Jackie Chan", "Bruce Lee", "Jet Li",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎬 ACTRICES
  // ═════════════════════════════════════════════════════════════
  ACTRICES: [
    "Scarlett Johansson", "Jennifer Lawrence", "Angelina Jolie", "Emma Watson", "Gal Gadot",
    "Meryl Streep", "Natalie Portman", "Margot Robbie", "Charlize Theron", "Zendaya",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🌍 PAYS
  // ═════════════════════════════════════════════════════════════
  PAYS: [
    "France", "Allemagne", "Espagne", "Italie", "Royaume-Uni",
    "Portugal", "Belgique", "Pays-Bas", "Suisse", "Autriche",
    "Suède", "Norvège", "Danemark", "Finlande", "Islande",
    "Irlande", "Écosse", "Pologne", "République Tchèque", "Hongrie",
    "Roumanie", "Bulgarie", "Grèce", "Turquie", "Russie",
    "Ukraine", "Biélorussie", "Lituanie", "Lettonie", "Estonie",
    "Slovaquie", "Croatie", "Serbie", "Slovénie", "Bosnie",
    "Monténégro", "Macédoine", "Albanie", "Malte", "Chypre",
    "Luxembourg", "Andorre", "Monaco", "Saint-Marin", "Vatican",
    "Liechtenstein", "Géorgie", "Arménie", "Azerbaïdjan", "Kazakhstan",
    "Japon", "Chine", "Corée du Sud", "Corée du Nord", "Inde",
    "Pakistan", "Bangladesh", "Thaïlande", "Vietnam", "Cambodge",
    "Laos", "Birmanie", "Malaisie", "Singapour", "Indonésie",
    "Philippines", "Taïwan", "Hong Kong", "Macao", "Mongolie",
    "Australie", "Nouvelle-Zélande", "Fidji", "Papouasie", "Vanuatu",
    "États-Unis", "Canada", "Mexique", "Guatemala", "Belize",
    "Costa Rica", "Panama", "Cuba", "Jamaïque", "Haïti",
    "République Dominicaine", "Porto Rico", "Bahamas", "Barbade", "Trinité",
    "Colombie", "Venezuela", "Guyane", "Brésil", "Équateur",
    "Pérou", "Bolivie", "Paraguay", "Uruguay", "Argentine",
    "Chili", "Afrique du Sud", "Égypte", "Maroc", "Algérie",
    "Tunisie", "Libye", "Soudan", "Éthiopie", "Kenya",
    "Ouganda", "Tanzanie", "Rwanda", "Burundi", "Congo",
    "RDC", "Cameroun", "Gabon", "Guinée", "Sénégal",
    "Mali", "Niger", "Tchad", "Burkina Faso", "Côte d'Ivoire",
    "Ghana", "Nigéria", "Bénin", "Togo", "Sierra Leone",
    "Libéria", "Guinée-Bissau", "Gambie", "Cap-Vert", "São Tomé",
    "Angola", "Zambie", "Zimbabwe", "Botswana", "Namibie",
    "Lesotho", "Eswatini", "Madagascar", "Maurice", "Comores",
    "Seychelles", "Djibouti", "Somalie", "Érythrée", "Mauritanie",
    "Israël", "Palestine", "Jordanie", "Liban", "Syrie",
    "Irak", "Iran", "Arabie Saoudite", "Yémen", "Oman",
    "Émirats Arabes Unis", "Qatar", "Bahreïn", "Koweït", "Afghanistan",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🦁 ANIMAUX
  // ═════════════════════════════════════════════════════════════
  ANIMAUX: {
    _subcategories: {
      'Félins': ["Lion", "Tigre", "Léopard", "Guépard", "Jaguar", "Puma"],
      'Primates': ["Singe", "Gorille", "Chimpanzé", "Orang-outan", "Babouin"],
      'Animaux de maison': ["Chat", "Chien", "Lapin", "Hamster", "Cochon d'Inde"],
      'Ferme': ["Cheval", "Âne", "Vache", "Taureau", "Mouton", "Brebis", "Chèvre", "Bouc", "Cochon", "Poule", "Coq", "Canard", "Oie", "Dinde", "Bœuf"],
      'Forêt': ["Loup", "Renard", "Ours", "Sanglier", "Cerf", "Biche", "Chevreuil", "Écureuil", "Hérisson"],
      'Savane': ["Éléphant", "Rhinocéros", "Hippopotame", "Girafe", "Zèbre", "Gnou", "Gazelle", "Antilope", "Buffle"],
      'Oiseaux': ["Aigle", "Faucon", "Hibou", "Chouette", "Corbeau", "Pigeon", "Moineau", "Perroquet", "Mouette", "Pingouin"],
      'Marins': ["Requin", "Dauphin", "Baleine", "Orque", "Phoque", "Otarie"],
      'Mer': ["Crabe", "Langouste", "Homard", "Crevette", "Poulpe", "Calamar", "Étoile de mer", "Oursin"],
      'Reptiles': ["Tortue", "Lézard", "Caméléon", "Iguane", "Serpent", "Python", "Cobra", "Vipère", "Crocodile", "Alligator", "Caïman"],
      'Étang': ["Grenouille", "Crapaud", "Rat", "Souris", "Lièvre", "Castor", "Loutre"],
      'Exotiques': ["Kangourou", "Koala", "Panda", "Dingo"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎮 JEUX VIDÉO
  // ═════════════════════════════════════════════════════════════
  JEUX_VIDEO: [
    "Minecraft", "Fortnite", "Grand Theft Auto V (GTA V)", "Grand Theft Auto IV (GTA IV)",
    "Grand Theft Auto: San Andreas", "Grand Theft Auto: Vice City", "The Legend of Zelda: Breath of the Wild",
    "League of Legends (LoL)", "PlayerUnknown's Battlegrounds (PUBG)", "Call of Duty: Warzone",
    "Tetris", "Pokémon Go", "Super Mario Bros.", "The Elder Scrolls V: Skyrim", "Red Dead Redemption 2",
    "Among Us", "World of Warcraft (WoW)", "Apex Legends", "FIFA", "Pro Evolution Soccer (PES)",
    "Counter-Strike: Global Offensive (CS:GO)", "Overwatch", "Halo", "Final Fantasy VII",
    "The Witcher 3: Wild Hunt", "Assassin's Creed", "Animal Crossing: New Horizons", "Destiny 2",
    "Diablo III", "Crash Bandicoot",
  ],


  // ═════════════════════════════════════════════════════════════
  // 🎵 MUSIQUE / CHANTEURS
  // ═════════════════════════════════════════════════════════════
  MUSIQUE: [
    "Niska", "Booba", "Jul", "PNL", "Ninho",
    "Gims", "Maître Gims", "Soprano", "Bigflo", "Oli",
    "Stromae", "Angèle", "Aya Nakamura", "Dadju", "Black M",
    "Vitaa", "Shy'm", "Zaz", "Carla Bruni", "Mylène Farmer",
    "Johnny Hallyday", "Eddy Mitchell", "Jacques Dutronc", "Serge Gainsbourg", "Charles Aznavour",
    "Joe Dassin", "Michel Sardou", "Renaud", "Francis Cabrel", "Jean-Jacques Goldman",
    "Patrick Bruel", "Florent Pagny", "Garou", "Daniel Balavoine", "Alain Souchon",
    "Laurent Voulzy", "Téléphone", "Indochine", "Noir Désir", "Mano Negra",
    "Tryo", "Kyo", "Linkin Park", "Nirvana", "Metallica",
    "Queen", "The Beatles", "Rolling Stones", "Led Zeppelin", "Pink Floyd",
    "Michael Jackson", "Prince", "Madonna", "Beyoncé", "Rihanna",
    "Taylor Swift", "Adele", "Lady Gaga", "Katy Perry", "Bruno Mars",
    "The Weeknd", "Drake", "Kanye West", "Jay-Z", "Eminem",
    "50 Cent", "Snoop Dogg", "Tupac", "Biggie", "Nas",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🚗 VOITURES
  // ═════════════════════════════════════════════════════════════
  VOITURES: [
    "Ferrari", "Lamborghini", "Porsche", "Rolls-Royce", "Bentley",
    "Aston Martin", "Maserati", "McLaren", "Bugatti", "Mercedes-Benz",
    "BMW", "Audi", "Jaguar", "Land Rover", "Tesla",
  ],

  // ═════════════════════════════════════════════════════════════
  // 👜 MARQUES
  // ═════════════════════════════════════════════════════════════
  MARQUES: [
    "Louis Vuitton", "Chanel", "Gucci", "Hermès", "Prada",
    "Rolex", "Cartier", "Fendi", "Dior", "Saint Laurent",
    "Balenciaga", "Burberry", "Tom Ford", "Bvlgari", "Nike",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎌 MANGA
  // ═════════════════════════════════════════════════════════════
  MANGA: [
    "Naruto", "Sasuke", "Sakura", "Kakashi", "Itachi",
    "Goku", "Vegeta", "Gohan", "Piccolo", "Frieza", "Krillin", "Broly", "Trunks", "Bulma", "Cell", "Majin Boo", "Tortue Géniale",
    "Luffy", "Zoro", "Nami", "Sanji", "Chopper", "Shanks", "Kaido", "Big Mom",
    "Saitama", "Rock D. Xebec",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎬 FILMS / SÉRIES
  // ═════════════════════════════════════════════════════════════
  FILMS_SERIES: [
    "Avatar", "Star Wars", "Jurassic World", "Mission: Impossible", "Fast & Furious",
    "Game of Thrones", "Stranger Things", "The Last of Us", "Squid Game", "One Piece",
  ],

  // ═════════════════════════════════════════════════════════════
  // 📦 OBJETS
  // ═════════════════════════════════════════════════════════════
  OBJETS: [
    "Téléphone", "Ordinateur", "Tablette", "Montre", "Lunettes",
    "Clé", "Portefeuille", "Sac", "Valise", "Parapluie",
    "Stylo", "Cahier", "Livre", "Télécommande", "Appareil photo",
    "Casque", "Écouteurs", "Enceinte", "Chargeur", "Batterie",
    "Lampe", "Bougie", "Allumette", "Briquet", "Couteau",
    "Fourchette", "Cuillère", "Assiette", "Verre", "Tasse",
    "Bouteille", "Serviette", "Torchon", "Éponge",
    "Balai", "Aspirateur", "Seau", "Chiffon", "Produit ménager",
    "Canapé", "Table", "Chaise", "Lit", "Armoire",
    "Commode", "Bureau", "Étagère", "Miroir", "Rideau",
    "Coussin", "Couverture", "Drap", "Oreiller", "Matelas",
    "Tapis", "Vase", "Cadre", "Horloge", "Réveil",
    "Télévision", "Radio", "Micro-ondes", "Grille-pain", "Cafetière",
    "Bouilloire", "Mixeur", "Robot culinaire", "Poêle", "Casserole",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🏠 LIEUX (Mode Spyfall)
  // ═════════════════════════════════════════════════════════════
  LIEUX: [
    "Plage", "Restaurant", "Cinéma", "Hôpital", "Avion",
    "École", "Gare", "Supermarché", "Parc d'attractions", "Stade",
    "Bibliothèque", "Musée", "Aéroport", "Hôtel", "Banque",
    "Casino", "Église", "Prison", "Ambassade", "Théâtre",
    "Cirque", "Bateau de croisière", "Camp militaire", "Station spatiale", "Sous-marin",
    "Pôle Nord", "Désert", "Forêt tropicale", "Île déserte", "Volcan",
    "Marché", "Usine", "Laboratoire", "Opéra", "Stade olympique",
    "Spa", "Festival", "Caravane", "Phare", "Château",
  ],

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
      'Global Stars': ["Messi", "Ronaldo (CR7)", "Neymar", "Mbappé", "Zidane", "Ronaldinho", "Maradona", "Pelé", "R9", "Henry"],
      'Strikers': ["Benzema", "Lewandowski", "Salah", "Haaland", "Kane", "Son Heung-min", "Lukaku", "Aguero", "Higuain", "Dybala", "Tevez"],
      'Wingers': ["Hazard", "Mané", "Dembélé", "Vinicius Jr", "Foden", "Saka", "Lamine Yamal", "Pedri", "Gavi"],
      'Midfielders': ["Iniesta", "Xavi", "Pirlo", "Beckham", "Lampard", "Gerrard", "Modric", "Toni Kroos", "De Bruyne", "Bellingham", "Pogba", "Griezmann"],
      'Defensive Midfielders': ["Matuidi", "Kanté", "Casemiro", "Tchouameni", "Valverde", "Rakitic"],
      'Defenders': ["Varane", "Ramos", "Pepe", "Marcelo", "Dani Alves", "Van Dijk", "De Ligt", "Davies", "Alaba", "Roberto Carlos", "Eder Militao"],
      'Goalkeepers': ["Alisson", "Ederson", "Courtois", "Ter Stegen", "Donnarumma", "Navas", "Oblak", "Neuer"],
      'Legends': ["Cafu", "Trezeguet", "Ribéry", "Robben", "Lahm", "Boateng", "Hummels", "Muller", "Romario", "Rooney"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🏀 BASKETBALL
  // ═════════════════════════════════════════════════════════════
  BASKETBALL: [
    "Michael Jordan", "LeBron James", "Kobe Bryant", "Shaquille O'Neal",
    "Allen Iverson", "Stephen Curry", "Kevin Durant", "Magic Johnson",
    "Larry Bird", "Tim Duncan", "Dwyane Wade", "Carmelo Anthony",
    "Chris Paul", "Russell Westbrook", "James Harden", "Kawhi Leonard",
    "Giannis Antetokounmpo", "Luka Dončić", "Nikola Jokić", "Kyrie Irving",
    "Yao Ming", "Dirk Nowitzki", "Tony Parker", "Manu Ginóbili",
    "Pau Gasol", "Tracy McGrady", "Scottie Pippen", "Dennis Rodman",
    "Paul George", "Damian Lillard",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎬 ACTORS
  // ═════════════════════════════════════════════════════════════
  ACTORS: [
    "Leonardo DiCaprio", "Tom Cruise", "Will Smith", "Brad Pitt", "Johnny Depp",
    "Robert Downey Jr.", "Dwayne Johnson", "Tom Hanks", "Keanu Reeves", "Morgan Freeman",
    "Christian Bale", "Hugh Jackman", "Matt Damon", "Ben Affleck", "Mark Wahlberg",
    "Jason Statham", "Vin Diesel", "Samuel L. Jackson", "Robert De Niro", "Al Pacino",
    "Tom Holland", "Chuck Norris", "Wesley Snipes", "Michael B. Jordan", "Omar Sy",
    "Jean Dujardin", "Denzel Washington", "Jackie Chan", "Bruce Lee", "Jet Li",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎬 ACTRESSES
  // ═════════════════════════════════════════════════════════════
  ACTRESSES: [
    "Scarlett Johansson", "Jennifer Lawrence", "Angelina Jolie", "Emma Watson", "Gal Gadot",
    "Meryl Streep", "Natalie Portman", "Margot Robbie", "Charlize Theron", "Zendaya",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🌍 COUNTRIES
  // ═════════════════════════════════════════════════════════════
  COUNTRIES: [
    "France", "Germany", "Spain", "Italy", "United Kingdom",
    "Portugal", "Belgium", "Netherlands", "Switzerland", "Austria",
    "Sweden", "Norway", "Denmark", "Finland", "Iceland",
    "Ireland", "Scotland", "Poland", "Czech Republic", "Hungary",
    "Romania", "Bulgaria", "Greece", "Turkey", "Russia",
    "Ukraine", "Belarus", "Lithuania", "Latvia", "Estonia",
    "Slovakia", "Croatia", "Serbia", "Slovenia", "Bosnia",
    "Montenegro", "North Macedonia", "Albania", "Malta", "Cyprus",
    "Luxembourg", "Andorra", "Monaco", "San Marino", "Vatican",
    "Liechtenstein", "Georgia", "Armenia", "Azerbaijan", "Kazakhstan",
    "Japan", "China", "South Korea", "North Korea", "India",
    "Pakistan", "Bangladesh", "Thailand", "Vietnam", "Cambodia",
    "Laos", "Myanmar", "Malaysia", "Singapore", "Indonesia",
    "Philippines", "Taiwan", "Hong Kong", "Macao", "Mongolia",
    "Australia", "New Zealand", "Fiji", "Papua New Guinea", "Vanuatu",
    "United States", "Canada", "Mexico", "Guatemala", "Belize",
    "Costa Rica", "Panama", "Cuba", "Jamaica", "Haiti",
    "Dominican Republic", "Puerto Rico", "Bahamas", "Barbados", "Trinidad",
    "Colombia", "Venezuela", "French Guiana", "Brazil", "Ecuador",
    "Peru", "Bolivia", "Paraguay", "Uruguay", "Argentina",
    "Chile", "South Africa", "Egypt", "Morocco", "Algeria",
    "Tunisia", "Libya", "Sudan", "Ethiopia", "Kenya",
    "Uganda", "Tanzania", "Rwanda", "Burundi", "Congo",
    "DR Congo", "Cameroon", "Gabon", "Guinea", "Senegal",
    "Mali", "Niger", "Chad", "Burkina Faso", "Ivory Coast",
    "Ghana", "Nigeria", "Benin", "Togo", "Sierra Leone",
    "Liberia", "Guinea-Bissau", "Gambia", "Cape Verde", "São Tomé",
    "Angola", "Zambia", "Zimbabwe", "Botswana", "Namibia",
    "Lesotho", "Eswatini", "Madagascar", "Mauritius", "Comoros",
    "Seychelles", "Djibouti", "Somalia", "Eritrea", "Mauritania",
    "Israel", "Palestine", "Jordan", "Lebanon", "Syria",
    "Iraq", "Iran", "Saudi Arabia", "Yemen", "Oman",
    "United Arab Emirates", "Qatar", "Bahrain", "Kuwait", "Afghanistan",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🦁 ANIMALS
  // ═════════════════════════════════════════════════════════════
  ANIMALS: {
    _subcategories: {
      'Felines': ["Lion", "Tiger", "Leopard", "Cheetah", "Jaguar", "Puma"],
      'Primates': ["Monkey", "Gorilla", "Chimpanzee", "Orangutan", "Baboon"],
      'Pets': ["Cat", "Dog", "Rabbit", "Hamster", "Guinea Pig"],
      'Farm': ["Horse", "Donkey", "Cow", "Bull", "Sheep", "Goat", "Pig", "Chicken", "Rooster", "Duck", "Goose", "Turkey", "Ox"],
      'Forest': ["Wolf", "Fox", "Bear", "Boar", "Deer", "Squirrel", "Hedgehog"],
      'Safari': ["Elephant", "Rhinoceros", "Hippopotamus", "Giraffe", "Zebra", "Wildebeest", "Gazelle", "Antelope", "Buffalo"],
      'Birds': ["Eagle", "Falcon", "Owl", "Crow", "Pigeon", "Sparrow", "Parrot", "Seagull", "Penguin"],
      'Marine': ["Shark", "Dolphin", "Whale", "Orca", "Seal", "Sea Lion"],
      'Seafood': ["Crab", "Lobster", "Shrimp", "Octopus", "Squid", "Starfish", "Sea Urchin"],
      'Reptiles': ["Turtle", "Lizard", "Chameleon", "Iguana", "Snake", "Python", "Cobra", "Viper", "Crocodile", "Alligator", "Caiman"],
      'Pond': ["Frog", "Toad", "Rat", "Mouse", "Hare", "Beaver", "Otter"],
      'Exotic': ["Kangaroo", "Koala", "Panda", "Dingo"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // 🎮 VIDEO GAMES
  // ═════════════════════════════════════════════════════════════
  VIDEO_GAMES: [
    "Minecraft", "Fortnite", "Grand Theft Auto V (GTA V)", "Grand Theft Auto IV (GTA IV)",
    "Grand Theft Auto: San Andreas", "Grand Theft Auto: Vice City", "The Legend of Zelda: Breath of the Wild",
    "League of Legends (LoL)", "PlayerUnknown's Battlegrounds (PUBG)", "Call of Duty: Warzone",
    "Tetris", "Pokémon Go", "Super Mario Bros.", "The Elder Scrolls V: Skyrim", "Red Dead Redemption 2",
    "Among Us", "World of Warcraft (WoW)", "Apex Legends", "FIFA", "Pro Evolution Soccer (PES)",
    "Counter-Strike: Global Offensive (CS:GO)", "Overwatch", "Halo", "Final Fantasy VII",
    "The Witcher 3: Wild Hunt", "Assassin's Creed", "Animal Crossing: New Horizons", "Destiny 2",
    "Diablo III", "Crash Bandicoot",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎵 MUSIC / SINGERS
  // ═════════════════════════════════════════════════════════════
  MUSIC: [
    "Niska", "Booba", "Jul", "PNL", "Ninho",
    "Gims", "Maître Gims", "Soprano", "Bigflo", "Oli",
    "Stromae", "Angèle", "Aya Nakamura", "Dadju", "Black M",
    "Vitaa", "Shy'm", "Zaz", "Carla Bruni", "Mylène Farmer",
    "Johnny Hallyday", "Eddy Mitchell", "Jacques Dutronc", "Serge Gainsbourg", "Charles Aznavour",
    "Joe Dassin", "Michel Sardou", "Renaud", "Francis Cabrel", "Jean-Jacques Goldman",
    "Patrick Bruel", "Florent Pagny", "Garou", "Daniel Balavoine", "Alain Souchon",
    "Laurent Voulzy", "Téléphone", "Indochine", "Noir Désir", "Mano Negra",
    "Tryo", "Kyo", "Linkin Park", "Nirvana", "Metallica",
    "Queen", "The Beatles", "Rolling Stones", "Led Zeppelin", "Pink Floyd",
    "Michael Jackson", "Prince", "Madonna", "Beyoncé", "Rihanna",
    "Taylor Swift", "Adele", "Lady Gaga", "Katy Perry", "Bruno Mars",
    "The Weeknd", "Drake", "Kanye West", "Jay-Z", "Eminem",
    "50 Cent", "Snoop Dogg", "Tupac", "Biggie", "Nas",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🚗 CARS
  // ═════════════════════════════════════════════════════════════
  CARS: [
    "Ferrari", "Lamborghini", "Porsche", "Rolls-Royce", "Bentley",
    "Aston Martin", "Maserati", "McLaren", "Bugatti", "Mercedes-Benz",
    "BMW", "Audi", "Jaguar", "Land Rover", "Tesla",
  ],

  // ═════════════════════════════════════════════════════════════
  // 👜 BRANDS
  // ═════════════════════════════════════════════════════════════
  BRANDS: [
    "Louis Vuitton", "Chanel", "Gucci", "Hermès", "Prada",
    "Rolex", "Cartier", "Fendi", "Dior", "Saint Laurent",
    "Balenciaga", "Burberry", "Tom Ford", "Bvlgari", "Nike",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🍥 MANGA
  // ═════════════════════════════════════════════════════════════
  MANGA: [
    "Naruto", "Sasuke", "Sakura", "Kakashi", "Itachi",
    "Goku", "Vegeta", "Gohan", "Piccolo", "Frieza", "Krillin", "Broly", "Trunks", "Bulma", "Cell", "Majin Buu", "Master Roshi",
    "Luffy", "Zoro", "Nami", "Sanji", "Chopper", "Shanks", "Kaido", "Big Mom",
    "Saitama", "Rock D. Xebec",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🎬 MOVIES / SERIES
  // ═════════════════════════════════════════════════════════════
  MOVIES_SERIES: [
    "Avatar", "Star Wars", "Jurassic World", "Mission: Impossible", "Fast & Furious",
    "Game of Thrones", "Stranger Things", "The Last of Us", "Squid Game", "One Piece",
  ],

  // ═════════════════════════════════════════════════════════════
  // 📦 OBJECTS
  // ═════════════════════════════════════════════════════════════
  OBJECTS: [
    "Phone", "Computer", "Tablet", "Watch", "Glasses",
    "Key", "Wallet", "Bag", "Suitcase", "Umbrella",
    "Pen", "Notebook", "Book", "Remote Control", "Camera",
    "Headphones", "Earbuds", "Speaker", "Charger", "Battery",
    "Lamp", "Candle", "Match", "Lighter", "Knife",
    "Fork", "Spoon", "Plate", "Glass", "Mug",
    "Bottle", "Napkin", "Dishcloth", "Sponge",
    "Broom", "Vacuum", "Bucket", "Rag", "Cleaning Product",
    "Sofa", "Table", "Chair", "Bed", "Wardrobe",
    "Dresser", "Desk", "Shelf", "Mirror", "Curtain",
    "Cushion", "Blanket", "Sheet", "Pillow", "Mattress",
    "Rug", "Vase", "Frame", "Clock", "Alarm Clock",
    "Television", "Radio", "Microwave", "Toaster", "Coffee Maker",
    "Kettle", "Blender", "Food Processor", "Pan", "Pot",
  ],

  // ═════════════════════════════════════════════════════════════
  // 🏠 LOCATIONS (Spyfall Mode)
  // ═════════════════════════════════════════════════════════════
  LOCATIONS: [
    "Beach", "Restaurant", "Cinema", "Hospital", "Airplane",
    "School", "Train Station", "Supermarket", "Amusement Park", "Stadium",
    "Library", "Museum", "Airport", "Hotel", "Bank",
    "Casino", "Church", "Prison", "Embassy", "Theater",
    "Circus", "Cruise Ship", "Military Camp", "Space Station", "Submarine",
    "North Pole", "Desert", "Rainforest", "Desert Island", "Volcano",
    "Market", "Factory", "Laboratory", "Opera", "Olympic Stadium",
    "Spa", "Festival", "Caravan", "Lighthouse", "Castle",
  ],

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