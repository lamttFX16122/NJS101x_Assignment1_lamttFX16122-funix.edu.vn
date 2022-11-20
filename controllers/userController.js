const User = require("../models/userModel");
const TimeRecording = require("../models/timeRecordingModel");
const Covid = require("../models/covidModel");
const moment = require("moment");

//get Thêm user
exports.getAddUser = (req, res, next) => {
    res.render("user/add-user", { title: "Thêm người dùng", name: req.user.name, isActive: 3 });
};
//Thêm User
exports.postAddUser = (req, res, next) => {
    const timeRecording = new TimeRecording({
        timeRecording: [],
        isWorking: false,
        previousTime: {}
    }); //setup timeRecording
    const covid = new Covid({
        hypothermia: [],
        vaccine: [],
        covid: [],
    }); //Setup Covid
    const user = new User({
        name: req.body.username,
        doB: req.body.doB,
        salaryScale: req.body.salaryScale,
        startDate: req.body.startDate,
        department: req.body.department,
        annualLeave: req.body.annualLeave * 8,
        imageUrl: req.body.imageUrl,
        timeRecordingId: timeRecording._id,
        covidId: covid._id,
    }); // setup user từ form
    timeRecording.userId = user._id;
    covid.userId = user._id;
    user
        .save()
        .then((result) => {
            return timeRecording.save();
        })
        .then((result) => {
            return covid.save();
        })
        .then(() => {
            return res.redirect("/");
        })
        .catch((err) => console.log(err));
};

//Thông tin cá nhân
exports.getUserInfo = (req, res, next) => {
    const user = req.user;
    return res.render("user/user-info", {
        user: user,
        moment: moment,
        parseHour: parseHour,
        title: "Thông tin cá nhân",
        name: req.user.name,
        isActive: 4,
    });
};
//Thay đổi hình ảnh
exports.postImage = (req, res, next) => {
    req.user.imageUrl = req.body.imageUrl;
    req.user.save();
    return res.redirect("/user-info");
};

