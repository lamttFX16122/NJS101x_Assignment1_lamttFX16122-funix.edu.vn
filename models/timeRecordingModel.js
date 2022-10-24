const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeRecordingSchema = new Schema({
    timeRecording: [{
        year: { type: Number }, //Năm
        yearItems: [{
            month: { type: Number },
            monthItems: [{
                day: { type: Number },
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
            regAnnualleave: { // Ngày nghỉ
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

    isWorking: { //Trạng thái làm việc
        type: Boolean
    },
    previousTime: { // index phiên làm việc
        timeRecording: { type: String },
        yearItems: { type: String },
        monthItems: { type: String },
        times: { type: String }
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});
module.exports = mongoose.model('TimeRecording', timeRecordingSchema);