const questionText = document.getElementById("question");
const answer1 = document.getElementById("answer1");
const answer2 = document.getElementById("answer2");
const answer3 = document.getElementById("answer3");
const answer1label = document.querySelector('label[for="answer1"]');
const answer2label = document.querySelector('label[for="answer2"]');
const answer3label = document.querySelector('label[for="answer3"]');
const scoreText = document.getElementById("score");

const backButton = document.getElementById("back");
const skipButton = document.getElementById("skip");
const nextButton = document.getElementById("next");

/* sample data

[
    {
        "id": 0,
        "marked": false,
        "answers": [
            [true, 1, true], // is right answer?, answer index relative to question, user input
            [false, 1, true],
            [true, 1, true]
        ],
    }
]
*/

let questions = [];

let score = 0;
let questionIndex = 0;
let questionLength;
let json;

let answerChance = [
    0.05, // chance of getting 0 answers
    0.50, // chance of getting 1 answer
    0.30, // chance of getting 2 answer
    0.15, // chance of getting 3 answers
]

function getRandomInt(max) {
    return Math.min(Math.floor(Math.random() * max), max - 1);
}

function getRandomIntRange(min, max) {
    return Math.min(Math.floor(min + Math.random() * (max - min)), max - 1);
}

function shuffleArray(array) {
    for (let i = 0; i < array.length; i++) {
        const idx = getRandomIntRange(i, array.length);
        const temp = array[i];
        array[i] = array[idx];
        array[idx] = temp;
    }
}

function loadQuestion() {
    const q = questions[questionIndex];
    questionText.innerText = `Question (${questionIndex + 1}/${questionLength}): ${json[q.id].q}`;
    answer1label.textContent = json[q.id][q.answers[0][0] ? "right" : "wrong"][q.answers[0][1]];
    answer2label.textContent = json[q.id][q.answers[1][0] ? "right" : "wrong"][q.answers[1][1]];
    answer3label.textContent = json[q.id][q.answers[2][0] ? "right" : "wrong"][q.answers[2][1]];

    answer1.checked = questions[questionIndex].answers[0][2];
    answer2.checked = questions[questionIndex].answers[1][2];
    answer3.checked = questions[questionIndex].answers[2][2];

    if (questionIndex === 0) backButton.setAttribute("disabled", "disabled");
    else backButton.removeAttribute("disabled");

    if (questionIndex === questionLength - 1) {
        if (questions[questionIndex].marked) nextButton.setAttribute("disabled", "disabled");
        skipButton.setAttribute("disabled", "disabled");
    }
    else {
        nextButton.removeAttribute("disabled");
        skipButton.removeAttribute("disabled");
    };

    if (questions[questionIndex].marked) {
        answer1label.style.color = q.answers[0][0] ? "var(--text-correct)" : "var(--text-wrong)";
        answer2label.style.color = q.answers[1][0] ? "var(--text-correct)" : "var(--text-wrong)";
        answer3label.style.color = q.answers[2][0] ? "var(--text-correct)" : "var(--text-wrong)";
    } else {
        answer1label.style.removeProperty("color");
        answer2label.style.removeProperty("color");
        answer3label.style.removeProperty("color");
    }
}

const run = (txt) => {
    json = txt;

    questionLength = json.length;

    // questions
    for (let index = 0; index < json.length; index++) {
        const rightAnswers = json[index].right;
        const wrongAnswers = json[index].wrong;

        questions[index] = {
            "id": index,
            "marked": false,
            "answers": []
        }

        let randVal = Math.random();
        let i = 0;

        for (i = 0; i < 4; i++) {
            if (randVal <= answerChance[i]) {
                break;
            }
            randVal -= answerChance[i]
        }

        // right answers
        for (let j = 0; j < i; j++) {
            let found = true
            let randIndex;
            while (found) {
                found = false;
                randIndex = getRandomInt(rightAnswers.length);
                for (let k = 0; k < questions[index].answers.length; k++) {
                    if (questions[index].answers[k][0] && questions[index].answers[k][1] === randIndex) {
                        found = true;
                        break;
                    }
                }
            }
            questions[index].answers.push([true, randIndex, false]);
        }

        // wrong answers
        for (let j = 0; j < (3 - i); j++) {
            let found = true
            let randIndex;
            while (found) {
                found = false;
                randIndex = getRandomInt(wrongAnswers.length);
                for (let k = 0; k < questions[index].answers.length; k++) {
                    if (!questions[index].answers[k][0] && questions[index].answers[k][1] === randIndex) {
                        found = true;
                        break;
                    }
                }
            }
            questions[index].answers.push([false, randIndex, false]);
        }
        shuffleArray(questions[index].answers)
    }

    shuffleArray(questions)

    loadQuestion();
}

answer1.addEventListener("click", () => {
    if (!questions[questionIndex].marked)
        questions[questionIndex].answers[0][2] = answer1.checked;
})

answer2.addEventListener("click", () => {
    if (!questions[questionIndex].marked)
        questions[questionIndex].answers[1][2] = answer2.checked;
})

answer3.addEventListener("click", () => {
    if (!questions[questionIndex].marked)
        questions[questionIndex].answers[2][2] = answer3.checked;
})

backButton.addEventListener("click", () => {
    questionIndex = Math.max(questionIndex - 1, 0);
    loadQuestion();
})

skipButton.addEventListener("click", () => {
    questionIndex = Math.min(questionIndex + 1, questionLength - 1);
    loadQuestion();
})

nextButton.addEventListener("click", () => {
    if (!questions[questionIndex].marked) {
        questions[questionIndex].marked = true

        const correct = questions[questionIndex].answers[0][0] === questions[questionIndex].answers[0][2] &&
            questions[questionIndex].answers[1][0] === questions[questionIndex].answers[1][2] &&
            questions[questionIndex].answers[2][0] === questions[questionIndex].answers[2][2]
        
        if (correct) score += 2; else score--;

        scoreText.textContent = score >= 0 ? "Money: $" + score : "Money: -$" + score * -1;
    } else {
        questionIndex = Math.min(questionIndex + 1, questionLength - 1);
    }
    loadQuestion();
})