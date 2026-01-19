
(async () => {
    try {
        const testUser = `test_${Date.now()}`;
        console.log(`Creating user ${testUser}...`);
        const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUser, password: 'password123', name: 'Test User' })
        });
        const user = await signupRes.json();
        if (!signupRes.ok) throw new Error(user.error);
        console.log("Created user:", user.username, "ID:", user.id);

        // 2. Update Name
        console.log("Updating name to 'Admin Updated'...");
        const updateRes = await fetch('http://localhost:3000/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, name: 'Admin Updated' })
        });
        const updatedUser = await updateRes.json();

        if (!updateRes.ok) throw new Error(updatedUser.error);
        console.log("Update Success! New Name:", updatedUser.name);

        if (updatedUser.name !== 'Admin Updated') {
            console.error("FAIL: Name did not update correctly.");
        } else {
            console.log("PASS: Name updated correctly.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
})();
