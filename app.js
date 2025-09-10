// Application state
let vocabularyLists = [];
let currentQuiz = null;
let currentListId = null;
let quizStatistics = {}; // Track word performance: { listId: { wordId: { correct: 0, incorrect: 0, lastIncorrect: timestamp } } }
let waitingForUserClick = false; // Flag to control answer display

// DOM elements
const listsTab = document.getElementById('listsTab');
const quizTab = document.getElementById('quizTab');
const listsSection = document.getElementById('listsSection');
const quizSection = document.getElementById('quizSection');
const addListBtn = document.getElementById('addListBtn');
const listsContainer = document.getElementById('listsContainer');
const listModal = document.getElementById('listModal');
const closeModal = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
const listForm = document.getElementById('listForm');
const modalTitle = document.getElementById('modalTitle');
const listName = document.getElementById('listName');
const listLanguage = document.getElementById('listLanguage');
const wordsContainer = document.getElementById('wordsContainer');
const addWordBtn = document.getElementById('addWordBtn');

// Quiz elements
const quizSelection = document.getElementById('quizSelection');
const quizGame = document.getElementById('quizGame');
const quizResults = document.getElementById('quizResults');
const quizListsContainer = document.getElementById('quizListsContainer');
const quizProgress = document.getElementById('quizProgress');
const quizScore = document.getElementById('quizScore');
const quizQuestion = document.getElementById('quizQuestion');
const quizWord = document.getElementById('quizWord');
const quizAnswer = document.getElementById('quizAnswer');
const submitAnswer = document.getElementById('submitAnswer');
const skipQuestion = document.getElementById('skipQuestion');
const endQuiz = document.getElementById('endQuiz');
const finalScore = document.getElementById('finalScore');
const finalPercentage = document.getElementById('finalPercentage');
const newQuiz = document.getElementById('newQuiz');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadVocabularyLists();
    loadQuizStatistics();
    setupEventListeners();
    renderLists();
    renderQuizLists();
});

// Event listeners
function setupEventListeners() {
    listsTab.addEventListener('click', () => switchTab('lists'));
    quizTab.addEventListener('click', () => switchTab('quiz'));
    addListBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalHandler());
    cancelModal.addEventListener('click', () => closeModalHandler());
    listForm.addEventListener('submit', saveList);
    addWordBtn.addEventListener('click', addWordPair);
    
    // Quiz event listeners
    submitAnswer.addEventListener('click', submitQuizAnswer);
    skipQuestion.addEventListener('click', skipQuizQuestion);
    endQuiz.addEventListener('click', endQuizSession);
    newQuiz.addEventListener('click', () => {
        showQuizSelection();
        renderQuizLists();
    });
    
    // Enter key for quiz answer
    quizAnswer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitQuizAnswer();
        }
    });
}

// Tab switching
function switchTab(tab) {
    if (tab === 'lists') {
        listsTab.classList.add('bg-indigo-500', 'text-white');
        listsTab.classList.remove('text-gray-500');
        quizTab.classList.remove('bg-indigo-500', 'text-white');
        quizTab.classList.add('text-gray-500');
        listsSection.classList.remove('hidden');
        quizSection.classList.add('hidden');
    } else {
        quizTab.classList.add('bg-indigo-500', 'text-white');
        quizTab.classList.remove('text-gray-500');
        listsTab.classList.remove('bg-indigo-500', 'text-white');
        listsTab.classList.add('text-gray-500');
        quizSection.classList.remove('hidden');
        listsSection.classList.add('hidden');
        showQuizSelection();
        renderQuizLists();
    }
}

// Local storage functions
function loadVocabularyLists() {
    const stored = localStorage.getItem('vocabularyLists');
    vocabularyLists = stored ? JSON.parse(stored) : [];
}

function saveVocabularyLists() {
    localStorage.setItem('vocabularyLists', JSON.stringify(vocabularyLists));
}

function loadQuizStatistics() {
    const stored = localStorage.getItem('quizStatistics');
    quizStatistics = stored ? JSON.parse(stored) : {};
}

function saveQuizStatistics() {
    localStorage.setItem('quizStatistics', JSON.stringify(quizStatistics));
}