//Tra cuu thong tin
exports.getLookup = (req, res, next) => {
    req.user
        .populate({ path: "timeRecordingId" }) // trả về timeRecording
        .then((user) => {
            let custom = { ...JSON.parse(JSON.stringify(user)) }; // custom thành mảng thay đổi được
            custom.timeRecordingId.timeRecording.forEach((year, i) => {
                //Year
                let totalAnnualOfYear = 0; //tong so ngay nghi cua nam
                year.yearItems.forEach((month, j) => {
                    //Month
                    let sumTimeInMonth = 0; // Time cong dồn trong tháng
                    let sumTimeOffTemp = 0; // Thời gian nghỉ cộng dồn và trừ đi thời gian nghỉ theo giờ để tính lương
                    let sumTimeOffTempMain = 0; // Tổng thời gian nghỉ trong tháng
                    let isSumOff = true; //Check có ngày nghỉ hay k
                    let isNotRecording = 0; // Nếu là ngày nghỉ trước ngày hiện tại thì isNotRecording=0
                    month.monthItems.forEach((day, k) => {
                        //day
                        let sumTimeInDay = 0; //tổng thời gian làm của ngày
                        let note = {};
                        day.times.forEach((timeItem) => {
                            sumTimeInDay += timeItem.workHours; // Cộng dồn thời gian của ngày
                            isNotRecording++; // => là ngày làm 
                        });
                        //Check Annual
                        if (month.regAnnualleave.dayOff.length > 0) {
                            month.regAnnualleave.dayOff.forEach((check) => {
                                //Loai tru ngay nghi de cong tong gio cua thang
                                sumTimeOffTemp += check.numOfHours;
                                if (isSumOff) {
                                    sumTimeOffTempMain += check.numOfHours;
                                }
                                if (check.numOfHours <= 8 &&
                                    parseInt(moment(check.days[0]).format("DD")) === day.day
                                ) {
                                    //Nghỉ theo gio
                                    sumTimeInDay += check.numOfHours * 60;
                                    note.offHour = check.numOfHours;
                                    note.off = check;
                                    sumTimeOffTemp -= check.numOfHours;
                                } else {
                                    check.days.forEach((arrAnnulItem) => {
                                        if (
                                            parseInt(moment(arrAnnulItem).format("DD")) === day.day
                                        ) {
                                            sumTimeInDay += 8; // Cộng vào thời gian làm 
                                            note.offHour = 8;
                                            note.off = check;
                                            sumTimeOffTemp -= 8;
                                        }
                                    });
                                }
                            });
                        }
                        day.note = note; // thông tin xem chi tiết nếu có ngày nghỉ
                        day.sumTimeInDay = sumTimeInDay;

                        let upTimeInDay = 0; // Thời gian tăng ca trong ngày (thời gian làm > 8 giờ)
                        let missTimeInDay = 0; // Thời gian thiếu trong ngày
                        if (sumTimeInDay >= 480) {
                            // so gio lam lon hon so gio cua 1 ngay (8*60=480 doi ra phut)
                            upTimeInDay += sumTimeInDay - 480;
                        } else {
                            missTimeInDay += 480 - sumTimeInDay;
                        }
                        day.upTimeInDay = upTimeInDay;
                        day.missTimeInDay = missTimeInDay;
                        sumTimeInMonth += sumTimeInDay;
                        day.times.sort((a, b) => {
                            return moment(b.startTime) - moment(a.startTime);
                        });
                        isSumOff = false;
                    });
                    month.isNotRecording = isNotRecording > 0 ? true : false;
                    month.sumOffMonthMain = sumTimeOffTempMain; //tong thoi gian nghi cua thang chua tru de cộng cho số ngày nghỉ của năm
                    month.sumOffMonthSub = sumTimeOffTemp; //Tong time nghi cua thang da tru qua diem danh
                    month.sumTimeInMonth = sumTimeInMonth; //Tong time lam cua thang

                    //Thay đổi định dạng cho ngày tháng... 1=>01 /// 
                    let str_yearMonth = `${year.year}-${month.month.toString().length === 1 ? +"0" + month.month.toString() : month.month.toString()}`;

                    const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang 2=>28 ngày
                    const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat của tháng

                    month.numBusinessDay = numOfMonthTemp - weekendOfMonth; //So ngay duoc tinh cong trong thang=this-(7, cn)
                    month.weekendOfMonth = weekendOfMonth;
                    //Thoi gian tang ca cua thang
                    let upTimeInMonth =
                        sumTimeInMonth - (numOfMonthTemp - weekendOfMonth) * 8 * 60 >= 0 ?
                            sumTimeInMonth - (numOfMonthTemp - weekendOfMonth) * 8 * 60 : 0;
                    month.upTimeInMonth = upTimeInMonth;
                    //Thoi gian thieu cua thang
                    let missTimeInMonth =
                        (numOfMonthTemp - weekendOfMonth) * 8 * 60 - sumTimeInMonth >= 0 ?
                            (numOfMonthTemp - weekendOfMonth) * 8 * 60 - sumTimeInMonth : 0;
                    month.missTimeInMonth = missTimeInMonth;
                    //Lương tháng
                    let salary = req.user.salaryScale * 3000000 + ((upTimeInMonth / 60) - (missTimeInMonth / 60)) * 200000;
                    if (moment() > moment(str_yearMonth).endOf("month")) {
                        month.salary = salary;
                    } else {
                        month.salary = "Chưa kết tháng";
                    }
                    totalAnnualOfYear += sumTimeOffTempMain; //tong so ngay nghi cua nam
                    month.monthItems.sort((a, b) => {
                        return b.day - a.day; //sắp xếp giảm dần theo ngày
                    });
                });
                year.yearItems.sort((a, b) => {
                    return b.month - a.month;
                });
                year.totalAnnualOfYear = totalAnnualOfYear;
            });

            return res.render("user/lookup", {
                data: custom,
                moment: moment,
                parseHour: parseHour,
                changeMoney: changeMoney,
                title: "Tra cứu thông tin",
                name: req.user.name,
                isActive: 5,
            });
        })
        .catch((err) => console.log(err));
};

