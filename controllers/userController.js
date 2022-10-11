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
            let custom = {...user }
            custom.ddddddddddddddddddd = 'ddddddddddddddddddd';
            user.timeRecordingId.timeRecording.forEach((year, i) => {
                //Year
                year.yearItems.forEach((month, j) => {
                    //Month
                    let sumTimeInMonth = 0;
                    let sumTimeOffTemp = 0;
                    let sumTimeOffTempMain = 0; // tinh tam time nghi de tinh thoi gian nghi cua thang
                    month.monthItems.forEach((day, k) => {
                        //day
                        let sumTimeInDay = 0;
                        let note = {};
                        day.times.forEach(timeItem => {
                                sumTimeInDay += timeItem.workHours;
                                // day item
                            })
                            //Check Annual
                        if (month.regAnnualleave.dayOff.length > 0) {
                            month.regAnnualleave.dayOff.forEach(check => { //Loai tru ngay nghi de cong tong gio cua thang
                                sumTimeOffTemp += check.numOfHours;
                                sumTimeOffTempMain += check.numOfHours;
                                if (check.numOfHours <= 8 && parseInt(moment(check.days[0]).format('DD')) === day.day) {
                                    // exits ngay nghi theo time hoac 1 ngay
                                    sumTimeInDay += check.numOfHours;
                                    note.offHour = check.numOfHours;
                                    note.off = check;
                                    sumTimeOffTemp -= check.numOfHours
                                } else { //if (check.numOfHours > 8) {
                                    check.days.forEach(arrAnnulItem => {
                                        if (parseInt(moment(arrAnnulItem).format('DD')) === day.day) {
                                            sumTimeInDay += 8;
                                            note.offHour = 8;
                                            note.off = check;
                                            sumTimeOffTemp -= 8;
                                        }
                                    })
                                }
                            })
                        }
                        user.timeRecordingId.timeRecording[i].yearItems[j].monthItems[k].note = note;
                        user.timeRecordingId.timeRecording[i].yearItems[j].monthItems[k].sumTimeInDay = sumTimeInDay;
                        let upTimeInDay = 0;
                        let missTimeInDay = 0;
                        if (sumTimeInDay >= 480) // so gio lam lon hon so gio cua 1 ngay (8*60=480 doi ra phut)
                        {
                            upTimeInDay += sumTimeInDay - 480;
                        } else {
                            missTimeInDay += 480 - sumTimeInDay;
                        }
                        user.timeRecordingId.timeRecording[i].yearItems[j].monthItems[k].upTimeInDay = upTimeInDay;
                        user.timeRecordingId.timeRecording[i].yearItems[j].monthItems[k].missTimeInDay = missTimeInDay;
                        sumTimeInMonth += sumTimeInDay;
                    })
                    user.timeRecordingId.timeRecording[i].yearItems[j].sumOffMonthMain = sumTimeOffTempMain; //tong thoi gian nghi cua thang chua tru
                    user.timeRecordingId.timeRecording[i].yearItems[j].sumOffMonthSub = sumTimeOffTemp; //Tong time nghi cua thang da tru qua diem danh
                    user.timeRecordingId.timeRecording[i].yearItems[j].sumTimeInMonth = sumTimeInMonth; //Tong time lam cua thang
                    let str_yearMonth = `${year.year}-${month.month.toString().length===1?+'0'+month.month.toString(): month.month.toString()}`;
                    const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                    const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat

                    user.timeRecordingId.timeRecording[i].yearItems[j].numBusinessDay = numOfMonthTemp - weekendOfMonth; //So ngay duoc tinh cong trong thang
                    user.timeRecordingId.timeRecording[i].yearItems[j].weekendOfMonth = weekendOfMonth;
                    //Thoi gian tang ca cua thang
                    let upTimeInMonth = (((numOfMonthTemp - weekendOfMonth) * 8) - (sumTimeInMonth / 60)) >= 0 ? (((numOfMonthTemp - weekendOfMonth) * 8) - (sumTimeInMonth / 60)) : 0;
                    user.timeRecordingId.timeRecording[i].yearItems[j].upTimeInMonth = upTimeInMonth;
                    //Thoi gian thieu cua thang
                    let missTimeInMonth = ((sumTimeInMonth / 60) - ((numOfMonthTemp - weekendOfMonth) * 8)) >= 0 ? ((sumTimeInMonth / 60) - ((numOfMonthTemp - weekendOfMonth) * 8)) : 0;
                    user.timeRecordingId.timeRecording[i].yearItems[j].missTimeInMonth = missTimeInMonth;
                    //Lương tháng
                    let salary = req.user.salaryScale * 3000000 + (upTimeInMonth - missTimeInMonth) * 200000;
                    user.timeRecordingId.timeRecording[i].yearItems[j].salary = salary;
                })
            })

            console.log(JSON.stringify(user));
            console.log(custom._doc.timeRecordingId);
        })
        .catch(err => console.log(err));

}

exports.getTest = (req, res, next) => {
    // console.log('--------------------: ', numWeekendOfMonth('2022-10'));
    const a = 2;
    //console.log(a.toString().length)
    console.log(moment(`2022-${a.toString().length===1?+'0'+a.toString():a.toString()}`).daysInMonth())
}

function numWeekendOfMonth(monthYear) { //Return number (Sunday and Saturday)
    let firstDayOfMonth = moment(monthYear).startOf('month');
    let end = moment(monthYear).endOf('month');
    let temp = 0;
    while (firstDayOfMonth <= end) {
        if (firstDayOfMonth.format('dddd') === 'Sunday' || firstDayOfMonth.format('dddd') === 'Saturday') {
            temp++;
        }
        firstDayOfMonth.add(1, 'days');
    }
    return temp;
}