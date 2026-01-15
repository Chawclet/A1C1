/**
 * Core application logic - Restructured for Bottom Nav and Tabbed Views
 */

// Ensure functions are global for onclick handlers
window.showTeacherView = function(viewName) {
    const materialsView = document.getElementById('materials-view');
    const groupsView = document.getElementById('groups-view');
    const navItems = document.querySelectorAll('.nav-item');

    if (!materialsView || !groupsView) return;

    if (viewName === 'materials') {
        materialsView.classList.remove('hidden');
        groupsView.classList.add('hidden');
        if(navItems[0]) navItems[0].classList.add('active');
        if(navItems[1]) navItems[1].classList.remove('active');
    } else {
        materialsView.classList.add('hidden');
        groupsView.classList.remove('hidden');
        if(navItems[0]) navItems[0].classList.remove('active');
        if(navItems[1]) navItems[1].classList.add('active');
    }
};

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
    const dash = document.getElementById('teacher-dashboard');
    if (dash) dash.classList.remove('hidden');
    
    // Default view
    window.showTeacherView('materials');
    
    // Load Teacher Data
    loadAllMaterials();
    if (typeof GroupUI !== 'undefined') {
        GroupUI.renderTeacherGroups();
    }
}

async function loadAllMaterials() {
    const list = document.getElementById('materials-list');
    if (!list) return;

    const { data: materials, error } = await supabaseClient
        .from('materials')
        .select('*')
        .order('level', { ascending: true })
        .order('lesson', { ascending: true });

    if (error) {
        list.innerHTML = `<p class="error">Error loading materials: ${error.message}</p>`;
        return;
    }

    list.innerHTML = '';
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    
    levels.forEach(lvl => {
        const levelSection = document.createElement('div');
        levelSection.className = 'level-container';
        levelSection.innerHTML = `<h3 style="margin: 20px 0 10px 0; color: #0d6efd;">Level ${lvl}</h3>`;
        list.appendChild(levelSection);

        const lvlMaterials = materials.filter(m => m.level === lvl);
        
        // Group by Lesson Number
        const lessonsMap = {};
        lvlMaterials.forEach(m => {
            const lessonNum = m.lesson || 0;
            if (!lessonsMap[lessonNum]) lessonsMap[lessonNum] = [];
            lessonsMap[lessonNum].push(m);
        });

        const lessonNums = Object.keys(lessonsMap).sort((a, b) => a - b);
        
        if (lessonNums.length === 0) {
            levelSection.innerHTML += '<p style="font-size:0.8rem; color:#999;">No lessons yet.</p>';
        } else {
            lessonNums.forEach(num => {
                const lessonData = lessonsMap[num];
                const details = document.createElement('details');
                details.className = 'card';
                details.style.marginBottom = '10px';
                details.style.padding = '10px';
                
                const summary = document.createElement('summary');
                summary.style.fontWeight = 'bold';
                summary.style.cursor = 'pointer';
                summary.innerText = `Lesson ${num}`;
                details.appendChild(summary);

                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = '1fr 1fr';
                grid.style.gap = '8px';
                grid.style.marginTop = '10px';

                // We want 4 buttons: Reading, Listening, Writing, Speaking
                const types = ['reading', 'listening', 'writing', 'speaking'];
                types.forEach(type => {
                    const material = lessonData.find(m => m.type.toLowerCase() === type);
                    const btn = document.createElement('button');
                    btn.innerText = type.charAt(0).toUpperCase() + type.slice(1);
                    btn.style.padding = '10px';
                    btn.style.fontSize = '0.8rem';
                    
                    if (material) {
                        btn.onclick = () => renderExercise(material);
                    } else {
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        btn.style.background = '#ccc';
                    }
                    grid.appendChild(btn);
                });

                details.appendChild(grid);
                levelSection.appendChild(details);
            });
        }
    });
}

/**
 * STUDENT DASHBOARD LOGIC
 */
async function showStudentDashboard(user) {
    const dash = document.getElementById('student-dashboard');
    if (dash) dash.classList.remove('hidden');
    document.getElementById('student-name').innerText = user.email;

    const { data: exercises } = await supabaseClient
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .order('lesson', { ascending: true });
        
    const list = document.getElementById('exercise-list');
    if (list) {
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
window.logout = function() {
    supabaseClient.auth.signOut().then(() => location.reload());
};

const logoutBtn = document.getElementById('logout-btn');
const teacherLogoutBtn = document.getElementById('teacher-logout-btn');
const backToDashBtn = document.getElementById('back-to-dash');

if (logoutBtn) logoutBtn.onclick = window.logout;
if (teacherLogoutBtn) teacherLogoutBtn.onclick = window.logout;
if (backToDashBtn) backToDashBtn.onclick = () => location.reload();
