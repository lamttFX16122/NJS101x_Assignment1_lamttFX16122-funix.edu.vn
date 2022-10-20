const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const covidSchema = new Schema({
    hypothermia: [{
        date: {
            type: String
        },
        time: {
            type: String
        },
        temperature: {
            type: String
        },
        affection: {
            type: String
        }
    }],
    vaccine: [{
        numVac: { type: Number },
        typeVac: { type: String },
        dateVac: { type: String }
    }],
    covid: [{
        numCovid: { type: Number },
        symptom: { type: String }, //Trieu chung
        dateCovid: { type: String },
        statusCovid: { type: Boolean } //True is +// 
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
module.exports = mongoose.model('Covid', covidSchema);