// Shopify to Firebase Data Sync Script
// Created by Kevin Waller
// 07-06-2023
// Copyright @Advalas Software 2023

const express = require('express');
const Shopify = require('shopify-api-node');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const database = admin.database();
const ordersRef = database.ref('orders');

// Shopify API credentials
const shopify = new Shopify({
    shopName: 'your-shop-name',
    apiKey: 'your-api-key',
    password: 'your-api-password',
});

// Webhook endpoint for Shopify order creation
app.post('/webhooks/orders/create', (req, res) => {
    const order = req.body;
    const customerEmail = order.email;

    // Store the order in Firebase using the customer's email as the key
    const orderId = order.id;
    const orderData = {
        id: order.id,
        customerName: order.customer?.name || '',
        
    };

    ordersRef.child(customerEmail).child(orderId).set(orderData)
        .then(() => {
            console.log('Order synced successfully:', orderId);
            res.sendStatus(200);
        })
        .catch((error) => {
            console.error('Error syncing order:', orderId, error);
            res.sendStatus(500);
        });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

