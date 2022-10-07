const User = require('../models/userModel');
const TimeRecording = require('../models/timeRecordingModel');
const moment = require('moment');

exports.getIndex = (req, res, next) => {
    console.log(req.user)
    res.render('user/index');
}
exports.getAddUser = (req, res, next) => {
    res.render('user/add-user');
}

exports.postAddUser = (req, res, next) => {
    const timeRecording = new TimeRecording({
        timeRecording: {},
        regAnnualleave: {},
        isWorking: false
    })
    const user = new User({
        name: req.body.username,
        doB: req.body.doB,
        salaryScale: req.body.salaryScale,
        startDate: req.body.startDate,
        department: req.body.department,
        annualLeave: req.body.annualLeave * 8,
        imageUrl: req.body.imageUrl,
        timeRecordingId: timeRecording._id
    })
    timeRecording.userId = user._id;
    user.save()
        .then(result => {
            return timeRecording.save();
        })
        .then(() => {
            return res.redirect('/');
        })
        .catch(err => console.log(err))
}

exports.getUserInfo = (req, res, next) => {
    const user = req.user;
    return res.render('user/user-info', { user: user, moment: moment });
}
exports.postImage = (req, res, next) => {
    req.user.imageUrl = req.body.imageUrl;
    req.user.save();
    return res.redirect('/user-info');
}

//Tra cuu thong tin
exports.getLookup = (req, res, next) => {
    req.user.populate({ path: 'timeRecordingId' })
        .then(user => {
            let lstDayoff = []; //So ngay dang ky nghi
            let lstMapTime = [];

            //Lay so ngay nghi
            user.timeRecordingId.regAnnualleave.dayOff.forEach((value) => {
                if (value.days.length > 1) {
                    value.days.forEach(x => {
                        let temp = {
                            day: moment(x).format('YYYY-MM-DD'),
                            hour: 8,
                            info: {...value }
                        }
                        lstDayoff.push(temp);
                    })
                } else {
                    let temp;
                    if (value.numOfHours === 8) {
                        temp = {
                            day: moment(value.days[0]).format('YYYY-MM-DD'),
                            hour: 8,
                            info: {...value }
                        }
                    } else {
                        temp = {
                            day: moment(value.days[0]).format('YYYY-MM-DD'),
                            hour: value.numOfHours,
                            info: {...value }
                        }
                    }
                    lstDayoff.push(temp);
                }
            })

            //Lay so ngay trung vs ngay nghi
            let currentDay;
            let totalTimeInMonth = 0;
            let totalUpTimeInMonth = 0;
            let totalMissHour = 0;
            user.timeRecordingId.timeRecording.times.forEach(time => {
                if (currentDay === moment(time.startTime).format('YYYY-MM-DD')) {
                    return;
                } else {
                    let timeDay = {};
                    currentDay = moment(time.startTime).format('YYYY-MM-DD');
                    timeDay.timeReDay = currentDay;

                    lstDayoff.forEach((item, index) => {
                        if (currentDay === item.day) {
                            timeDay.annualInfo = item;
                            lstDayoff.splice(index, 1)
                        }
                    })
                    lstMapTime.push(timeDay);
                }
            })
            let table = [];
            //add info map annua with timeRecording
            lstMapTime.forEach(item => {
                let temp = {};
                temp.dayofMonth = item.timeReDay; // Ngay bat dau
                let tempArr = [];
                let totalTime = 0;
                let isWorking = false;
                let upTime = 0;
                let missHour = 0;
                user.timeRecordingId.timeRecording.times.forEach(i => {
                    let working = false;
                    if (item.timeReDay === moment(i.startTime).format('YYYY-MM-DD')) {

                        if (i.isLoading) {
                            working = true;
                        } else {
                            totalTime = totalTime + (i.workHours / 60);
                        }
                        tempArr.push(i);
                    }
                    isWorking = working;
                })
                if (isWorking) {
                    temp.totalTime = -1;
                    upTime = 0;
                } else {
                    totalTime = totalTime + (item.annualInfo ? item.annualInfo.hour : 0);
                    if (totalTime > 8) {
                        upTime = totalTime - 8;
                    } else {
                        upTime = 0;
                    }
                    temp.totalTime = totalTime;
                    totalTimeInMonth = totalTimeInMonth + totalTime;
                }
                if (totalTime < 8 && totalTime) {
                    missHour = 8 - totalTime;
                }
                totalMissHour = totalMissHour + missHour;
                temp.missHour = missHour;

                temp.upTime = upTime;
                temp.annualInfo = item.annualInfo ? item.annualInfo : '';
                temp.lstRecording = tempArr.sort((a, b) => moment(b.startTime) - moment(a.startTime));
                totalUpTimeInMonth = totalUpTimeInMonth + upTime;
                table.push(temp);
            })

            //Add Annual not map
            lstDayoff.forEach(i => {
                let temp = {};
                temp.dayofMonth = i.day;
                temp.missHour = 0;
                temp.upTime = 0;
                temp.totalTime = 0;
                temp.annualInfo = i;
                temp.lstRecording = [];
                totalTimeInMonth = totalTimeInMonth + 8;
                table.push(temp)
            })

            // 

            const info = {};
            info.table = table.sort((a, b) => moment(b.dayofMonth) - moment(a.dayofMonth));
            info.totalTimeInMonth = totalTimeInMonth;
            info.totalUpTimeInMonth = totalUpTimeInMonth;
            info.totalMissHour = totalMissHour;
            info.salaryMonth = req.user.salaryScale * 3000000 + (totalUpTimeInMonth - totalMissHour) * 200000



            return res.render('user/lookup', { info: info, moment: moment });
        })
        .catch(err => console.log(err));
}