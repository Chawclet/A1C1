/**
 * Handles user authentication using Supabase.
 */

async function signIn(email, password) {
    // Clear previous errors
    const errorDisplay = document.getElementById('auth-error');
    errorDisplay.innerText = "Authenticating...";
    
    console.log("Attempting sign in for:", email);
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Auth error:", error);
            // Display detailed error message to UI
            errorDisplay.innerText = `Login Error: ${error.message}`;
            
            // Helpful hints for common errors
            if (error.status === 400) {
                errorDisplay.innerText += " (Check if email/password is correct)";
            } else if (error.status === 429) {
                errorDisplay.innerText += " (Too many attempts. Wait a few minutes)";
            }
            return null;
        }
        
        console.log("Sign in successful", data.user);
        errorDisplay.innerText = "Login successful! Redirecting...";
        return data.user;
        
    } catch (err) {
        console.error("Critical error during auth:", err);
        errorDisplay.innerText = `System Error: ${err.message || "Connection failed"}. Check console for details.`;
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

        if (error) {
            console.error('Role Fetch Error:', error);
            // Don't block the user, but log it
            return 'student'; 
        }
        return data.role;
    } catch (err) {
        console.error("Unexpected Role Error:", err);
        return 'student';
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
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