// Track word performance
function recordWordResult(listId, wordId, isCorrect) {
    if (!quizStatistics[listId]) {
        quizStatistics[listId] = {};
    }
    if (!quizStatistics[listId][wordId]) {
        quizStatistics[listId][wordId] = { correct: 0, incorrect: 0, lastIncorrect: null };
    }

    if (isCorrect) {
        quizStatistics[listId][wordId].correct++;
    } else {
        quizStatistics[listId][wordId].incorrect++;
        quizStatistics[listId][wordId].lastIncorrect = Date.now();
    }

    saveQuizStatistics();
}

// Get words that need more practice (recently incorrect or high error rate)
function getWordsNeedingPractice(listId, allWords) {
    if (!quizStatistics[listId]) return allWords;

    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000); // 1 week in milliseconds

    return allWords.filter(word => {
        const stats = quizStatistics[listId][word.id];
        if (!stats) return true; // New words need practice

        // Include if recently incorrect (within last week)
        if (stats.lastIncorrect && stats.lastIncorrect > oneWeekAgo) return true;

        // Include if error rate is high (more than 30% incorrect)
        const totalAttempts = stats.correct + stats.incorrect;
        if (totalAttempts >= 3 && (stats.incorrect / totalAttempts) > 0.3) return true;

        return false;
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Modal functions
function openModal(listId = null) {
    currentListId = listId;
    const list = listId ? vocabularyLists.find(l => l.id === listId) : null;
    
    modalTitle.textContent = listId ? 'Modifier la Liste' : 'Nouvelle Liste';
    listName.value = list ? list.name : '';
    listLanguage.value = list ? list.language : '';
    
    // Clear and populate words
    wordsContainer.innerHTML = '';
    if (list && list.words.length > 0) {
        list.words.forEach(word => {
            addWordPair(word.french, word.translation);
        });
    } else {
        addWordPair(); // Add one empty pair
    }
    
    listModal.classList.remove('hidden');
}

function closeModalHandler() {
    listModal.classList.add('hidden');
    currentListId = null;
}

// Word pair management
function addWordPair(french = '', translation = '') {
    const wordPair = document.createElement('div');
    wordPair.className = 'flex space-x-2 items-center';
    wordPair.innerHTML = `
        <input type="text" placeholder="Français" value="${french}" 
               class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" required>
        <input type="text" placeholder="Traduction" value="${translation}" 
               class="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" required>
        <button type="button" onclick="this.parentElement.remove()" 
                class="text-red-500 hover:text-red-700 text-xl">&times;</button>
    `;
    wordsContainer.appendChild(wordPair);
}

// Save list
function saveList(e) {
    e.preventDefault();
    
    const name = listName.value.trim();
    const language = listLanguage.value;
    const wordPairs = Array.from(wordsContainer.children).map(pair => {
        const inputs = pair.querySelectorAll('input');
        return {
            id: generateId(),
            french: inputs[0].value.trim(),
            translation: inputs[1].value.trim()
        };
    }).filter(word => word.french && word.translation);
    
    if (!name || !language || wordPairs.length === 0) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    const listData = {
        id: currentListId || generateId(),
        name,
        language,
        words: wordPairs,
        createdAt: currentListId ? vocabularyLists.find(l => l.id === currentListId).createdAt : new Date(),
        updatedAt: new Date()
    };
    
    if (currentListId) {
        const index = vocabularyLists.findIndex(l => l.id === currentListId);
        vocabularyLists[index] = listData;
    } else {
        vocabularyLists.push(listData);
    }
    
    saveVocabularyLists();
    renderLists();
    renderQuizLists();
    closeModalHandler();
}

// Render lists
function renderLists() {
    listsContainer.innerHTML = '';
    
    if (vocabularyLists.length === 0) {
        listsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p class="text-lg mb-2">📝</p>
                <p>Aucune liste de vocabulaire</p>
                <p class="text-sm">Créez votre première liste !</p>
            </div>
        `;
        return;
    }
    
    vocabularyLists.forEach(list => {
        const listElement = document.createElement('div');
        listElement.className = 'bg-white rounded-lg shadow-sm p-4 fade-in';
        listElement.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-gray-800">${list.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="openModal('${list.id}')" class="text-blue-500 hover:text-blue-700 text-sm">✏️</button>
                    <button onclick="deleteList('${list.id}')" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>
                </div>
            </div>
            <div class="flex justify-between items-center text-sm text-gray-600">
                <span class="capitalize">${list.language === 'english' ? 'Anglais' : 'Allemand'}</span>
                <span>${list.words.length} mot${list.words.length > 1 ? 's' : ''}</span>
            </div>
        `;
        listsContainer.appendChild(listElement);
    });
}

// Delete list
function deleteList(listId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
        vocabularyLists = vocabularyLists.filter(l => l.id !== listId);
        saveVocabularyLists();
        renderLists();
        renderQuizLists();
    }
}