//sử dụng cho Chọn xem lương tháng get từ Ajax
exports.getLookupAjax = (req, res, next) => {
    req.user
        .populate({ path: "timeRecordingId" })
        .then((user) => {
            let custom = { ...JSON.parse(JSON.stringify(user)) };
            custom.timeRecordingId.timeRecording.forEach((year, i) => {
                //Year
                let totalAnnualOfYear = 0;
                year.yearItems.forEach((month, j) => {
                    //Month
                    let sumTimeInMonth = 0; // Time cong dồn trong tháng
                    let sumTimeOffTemp = 0; // Thời gian nghỉ cộng dồn và trừ đi thời gian nghỉ theo giờ để tính lương
                    let sumTimeOffTempMain = 0; // Tổng thời gian nghỉ trong tháng
                    let isSumOff = true;
                    let isNotRecording = 0;
                    month.monthItems.forEach((day, k) => {
                        //day
                        let sumTimeInDay = 0;
                        let note = {};
                        day.times.forEach((timeItem) => {
                            sumTimeInDay += timeItem.workHours;
                            isNotRecording++;
                        });
                        //Check Annual
                        if (month.regAnnualleave.dayOff.length > 0) {
                            month.regAnnualleave.dayOff.forEach((check) => {
                                //Loai tru ngay nghi de cong tong gio cua thang
                                sumTimeOffTemp += check.numOfHours;
                                if (isSumOff) {
                                    sumTimeOffTempMain += check.numOfHours;
                                }
                                // sumTimeOffTempMain += check.numOfHours;
                                if (
                                    check.numOfHours <= 8 &&
                                    parseInt(moment(check.days[0]).format("DD")) === day.day
                                ) {
                                    // exits ngay nghi theo time hoac 1 ngay
                                    sumTimeInDay += check.numOfHours * 60;
                                    note.offHour = check.numOfHours;
                                    note.off = check;
                                    sumTimeOffTemp -= check.numOfHours;
                                } else {
                                    //if (check.numOfHours > 8) {
                                    check.days.forEach((arrAnnulItem) => {
                                        if (
                                            parseInt(moment(arrAnnulItem).format("DD")) === day.day
                                        ) {
                                            sumTimeInDay += 8;
                                            note.offHour = 8;
                                            note.off = check;
                                            sumTimeOffTemp -= 8;
                                        }
                                    });
                                }
                            });
                        }
                        day.note = note;
                        day.sumTimeInDay = sumTimeInDay;

                        let upTimeInDay = 0;
                        let missTimeInDay = 0;
                        if (sumTimeInDay >= 480) {
                            // so gio lam lon hon so gio cua 1 ngay (8*60=480 doi ra phut)
                            upTimeInDay += sumTimeInDay - 480;
                        } else {
                            missTimeInDay += 480 - sumTimeInDay;
                        }
                        day.upTimeInDay = upTimeInDay;
                        day.missTimeInDay = missTimeInDay;
                        sumTimeInMonth += sumTimeInDay;
                        day.times.sort((a, b) => {
                            return moment(b.startTime) - moment(a.startTime);
                        });
                        isSumOff = false;
                    });
                    month.isNotRecording = isNotRecording > 0 ? true : false;
                    month.sumOffMonthMain = sumTimeOffTempMain; //tong thoi gian nghi cua thang chua tru
                    month.sumOffMonthSub = sumTimeOffTemp; //Tong time nghi cua thang da tru qua diem danh
                    month.sumTimeInMonth = sumTimeInMonth; //Tong time lam cua thang
                    let str_yearMonth = `${year.year}-${month.month.toString().length === 1
                            ? +"0" + month.month.toString()
                            : month.month.toString()
                        }`;
                    const numOfMonthTemp = moment(str_yearMonth).daysInMonth(); // so ngay cua thang
                    const weekendOfMonth = numWeekendOfMonth(str_yearMonth); // so ngay thu 7 va chu nhat

                    month.numBusinessDay = numOfMonthTemp - weekendOfMonth; //So ngay duoc tinh cong trong thang
                    month.weekendOfMonth = weekendOfMonth;
                    //Thoi gian tang ca cua thang
                    let upTimeInMonth =
                        sumTimeInMonth - (numOfMonthTemp - weekendOfMonth) * 8 * 60 >= 0 ?
                            sumTimeInMonth - (numOfMonthTemp - weekendOfMonth) * 8 * 60 :
                            0;
                    month.upTimeInMonth = upTimeInMonth;
                    //Thoi gian thieu cua thang
                    let missTimeInMonth =
                        (numOfMonthTemp - weekendOfMonth) * 8 * 60 - sumTimeInMonth >= 0 ?
                            (numOfMonthTemp - weekendOfMonth) * 8 * 60 - sumTimeInMonth :
                            0;
                    month.missTimeInMonth = missTimeInMonth;
                    //Lương tháng

                    let salary = req.user.salaryScale * 3000000 + ((upTimeInMonth / 60) - (missTimeInMonth / 60)) * 200000;
                    if (moment() > moment(str_yearMonth).endOf("month")) {
                        month.salary = salary;
                    } else {
                        month.salary = "Chưa kết tháng";
                    }
                    totalAnnualOfYear += sumTimeOffTempMain;
                    month.monthItems.sort((a, b) => {
                        return b.day - a.day;
                    });
                });
                year.yearItems.sort((a, b) => {
                    return b.month - a.month;
                });
                year.totalAnnualOfYear = totalAnnualOfYear;
            });
            return res.send(custom);
        })
        .catch((err) => console.log(err));
};

