
(async () => {
    try {
        const testUser = `test_avatar_${Date.now()}`;
        console.log(`Creating user ${testUser}...`);
        const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: testUser, password: 'password123', name: 'Avatar User' })
        });
        const user = await signupRes.json();
        if (!signupRes.ok) throw new Error(user.error);

        const fakeAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";
        console.log("Uploading avatar...");
        const updateRes = await fetch('http://localhost:3000/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, avatar: fakeAvatar })
        });
        const updatedUser = await updateRes.json();

        if (!updateRes.ok) throw new Error(updatedUser.error);

        if (updatedUser.avatar === fakeAvatar) {
            console.log("PASS: Avatar updated correctly.");
        } else {
            console.error("FAIL: Avatar mismatch.");
            console.log("Expected:", fakeAvatar.substring(0, 20) + "...");
            console.log("Got:", updatedUser.avatar ? updatedUser.avatar.substring(0, 20) + "..." : "null");
        }

    } catch (e) {
        console.error("Error:", e);
    }
})();
