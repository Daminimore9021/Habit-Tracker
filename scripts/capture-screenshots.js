const puppeteer = require('puppeteer');
const fs = require('fs');

if (!fs.existsSync('public/screenshots')) {
    fs.mkdirSync('public/screenshots', { recursive: true });
}

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Function to click button by text
    const clickButtonByText = async (text) => {
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const t = await page.evaluate(el => el.textContent, btn);
            if (t && t.includes(text)) {
                await btn.click();
                return true;
            }
        }
        return false;
    };

    const clickByText = async (tag, text) => {
        const els = await page.$$(tag);
        for (const el of els) {
            const t = await page.evaluate(e => e.textContent, el);
            if (t && t.includes(text)) {
                await el.click();
                return true;
            }
        }
        return false;
    };

    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'public/screenshots/signin_page.png' });

        // Go to Signup
        console.log('Switching to Signup...');
        const clickedSignup = await clickButtonByText('Sign Up') || await clickByText('span', 'Sign Up');
        if (!clickedSignup) { console.log("Failed to click Sign Up toggle"); }

        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: 'public/screenshots/signup_page.png' });

        // Try to create user to ensure it exists
        console.log('Attempting to create user "admin"...');
        await page.type('input[placeholder="Enter your name"]', 'Admin User');
        await page.type('input[placeholder="Choose a username"]', 'admin');
        await page.type('input[placeholder="••••••••"]', 'password123');

        await clickButtonByText('Create Account');

        // Wait to see if navigation happens (success) or error
        try {
            await page.waitForNavigation({ timeout: 5000 });
            console.log('Signup successful, logged in.');
        } catch (e) {
            console.log('Signup might have failed (user exists?), trying Login...');
            // If signup failed, we might still be on the page or got an error.
            // Switch to Login mode
            const clickedSignin = await clickByText('span', 'Sign In');
            if (clickedSignin) {
                await new Promise(r => setTimeout(r, 500));
                // Fill login form
                await page.evaluate(() => {
                    document.querySelectorAll('input').forEach(i => i.value = '');
                });
                await page.type('input[placeholder="Choose a username"]', 'admin');
                await page.type('input[placeholder="••••••••"]', 'password123');
                await clickButtonByText('Sign In');
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
                console.log('Login successful.');
            }
        }

        console.log('Taking dashboard screenshot...');
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: 'public/screenshots/dashboard.png' });

        // Add Item Modal
        console.log('Opening Add Item modal...');
        try {
            await page.click('button.text-indigo-400');
        } catch (e) {
            console.log("Could not find specific add button, trying generic");
            const buttons = await page.$$('button');
            if (buttons.length > 2) await buttons[2].click();
        }

        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'public/screenshots/add_item_modal.png' });
        await page.keyboard.press('Escape');

        // Habits Page
        console.log('Navigating to Habits...');
        await page.goto('http://localhost:3000/habits', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'public/screenshots/habits_page.png' });

    } catch (error) {
        console.error('Error in script:', error);
    } finally {
        await browser.close();
        console.log('Done.');
    }
})();
