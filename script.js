// Remplace ceci par tes infos Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCJAh3RTo9Lay1DY4kDrx7x-zzCzyGAzdo",
  authDomain: "timesup-36197.firebaseapp.com",
  projectId: "timesup-36197",
  storageBucket: "timesup-36197.firebasestorage.app",
  messagingSenderId: "66205125533",
  appId: "1:66205125533:web:2db9e77baf0033fb39fd74",
  measurementId: "G-CTDLHPF0FF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


let currentTeam = null;
let currentWord = null;
let pendingWords = [];
const teamScores = {
    Rouge: 0,
    Bleu: 0,
    Vert: 0,
    Jaune: 0,
    Violet: 0,
};
const foundWordIds = new Set(); // IDs des mots validés trouvés

// Sélection d'équipe
function selectTeam(team) {
    currentTeam = team;
    renderScores();
}

// Changer score équipe courante
function changeScore(value) {
    if (currentTeam) {
        teamScores[currentTeam] += value;
        if (teamScores[currentTeam] < 0) teamScores[currentTeam] = 0;
        renderScores();
    }
}

// Afficher les scores horizontalement
function renderScores() {
    const container = document.getElementById("allScores");
    container.innerHTML = `
    <h4>Scores des équipes :</h4>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      ${Object.entries(teamScores)
            .map(([team, score]) => `<div><strong>${team}:</strong> ${score}</div>`)
            .join("")}
    </div>
  `;
}

// Afficher les équipes pour sélection
function renderTeams() {
    const container = document.getElementById("teams");
    container.innerHTML = Object.keys(teamScores)
        .map(
            (team) =>
                `<button onclick="selectTeam('${team}')" style="margin: 3px; ${currentTeam === team ? "font-weight:bold;" : ""
                }">${team}</button>`
        )
        .join("");
}

// Rendu de l’historique des mots à valider
function renderPendingWords() {
    const container = document.getElementById("pendingWords");
    container.innerHTML = pendingWords
        .map(
            (wordObj, index) => `
      <div style="margin-bottom:5px;">
        ${wordObj.word} 
        <button onclick="validatePendingWord(${index}, true)">Trouvé</button> 
        <button onclick="validatePendingWord(${index}, false)">Pas trouvé</button>
      </div>`
        )
        .join("");
}

// Valider mot dans l'historique
function validatePendingWord(index, found) {
    const wordObj = pendingWords[index];
    if (!wordObj) return;

    if (found && currentTeam) {
        changeScore(1);
        // Supprime le mot de Firestore
        db.collection("words").doc(wordObj.id).delete();
        // Enregistre comme mot trouvé
        foundWordIds.add(wordObj.id);
    }

    // Retire le mot de l'historique dans tous les cas
    pendingWords.splice(index, 1);
    renderPendingWords();
}

// Tirer un mot aléatoire disponible (ni déjà tiré ni validé)
async function drawWord() {
    const snapshot = await db.collection("words").get();
    const allWords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const pendingIds = new Set(pendingWords.map(w => w.id));

    // Mots disponibles = pas dans historique ni trouvés
    const availableWords = allWords.filter(
        w => !pendingIds.has(w.id) && !foundWordIds.has(w.id)
    );

    if (availableWords.length > 0) {
        const random = availableWords[Math.floor(Math.random() * availableWords.length)];
        pendingWords.push(random);
        renderPendingWords();
        currentWord = random;
        document.getElementById("randomWord").innerText = random.word;
    } else {
        document.getElementById("randomWord").innerText = "Plus de mots disponibles !";
        currentWord = null;
    }
}

// Initialisation simple au chargement
window.onload = () => {
    renderTeams();
    renderScores();
    renderPendingWords();
    document.getElementById("randomWord").innerText = "";
};