// Insert data phiên làm việc
exports.getTest = async (req, res, next) => {
    const arr = ['15:00', '14:00', '16:00', '16:30', '14:30']; // Random giờ end khác nhau 
    for (let g = 1; g < 10; g++) {
        let monthYear = `2022-0${g}`; // Nối chuổi tháng tăng dần 1=>9

        let firstDayOfMonth = moment(monthYear).startOf("month"); //ngày đâu tiên của tháng
        let end = moment(monthYear).endOf("month"); //Ngày cuối cùng của tháng

        while (firstDayOfMonth <= end) {
            const workPlace = 'Công ty';
            await TimeRecording.findById(req.user.timeRecordingId)
                .then((t) => {
                    if (
                        firstDayOfMonth.format("dddd") != "Sunday" &&
                        firstDayOfMonth.format("dddd") != "Saturday"
                    ) {
                        let a = moment(firstDayOfMonth.format('YYYY-MM-DD') + ' ' + '07:00'); //Mặc đinh bắt đầu lúc 7h
                        let b = moment(firstDayOfMonth.format('YYYY-MM-DD') + ' ' + arr[Math.floor(Math.random() * arr.length)]); // Giờ kết thúc Random

                        let item = {};
                        const indexYears = t.timeRecording.findIndex((x) => {
                            return x.year === parseInt(firstDayOfMonth.format("YYYY"));
                        });
                        const indexMonth = t.timeRecording[indexYears].yearItems.findIndex((y) => {
                            return y.month === parseInt(firstDayOfMonth.format("MM"));
                        });
                        const indexDay = t.timeRecording[indexYears].yearItems[
                            indexMonth
                        ].monthItems.findIndex((z) => {
                            return z.day === parseInt(firstDayOfMonth.format("DD"));
                        });

                        item.startTime = a.format();
                        item.workPlace = workPlace;
                        item.isLoading = false;
                        item.endTime = b.format();
                        item.workHours = b.diff(a, "minutes")
                        let times = [
                            ...t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                                indexDay
                            ].times,
                        ];
                        times.push(item);
                        t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                            indexDay
                        ].times = times;
                        console.log('OK')
                        return t.save();
                    }
                })
                .catch((err) => console.log(err));

            firstDayOfMonth.add(1, "days"); //tăng ngày lên
        }
    }
};


