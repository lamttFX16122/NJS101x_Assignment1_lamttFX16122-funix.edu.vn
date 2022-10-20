const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    doB: {
        type: Date,
        required: true
    },
    salaryScale: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    annualLeave: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    timeRecordingId: {
        type: Schema.Types.ObjectId,
        ref: 'TimeRecording'
    },
    covidId: {
        type: Schema.Types.ObjectId,
        ref: 'Covid'
    }

});

userSchema.methods.updateAnnual = function(numHour) {
    this.annualLeave = numHour;
    return this.save();
}

module.exports = mongoose.model('User', userSchema);