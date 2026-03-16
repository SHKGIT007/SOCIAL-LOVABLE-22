const Razorpay = require('razorpay');
const crypto = require('crypto');

const { SystemSetting } = require('../models');

let razorpayInstance;

const getClient = async () => {
    const settings = await SystemSetting.findOne({ where: { id: 1 } });
    const keyId = settings?.razorpay_key_id || process.env.RAZORPAY_KEY_ID;
    const keySecret = settings?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are not configured');
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
};

const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    try {
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount: amount must be greater than 0');
        }

        // Check if Razorpay is in test/demo mode with invalid credentials
        if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.length < 20) {
            throw new Error('Invalid Razorpay SECRET key. Please update it with your actual Razorpay test key from dashboard (Settings > API Keys)');
        }

        const client = await getClient();
        const order = await client.orders.create({ amount, currency, receipt, notes });
        if (!order || !order.id) {
            throw new Error('Razorpay API returned invalid order response');
        }
        return order;
    } catch (error) {
        const errorMsg = error.response?.data?.error?.description || error.response?.data?.error?.message || error.message || 'Unknown error';
        throw new Error(`Razorpay Error: ${errorMsg}`);
    }
};

const verifySignature = async (orderId, paymentId, signature) => {
    const settings = await SystemSetting.findOne({ where: { id: 1 } });
    const keySecret = settings?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
        throw new Error('Razorpay key secret is not configured');
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const expectedSignature = hmac.digest('hex');

    return expectedSignature === signature;
};

module.exports = {
    createOrder,
    verifySignature
};
