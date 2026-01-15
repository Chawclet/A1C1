/**
 * Handles user authentication using Supabase.
 */

/**
 * Signs in the user and returns the user object.
 */
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        document.getElementById('auth-error').innerText = "Login failed: " + error.message;
        return null;
    }
    return data.user;
}

/**
 * Fetches the user's role from the 'users' table based on the schema.
 */
async function getUserRole(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching role:', error);
        return 'student'; // Default fallback
    }
    return data.role;
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
