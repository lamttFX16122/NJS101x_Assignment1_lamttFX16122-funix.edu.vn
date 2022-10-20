const TimeRecording = require("../models/timeRecordingModel");
const User = require("../models/userModel");
const moment = require("moment");
const { json } = require("express/lib/response");

//Man hinh cham cong
exports.getTimeRecording = (req, res, next) => {
    TimeRecording.findById(req.user.timeRecordingId)
        .then((t) => {
            let item = {};
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
                let startTime = "";
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

                //findIndex isLoading==true
                const startTimeIndex = t.timeRecording[indexYears].yearItems[
                    indexMonth
                ].monthItems[indexDay].times.findIndex((r) => {
                    return r.isLoading === true;
                });

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
                    title: 'Chấm công',
                    isActive: 1
                });
            });
        })
        .catch((err) => console.log(err));
};

//Form bat dau cham cong
exports.getStartTime = (req, res, next) => {
    console.log(req.user.name);
    res.render("time_recording/start-time", { name: req.user.name, title: 'Nơi làm việc' });
};

exports.postStartTime = (req, res, next) => {
    const id = req.user.timeRecordingId;
    const workPlace = req.body.workplace;

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
            // }
            t.isWorking = !t.isWorking;
            return t.save();
            // })
            //
        })
        .then((result) => {
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
            let remainingAnnual = req.user.annualLeave;
            //In Year
            const indexYears = t.timeRecording.findIndex((x) => {
                return x.year === parseInt(moment().format("YYYY"));
            });
            // Tong time nghi
            t.timeRecording[indexYears].yearItems.forEach((x) => {
                x.regAnnualleave.dayOff.forEach((i) => {
                    totalAnnual += i.numOfHours;
                });
            });
            //  console.log(t.timeRecording[indexYears].yearItems)

            res.render("time_recording/annualLeave", {
                moment: moment,
                annualLeave: t.timeRecording[indexYears],
                totalAnnual: totalAnnual,
                remainingAnnual: remainingAnnual,
                parseHour: parseHour,
                title: 'Đăng ký nghỉ phép',
                isActive: 2
            });
        })
        .catch((err) => console.log(err));
};
exports.postAnnualLeave = (req, res, next) => {
    let currentnumDay = req.user.annualLeave;
    const id = req.body.txt_id_annual;
    const start = moment(req.body.startDate).format("YYYY-MM-DD"); //Tu ngay
    const end = moment(req.body.endDate).format("YYYY-MM-DD"); //Den ngay
    const hour = parseInt(req.body.numhours); //So gio
    let totalRes = 0; //Tong so gio dang ky nghi
    let totalOldRes = 0;
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

                    if (!id) {
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
                        // -------------------------------------------------------------------------------------------------------------------

                        let arr = JSON.parse(
                            JSON.stringify([
                                ...t.timeRecording[indexYears].yearItems[indexMonth]
                                .regAnnualleave.dayOff,
                            ])
                        );
                        let indexOld = arr.findIndex(
                            (a) => (a._id = "634fcfcb470f4935c0fcec1c")
                        );
                        totalOldRes = arr[indexOld].numOfHours; // Ngay nghi cu

                        arr.splice(
                            arr.findIndex((a) => (a._id = "634fcfcb470f4935c0fcec1c")),
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
                            if (currentnumDay >= totalRes) {
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
                    currentnumDay = currentnumDay + totalOldRes - totalRes;
                    return req.user.updateAnnual(currentnumDay);
                })
                .then(() => {
                    return res.redirect("/annualLeave");
                });
        })
        .catch((err) => {
            return res.render("err", {
                title: "Đăng ký nghỉ",
                message: err.message,
                backUrl: "/annualLeave",
            });
        });
};

exports.postDeleteAnnual = (req, res, next) => {
    const id = req.body.remove_annual;
    let numOfhour = 0;
    TimeRecording.findById(req.user.timeRecordingId)
        .then(t => {
            console.log(typeof(moment().format('YYYY')))
            t.timeRecording.forEach((year, i) => {
                year.yearItems.forEach((month, j) => {
                    let indexItem = month.regAnnualleave.dayOff.findIndex(item => item._id == id)
                    if (indexItem >= 0) {
                        numOfhour = month.regAnnualleave.dayOff[indexItem].numOfHours;
                        month.regAnnualleave.dayOff.splice(indexItem, 1);
                    }
                    if (month.regAnnualleave.dayOff.length === 0) {
                        if (year.year === parseInt(moment().format('YYYY')) && month.month > parseInt(moment().format('MM'))) {
                            year.yearItems.splice(j, 1);
                        }
                    }
                })
            })
            return t.save();
        })
        .then(t => {
            console.log('Ngay nghi ban dau: ', req.user.annualLeave)
            console.log('Ngay nghi tru ra: ', numOfhour)
            return req.user.updateAnnual(req.user.annualLeave + numOfhour)
        })
        .then(() => {
            console.log('Ngay nghi cuoi cung: ', req.user.annualLeave)
            return res.redirect("/annualLeave");
        })
        .catch(err => console.log(err))
};
//Func tách từ ngày đến ngày thành các ngày chi tiết
function getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
    // if (start.isAfter(end)) throw new Error('start must precede end')
    const next = moment(start).add(1, key).startOf(key);
    if (next.isAfter(end, key)) return arr;
    return getRangeOfDates(next, end, key, arr.concat(next));
}

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