// Quiz functions
function renderQuizLists() {
    quizListsContainer.innerHTML = '';
    
    if (vocabularyLists.length === 0) {
        quizListsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <p class="text-lg mb-2">🎯</p>
                <p>Aucune liste disponible</p>
                <p class="text-sm">Créez d'abord une liste de vocabulaire</p>
            </div>
        `;
        return;
    }
    
    vocabularyLists.forEach(list => {
        const listElement = document.createElement('div');
        listElement.className = 'bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow';
        listElement.innerHTML = `
            <h3 class="font-semibold text-gray-800 mb-1">${list.name}</h3>
            <div class="flex justify-between items-center text-sm text-gray-600">
                <span class="capitalize">${list.language === 'english' ? 'Anglais' : 'Allemand'}</span>
                <span>${list.words.length} mot${list.words.length > 1 ? 's' : ''}</span>
            </div>
        `;
        listElement.addEventListener('click', () => startQuiz(list.id));
        quizListsContainer.appendChild(listElement);
    });
}

// Start quiz
function startQuiz(listId) {
    const list = vocabularyLists.find(l => l.id === listId);
    if (!list || list.words.length === 0) return;

    // Get words that need more practice
    const wordsNeedingPractice = getWordsNeedingPractice(listId, list.words);
    const otherWords = list.words.filter(word => !wordsNeedingPractice.includes(word));

    // Prioritize words needing practice (70% of quiz) + some random words (30%)
    let selectedWords = [];
    const practiceCount = Math.min(wordsNeedingPractice.length, Math.ceil(list.words.length * 0.7));
    const randomCount = Math.min(otherWords.length, list.words.length - practiceCount);

    // Add words needing practice
    selectedWords = [...wordsNeedingPractice.slice(0, practiceCount)];

    // Add some random words for variety
    if (randomCount > 0) {
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        selectedWords = [...selectedWords, ...shuffledOthers.slice(0, randomCount)];
    }

    // If we don't have enough words, fill with remaining words
    if (selectedWords.length < list.words.length) {
        const remaining = list.words.filter(word => !selectedWords.includes(word));
        selectedWords = [...selectedWords, ...remaining];
    }

    // Shuffle the final selection
    const shuffledWords = [...selectedWords].sort(() => Math.random() - 0.5);

    const questions = shuffledWords.map(word => {
        const questionLanguage = Math.random() < 0.5 ? 'french' : list.language;
        return {
            id: generateId(),
            word,
            questionLanguage,
            expectedAnswer: questionLanguage === 'french' ? word.translation : word.french
        };
    });

    currentQuiz = {
        listId,
        listName: list.name,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        totalQuestions: questions.length,
        startTime: new Date()
    };

    showQuizGame();
    displayCurrentQuestion();
}

// Show quiz sections
function showQuizSelection() {
    quizSelection.classList.remove('hidden');
    quizGame.classList.add('hidden');
    quizResults.classList.add('hidden');
}

function showQuizGame() {
    quizSelection.classList.add('hidden');
    quizGame.classList.remove('hidden');
    quizResults.classList.add('hidden');
}

function showQuizResults() {
    quizSelection.classList.add('hidden');
    quizGame.classList.add('hidden');
    quizResults.classList.remove('hidden');
}

// Display current question
function displayCurrentQuestion() {
    if (!currentQuiz || currentQuiz.currentQuestionIndex >= currentQuiz.questions.length) {
        endQuizSession();
        return;
    }

    const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const list = vocabularyLists.find(l => l.id === currentQuiz.listId);

    quizProgress.textContent = `Question ${currentQuiz.currentQuestionIndex + 1}/${currentQuiz.totalQuestions}`;
    quizScore.textContent = `Score: ${currentQuiz.score}`;

    if (question.questionLanguage === 'french') {
        quizQuestion.textContent = `Traduire en ${list.language === 'english' ? 'anglais' : 'allemand'} :`;
        quizWord.textContent = question.word.french;
    } else {
        quizQuestion.textContent = 'Traduire en français :';
        quizWord.textContent = question.word.translation;
    }

    quizAnswer.value = '';

    // Reset UI state
    waitingForUserClick = false;
    quizAnswer.disabled = false;
    submitAnswer.disabled = false;
    skipQuestion.disabled = false;

    // Hide continue button if it exists
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.style.display = 'none';
    }

    quizAnswer.focus();
}

// Submit quiz answer
function submitQuizAnswer() {
    if (!currentQuiz || waitingForUserClick) return;

    const userAnswer = quizAnswer.value.trim().toLowerCase();
    const correctAnswer = currentQuiz.questions[currentQuiz.currentQuestionIndex].expectedAnswer.toLowerCase();
    const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const isCorrect = userAnswer === correctAnswer;

    // Record the result for learning analytics
    recordWordResult(currentQuiz.listId, currentQuestion.word.id, isCorrect);

    if (isCorrect) {
        currentQuiz.score++;
        showFeedback(true);
        // Correct answers proceed automatically after short delay
        setTimeout(() => {
            currentQuiz.currentQuestionIndex++;
            displayCurrentQuestion();
        }, 1500);
    } else {
        showFeedback(false, correctAnswer);
        // For incorrect answers, wait for user click to proceed
        waitingForUserClick = true;
        showContinueButton();
    }
}

// Skip question
function skipQuizQuestion() {
    if (!currentQuiz || waitingForUserClick) return;

    const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const correctAnswer = currentQuestion.expectedAnswer;

    // Record as incorrect since it was skipped
    recordWordResult(currentQuiz.listId, currentQuestion.word.id, false);

    showFeedback(false, correctAnswer);

    // For skipped questions, wait for user click to proceed
    waitingForUserClick = true;
    showContinueButton();
}

// Show feedback
function showFeedback(isCorrect, correctAnswer = '') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white font-medium z-50 ${
        isCorrect ? 'bg-green-500' : 'bg-red-500'
    }`;
    feedbackDiv.textContent = isCorrect ? '✓ Correct !' : `✗ Réponse: ${correctAnswer}`;
    feedbackDiv.id = 'feedback-message';

    document.body.appendChild(feedbackDiv);

    // For correct answers, remove automatically
    if (isCorrect) {
        setTimeout(() => {
            if (document.getElementById('feedback-message')) {
                document.body.removeChild(feedbackDiv);
            }
        }, 1500);
    }
    // For incorrect answers, keep displayed until user clicks continue
}

// Show continue button for incorrect answers
function showContinueButton() {
    // Disable answer input and submit button
    quizAnswer.disabled = true;
    submitAnswer.disabled = true;
    skipQuestion.disabled = true;

    // Create or show continue button
    let continueBtn = document.getElementById('continue-btn');
    if (!continueBtn) {
        continueBtn = document.createElement('button');
        continueBtn.id = 'continue-btn';
        continueBtn.className = 'w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4';
        continueBtn.textContent = 'Continuer (j\'ai mémorisé)';
        continueBtn.addEventListener('click', continueToNextQuestion);

        // Insert after the quiz answer input
        quizAnswer.parentNode.insertBefore(continueBtn, quizAnswer.nextSibling);
    }

    continueBtn.style.display = 'block';
    continueBtn.focus();
}

// Continue to next question
function continueToNextQuestion() {
    waitingForUserClick = false;

    // Re-enable controls
    quizAnswer.disabled = false;
    submitAnswer.disabled = false;
    skipQuestion.disabled = false;

    // Hide continue button
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.style.display = 'none';
    }

    // Remove feedback message
    const feedbackDiv = document.getElementById('feedback-message');
    if (feedbackDiv) {
        document.body.removeChild(feedbackDiv);
    }

    // Move to next question
    currentQuiz.currentQuestionIndex++;
    displayCurrentQuestion();
}

// End quiz session
function endQuizSession() {
    if (!currentQuiz) return;

    const percentage = Math.round((currentQuiz.score / currentQuiz.totalQuestions) * 100);

    finalScore.textContent = `${currentQuiz.score}/${currentQuiz.totalQuestions}`;
    finalPercentage.textContent = `${percentage}%`;

    showQuizResults();
    currentQuiz = null;
}
