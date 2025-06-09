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
    <ul style="list-style: none; padding: 0;">
      ${Object.entries(teamScores)
            .map(([team, score]) => `<li><strong>${team}:</strong> ${score}</li>`)
            .join("")}
    </ul>
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
        // alert supprimée
    }
}

async function drawWord() {
    const snapshot = await db.collection("words").get();
    const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (words.length > 0) {
        const random = words[Math.floor(Math.random() * words.length)];
        currentWord = random;
        document.getElementById("randomWord").innerText = random.word;
        document.getElementById("validationButtons").style.display = "block";
    } else {
        document.getElementById("randomWord").innerText = "Plus de mots !";
        document.getElementById("validationButtons").style.display = "none";
    }
}

function validateWord(found) {
    if (!currentTeam) {
        alert("Sélectionne une équipe avant de valider !");
        return;
    }

    if (currentWord) {
        if (found) {
            db.collection("words").doc(currentWord.id).delete();
            changeScore(1);
        }
        currentWord = null;
        document.getElementById("randomWord").innerText = "";
        document.getElementById("validationButtons").style.display = "none";
    }
}

// Afficher les scores dès le début
window.onload = () => {
    renderAllScores();
};