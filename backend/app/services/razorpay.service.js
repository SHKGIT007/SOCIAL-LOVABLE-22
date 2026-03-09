const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance;

const getClient = () => {
    if (razorpayInstance) {
        return razorpayInstance;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error('Razorpay keys are not configured');
    }

    razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });

    return razorpayInstance;
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

        const client = getClient();
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

const verifySignature = (orderId, paymentId, signature) => {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay key secret is not configured');
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const expectedSignature = hmac.digest('hex');

    return expectedSignature === signature;
};

module.exports = {
    createOrder,
    verifySignature
};
