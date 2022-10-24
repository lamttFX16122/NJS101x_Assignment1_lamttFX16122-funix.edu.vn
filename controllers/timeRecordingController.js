const TimeRecording = require("../models/timeRecordingModel");
const moment = require("moment");

//Man hinh cham cong
exports.getTimeRecording = (req, res, next) => {
    TimeRecording.findById(req.user.timeRecordingId)
        .then((t) => {
            let item = {};
            //Xu ly chưa endTime khi sang ngày làm việc mới... Time gáng là 1h
            if (t.isWorking) {
                const prevTime =
                    t.timeRecording[parseInt(t.previousTime.timeRecording)].yearItems[
                        parseInt(t.previousTime.yearItems)
                    ].monthItems[parseInt(t.previousTime.monthItems)].times[
                        parseInt(t.previousTime.times)
                    ].startTime;
                if (
                    moment(prevTime).format("YYYY-MM-DD") !==
                    moment().format("YYYY-MM-DD")
                ) {
                    t.isWorking = false;

                    t.timeRecording[parseInt(t.previousTime.timeRecording)].yearItems[
                        parseInt(t.previousTime.yearItems)
                    ].monthItems[parseInt(t.previousTime.monthItems)].times[
                        parseInt(t.previousTime.times)
                    ].isLoading = false;

                    let a = moment(prevTime);
                    let b = moment(a).add(1, "hours");

                    t.timeRecording[parseInt(t.previousTime.timeRecording)].yearItems[
                        parseInt(t.previousTime.yearItems)
                    ].monthItems[parseInt(t.previousTime.monthItems)].times[
                        parseInt(t.previousTime.times)
                    ].endTime = a.format();

                    t.timeRecording[parseInt(t.previousTime.timeRecording)].yearItems[
                        parseInt(t.previousTime.yearItems)
                    ].monthItems[parseInt(t.previousTime.monthItems)].times[
                        parseInt(t.previousTime.times)
                    ].workHours = b.diff(a, "minutes");
                    t.previousTime = {};

                    return t.save();
                }
            }
            if (t.timeRecording.length === 0) {
                // Trường hợp first index //
                item.year = parseInt(moment().format("YYYY"));
                item.yearItems = [{
                    month: parseInt(moment().format("MM")),
                    monthItems: [{
                        day: parseInt(moment().format("DD")),
                        times: [],
                    }, ],
                }, ];

                let timeRecording = [...t.timeRecording];
                timeRecording.push(item);
                t.timeRecording = timeRecording;
                return t.save();
            } else {
                // Trường hợp new year
                let indexYears = t.timeRecording.findIndex(
                    (x) => x.year === parseInt(moment().format("YYYY"))
                );

                if (indexYears < 0) {
                    item.year = parseInt(moment().format("YYYY"));
                    item.yearItems = [{
                        month: parseInt(moment().format("MM")),
                        monthItems: [{
                            day: parseInt(moment().format("DD")),
                            times: [],
                        }, ],
                    }, ];
                    let timeRecording = [...t.timeRecording];
                    timeRecording.push(item);
                    t.timeRecording = timeRecording;
                    return t.save();
                } else {
                    const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                        (y) => {
                            return y.month === parseInt(moment().format("MM"));
                        }
                    );
                    if (indexMonth < 0) {
                        // Trường hợp New Month
                        item.month = parseInt(moment().format("MM"));
                        item.monthItems = [{
                            day: parseInt(moment().format("DD")),
                            times: [],
                        }, ];
                        let yearItems = [...t.timeRecording[indexYears].yearItems];
                        yearItems.push(item);
                        t.timeRecording[indexYears].yearItems = yearItems;
                        return t.save();
                    } else {
                        //Trường hợp New Day
                        const indexDay = t.timeRecording[indexYears].yearItems[
                            indexMonth
                        ].monthItems.findIndex((z) => {
                            return z.day === parseInt(moment().format("DD"));
                        });
                        if (indexDay < 0) {
                            item.day = parseInt(moment().format("DD"));
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
        })

    .then((t) => {
            TimeRecording.findById(req.user.timeRecordingId).then((t) => {
                let startTime = ""; // Nếu đã bắt đầu thì lưu thời gian bắt đầu
                const indexYears = t.timeRecording.findIndex((x) => {
                    return x.year === parseInt(moment().format("YYYY")); //index năm hiện tại
                });
                const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                    (y) => {
                        return y.month === parseInt(moment().format("MM")); // index tháng hiện tại
                    }
                );
                const indexDay = t.timeRecording[indexYears].yearItems[
                    indexMonth
                ].monthItems.findIndex((z) => {
                    return z.day === parseInt(moment().format("DD")); //index ngày hiện tại
                });

                const startTimeIndex = t.timeRecording[indexYears].yearItems[
                    indexMonth
                ].monthItems[indexDay].times.findIndex((r) => {
                    return r.isLoading === true;
                }); // index của phiên đang làm việc

                if (startTimeIndex >= 0) {
                    startTime = `Bắt đầu lúc: ${moment(
            t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
              indexDay
            ].times[startTimeIndex].startTime
          ).format("HH:mm")} - ${moment(
            t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
              indexDay
            ].times[startTimeIndex].startTime
          ).format("DD/MM/YYYY")}`;
                }

                return res.render("time_recording/time-recording", {
                    moment: moment,
                    TimeRecording: t,
                    listInDay: t.timeRecording[indexYears].yearItems[
                        indexMonth
                    ].monthItems[indexDay].times.sort((a, b) => {
                        return moment(b.startTime) - moment(a.startTime);
                    }),
                    startTime: startTime,
                    parseHour: parseHour,
                    title: "Chấm công",
                    name: req.user.name,
                    isActive: 1,
                });
            });
        })
        .catch((err) => console.log(err));
};

//Form bat dau cham cong
exports.getStartTime = (req, res, next) => {
    console.log(req.user.name);
    res.render("time_recording/start-time", {
        name: req.user.name,
        title: "Nơi làm việc",
    });
};

exports.postStartTime = (req, res, next) => {
    const id = req.user.timeRecordingId;
    const workPlace = req.body.workplace;
    let address = {}; // biến lưu thông tin index arr các cấp trong lúc bắt đầu một phiên làm việc
    TimeRecording.findById(id)
        .then((t) => {
            let item = {};
            const indexYears = t.timeRecording.findIndex((x) => {
                return x.year === parseInt(moment().format("YYYY"));
            });
            const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                (y) => {
                    return y.month === parseInt(moment().format("MM"));
                }
            );
            const indexDay = t.timeRecording[indexYears].yearItems[
                indexMonth
            ].monthItems.findIndex((z) => {
                return z.day === parseInt(moment().format("DD"));
            });

            item.startTime = moment().format();
            item.workPlace = workPlace;
            item.isLoading = true;

            let times = [
                ...t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                    indexDay
                ].times,
            ];
            times.push(item);
            t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                indexDay
            ].times = times;
            address.timeRecording = indexYears;
            address.yearItems = indexMonth;
            address.monthItems = indexDay;
            address.times = times.length - 1;
            t.isWorking = !t.isWorking;
            t.previousTime = address;
            return t.save();
        })
        .then(() => {
            return res.redirect("/time-recording");
        })
        .catch((err) => console.log(err));
};
// End time
exports.postEndTime = (req, res, next) => {
    TimeRecording.findById(req.user.timeRecordingId)
        .then((t) => {
            const indexYears = t.timeRecording.findIndex((x) => {
                return x.year === parseInt(moment().format("YYYY"));
            });
            const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                (y) => {
                    return y.month === parseInt(moment().format("MM"));
                }
            );
            const indexDay = t.timeRecording[indexYears].yearItems[
                indexMonth
            ].monthItems.findIndex((z) => {
                return z.day === parseInt(moment().format("DD"));
            });

            const timesIndex = t.timeRecording[indexYears].yearItems[
                indexMonth
            ].monthItems[indexDay].times.findIndex((x) => {
                return x.isLoading === true;
            });

            const endtime = moment();
            t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                indexDay
            ].times[timesIndex].endTime = endtime.format();
            t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                indexDay
            ].times[timesIndex].isLoading = false;
            t.timeRecording[indexYears].yearItems[indexMonth].monthItems[
                indexDay
            ].times[timesIndex].workHours = endtime.diff(
                moment(
                    t.timeRecording[indexYears].yearItems[indexMonth].monthItems[indexDay]
                    .times[timesIndex].startTime
                ),
                "minutes"
            );
            t.isWorking = !t.isWorking;
            t.previousTime = {};
            return t.save();
        })
        .then((resultSave) => {
            return res.redirect("/time-recording");
        })
        .catch((err) => console.log(err));
};
//AnnualLeave
exports.getAnnualLeave = (req, res, next) => {
    TimeRecording.findById(req.user.timeRecordingId)
        .then((t) => {
            let totalAnnual = 0; //Tong time nghi
            let remainingAnnual = req.user.annualLeave; //Số ngày nghỉ còn lại
            //In Year
            const indexYears = t.timeRecording.findIndex((x) => {
                return x.year === parseInt(moment().format("YYYY"));
            });
            // Tong time nghi
            t.timeRecording[indexYears].yearItems.forEach((x) => {
                x.regAnnualleave.dayOff.forEach((i) => {
                    totalAnnual += i.numOfHours; // Thời gian nghỉ theo giờ
                });
            });

            res.render("time_recording/annualLeave", {
                moment: moment,
                annualLeave: t.timeRecording[indexYears],
                totalAnnual: totalAnnual,
                remainingAnnual: remainingAnnual,
                parseHour: parseHour,
                title: "Đăng ký nghỉ phép",
                name: req.user.name,
                isActive: 2,
            });
        })
        .catch((err) => console.log(err));
};
exports.postAnnualLeave = (req, res, next) => {
    let currentnumDay = req.user.annualLeave; // Số ngày nghỉ hiện tại
    const id = req.body.txt_id_annual;
    const start = moment(req.body.startDate).format("YYYY-MM-DD"); //Tu ngay
    const end = moment(req.body.endDate).format("YYYY-MM-DD"); //Den ngay
    const hour = parseInt(req.body.numhours); //So gio
    let totalRes = 0; //Tong so gio dang ky nghi
    let totalOldRes = 0; //Tong so gio nghi đã đăng ký... phục vụ cho cập nhật
    TimeRecording.findById(req.user.timeRecordingId)
        .then((t) => {
            let item = {};
            if (t.timeRecording.length === 0) {
                // Trường hợp first index //
                item.year = parseInt(moment(start).format("YYYY"));
                item.yearItems = [{
                    month: parseInt(moment(start).format("MM")),
                    monthItems: [{
                        day: parseInt(moment(start).format("DD")),
                        times: [],
                    }, ],
                }, ];

                let timeRecording = [...t.timeRecording];
                timeRecording.push(item);
                t.timeRecording = timeRecording;
                return t.save();
            } else {
                // Trường hợp new year
                let indexYears = t.timeRecording.findIndex(
                    (x) => x.year === parseInt(moment(start).format("YYYY"))
                );

                if (indexYears < 0) {
                    item.year = parseInt(moment(start).format("YYYY"));
                    item.yearItems = [{
                        month: parseInt(moment(start).format("MM")),
                        monthItems: [{
                            day: parseInt(moment(start).format("DD")),
                            times: [],
                        }, ],
                        regAnnualleave: {
                            dayOff: [],
                        },
                    }, ];
                    let timeRecording = [...t.timeRecording];
                    timeRecording.push(item);
                    t.timeRecording = timeRecording;
                    return t.save();
                } else {
                    const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                        (y) => {
                            return y.month === parseInt(moment(start).format("MM"));
                        }
                    );
                    if (indexMonth < 0) {
                        // Trường hợp New Month
                        item.month = parseInt(moment(start).format("MM"));
                        item.monthItems = [{
                            day: parseInt(moment(start).format("DD")),
                            times: [],
                        }, ];
                        item.regAnnualleave = {
                            dayOff: [],
                        };
                        let yearItems = [...t.timeRecording[indexYears].yearItems];
                        yearItems.push(item);
                        t.timeRecording[indexYears].yearItems = yearItems;
                        return t.save();
                    } else {
                        return t;
                    }
                }
            }
        })
        .then((result) => {
            TimeRecording.findById(req.user.timeRecordingId)
                .then((t) => {
                    const indexYears = t.timeRecording.findIndex((x) => {
                        return x.year === parseInt(moment(start).format("YYYY"));
                    });
                    const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
                        (y) => {
                            return y.month === parseInt(moment(start).format("MM"));
                        }
                    );

                    if (!id) { // Nếu k có id => tao moi
                        const checkBetween = t.timeRecording[indexYears].yearItems[
                            indexMonth
                        ].regAnnualleave.dayOff.findIndex((item) => {
                            return (
                                (start === item.startDay && end === item.endDay) ||
                                moment(start).isBetween(item.startDay, item.endDay) ||
                                moment(end).isBetween(item.startDay, item.endDay) ||
                                start === item.startDay ||
                                start === item.endDay ||
                                end === item.startDay ||
                                end === item.endDay
                            );
                            //Check thời gian có trùng lắp với khoảng time đã đăng ký hay chưa??
                        });
                        if (checkBetween >= 0) {
                            throw new Error(
                                "Khoảng thời gian nghỉ trùng với khoảng thời gian đã đăng ký"
                            );
                        } else {
                            let updateAnnual = [
                                ...t.timeRecording[indexYears].yearItems[indexMonth]
                                .regAnnualleave.dayOff,
                            ];

                            if (start !== end) {
                                totalRes = (moment(end).diff(moment(start), "days") + 1) * 8;
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
                                    days: getRangeOfDates(moment(start), moment(end), "day"),
                                };
                                updateAnnual.push(dayOff);
                                t.timeRecording[indexYears].yearItems[
                                    indexMonth
                                ].regAnnualleave.dayOff = updateAnnual;
                                return t.save();
                            } else {
                                throw new Error(
                                    "Thời gian đăng ký vượt quá thời gian nghỉ còn lại!"
                                );
                            }
                        }
                    } else {
                        let arr = JSON.parse(
                            JSON.stringify([
                                ...t.timeRecording[indexYears].yearItems[indexMonth]
                                .regAnnualleave.dayOff,
                            ])
                        );
                        let indexOld = arr.findIndex((a) => a._id == id);
                        totalOldRes = arr[indexOld].numOfHours; // Ngay nghi cu

                        arr.splice(
                            arr.findIndex((a) => a._id == id),
                            1
                        );

                        const checkBetween = arr.findIndex((item) => {
                            return (
                                (start === item.startDay && end === item.endDay) ||
                                moment(start).isBetween(item.startDay, item.endDay) ||
                                moment(end).isBetween(item.startDay, item.endDay) ||
                                start === item.startDay ||
                                start === item.endDay ||
                                end === item.startDay ||
                                end === item.endDay
                            );
                        });
                        if (checkBetween >= 0) {
                            throw new Error(
                                "Khoảng thời gian nghỉ trùng với khoảng thời gian đã đăng ký"
                            );
                        } else {
                            if (start !== end) {
                                totalRes = (moment(end).diff(moment(start), "days") + 1) * 8;
                            } else {
                                if (hour > 0) {
                                    totalRes = hour;
                                } else {
                                    totalRes = 8;
                                }
                            }
                            if (currentnumDay + totalOldRes >= totalRes) {
                                //id
                                const dayOff = {
                                    startDay: start,
                                    endDay: end,
                                    numOfHours: totalRes,
                                    cause: req.body.cause,
                                    days: getRangeOfDates(moment(start), moment(end), "day"),
                                };
                                arr.push(dayOff);
                                t.timeRecording[indexYears].yearItems[
                                    indexMonth
                                ].regAnnualleave.dayOff = arr;
                                return t.save();
                            } else {
                                throw new Error(
                                    "Thời gian đăng ký vượt quá thời gian nghỉ còn lại!"
                                );
                            }
                        }
                    }
                })

            .then((result) => {
                    currentnumDay = currentnumDay + totalOldRes - totalRes; //Cập nhật lại ngày nghỉ
                    return req.user.updateAnnual(currentnumDay);
                })
                .then(() => {
                    return res.redirect("/annualLeave");
                }).catch((err) => {
                    return res.render("err", { // form bắt lỗi do trùng ngày nghỉ hoặc hết ngày nghỉ
                        title: "Đăng ký nghỉ",
                        message: err.message,
                        name: req.user.name,
                        backUrl: "/annualLeave",
                    });
                });
        })
        .catch((err) => {
            return res.render("err", { // form bắt lỗi do trùng ngày nghỉ hoặc hết ngày nghỉ
                title: "Đăng ký nghỉ",
                message: err.message,
                name: req.user.name,
                backUrl: "/annualLeave",
            });
        });
};

