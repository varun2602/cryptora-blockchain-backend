const mongoose = require('mongoose');

const walletAddressSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        unique: true,
    },
    address: {
        type: String,
        unique: true,
    },
});

async function generateUserId(model) {
    const count = await model.countDocuments({});
    return count + 1;
}

walletAddressSchema.pre('save', async function (next) {
    if (!this.user_id) {
        this.user_id = await generateUserId(this.constructor);
    }
    next();
});

module.exports = mongoose.model('Wallet', walletAddressSchema);
