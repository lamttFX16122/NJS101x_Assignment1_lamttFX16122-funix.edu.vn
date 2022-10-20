const User = require('../models/userModel');
const TimeRecording = require('../models/timeRecordingModel');
const Covid = require('../models/covidModel');
const moment = require('moment');

exports.getAddUser = (req, res, next) => {
    res.render('user/add-user', { title: 'Thêm người dùng', isActive: 3 });
}

exports.postAddUser = (req, res, next) => {
    const timeRecording = new TimeRecording({
        timeRecording: [],
        isWorking: false
    })
    const covid = new Covid({
        hypothermia: [],
        vaccine: [],
        covid: []
    })
    const user = new User({
        name: req.body.username,
        doB: req.body.doB,
        salaryScale: req.body.salaryScale,
        startDate: req.body.startDate,
        department: req.body.department,
        annualLeave: req.body.annualLeave * 8,
        imageUrl: req.body.imageUrl,
        timeRecordingId: timeRecording._id,
        covidId: covid._id
    })
    console.log(covid)
    console.log(user)
    timeRecording.userId = user._id;
    covid.userId = user._id;
    user.save()
        .then(result => {
            return timeRecording.save();
        })
        .then(result => {
            return covid.save();
        })
        .then(() => {
            return res.redirect('/');
        })
        .catch(err => console.log(err))
}

