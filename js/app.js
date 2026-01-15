/**
 * Core application logic synchronized with the provided database schema.
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const role = await getUserRole(session.user.id);
            initApp(session.user, role);
        }
    } catch (err) {
        console.error("Session check error:", err);
    }
});

async function initApp(user, role) {
    document.getElementById('auth-section').classList.add('hidden');
    if (role === 'teacher') {
        showTeacherDashboard(user);
    } else {
        showStudentDashboard(user);
    }
}

/**
 * STUDENT DASHBOARD
 */
async function showStudentDashboard(user) {
    const dash = document.getElementById('student-dashboard');
    dash.classList.remove('hidden');
    document.getElementById('student-name').innerText = user.email;

    const exercises = await fetchExercises();
    const list = document.getElementById('exercise-list');
    list.innerHTML = '<h3>Available Lessons</h3>';
    
    exercises.forEach(ex => {
        const btn = document.createElement('button');
        btn.innerText = `L${ex.lesson} [${ex.level}] - ${ex.type.toUpperCase()}: ${ex.title}`;
        btn.className = 'exercise-btn';
        btn.style.width = "100%";
        btn.style.marginBottom = "8px";
        btn.onclick = () => renderExercise(ex);
        list.appendChild(btn);
    });

    loadStudentCharts(user.id);
}

async function loadStudentCharts(userId) {
    const { data: charts } = await supabase
        .from('charts')
        .select('*')
        .eq('user_id', userId);

    if (charts && charts.length > 0) {
        const latest = charts[0];
        renderProgressChart('progressChart', latest.data.labels, latest.data.values);
    }
}

/**
 * TEACHER DASHBOARD
 */
async function showTeacherDashboard(user) {
    const dash = document.getElementById('teacher-dashboard');
    dash.classList.remove('hidden');

    loadSubmissions();

    const { data: students } = await supabase
        .from('users')
        .select('id, role, created_at')
        .eq('role', 'student');

    const list = document.getElementById('student-progress-list');
    list.innerHTML = '<h3>Registered Students</h3>';
    
    if (students) {
        students.forEach(s => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.marginBottom = "10px";
            card.innerHTML = `<p><strong>ID:</strong> ${s.id.substring(0,8)}... <br>Joined: ${new Date(s.created_at).toLocaleDateString()}</p>`;
            list.appendChild(card);
        });
    }

    document.getElementById('unlock-all-btn').onclick = async () => {
        const { error } = await supabase
            .from('materials')
            .update({ is_active: true })
            .eq('is_active', false);
        if (!error) {
            alert('Lessons published!');
            location.reload();
        }
    };
}

/**
 * SUBMISSION MANAGEMENT
 */
async function loadSubmissions() {
    const { data: subs } = await supabase
        .from('submissions')
        .select(`
            id,
            user_id,
            answer,
            score,
            materials (title)
        `)
        .is('score', null);

    const list = document.getElementById('submissions-list');
    list.innerHTML = '';
    
    if (subs && subs.length > 0) {
        subs.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = "10px";
            div.innerHTML = `
                <p><strong>Material:</strong> ${sub.materials.title}</p>
                <div style="background:#f9f9f9; padding:10px; border-radius:4px; font-size:0.9rem;">${sub.answer}</div>
                <input type="number" id="score-${sub.id}" placeholder="Enter Score (0-9)" step="0.5" style="margin-top:10px;">
                <button onclick="gradeSubmission('${sub.id}')" style="width:100%; margin-top:5px;">Submit Score</button>
            `;
            list.appendChild(div);
        });
    } else {
        list.innerHTML = '<p>No pending submissions to grade.</p>';
    }
}

async function gradeSubmission(subId) {
    const score = document.getElementById(`score-${subId}`).value;
    const { error } = await supabase
        .from('submissions')
        .update({ score: parseFloat(score) })
        .eq('id', subId);

    if (!error) {
        alert('Score submitted!');
        loadSubmissions();
    }
}

/**
 * STUDENT WRITING SUBMISSION
 */
document.getElementById('submit-writing')?.addEventListener('click', async () => {
    const text = document.getElementById('writing-input').value;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('submissions')
        .insert([{ 
            user_id: user.id, 
            material_id: window.currentMaterialId, 
            answer: text
        }]);

    if (!error) {
        alert('Work submitted for grading!');
        location.reload();
    }
});

document.getElementById('logout-btn').onclick = logout;
document.getElementById('teacher-logout-btn').onclick = logout;
document.getElementById('back-to-dash').onclick = () => location.reload();
