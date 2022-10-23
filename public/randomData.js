//---------------------------------------------------------------------------------------------------------------------------------------------------
//====================== SETUP Year=>Month=>Day for TimeRecording
// exports.getTest = async(req, res, next) => {
//     for (let g = 1; g < 10; g++) {
//         let monthYear = `2022-0${g}`;
//         let firstDayOfMonth = moment(monthYear).startOf("month");
//         let end = moment(monthYear).endOf("month");

//         while (firstDayOfMonth <= end) {

//             await TimeRecording.findById(req.user.timeRecordingId)
//                 .then((t) => {
//                     if (
//                         firstDayOfMonth.format("dddd") != "Sunday" &&
//                         firstDayOfMonth.format("dddd") != "Saturday"
//                     ) {
//                         console.log('DD: ', firstDayOfMonth.format("DD"), '==', firstDayOfMonth.format("MM"))
//                         let item = {};
//                         if (t.timeRecording.length === 0) {
//                             // Trường hợp first index //
//                             item.year = parseInt(firstDayOfMonth.format("YYYY"));
//                             item.yearItems = [{
//                                 month: parseInt(firstDayOfMonth.format("MM")),
//                                 monthItems: [{
//                                     day: parseInt(firstDayOfMonth.format("DD")),
//                                     times: [],
//                                 }, ],
//                             }, ];

//                             let timeRecording = [...t.timeRecording];
//                             timeRecording.push(item);
//                             t.timeRecording = timeRecording;
//                             return t.save();
//                         } else {
//                             // Trường hợp new year
//                             let indexYears = t.timeRecording.findIndex(
//                                 (x) => x.year === parseInt(firstDayOfMonth.format("YYYY"))
//                             );

//                             if (indexYears < 0) {
//                                 item.year = parseInt(firstDayOfMonth.format("YYYY"));
//                                 item.yearItems = [{
//                                     month: parseInt(firstDayOfMonth.format("MM")),
//                                     monthItems: [{
//                                         day: parseInt(firstDayOfMonth.format("DD")),
//                                         times: [],
//                                     }, ],
//                                 }, ];
//                                 let timeRecording = [...t.timeRecording];
//                                 timeRecording.push(item);
//                                 t.timeRecording = timeRecording;
//                                 return t.save();
//                             } else {
//                                 const indexMonth = t.timeRecording[indexYears].yearItems.findIndex(
//                                     (y) => {
//                                         return y.month === parseInt(firstDayOfMonth.format("MM"));
//                                     }
//                                 );
//                                 if (indexMonth < 0) {
//                                     // Trường hợp New Month
//                                     item.month = parseInt(firstDayOfMonth.format("MM"));
//                                     item.monthItems = [{
//                                         day: parseInt(firstDayOfMonth.format("DD")),
//                                         times: [],
//                                     }, ];
//                                     let yearItems = [...t.timeRecording[indexYears].yearItems];
//                                     yearItems.push(item);
//                                     t.timeRecording[indexYears].yearItems = yearItems;
//                                     return t.save();
//                                 } else {
//                                     //Trường hợp New Day
//                                     const indexDay = t.timeRecording[indexYears].yearItems[
//                                         indexMonth
//                                     ].monthItems.findIndex((z) => {
//                                         return z.day === parseInt(firstDayOfMonth.format("DD"));
//                                     });
//                                     if (indexDay < 0) {
//                                         item.day = parseInt(firstDayOfMonth.format("DD"));
//                                         item.times = [];
//                                         let day = [
//                                             ...t.timeRecording[indexYears].yearItems[indexMonth].monthItems,
//                                         ];
//                                         day.push(item);
//                                         t.timeRecording[indexYears].yearItems[indexMonth].monthItems =
//                                             day;
//                                         return t.save();
//                                     } else {
//                                         return t;
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }).then(a => {
//                     // console.log(a)
//                     //  next()
//                 })
//                 .catch(err => console.log(err))

//             //}
//             firstDayOfMonth.add(1, "days");
//             // console.log(firstDayOfMonth, '===', firstDayOfMonth.format("dddd"))

//         }
//     }
// };
//---------------------------------------------------------------------------------------------------------------------------------------------------