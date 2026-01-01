const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://alphapowerzone-apz.onrender.com/api';

async function testProductAdd() {
    console.log("🚀 Starting Product Add Test...");

    try {
        // 1. Signup a Test Owner (if doesn't exist)
        const testEmail = `testowner_${Date.now()}@apz.com`;
        const testPassword = "Password123";

        console.log(`📝 Registering test owner: ${testEmail}`);
        const signupRes = await axios.post(`${BASE_URL}/owners/signup`, {
            name: "Test Bot",
            email: testEmail,
            password: testPassword
        });
        console.log("✅ Signup successful!");

        // 2. Login
        console.log("🔑 Logging in...");
        const loginRes = await axios.post(`${BASE_URL}/owners/signin`, {
            email: testEmail,
            password: testPassword
        });

        const cookie = loginRes.headers['set-cookie'][0];
        console.log("✅ Login successful! Cookie obtained.");

        // 3. Get first category ID
        console.log("📂 Fetching categories...");
        const catRes = await api_get('/categories', cookie);
        if (catRes.length === 0) {
            throw new Error("No categories found to attach product to.");
        }
        const categoryId = catRes[0].id;
        console.log(`✅ Using Category ID: ${categoryId} (${catRes[0].name})`);

        // 4. Add Product
        console.log("🖼️ Preparing product upload...");
        const form = new FormData();
        form.append('name', 'Automated Test Product');
        form.append('description', 'Created by AI script to debug 500 error');
        form.append('price', '1234');
        form.append('categoryId', categoryId.toString());

        const imagePath = path.join(__dirname, '../frontend/public/images/home_hero.png');
        form.append('image', fs.createReadStream(imagePath));

        console.log("🚀 Sending POST /api/products...");
        const prodRes = await axios.post(`${BASE_URL}/products`, form, {
            headers: {
                ...form.getHeaders(),
                'Cookie': cookie
            }
        });

        console.log("💎 SUCCESS! Product created:");
        console.log(JSON.stringify(prodRes.data, null, 2));

    } catch (err) {
        console.error("❌ TEST FAILED!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Message:", err.message);
        }
        process.exit(1);
    }
}

async function api_get(endpoint, cookie) {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: { 'Cookie': cookie }
    });
    return res.data;
}

testProductAdd();