exports.getUserInfo = (req, res, next) => {
    const user = req.user;
    return res.render('user/user-info', { user: user, moment: moment, parseHour: parseHour, title: 'Thông tin cá nhân', isActive: 4 });
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
            let custom = {...JSON.parse(JSON.stringify(user)) }
            custom.timeRecordingId.timeRecording.forEach((year, i) => {
                //Year
                let totalAnnualOfYear = 0;
                year.yearItems.forEach((month, j) => {
                    //Month
                    let sumTimeInMonth = 0; // Time cong dồn trong tháng
                    let sumTimeOffTemp = 0; // Thời gian nghỉ cộng dồn và trừ đi thời gian nghỉ theo giờ để tính lương
                    let sumTimeOffTempMain = 0; // Tổng thời gian nghỉ trong tháng
                    let isSumOff = true;
                    let isNotRecording = true;
                    month.monthItems.forEach((day, k) => {
                        //day
                        let sumTimeInDay = 0;
                        let note = {};
                        if (!day.times.length > 0) {
                            isNotRecording = false;
                        }
                        day.times.forEach(timeItem => {
                                sumTimeInDay += timeItem.workHours;
                            })
                            //Check Annual
                        if (month.regAnnualleave.dayOff.length > 0) {
                            month.regAnnualleave.dayOff.forEach(check => { //Loai tru ngay nghi de cong tong gio cua thang
                                sumTimeOffTemp += check.numOfHours;
                                if (isSumOff) {
                                    sumTimeOffTempMain += check.numOfHours;
                                }
                                // sumTimeOffTempMain += check.numOfHours;
                                if (check.numOfHours <= 8 && parseInt(moment(check.days[0]).format('DD')) === day.day) {
                                    // exits ngay nghi theo time hoac 1 ngay
                                    sumTimeInDay += check.numOfHours * 60;
                                    note.offHour = check.numOfHours;
                                    note.off = check;
                                    sumTimeOffTemp -= check.numOfHours;
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
                        day.note = note;
                        day.sumTimeInDay = sumTimeInDay;

                        let upTimeInDay = 0;
                        let missTimeInDay = 0;
                        if (sumTimeInDay >= 480) // so gio lam lon hon so gio cua 1 ngay (8*60=480 doi ra phut)
                        {
                            upTimeInDay += sumTimeInDay - 480;
                        } else {
                            missTimeInDay += 480 - sumTimeInDay;
                        }
                        day.upTimeInDay = upTimeInDay;
                        day.missTimeInDay = missTimeInDay;
                        sumTimeInMonth += sumTimeInDay;
                        day.times.sort((a, b) => {
                            return moment(b.startTime) - moment(a.startTime);
                        })
                        isSumOff = false;
                    })
                    month.isNotRecording = isNotRecording;
                    month.sumOffMonthMain = sumTimeOffTempMain; //tong thoi gian nghi cua thang chua tru
                    month.sumOffMonthSub = sumTimeOffTemp; //Tong time nghi cua thang da tru qua diem danh
                    month.sumTimeInMonth = sumTimeInMonth; //Tong time lam cua thang
                    let str_yearMonth = `${year.year}-${month.month.toString().length===1?+'0'+month.month.toString(): month.month.toString()}`;
                    const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                    const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat

                    month.numBusinessDay = numOfMonthTemp - weekendOfMonth; //So ngay duoc tinh cong trong thang
                    month.weekendOfMonth = weekendOfMonth;
                    //Thoi gian tang ca cua thang
                    let upTimeInMonth = (sumTimeInMonth - ((numOfMonthTemp - weekendOfMonth) * 8) * 60) >= 0 ? sumTimeInMonth - ((numOfMonthTemp - weekendOfMonth) * 8) * 60 : 0;
                    month.upTimeInMonth = upTimeInMonth;
                    //Thoi gian thieu cua thang
                    let missTimeInMonth = (((numOfMonthTemp - weekendOfMonth) * 8) * 60 - sumTimeInMonth) >= 0 ? (((numOfMonthTemp - weekendOfMonth) * 8) * 60 - sumTimeInMonth) : 0;
                    month.missTimeInMonth = missTimeInMonth;
                    //Lương tháng
                    let salary = req.user.salaryScale * 3000000 + (upTimeInMonth - missTimeInMonth) * 200000;
                    if (moment() > moment(str_yearMonth).endOf('month')) {
                        month.salary = salary;
                    } else {
                        month.salary = "Chưa kết tháng";
                    }
                    totalAnnualOfYear += sumTimeOffTempMain;
                    month.monthItems.sort((a, b) => {
                        return b.day - a.day;
                    })
                })
                year.yearItems.sort((a, b) => {
                    return b.month - a.month;
                })
                year.totalAnnualOfYear = totalAnnualOfYear;
            })

            //  console.log(JSON.stringify(custom));


            return res.render('user/lookup', { data: custom, moment: moment, parseHour: parseHour, title: 'Tra cứu thông tin', isActive: 5 })
        })
        .catch(err => console.log(err));

}

exports.getTest = (req, res, next) => {
    const id = '634fcfcb470f4935c0fcec1c';
    const start = '2022-10-21';

    TimeRecording.updateOne({
            _id: req.user.timeRecordingId //,
                // 'timeRecording.$.year': parseInt(moment(start).format('YYYY')),
                // 'timeRecording.$.yearItems.$.month': parseInt(moment(start).format('MM')),
        }, { $pull: { 'timeRecording.$.yearItems.$.regAnnualleave.dayOff': { _id: id } } }, { new: true })
        .then(result => {
            console.log(result)
                //  res.redirect('/info-covid');
        })
        .catch(err => console.log(err));
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

function parseHour(hour, type) {
    let result = '';
    //minutes to hour
    if (type === 0) {
        if (hour === 0) {
            result += hour + ' phút';
        } else {
            if (parseInt(hour / 60) > 0) {
                result += parseInt(hour / 60).toString() + ' giờ '
            }
            if (parseInt(hour % 60) > 0) {
                result += parseInt(hour % 60).toString() + ' phút'
            }
        }
    } else {
        if (hour === 0) {
            result += hour + ' giờ';
        }
        if (parseInt(hour / 8) > 0) {
            result += parseInt(hour / 8).toString() + ' ngày ';
        }
        if (parseInt(hour % 8) > 0) {
            result += parseInt(hour % 8).toString() + ' giờ ';
        }
        // result = hour / 8 > 0 ? parseInt(hour / 8).toString() + ' ngày' : '' + (hour % 8) > 0 ? (hour / 8).toString() + ' giờ' : '';
    }
    return result;
}