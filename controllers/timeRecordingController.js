const TimeRecording = require('../models/timeRecordingModel');
const User = require('../models/userModel');
const moment = require('moment');

//Man hinh cham cong
exports.getTimeRecording = (req, res, next) => {
    let startTime;
    TimeRecording.findById(req.user.timeRecordingId)
        .then(results => {
            //Loc ngay hom nay
            let resultInDay = results.timeRecording.times.filter((value) => {
                return moment(value.startTime).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY')
            })
            console.log(resultInDay)
            if (resultInDay.length > 0) {
                results.timeRecording.times = resultInDay;
                const startTimeIndex = results.timeRecording.times.findIndex(i => {
                    return i.isLoading === true;
                })
                if (startTimeIndex >= 0) {
                    const timeTemp = results.timeRecording.times[startTimeIndex].startTime;
                    startTime = `Bắt đầu lúc: ${moment(timeTemp).format('HH:mm')} - ${moment(timeTemp).format('DD/MM/YYYY')}`
                }
            }
            // console.log('===>>>>', result.timeRecording.times)
            return res.render('time_recording/time-recording', { moment: moment, TimeRecording: results, listInDay: resultInDay, startTime: startTime });
        })
        .catch(err => console.log(err));
}

//Form bat dau cham cong
exports.getStartTime = (req, res, next) => {
    console.log(req.user.name)
    res.render('time_recording/start-time', { name: req.user.name });
}

exports.postStartTime = (req, res, next) => {
        const id = req.user.timeRecordingId;
        const workPlace = req.body.workplace;
        let item = {
            startTime: moment().format(),
            workplace: workPlace,
            isLoading: true
        }
        TimeRecording.findById(id)
            .then(t => {
                const _times = [...t.timeRecording.times];
                _times.push(item)
                t.timeRecording.times = _times;
                t.isWorking = !t.isWorking;
                return t.save();
            })
            .then(result => {
                return res.redirect('/user/time-recording')
            })
            .catch(err => console.log(err));

    }
    // End time
exports.postEndTime = (req, res, next) => {
        TimeRecording.findById(req.user.timeRecordingId)
            .then(result => {
                const timesIndex = result.timeRecording.times.findIndex(x => {
                    return x.isLoading === true;
                })
                const endtime = moment();
                result.timeRecording.times[timesIndex].endTime = endtime.format();
                result.timeRecording.times[timesIndex].isLoading = false;
                result.timeRecording.times[timesIndex].workHours = endtime.diff(moment(result.timeRecording.times[timesIndex].startTime), 'minutes');
                result.isWorking = !result.isWorking;
                return result.save();
            })
            .then(resultSave => {
                return res.redirect('/user/time-recording');
            })
            .catch(err => console.log(err))

    }
    //AnnualLeave
exports.getAnnualLeave = (req, res, next) => {
    TimeRecording.findById(req.user.timeRecordingId)
        .then(datas => {
            let data = {...datas };
            let totalResAnnual = 0;
            datas.regAnnualleave.dayOff.forEach((value) => {
                totalResAnnual += value.numOfHours;
            })
            data.totalResAnnual = totalResAnnual / 8;
            data.annualRemaining = req.user.annualLeave / 8;
            console.log(data._doc.regAnnualleave.dayOff)
            res.render('time_recording/annualLeave', { moment: moment, timeRecording: data });
        })
        .catch(err => console.log(err));
}
exports.postAnnualLeave = (req, res, next) => {
    let currentnumDay = req.user.annualLeave;
    const start = moment(req.body.startDate).format('YYYY-MM-DD');
    const end = moment(req.body.endDate).format('YYYY-MM-DD');
    const hour = parseInt(req.body.numhours);
    let totalRes = 0; //Tong so gio dang ky nghi


    TimeRecording.findById(req.user.timeRecordingId)
        .then(data => {
            checkBetween = data.regAnnualleave.dayOff.findIndex(item => {
                return (start === item.startDay && end === item.endDay) ||
                    moment(start).isBetween(item.startDay, item.endDay) ||
                    moment(end).isBetween(item.startDay, item.endDay) ||
                    start === item.startDay || start === item.endDay ||
                    end === item.startDay || end === item.endDay
            })
            if (checkBetween >= 0) {
                throw new Error('Khoảng thời gian nghỉ trùng với khoảng thời gian đã đăng ký');
            } else {
                let updateAnnual = [...data.regAnnualleave.dayOff];
                if (start !== end) {
                    totalRes = (moment(end).diff(moment(start), 'days') + 1) * 8;
                } else {
                    if (hour > 0) {
                        totalRes = hour;
                    } else {
                        totalRes = 8;
                    }
                }
                if (currentnumDay >= totalRes) {
                    const dayOff = {
                        startDay: start,
                        endDay: end,
                        numOfHours: totalRes,
                        cause: req.body.cause,
                        days: getRangeOfDates(moment(start), moment(end), 'day')
                    }
                    updateAnnual.push(dayOff);
                    data.regAnnualleave.dayOff = updateAnnual;
                    return data.save();
                } else {
                    throw new Error('Thời gian đăng ký vượt quá thời gian nghỉ còn lại!');
                }
            }
        })
        .then(result => {
            currentnumDay = currentnumDay - totalRes;
            return req.user.updateAnnual(currentnumDay);
        })
        .then(() => {
            return res.redirect('/user/annualLeave');
        })
        .catch(err => {
            return res.render('err', { title: 'Đăng ký nghỉ', message: err.message, backUrl: '/user/annualLeave' });
        });

}

//Func tách từ ngày đến ngày thành các ngày chi tiết
function getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
    // if (start.isAfter(end)) throw new Error('start must precede end')
    const next = moment(start).add(1, key).startOf(key);
    if (next.isAfter(end, key)) return arr;
    return getRangeOfDates(next, end, key, arr.concat(next));
}