//Xoa ngay nghi
exports.postDeleteAnnual = (req, res, next) => {
    const id = req.body.remove_annual;
    let numOfhour = 0;
    TimeRecording.findById(req.user.timeRecordingId)
        .then((t) => {
            t.timeRecording.forEach((year, i) => {
                year.yearItems.forEach((month, j) => {
                    let indexItem = month.regAnnualleave.dayOff.findIndex(
                        (item) => item._id == id
                    ); //index ngày nghỉ
                    if (indexItem >= 0) {
                        numOfhour = month.regAnnualleave.dayOff[indexItem].numOfHours; // lấy giờ nghỉ củ để cập nhật
                        month.regAnnualleave.dayOff.splice(indexItem, 1); //xóa khỏi mảng
                    }
                    if (month.regAnnualleave.dayOff.length === 0) {
                        if (
                            year.year === parseInt(moment().format("YYYY")) &&
                            month.month > parseInt(moment().format("MM")) // kiểm tra xem xóa có hợp lệ 
                        ) {
                            year.yearItems.splice(j, 1);
                        }
                    }
                });
            });
            return t.save();
        })
        .then((t) => {
            return req.user.updateAnnual(req.user.annualLeave + numOfhour); // cập nhật lại ngày nghỉ
        })
        .then(() => {
            return res.redirect("/annualLeave");
        })
        .catch((err) => console.log(err));
};
//Func tách từ ngày đến ngày thành các ngày chi tiết
function getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
    const next = moment(start).add(1, key).startOf(key);
    if (next.isAfter(end, key)) return arr;
    return getRangeOfDates(next, end, key, arr.concat(next));
}

//Func doi phut thành giờ || giờ thành ngày
function parseHour(hour, type) {
    let result = "";
    //minutes to hour
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