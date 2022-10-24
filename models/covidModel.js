const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const covidSchema = new Schema({
    hypothermia: [{ //thân nhiệt
        date: {
            type: String
        },
        time: {
            type: String
        },
        temperature: { //Nhiệt độ
            type: String
        },
        affection: { // Tình trạng cơ thể
            type: String
        }
    }],
    vaccine: [{
        numVac: { type: Number }, // Mũi số
        typeVac: { type: String }, // Loại
        dateVac: { type: String } //Ngay tiêm
    }],
    covid: [{
        numCovid: { type: Number }, // Lần mắc
        symptom: { type: String }, //Trieu chung
        dateCovid: { type: String }, // Ngày tiêm
        statusCovid: { type: Boolean } //True is +//
    }],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
module.exports = mongoose.model('Covid', covidSchema);