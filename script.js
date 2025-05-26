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

function addWord() {
  const word = document.getElementById("newWord").value.trim();
  if (word) {
    db.collection("words").add({ word });
    document.getElementById("newWord").value = "";
    alert("Mot ajouté !");
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
  if (currentWord) {
    if (found) {
      // Si trouvé, on supprime de la base
      db.collection("words").doc(currentWord.id).delete();
    } 
    // Si pas trouvé, on ne fait rien : le mot reste dans la base

    // Réinitialisation
    currentWord = null;
    document.getElementById("randomWord").innerText = "";
    document.getElementById("validationButtons").style.display = "none";
  }
}