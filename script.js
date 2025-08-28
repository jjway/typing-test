const typingAreaElement = document.getElementById('typing-area');
const wpmDisplayElement = document.getElementById('wpm-display');
const accuracyDisplayElement = document.getElementById('accuracy-display');
const timerDisplayElement = document.getElementById('timer-display');
const restartButton = document.getElementById('restart-button');
const articleSelectElement = document.getElementById('article-select');

const articles = [
    {
        title: "Alice's Adventures in Wonderland",
        text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?' So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her."
    },
    {
        title: "Oliver Twist",
        text: "The room in which the boys were fed, was a large stone hall, with a copper at one end: out of which the master, dressed in an apron for the purpose, and assisted by one or two women, ladled the gruel at meal-times. Of this festive composition each boy had one porringer, and no more—except on occasions of great public rejoicing, when he had two ounces and a quarter of bread besides. The bowls never wanted washing. The boys polished them with their spoons till they shone again; and when they had performed this operation, they would sit staring at the copper, with such eager eyes, as if they could have devoured the very bricks of which it was composed."
    },
    {
        title: "Pride and Prejudice",
        text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters."
    }
];

let timer;
let startTime;
let currentLineIndex = 0;
let allInputLines = [];
let allSampleLines = [];

// --- Functions ---

function populateArticleSelector() {
    articles.forEach((article, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = article.title;
        articleSelectElement.appendChild(option);
    });
}

function startTest() {
    const articleIndex = articleSelectElement.value;
    const articleText = articles[articleIndex].text;
    renderNewTest(articleText);
}

function renderNewTest(text) {
    resetTestState();
    typingAreaElement.innerHTML = '';
    const lines = splitTextIntoLines(text);

    lines.forEach((line, index) => {
        const linePair = document.createElement('div');
        linePair.classList.add('line-pair');

        const sampleLine = document.createElement('div');
        sampleLine.classList.add('sample-line');
        line.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            sampleLine.appendChild(charSpan);
        });

        const inputLine = document.createElement('input');
        inputLine.type = 'text';
        inputLine.classList.add('input-line');
        inputLine.addEventListener('input', handleLineInput);
        inputLine.disabled = (index !== 0);

        linePair.appendChild(sampleLine);
        linePair.appendChild(inputLine);
        typingAreaElement.appendChild(linePair);
    });

    allInputLines = Array.from(document.querySelectorAll('.input-line'));
    allSampleLines = Array.from(document.querySelectorAll('.sample-line'));
    if(allInputLines.length > 0) {
        allInputLines[0].focus();
    }
}

function handleLineInput(e) {
    if (!startTime) {
        startTime = new Date();
        timer = setInterval(updateStats, 1000);
    }

    const currentInput = e.target;
    const sampleLineSpans = allSampleLines[currentLineIndex].querySelectorAll('span');
    const inputValue = currentInput.value;

    sampleLineSpans.forEach((charSpan, index) => {
        const char = inputValue[index];
        if (char == null) {
            charSpan.classList.remove('correct', 'incorrect');
        } else if (char === charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
        }
    });

    if (inputValue === allSampleLines[currentLineIndex].innerText) {
        currentInput.disabled = true;
        currentLineIndex++;

        if (currentLineIndex < allInputLines.length) {
            allInputLines[currentLineIndex].disabled = false;
            allInputLines[currentLineIndex].focus();
        } else {
            clearInterval(timer);
            updateStats();
        }
    }
}

function updateStats() {
    const elapsedTime = Math.floor((new Date() - startTime) / 1000);
    timerDisplayElement.innerText = elapsedTime;

    let totalTypedChars = 0;
    let totalCorrectChars = 0;

    allInputLines.forEach((input, index) => {
        if (index < currentLineIndex || !input.disabled) {
            totalTypedChars += input.value.length;
            const sampleSpans = allSampleLines[index].querySelectorAll('span');
            input.value.split('').forEach((char, charIndex) => {
                if (charIndex < sampleSpans.length && char === sampleSpans[charIndex].innerText) {
                    totalCorrectChars++;
                }
            });
        }
    });

    const accuracy = Math.round((totalCorrectChars / totalTypedChars) * 100) || 100;
    accuracyDisplayElement.innerText = accuracy;

    if (elapsedTime > 0) {
        const wpm = Math.round((totalTypedChars / 5) / (elapsedTime / 60));
        wpmDisplayElement.innerText = wpm;
    }
}

function resetTestState() {
    clearInterval(timer);
    startTime = null;
    currentLineIndex = 0;
    timerDisplayElement.innerText = 0;
    wpmDisplayElement.innerText = 0;
    accuracyDisplayElement.innerText = 100;
}

function splitTextIntoLines(text, maxChars = 60) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if (currentLine === '') {
            currentLine = word;
        } else if ((currentLine + ' ' + word).length <= maxChars) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    lines.push(currentLine);
    return lines;
}

// --- Event Listeners & Initial Load ---

restartButton.addEventListener('click', startTest);
articleSelectElement.addEventListener('change', startTest);

document.addEventListener('DOMContentLoaded', () => {
    populateArticleSelector();
    startTest();
});
