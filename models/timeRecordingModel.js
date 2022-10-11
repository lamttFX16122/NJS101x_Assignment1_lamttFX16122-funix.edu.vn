const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeRecordingSchema = new Schema({
    timeRecording: [{
        year: { type: Number }, //2022
        yearItems: [{
            month: { type: Number }, //10
            monthItems: [{
                day: { type: Number }, //08
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
                    workPlace: {
                        type: String
                    },
                    isLoading: {
                        type: Boolean
                    }
                }]
            }],
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
            }
        }]

    }],

    isWorking: {
        type: Boolean
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('TimeRecording', timeRecordingSchema);