/**
 * Core application logic - Restructured for Bottom Nav and Tabbed Views
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof supabaseClient !== 'undefined') {
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                const role = await getUserRole(session.user.id);
                initApp(session.user, role);
            }
        }
    } catch (err) {
        console.error("Session check error:", err);
    }
});

async function getUserRole(userId) {
    const { data, error } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
    return data?.role || 'student';
}

async function initApp(user, role) {
    document.getElementById('auth-section').classList.add('hidden');
    if (role === 'teacher') {
        showTeacherDashboard(user);
    } else {
        showStudentDashboard(user);
    }
}

/**
 * TEACHER DASHBOARD LOGIC
 */
async function showTeacherDashboard(user) {
    document.getElementById('teacher-dashboard').classList.remove('hidden');
    
    // Default view
    showTeacherView('materials');
    
    // Load Teacher Data
    loadAllMaterials();
    if (typeof GroupUI !== 'undefined') {
        GroupUI.renderTeacherGroups();
    }
}

function showTeacherView(viewName) {
    const materialsView = document.getElementById('materials-view');
    const groupsView = document.getElementById('groups-view');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle Views
    if (viewName === 'materials') {
        materialsView.classList.remove('hidden');
        groupsView.classList.add('hidden');
        navItems[0].classList.add('active');
        navItems[1].classList.remove('active');
    } else {
        materialsView.classList.add('hidden');
        groupsView.classList.remove('hidden');
        navItems[0].classList.remove('active');
        navItems[1].classList.add('active');
    }
}

async function loadAllMaterials() {
    const list = document.getElementById('materials-list');
    const { data: materials, error } = await supabaseClient
        .from('materials')
        .select('*')
        .order('level', { ascending: true });

    if (error) {
        list.innerHTML = `<p class="error">Error loading materials: ${error.message}</p>`;
        return;
    }

    list.innerHTML = '';
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    
    levels.forEach(lvl => {
        const section = document.createElement('div');
        section.className = 'card';
        section.style.marginBottom = '15px';
        section.innerHTML = `<h4>Level ${lvl}</h4><div id="lvl-${lvl}-list"></div>`;
        list.appendChild(section);

        const lvlList = section.querySelector(`#lvl-${lvl}-list`);
        const filtered = materials.filter(m => m.level === lvl);
        
        if (filtered.length === 0) {
            lvlList.innerHTML = '<p style="font-size:0.8rem; color:#999;">No lessons yet.</p>';
        } else {
            filtered.forEach(m => {
                const btn = document.createElement('button');
                btn.innerText = `[${m.type.toUpperCase()}] ${m.title}`;
                btn.style.width = '100%';
                btn.style.fontSize = '0.75rem';
                btn.style.marginBottom = '5px';
                btn.style.padding = '8px';
                btn.onclick = () => renderExercise(m);
                lvlList.appendChild(btn);
            });
        }
    });
}

/**
 * STUDENT DASHBOARD LOGIC
 */
async function showStudentDashboard(user) {
    const dash = document.getElementById('student-dashboard');
    dash.classList.remove('hidden');
    document.getElementById('student-name').innerText = user.email;

    const { data: exercises } = await supabaseClient
        .from('materials')
        .select('*')
        .eq('is_active', true);
        
    const list = document.getElementById('exercise-list');
    list.innerHTML = '<h3>Available Lessons</h3>';
    
    if (exercises) {
        exercises.forEach(ex => {
            const btn = document.createElement('button');
            btn.innerText = `[${ex.level}] ${ex.type.toUpperCase()}: ${ex.title}`;
            btn.className = 'exercise-btn';
            btn.style.width = "100%";
            btn.style.marginBottom = "8px";
            btn.onclick = () => renderExercise(ex);
            list.appendChild(btn);
        });
    }

    if (typeof GroupUI !== 'undefined') {
        GroupUI.renderStudentGroups(user.id);
    }
    loadStudentCharts(user.id);
}

async function loadStudentCharts(userId) {
    const { data: charts } = await supabaseClient
        .from('charts')
        .select('*')
        .eq('user_id', userId);

    if (charts && charts.length > 0) {
        const latest = charts[0];
        if (typeof renderProgressChart === 'function') {
            renderProgressChart('progressChart', latest.data.labels, latest.data.values);
        }
    }
}

// Global functions
function logout() {
    supabaseClient.auth.signOut().then(() => location.reload());
}

if (document.getElementById('logout-btn')) document.getElementById('logout-btn').onclick = logout;
if (document.getElementById('teacher-logout-btn')) document.getElementById('teacher-logout-btn').onclick = logout;
if (document.getElementById('back-to-dash')) document.getElementById('back-to-dash').onclick = () => location.reload();
