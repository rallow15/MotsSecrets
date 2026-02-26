export const WORD_DB = [
{ a: "McDonald's", b: "Burger King" },
{ a: "Football", b: "Basketball" },
{ a: "Snapchat", b: "Instagram" },
{ a: "TikTok", b: "YouTube" },
{ a: "iPhone", b: "Android" },
{ a: "Netflix", b: "Amazon Prime" },
{ a: "PlayStation", b: "Xbox" },
{ a: "Coca-Cola", b: "Pepsi" },
{ a: "Nike", b: "Adidas" },
{ a: "Marvel", b: "DC Comics" },
{ a: "Harry Potter", b: "Star Wars" },
{ a: "Uber", b: "Taxi" },
{ a: "KFC", b: "Domino's Pizza" },
{ a: "Spotify", b: "Apple Music" },
{ a: "Pomme", b: "Poire" },
{ a: "Chien", b: "Loup" },
{ a: "Océan", b: "Mer" },
{ a: "WhatsApp", b: "Telegram" },
{ a: "Twitter/X", b: "Facebook" },
{ a: "Google", b: "Bing" },
{ a: "Windows", b: "Mac" },
{ a: "Twitch", b: "YouTube Gaming" },
{ a: "Discord", b: "Slack" },
{ a: "Amazon", b: "eBay" },
{ a: "Tesla", b: "Ferrari" },
{ a: "GTA", b: "Minecraft" },
{ a: "Fortnite", b: "PUBG" },
{ a: "Call of Duty", b: "Battlefield" },
{ a: "FIFA", b: "NBA 2K" },
{ a: "Pizza", b: "Burger" },
{ a: "Sushi", b: "Tacos" },
{ a: "Nutella", b: "Peanut Butter" },
{ a: "Café", b: "Thé" },
{ a: "Bière", b: "Vin" },
{ a: "Chocolat", b: "Bonbons" },
{ a: "Glace", b: "Gâteau" },
{ a: "Fanta", b: "Sprite" },
{ a: "Red Bull", b: "Monster" },
{ a: "Oreo", b: "Chips Ahoy" },
{ a: "Pain", b: "Riz" },
{ a: "Poulet", b: "Bœuf" },
{ a: "Tennis", b: "Badminton" },
{ a: "Natation", b: "Course à pied" },
{ a: "Boxe", b: "MMA" },
{ a: "Ski", b: "Snowboard" },
{ a: "Vélo", b: "Trottinette" },
{ a: "Rugby", b: "Foot américain" },
{ a: "Golf", b: "Pétanque" },
{ a: "Yoga", b: "Pilates" },
{ a: "Chat", b: "Chien" },
{ a: "Lion", b: "Tigre" },
{ a: "Dauphin", b: "Requin" },
{ a: "Aigle", b: "Faucon" },
{ a: "Lapin", b: "Hamster" },
{ a: "Serpent", b: "Lézard" },
{ a: "Montagne", b: "Plage" },
{ a: "Forêt", b: "Désert" },
{ a: "Paris", b: "Londres" },
{ a: "New York", b: "Los Angeles" },
{ a: "Japon", b: "Corée du Sud" },
{ a: "Espagne", b: "Italie" },
{ a: "Cinéma", b: "Théâtre" },
{ a: "Roman", b: "BD" },
{ a: "Rap", b: "Rock" },
{ a: "Jazz", b: "Classique" },
{ a: "Astérix", b: "Tintin" },
{ a: "Batman", b: "Spider-Man" },
{ a: "Dracula", b: "Frankenstein" },
];

export function generateAssignments(numPlayers) {
const pair = WORD_DB[Math.floor(Math.random() * WORD_DB.length)];
const majorityWord = Math.random() < 0.5 ? pair.a : pair.b;
const intrusWord = majorityWord === pair.a ? pair.b : pair.a;
const intrusIndex = Math.floor(Math.random() * numPlayers);
return Array.from({ length: numPlayers }, (_, i) => ({
word: i === intrusIndex ? intrusWord : majorityWord,
}));
}

export function findWinner(playerNumbers, mystery) {
let bestPlayer = 0;
let bestDiff = Math.abs(playerNumbers[0] - mystery);
for (let i = 1; i < playerNumbers.length; i++) {
const diff = Math.abs(playerNumbers[i] - mystery);
if (diff < bestDiff) {
bestDiff = diff;
bestPlayer = i;
}
}
return bestPlayer;
}


