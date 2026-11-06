// Массив с вопросами, ответами и правильными вариантами
const questionsData = [
    {
        text: 'А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.',
        answers: [
            { text: 'Пол деревни, за раз', correct: false },
            { text: 'Полдеревни, зараз', correct: true, note: 'Полдеревни пишется слитно. «Зараз» (ударение на второй слог) — наречие, означает «быстро, одним махом».' },
            { text: 'Пол-деревни, за раз', correct: false }
        ]
    },
    {
        text: 'А эти слова как пишутся?',
        answers: [
            { text: 'Капуччино и эспрессо', correct: false },
            { text: 'Каппуччино и экспрессо', correct: false },
            { text: 'Капучино и эспрессо', correct: true, note: 'По орфографическим нормам русского языка верно: «капучино» и «эспрессо».' }
        ]
    },
    {
        text: 'Как нужно писать?',
        answers: [
            { text: 'Черезчур', correct: false },
            { text: 'Черес-чур', correct: false },
            { text: 'Чересчур', correct: true, note: 'Слово образовано от «через» + древнее «чур» («граница, край»), пишется слитно — «чересчур».' }
        ]
    },
    {
        text: 'Где допущена ошибка?',
        answers: [
            { text: 'Аккордеон', correct: false },
            { text: 'Белиберда', correct: false },
            { text: 'Эпелепсия', correct: true, note: 'Правильно: «эпИлепсия».' }
        ]
    },
    {
        text: 'В каких предложениях слово «одевать» употреблено правильно с точки зрения литературной нормы?(несколько ответов)',
        answers: [
            { text: 'Мама одевает ребёнка перед прогулкой.', correct: true, note: 'Глагол «одевать» переходный — одевают кого-то другого.' },
            { text: 'Он одевает пальто и выходит на улицу.', correct: false },
            { text: 'Стилист одевает клиента перед фотосессией.', correct: true, note: 'Глагол «одевать» переходный — одевают кого-то другого.' },
            { text: 'Она одевает шапку и бежит на работу.', correct: false }
        ]
    }
];

// Глобальные переменные для управления состоянием теста
let testQuestions = [];       // Перемешанные вопросы
let currentQuestionIndex = 0; // Индекс текущего вопроса
let correctAnswersCount = 0;  // Счётчик верных ответов
let isWaitingForNext = false; // Блокировка кликов на время анимации
let userResults = [];         // История ответов для финального экрана

const testArea = document.getElementById('test-area');
const testStatus = document.getElementById('test-status');
const testResult = document.getElementById('test-result');
const testReview = document.getElementById('test-review');

// Перемешивает массив (чтобы вопросы и ответы шли в случайном порядке)
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Создаёт паузу (удобно для задержек в асинхронном коде)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Запуск теста
function startTest() {
    testQuestions = shuffleArray(questionsData);
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    userResults = [];
    showCurrentQuestion();
}

// Отрисовка текущего вопроса на экране
function showCurrentQuestion() {
    // Если вопросы закончились - показываем результаты
    if (currentQuestionIndex >= testQuestions.length) {
        finishTest();
        return;
    }

    const question = testQuestions[currentQuestionIndex];
    const card = document.createElement('div');
    card.className = 'q-card';

    // Блок вопроса
    const questionBox = document.createElement('div');
    questionBox.className = 'q-question';
    questionBox.textContent = `${currentQuestionIndex + 1}. ${question.text}`;
    
    // Маркер, который появится после ответа
    const marker = document.createElement('span');
    marker.className = 'q-marker';
    questionBox.appendChild(marker);

    // Контейнер для вариантов ответов
    const answersContainer = document.createElement('div');
    answersContainer.className = 'q-answers';

    // Перемешиваем ответы и создаём блоки для каждого
    const shuffledAnswers = shuffleArray(question.answers);
    shuffledAnswers.forEach(answerData => {
        const answerBtn = document.createElement('div');
        answerBtn.className = 'answer';
        answerBtn.textContent = answerData.text;
        
        // Клик по ответу запускает проверку
        answerBtn.addEventListener('click', () => checkAnswer(
            card, answersContainer, marker, question, answerBtn, answerData
        ));
        
        answersContainer.appendChild(answerBtn);
    });

    // Собираем и добавляем карточку на страницу
    card.appendChild(questionBox);
    card.appendChild(answersContainer);
    
    testArea.innerHTML = '';
    testArea.appendChild(card);
}

