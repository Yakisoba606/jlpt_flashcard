let kanjiList = [];
let wordList = [];
let currentIndex = 0;

const kanjiEl = document.getElementById("kanji");
const furiganaEl = document.getElementById("furigana");
const meaningEl = document.getElementById("meaning");
const cardEl = document.getElementById("card");

async function fetchKanjiLists() {
  try {
    const [n1Res, n2Res] = await Promise.all([
      fetch("https://kanjiapi.dev/v1/kanji/jlpt-1"),
      fetch("https://kanjiapi.dev/v1/kanji/jlpt-2")
    ]);

    if (!n1Res.ok || !n2Res.ok) throw new Error("Failed to load kanji lists");

    const [n1, n2] = await Promise.all([n1Res.json(), n2Res.json()]);
    kanjiList = [...n1, ...n2];
    shuffleArray(kanjiList);
    console.log(`Loaded ${kanjiList.length} kanji from N1+N2`);

    await loadWordsForRandomKanji();
  } catch (e) {
    console.error("Error loading JLPT kanji:", e);
  }
}

async function loadWordsForRandomKanji(){
    try{
        if(kanjiList.length===0)
            return;
        const randomKanji = kanjiList[Math.floor(Math.random()*kanjiList.length)];
        const response = await fetch(`https://kanjiapi.dev/v1/words/${randomKanji}`);
        if(!response.ok) 
            return loadWordsForRandomKanji();

        wordList=await response.json();
        if(wordList.length>0){
            shuffleArray(wordList);
            currentIndex = 0;
            updateCard();
        }else{
            loadWordsForRandomKanji();
        }
    } catch(e){
        console.error("Error loading words",e)
        loadWordsForRandomKanji();
    }
}

function updateCard() {
  if (wordList.length === 0) return;
  const word = wordList[currentIndex];
  kanjiEl.textContent = word.variants[0]?.written || "...";
  furiganaEl.textContent = word.variants[0]?.pronounced || "";
  meaningEl.textContent = `Meaning: ${word.meanings[0]?.glosses?.join(", ") || "..."}`;
  cardEl.classList.remove("is-flipped");
}

function navigate(direction) {
  if (wordList.length === 0) return;
  currentIndex = (currentIndex + direction + wordList.length) % wordList.length;
  updateCard();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

document.getElementById("nextBtn").addEventListener("click", () => navigate(1));
document.getElementById("prevBtn").addEventListener("click", () => navigate(-1));
cardEl.addEventListener("click", () => cardEl.classList.toggle("is-flipped"));

fetchKanjiLists();