/**
 * Handles user authentication using Supabase.
 */

async function signIn(email, password) {
    const errorDisplay = document.getElementById('auth-error');
    errorDisplay.innerText = "Authenticating...";
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            errorDisplay.innerText = `Login Error: ${error.message}`;
            return null;
        }
        return data.user;
    } catch (err) {
        errorDisplay.innerText = "Connection error. Check console.";
        return null;
    }
}

async function getUserRole(userId) {
    try {
        const { data, error } = await supabase
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

async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
}

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