// Проверка выбранного ответа
async function checkAnswer(card, answersContainer, marker, question, clickedElement, answerData) {
    // Если идёт анимация или на этот ответ уже нажимали — игнорируем
    if (isWaitingForNext || clickedElement.classList.contains('answer--selected')) return;
    
    const isCorrect = answerData.correct;
    clickedElement.classList.add('answer--selected');

    // --- Если ответ неправильный ---
    if (!isCorrect) {
        isWaitingForNext = true;
        clickedElement.classList.add('answer--wrong');
        
        // Пометка «ваш ответ»
        const label = document.createElement('span');
        label.className = 'answer__label';
        label.textContent = 'ваш ответ';
        clickedElement.appendChild(label);

        const correctAnswers = question.answers.filter(a => a.correct);
        
        // Записываем результат в историю
        userResults.push({
            questionText: question.text,
            isCorrect: false,
            correctAnswerTexts: correctAnswers.map(a => a.text),
            correctAnswerNotes: correctAnswers.map(a => a.note).filter(Boolean)
        });

        marker.textContent = '\u2718';
        marker.classList.add('q-marker--bad', 'q-marker--show');
        
        await showResultAndNext(card, answersContainer, question);
        return;
    }

    //Если ответ правильный 
    clickedElement.classList.add('answer--correct');

    // Проверяем, все ли правильные ответы выбраны (если их несколько)
    const allCorrectAnswers = question.answers.filter(a => a.correct);
    const allAnswerElements = [...answersContainer.querySelectorAll('.answer')];
    
    const selectedCorrectCount = allAnswerElements.filter(el => 
        el.classList.contains('answer--selected') && 
        allCorrectAnswers.some(ca => ca.text === el.textContent)
    ).length;

    // Если выбраны не все правильные - ждём, пока пользователь нажмёт остальные
    if (selectedCorrectCount < allCorrectAnswers.length) {
        return; 
    }

    // Все правильные выбраны - вопрос засчитан
    isWaitingForNext = true;
    
    userResults.push({
        questionText: question.text,
        isCorrect: true,
        correctAnswerTexts: allCorrectAnswers.map(a => a.text),
        correctAnswerNotes: allCorrectAnswers.map(a => a.note).filter(Boolean)
    });
    
    correctAnswersCount++;
    marker.textContent = '\u2714';
    marker.classList.add('q-marker--ok', 'q-marker--show');

    await showResultAndNext(card, answersContainer, question);
}

// Показывает правильные ответы и переходит к следующему вопросу
async function showResultAndNext(card, answersContainer, question) {
    await delay(1000); // Пауза «через пару секунд»

    // Все блоки ответов по очереди уезжают вниз
    const allAnswerElements = [...answersContainer.querySelectorAll('.answer')];
    for (const el of allAnswerElements) {
        el.classList.add('answer--leaving');
        await delay(100);
    }
    await delay(400);

    // Скрываем все ответы перед показом правильных
    allAnswerElements.forEach(el => el.style.display = 'none');

    const correctAnswers = question.answers.filter(a => a.correct);

    // Показываем правильные ответы (и выбранный неправильный, если была ошибка)
    allAnswerElements.forEach(el => {
        const cleanText = el.textContent.replace('ваш ответ', '').trim();
        
        if (correctAnswers.some(ca => ca.text === cleanText)) {
            el.style.display = '';
            el.classList.add('answer--correct');
            el.style.animation = 'none';
            
            // Добавляем пояснение к правильному ответу
            const correctData = correctAnswers.find(ca => ca.text === cleanText);
            if (correctData && correctData.note && !el.querySelector('.answer__note')) {
                const note = document.createElement('span');
                note.className = 'answer__note';
                note.textContent = correctData.note;
                el.appendChild(note);
            }
        } else if (el.classList.contains('answer--wrong')) {
            el.style.display = '';
            el.style.animation = 'none';
        }
    });

    await delay(1500); // Время на чтение

    // Карточка уезжает вверх
    card.classList.add('q-card--leaving');
    await delay(400);
    
    // Переход к следующему вопросу
    currentQuestionIndex++;
    isWaitingForNext = false;
    showCurrentQuestion();
}

// Завершение теста: статистика и разбор
function finishTest() {
    testArea.innerHTML = '';
    testStatus.hidden = false; // Надпись «Вопросы закончились»

    const percent = Math.round((correctAnswersCount / testQuestions.length) * 100);

    // Блок статистики
    testResult.hidden = false;
    testResult.innerHTML = `
        <h3>Тест завершён!</h3>
        <div class="score">${correctAnswersCount} / ${testQuestions.length}</div>
        <p>Правильных ответов: ${correctAnswersCount} из ${testQuestions.length} (${percent}%)</p>
    `;

    // Блок с разбором всех вопросов
    testReview.hidden = false;
    testReview.innerHTML = `
        <h3 style="font-family:'Playfair Display',serif; color:#3B2A20; margin:10px 0 4px;">Разбор вопросов</h3>
        <p style="font-family:'Inter',sans-serif; color:#6b5a4a; font-size:14px; margin:0 0 12px;">Нажмите на вопрос, чтобы увидеть правильный ответ.</p>
    `;

    userResults.forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'review-item';
        
        // Формируем список всех правильных ответов
        const answersHtml = result.correctAnswerTexts.map((text, i) => {
            const note = result.correctAnswerNotes[i] || '';
            return `<div style="margin-bottom:6px;">• <b>${text}</b> ${note ? `<br><span style="color:#3B2A20; font-size:0.9em;">${note}</span>` : ''}</div>`;
        }).join('');

        item.innerHTML = `
            <div class="review-item__head">
                <span class="review-item__mark">${result.isCorrect ? '\u2714' : '\u2718'}</span>
                <span class="review-item__text">${index + 1}. ${result.questionText}</span>
            </div>
            <div class="review-item__answer">
                <b>Правильные ответы:</b><br>
                ${answersHtml}
            </div>
        `;
        
        // При клике открываем этот вопрос, а все остальные закрываем
        item.addEventListener('click', () => {
            const allItems = testReview.querySelectorAll('.review-item');
            const isAlreadyOpen = item.classList.contains('review-item--open');
            
            allItems.forEach(el => el.classList.remove('review-item--open'));
            
            if (!isAlreadyOpen) {
                item.classList.add('review-item--open');
            }
        });
        
        testReview.appendChild(item);
    });
}

// Запуск
startTest();