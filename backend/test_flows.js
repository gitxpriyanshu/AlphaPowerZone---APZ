const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3006/api';
const IMAGE_PATH = '/Users/priyanshukv/.gemini/antigravity/brain/819b65fb-5b8e-477e-ae0a-4fdd597b7a1e/test_product_image_1767286296517.png';

const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true,
});

async function runTests() {
    console.log('Starting tests...');

    // --- User Flow ---
    console.log('\n--- User Flow ---');
    const user = {
        name: 'Test User',
        email: `testuser_${Date.now()}@example.com`,
        age: 25,
        mobile: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        password: 'password123'
    };

    // User Signup
    let res = await client.post('/users/signup', user);
    console.log('User Signup:', res.status, res.data);

    // User Signin
    res = await client.post('/users/signin', {
        email: user.email,
        password: user.password
    });
    console.log('User Signin:', res.status, res.data);
    const userCookie = res.headers['set-cookie'];

    // --- Owner Flow ---
    console.log('\n--- Owner Flow ---');
    const owner = {
        name: 'Test Owner',
        email: `testowner_${Date.now()}@example.com`,
        password: 'password123'
    };

    // Owner Signup
    res = await client.post('/owners/signup', owner);
    console.log('Owner Signup:', res.status, res.data);

    // Owner Signin
    res = await client.post('/owners/signin', {
        email: owner.email,
        password: owner.password
    });
    console.log('Owner Signin:', res.status, res.data);

    if (res.status !== 200) {
        console.error("Owner login failed, cannot proceed");
        return;
    }

    const ownerCookie = res.headers['set-cookie'];

    // --- Security Check: User cannot create Category ---
    console.log('\n--- Security Check ---');
    const unauthorizedForm = new FormData();
    unauthorizedForm.append('name', 'Unauthorized Category');
    if (fs.existsSync(IMAGE_PATH)) {
        unauthorizedForm.append('image', fs.createReadStream(IMAGE_PATH));
    }

    // Attempt to create category with User Cookie
    res = await client.post('/categories', unauthorizedForm, {
        headers: {
            ...unauthorizedForm.getHeaders(),
            Cookie: userCookie
        }
    });
    console.log('User Create Category Attempt:', res.status, res.data.message || res.statusText);

    // --- Security Check: User cannot create Product ---
    console.log('--- Security Check: User cannot create Product ---');
    const unauthorizedProductForm = new FormData();
    unauthorizedProductForm.append('name', 'Unauthorized Product');
    unauthorizedProductForm.append('description', 'Should fail');
    unauthorizedProductForm.append('price', 100);
    unauthorizedProductForm.append('categoryId', 1);

    if (fs.existsSync(IMAGE_PATH)) {
        unauthorizedProductForm.append('image', fs.createReadStream(IMAGE_PATH));
    }

    res = await client.post('/products', unauthorizedProductForm, {
        headers: {
            ...unauthorizedProductForm.getHeaders(),
            Cookie: userCookie
        }
    });
    console.log('User Create Product Attempt (Should Fail):', res.status, res.data.message || res.statusText);

    // --- Category Flow ---
    console.log('\n--- Category Flow ---');
    const categoryForm = new FormData();
    categoryForm.append('name', 'Test Category ' + Date.now());
    if (fs.existsSync(IMAGE_PATH)) {
        categoryForm.append('image', fs.createReadStream(IMAGE_PATH));
    } else {
        console.error("Image file not found for category " + IMAGE_PATH);
        return;
    }

    // Assuming createCategory route is at /categories/
    res = await client.post('/categories', categoryForm, {
        headers: {
            ...categoryForm.getHeaders(),
            Cookie: ownerCookie
        }
    });
    console.log('Create Category:', res.status, res.data);
    const categoryId = res.data.category ? res.data.category.id : 1;

    // --- Product Flow ---
    console.log('\n--- Product Flow ---');

    // Create Product
    const form = new FormData();
    form.append('name', 'Test Product');
    form.append('description', 'This is a test product');
    form.append('price', 99.99);
    form.append('categoryId', categoryId);

    if (fs.existsSync(IMAGE_PATH)) {
        form.append('image', fs.createReadStream(IMAGE_PATH));
    }

    const productHeaders = {
        ...form.getHeaders(),
        Cookie: ownerCookie
    };

    res = await client.post('/products', form, { headers: productHeaders });
    console.log('Create Product:', res.status, res.data);

    const productId = res.data.product ? res.data.product.id : null;

    if (productId) {
        // --- Product Listing Flow ---
        console.log('\n--- Product Listing Flow ---');
        // Get All Products
        res = await client.get('/products');
        console.log('Get All Products:', res.status, `Found ${res.data.length} products`);

        // Get Product By ID
        res = await client.get(`/products/${productId}`);
        console.log('Get Product By ID:', res.status, res.data.name);

        // --- Cart Flow ---
        console.log('\n--- Cart Flow ---');
        const userHeaders = { Cookie: userCookie };

        // Add to Cart
        res = await client.post('/cart/add', { productId }, { headers: userHeaders });
        console.log('Add to Cart:', res.status, res.data);

        // Get Cart
        res = await client.get('/cart', { headers: userHeaders });
        console.log('Get Cart:', res.status, res.data);

        if (res.data.length > 0) {
            // --- Order Flow ---
            console.log('\n--- Order Flow ---');
            // Place Order
            res = await client.post('/orders', {}, { headers: userHeaders });
            console.log('Place Order:', res.status, res.data.message);
            const orderId = res.data.order ? res.data.order.id : null;

            if (orderId) {
                // Get User Orders
                res = await client.get('/orders', { headers: userHeaders });
                console.log('Get User Orders:', res.status, `Found ${res.data.length} orders`);
            }

            // Verify Cart Empty
            res = await client.get('/cart', { headers: userHeaders });
            console.log('Get Cart (After Order):', res.status, `Items: ${res.data.length}`);
        }
    }
}

runTests();
