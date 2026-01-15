/**
 * Handles user authentication and registration using Supabase.
 */

async function signIn(email, password) {
    const errorDisplay = document.getElementById('auth-error');
    errorDisplay.innerText = "Authenticating...";
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            errorDisplay.innerText = `Login Error: ${error.message}`;
            return null;
        }
        return data.user;
    } catch (err) {
        errorDisplay.innerText = "Connection error: " + err.message;
        return null;
    }
}

async function registerStudent(email, password) {
    try {
        // 1. Create Auth User
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        // 2. Add to public.users table (triggered by RLS or manually if needed)
        // Note: Usually a Supabase Trigger handles this, but we'll ensure the entry exists
        const { error: dbError } = await supabaseClient
            .from('users')
            .insert([{ id: data.user.id, role: 'student' }]);

        if (dbError) console.warn("User record might already exist:", dbError.message);
        
        return data.user;
    } catch (err) {
        alert("Registration Error: " + err.message);
        return null;
    }
}

async function getUserRole(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) return 'student'; 
        return data.role;
    } catch (err) {
        return 'student';
    }
}

// Event Listeners
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = await signIn(email, password);
    if (user) {
        const role = await getUserRole(user.id);
        initApp(user, role);
    }
});

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'register-student-form') {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        
        const newUser = await registerStudent(email, password);
        if (newUser) {
            alert("Student registered successfully!");
            e.target.reset();
            if (typeof GroupUI !== 'undefined') GroupUI.renderTeacherGroups();
        }
    }
});
