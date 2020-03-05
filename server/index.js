const consumptionUtils =  require("./utils/consumption-utils");

const mongoose = require('mongoose');
const express  = require('express');

const SerialPort = require('serialport');
const ReadLine = SerialPort.parsers.Readline;

const EnergyBalanceModel = require('./models/energy-balance');
const EnergyBalanceRouter = require('./routes/energy-balance');

const app = express();

// app configuration
// picks up the node env values if possible
const APP_PORT = process.env.APP_PORT || 3000;
const DB_PORT  = process.env.DB_PORT  || 27017;
const DB_NAME  = process.env.DB_NAME  || 'sun-trackerino';
const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/ttyACM0';


// mongoose connection
mongoose.connect(`mongodb://localhost:${DB_PORT}/${DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.catch(err => {
    console.error('Mongodb starting error:', err.stack);
    process.exit(1);
});

const db = mongoose.connection;

app.use('/energy-balance', EnergyBalanceRouter);
app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}`));

const serial = new SerialPort(SERIAL_PORT, { baudRate: 9600 }, (err) => {
    console.error(`Can't connect to ${SERIAL_PORT} ==> ${err.message}`);
});


const parser = serial.pipe(new ReadLine())
parser.on("data", chunk => {
    let value = consumptionUtils.rawChunkToProductionValue(chunk);

    if(value)
        productionValues.push(value);
});

const productionValues = []; // array of values received from the Arduino
const TIME_INTERVAL = 60000; // in ms

async function run() {
    await wait(TIME_INTERVAL);
    
    if(productionValues.length != 0) {   
        const production = productionValues.reduce((prev, curr) => prev + curr, 0) / productionValues.length;

        const consumption = consumptionUtils.getRandomHardwareEnergyConsumption();
        const newEnergyBalance = {
            production: production,
            consumption: consumption,
            ratio: chunk / consumption
        };

        const model = new EnergyBalanceModel(newEnergyBalance);

        model.save().catch(err => {
            console.error("Error on energy balance save");
        });
    }
}

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

while(1) {
    run();
}