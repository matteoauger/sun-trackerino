const mongoose = require('mongoose');

const EnergyBalanceSchema = new mongoose.Schema({
    production: {
        type: Number,
        required: [true, 'The power production is mandatory'],
    },
    consumption: {
        type: Number,
        required: [true, 'The power consumption is mandatory'],
    },
    ratio: {
        type: Number,
        required: [true, 'The power ratio is mandatory'],
    },
    date: {
        type: Date,
        default: Date.now,
        requied: [true, 'The date is required']
    },
});

module.exports = mongoose.model('EnergyBalance', EnergyBalanceSchema);