// Insert khung ngày tháng
exports.getTestSetUp = async (req, res, next) => {
    for (let g = 1; g < 10; g++) {
        let monthYear = `2022-0${g}`;
        let firstDayOfMonth = moment(monthYear).startOf("month");
        let end = moment(monthYear).endOf("month");

        while (firstDayOfMonth <= end) {

            await TimeRecording.findById(req.user.timeRecordingId)
                .then((t) => {
                    if (
                        firstDayOfMonth.format("dddd") != "Sunday" &&
                        firstDayOfMonth.format("dddd") != "Saturday"
                    ) {
                        console.log('DD: ', firstDayOfMonth.format("DD"), '==', firstDayOfMonth.format("MM"))
                        let item = {};
                        if (t.timeRecording.length === 0) {
                            // Trường hợp first index //
                            item.year = parseInt(firstDayOfMonth.format("YYYY"));
                            item.yearItems = [{
                                month: parseInt(firstDayOfMonth.format("MM")),
                                monthItems: [{
                                    day: parseInt(firstDayOfMonth.format("DD")),
                                    times: [],
                                },],
                            },];

                            let timeRecording = [...t.timeRecording];
                            timeRecording.push(item);
                            t.timeRecording = timeRecording;
                            return t.save();
                        } else {
                            // Trường hợp new year
                            let indexYears = t.timeRecording.findIndex(
                                (x) => x.year === parseInt(firstDayOfMonth.format("YYYY"))
                            );

                            if (indexYears < 0) {
                                item.year = parseInt(firstDayOfMonth.format("YYYY"));
                                item.yearItems = [{
                                    month: parseInt(firstDayOfMonth.format("MM")),
                                    monthItems: [{
                                        day: parseInt(firstDayOfMonth.format("DD")),
                                        times: [],
                                    },],
                                },];
                                let timeRecording = [...t.timeRecording];
                                timeRecording.push(item);
                                t.timeRecording = timeRecording;
                                return t.save();
                            } else {
                                const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                                    (y) => {
                                        return y.month === parseInt(firstDayOfMonth.format("MM"));
                                    }
                                );
                                if (indexMonth < 0) {
                                    // Trường hợp New Month
                                    item.month = parseInt(firstDayOfMonth.format("MM"));
                                    item.monthItems = [{
                                        day: parseInt(firstDayOfMonth.format("DD")),
                                        times: [],
                                    },];
                                    let yearItems = [...t.timeRecording[indexYears].yearItems];
                                    yearItems.push(item);
                                    t.timeRecording[indexYears].yearItems = yearItems;
                                    return t.save();
                                } else {
                                    //Trường hợp New Day
                                    const indexDay = t.timeRecording[indexYears].yearItems[
                                        indexMonth
                                    ].monthItems.findIndex((z) => {
                                        return z.day === parseInt(firstDayOfMonth.format("DD"));
                                    });
                                    if (indexDay < 0) {
                                        item.day = parseInt(firstDayOfMonth.format("DD"));
                                        item.times = [];
                                        let day = [
                                            ...t.timeRecording[indexYears].yearItems[indexMonth].monthItems,
                                        ];
                                        day.push(item);
                                        t.timeRecording[indexYears].yearItems[indexMonth].monthItems =
                                            day;
                                        return t.save();
                                    } else {
                                        return t;
                                    }
                                }
                            }
                        }
                    }
                }).then(a => {
                    // console.log(a)
                    //  next()
                })
                .catch(err => console.log(err))

            //}
            firstDayOfMonth.add(1, "days");
            // console.log(firstDayOfMonth, '===', firstDayOfMonth.format("dddd"))

        }
    }
};

//Func số ngày nghỉ của tháng... trả về tổng số ngày thứ 7 và chủ nhật của tháng
function numWeekendOfMonth(monthYear) {
    let firstDayOfMonth = moment(monthYear).startOf("month");
    let end = moment(monthYear).endOf("month");
    let temp = 0;
    while (firstDayOfMonth <= end) {
        if (
            firstDayOfMonth.format("dddd") === "Sunday" ||
            firstDayOfMonth.format("dddd") === "Saturday"
        ) {
            temp++;
        }
        firstDayOfMonth.add(1, "days");
    }
    return temp;
}

//Chuyen doi thoi gian phut=> gio (type==0)|| gio=> ngày ((type==1))
function parseHour(hour, type) {
    let result = "";
    if (type === 0) {
        if (hour === 0) {
            result += hour + " phút";
        } else {
            if (parseInt(hour / 60) > 0) {
                result += parseInt(hour / 60).toString() + " giờ ";
            }
            if (parseInt(hour % 60) > 0) {
                result += parseInt(hour % 60).toString() + " phút";
            }
        }
    } else {
        if (hour === 0) {
            result += hour + " giờ";
        }
        if (parseInt(hour / 8) > 0) {
            result += parseInt(hour / 8).toString() + " ngày ";
        }
        if (parseInt(hour % 8) > 0) {
            result += parseInt(hour % 8).toString() + " giờ ";
        }
    }
    return result;
}

//Func trả về lương theo định dạng tiền VNĐ=> 7.000.000
function changeMoney(money) {
    let x = '';
    if (typeof (money) == 'number') {
        money = money.toString();
        let mod = parseInt(money.length) % 3; // 1
        let sub = parseInt(money.length) / 3; // 2

        if (money.length > 3) {
            if (mod > 0) {
                x += money.substr(0, mod);
                for (let i = 1; i <= sub; i++) {
                    x += '.' + money.substr(mod, 3)
                    mod += 3;
                }
                x += ' VNĐ'
            } else {
                for (let i = 1; i <= sub; i++) {
                    if (i == 1) {
                        x += money.substr(mod, mod + 3)
                        mod += 3;
                    } else {
                        x += '.' + money.substr(mod, 3)
                        mod += 2;
                    }

                }
                x += ' VNĐ'
            }
        } else {
            x += money + ' VNĐ';
        }
    } else {
        x += money;
    }
    return x.trim();
}