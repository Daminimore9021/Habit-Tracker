
(async () => {
    try {
        console.log("Creating admin user...");
        const res = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123', name: 'Admin User' })
        });
        const data = await res.json();
        if (!res.ok) {
            console.log("Signup Info:", data.error); // Likely "User already exists"
        } else {
            console.log("Admin user created:", data.id);
        }
    } catch (e) {
        console.error("Error:", e);
    }
})();
