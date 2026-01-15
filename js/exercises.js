/**
 * Fetches all materials from the 'materials' table.
 */
async function fetchExercises() {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching materials:', error);
        return [];
    }
    return data;
}

function renderExercise(exercise) {
    const screen = document.getElementById('exercise-screen');
    const readingCont = document.getElementById('reading-container');
    const listeningCont = document.getElementById('listening-container');
    const writingCont = document.getElementById('writing-container');
    const timerDisplay = document.getElementById('timer-display');

    [readingCont, listeningCont, writingCont].forEach(c => c.classList.add('hidden'));
    screen.classList.remove('hidden');
    document.getElementById('student-dashboard').classList.add('hidden');

    const content = exercise.content;

    if (exercise.type === 'reading') {
        readingCont.classList.remove('hidden');
        document.getElementById('passage').innerHTML = `<h2>${exercise.title}</h2><div>${content.text}</div>`;
        document.getElementById('questions').innerHTML = renderQuestions(content.questions);
        initSwipe();
    } 
    else if (exercise.type === 'listening') {
        listeningCont.classList.remove('hidden');
        document.getElementById('listening-questions').innerHTML = renderQuestions(content.questions);
    } 
    else if (exercise.type === 'writing' || exercise.type === 'speaking') {
        writingCont.classList.remove('hidden');
        document.getElementById('writing-prompt-title').innerText = exercise.title;
        document.getElementById('writing-prompt').innerText = content.prompt || "Write your essay below.";
        window.currentMaterialId = exercise.id;
    }

    const limit = exercise.time_limit ? exercise.time_limit * 60 : 1200;
    startTimer(limit, timerDisplay);
}

function renderQuestions(questions) {
    if (!questions) return '';
    return questions.map((q, i) => `
        <div class="question">
            <p><strong>${i + 1}.</strong> ${q.text}</p>
            ${q.options ? q.options.map(opt => `
                <label style="display:block; margin: 5px 0;">
                    <input type="radio" name="q${i}" value="${opt}"> ${opt}
                </label>
            `).join('') : '<input type="text" placeholder="Type your answer" class="answer-input">'}
        </div>
    `).join('');
}

function initSwipe() {
    const passage = document.getElementById('passage');
    const questions = document.getElementById('questions');
    const mc = new Hammer(document.getElementById('reading-container'));

    mc.on("swipeleft", () => {
        passage.style.transform = "translateX(-100%)";
        questions.style.transform = "translateX(0)";
    });

    mc.on("swiperight", () => {
        passage.style.transform = "translateX(0)";
        questions.style.transform = "translateX(100%)";
    });
}
