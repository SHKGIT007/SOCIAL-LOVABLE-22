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
    const client = getClient();
    return client.orders.create({ amount, currency, receipt, notes });
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
