/**
 * Fetches and renders exercises with role-based visibility.
 */
async function fetchExercises() {
    const { data, error } = await supabaseClient
        .from('materials')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching materials:', error);
        return [];
    }
    return data;
}

async function renderExercise(exercise) {
    const screen = document.getElementById('exercise-screen');
    const readingCont = document.getElementById('reading-container');
    const listeningCont = document.getElementById('listening-container');
    const writingCont = document.getElementById('writing-container');
    const timerDisplay = document.getElementById('timer-display');
    const backBtn = document.getElementById('back-to-dash');

    // Determine role (teacher vs student)
    const { data: { session } } = await supabaseClient.auth.getSession();
    const { data: userData } = await supabaseClient.from('users').select('role').eq('id', session.user.id).single();
    const isTeacher = userData?.role === 'teacher';

    [readingCont, listeningCont, writingCont].forEach(c => c.classList.add('hidden'));
    screen.classList.remove('hidden');
    document.getElementById('student-dashboard')?.classList.add('hidden');
    document.getElementById('teacher-dashboard')?.classList.add('hidden');

    const content = exercise.content || {};
    // Fix for "undefined" - check common keys for text content
    const textContent = content.text || content.passage || content.content || content.prompt || "";

    if (exercise.type === 'reading') {
        readingCont.classList.remove('hidden');
        document.getElementById('passage').innerHTML = `<h2>${exercise.title}</h2><div>${textContent}</div>`;
        
        const questionsEl = document.getElementById('questions');
        if (isTeacher) {
            questionsEl.innerHTML = `<div class="card"><h3>Teacher Preview</h3><p>Questions and submission boxes are hidden for teachers.</p></div>`;
            timerDisplay.classList.add('hidden');
        } else {
            questionsEl.innerHTML = renderQuestions(content.questions);
            timerDisplay.classList.remove('hidden');
            initSwipe();
        }
    } 
    else if (exercise.type === 'listening') {
        listeningCont.classList.remove('hidden');
        const listQuestionsEl = document.getElementById('listening-questions');
        if (isTeacher) {
            listQuestionsEl.innerHTML = `<p><strong>Teacher View:</strong> Questions hidden. Record score manually after evaluation.</p>`;
            timerDisplay.classList.add('hidden');
        } else {
            listQuestionsEl.innerHTML = renderQuestions(content.questions);
            timerDisplay.classList.remove('hidden');
        }
    } 
    else if (exercise.type === 'writing' || exercise.type === 'speaking') {
        writingCont.classList.remove('hidden');
        document.getElementById('writing-prompt-title').innerText = exercise.title;
        document.getElementById('writing-prompt').innerText = textContent;
        
        const submitBtn = document.getElementById('submit-writing');
        const inputArea = document.getElementById('writing-input');
        
        if (isTeacher) {
            submitBtn.classList.add('hidden');
            inputArea.classList.add('hidden');
            timerDisplay.classList.add('hidden');
        } else {
            submitBtn.classList.remove('hidden');
            inputArea.classList.remove('hidden');
            timerDisplay.classList.remove('hidden');
            window.currentMaterialId = exercise.id;
        }
    }

    if (!isTeacher) {
        const limit = exercise.time_limit ? exercise.time_limit * 60 : 1200;
        startTimer(limit, timerDisplay);
    }
}

function renderQuestions(questions) {
    if (!questions || !Array.isArray(questions)) return '<p>No questions available.</p>';
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
    if (!passage || !questions) return;
    
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
