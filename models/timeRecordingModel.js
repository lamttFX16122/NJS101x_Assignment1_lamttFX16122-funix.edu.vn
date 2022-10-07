const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeRecordingSchema = new Schema({
    timeRecording: {
        times: [{
            startTime: {
                type: String
            },
            endTime: {
                type: String
            },
            workHours: {
                type: Number
            },
            workplace: {
                type: String
            },
            isLoading: {
                type: Boolean
            }
        }]
    },
    regAnnualleave: {
        dayOff: [{
            startDay: {
                type: String
            },
            endDay: {
                type: String
            },
            numOfHours: {
                type: Number
            },
            cause: {
                type: String
            },
            days: {
                type: Array
            }
        }]
    },
    isWorking: {
        type: Boolean
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('TimeRecording', timeRecordingSchema);