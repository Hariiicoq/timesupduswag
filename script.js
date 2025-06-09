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

let currentWord = null;
let currentTeam = null;
let teamScores = {
    Rouge: 0,
    Bleu: 0,
    Vert: 0,
    Jaune: 0,
    Violet: 0
};
let pendingWords = []; // mots à valider

function selectTeam(teamName) {
    currentTeam = teamName;
    document.getElementById("currentTeam").innerText = teamName;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    const score = teamScores[currentTeam] || 0;
    document.getElementById("score").innerText = score;
    renderAllScores();
}

function renderAllScores() {
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

function changeScore(value) {
    if (!currentTeam) {
        alert("Choisis d'abord une équipe !");
        return;
    }
    teamScores[currentTeam] = Math.max(0, (teamScores[currentTeam] || 0) + value);
    updateScoreDisplay();
}

function addWord() {
    const word = document.getElementById("newWord").value.trim();
    if (word) {
        db.collection("words").add({ word });
        document.getElementById("newWord").value = "";
    }
}

async function drawWord() {
    const snapshot = await db.collection("words").get();
    const allWords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const pendingIds = new Set(pendingWords.map(w => w.id));
    const availableWords = allWords.filter(w => !pendingIds.has(w.id));

    if (availableWords.length > 0) {
        const random = availableWords[Math.floor(Math.random() * availableWords.length)];
        pendingWords.push(random);
        renderPendingWords();
        currentWord = random;

        // Afficher le mot tiré en grand
        document.getElementById("randomWord").innerText = random.word;
    } else {
        document.getElementById("randomWord").innerText = "Plus de mots disponibles !";
        currentWord = null;
    }
}

function renderPendingWords() {
    const list = document.getElementById("pendingWords");
    list.innerHTML = "";

    pendingWords.forEach((wordObj, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
      ${wordObj.word}
      <button onclick="validatePendingWord(${index}, true)">✅</button>
      <button onclick="validatePendingWord(${index}, false)">🔄</button>
    `;
        list.appendChild(li);
    });
}

function validatePendingWord(index, found) {
    const wordObj = pendingWords[index];
    if (!wordObj) return;

    if (found && currentTeam) {
        changeScore(1);
        db.collection("words").doc(wordObj.id).delete(); // supprimer seulement si trouvé
    }

    // Sinon (pas trouvé), on ne le supprime pas → il pourra être re-tiré
    pendingWords.splice(index, 1);
    renderPendingWords();
}