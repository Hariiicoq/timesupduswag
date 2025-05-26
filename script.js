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

function addWord() {
  const word = document.getElementById("newWord").value.trim();
  if (word) {
    db.collection("words").add({ word });
    document.getElementById("newWord").value = "";
  }
}

async function drawWord() {
  const snapshot = await db.collection("words").get();
  const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (words.length > 0) {
    const random = words[Math.floor(Math.random() * words.length)];
    document.getElementById("randomWord").innerText = random.word;
    db.collection("words").doc(random.id).delete();
  } else {
    document.getElementById("randomWord").innerText = "Plus de mots !";
  }
}

db.collection("words").onSnapshot(snapshot => {
  const list = document.getElementById("wordList");
  list.innerHTML = "";
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().word;
    list.appendChild(li);
  });
});