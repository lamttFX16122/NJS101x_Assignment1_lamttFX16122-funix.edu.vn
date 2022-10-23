$(document).ready(() => {
    // Thong tin than nhiet
    $('.btn-edit-hypothermia').click((e) => {
        let index = e.target.id; // Row
        let a = $(".tbl-hypothermia > tbody >tr").eq(index).children("td").eq(0).text().trim();
        let b = $(".tbl-hypothermia > tbody >tr").eq(index).children("td").eq(1).attr('id'); //date not parse
        let c = $(".tbl-hypothermia > tbody >tr").eq(index).children("td").eq(2).text().trim();
        let d = $(".tbl-hypothermia > tbody >tr").eq(index).children("td").eq(3).text().trim();
        let id = $(".tbl-hypothermia > tbody >tr").eq(index).children("td").eq(4).attr('id'); //ID items Row

        $('#collapseTwo').addClass('show');
        $('#btn-collapsedTwo').removeClass('collapsed')
        $('#time').val(a)
        $('#date').val(b);
        $('#temperature').val(c);
        $('#affection').val(d);
        $('#txt_id').val(id);

    })

    $('.btn-clearTwo').click(() => {
        $('#collapseTwo').removeClass('show');
        $('#btn-collapsedTwo').addClass('collapsed')
        $('#time').val('')
        $('#date').val('');
        $('#temperature').val('');
        $('#affection').val('');
        $('#txt_id').val('');
    })

    // Thong tin vaccine

    $('.btn-edit-vaccine').click((e) => {
        let index = e.target.id; // Row
        let a = $(".tbl-vaccine > tbody >tr").eq(index).children("td").eq(0).text().trim();
        let b = $(".tbl-vaccine > tbody >tr").eq(index).children("td").eq(1).attr('id'); //date not parse
        let c = $(".tbl-vaccine > tbody >tr").eq(index).children("td").eq(2).text().trim();

        let id = $(".tbl-vaccine > tbody >tr").eq(index).children("td").eq(3).attr('id'); //ID items Row

        $('#collapseTwo1').addClass('show');
        $('#btn-collapseTwo1').removeClass('collapsed')

        $('#numVac').val(a)
        $('#dateVac').val(b);
        $('#typeVac').val(c);
        $('#txt_id1').val(id);

    })

    $('.btn-clearTwo1').click(() => {
        $('#collapseTwo1').removeClass('show');
        $('#btn-collapseTwo1').addClass('collapsed')
        $('#numVac').val('')
        $('#dateVac').val('');
        $('#typeVac').val('');
        $('#txt_id1').val('');
    })

    //Thong tin duong tinh covid
    $('.btn-edit-covid').click((e) => {
        let index = e.target.id; // Row
        let a = $(".tbl-covid > tbody >tr").eq(index).children("td").eq(0).text().trim();
        let b = $(".tbl-covid > tbody >tr").eq(index).children("td").eq(1).attr('id'); //date not parse
        let c = $(".tbl-covid > tbody >tr").eq(index).children("td").eq(2).text().trim();
        let d = $(".tbl-covid > tbody >tr").eq(index).children("td").eq(3).attr('id');
        let id = $(".tbl-covid > tbody >tr").eq(index).children("td").eq(4).attr('id'); //ID items Row

        $('#collapseTwo2').addClass('show');
        $('#btn-collapseTwo2').removeClass('collapsed')

        $('#numCovid').val(a)
        $('#dateCovid').val(b);
        $('#symptom').val(c);
        $('#statusCovid').val(d.toString());
        $('#txt_id2').val(id);

    })

    $('.btn-clearTwo2').click(() => {
            $('#collapseTwo2').removeClass('show');
            $('#btn-collapseTwo2').addClass('collapsed')
            $('#numCovid').val('')
            $('#dateCovid').val('');
            $('#symptom').val('');
            $('#statusCovid').val('');
            $('#txt_id2').val('');
        })
        // ---------------------------------------- AnnuallY---------------------------------------------
    $('.btn-edit-annual').click((e) => {
        let index = e.target.id; // Row
        let a = $(".tbl-annual > tbody >tr").eq(index).children("td").eq(0).attr('id');
        let b = $(".tbl-annual > tbody >tr").eq(index).children("td").eq(1).attr('id'); //date not parse
        let c = $(".tbl-annual > tbody >tr").eq(index).children("td").eq(2).attr('id');
        let d = $(".tbl-annual > tbody >tr").eq(index).children("td").eq(3).text().trim();
        let id = $(".tbl-annual > tbody >tr").eq(index).children("td").eq(4).attr('id'); //ID items Row

        $('#annualLeave').val(a)
        $('#startDate').val(b);
        $('#endDate').val(c);
        $('#floatingTextarea').val(d);
        $('#txt_id_annual').val(id);
        $('#annual-submit').text("Sửa")
    })

    $('#annual-clear').click(() => {
            $('#annualLeave').val('')
            $('#startDate').val(moment().format('YYYY-MM-DD'));
            $('#endDate').val(moment().format('YYYY-MM-DD'));
            $('#floatingTextarea').val('');
            $('#txt_id_annual').val('');
            $('#annual-submit').text("Đăng ký")
        })
        // ========================== LOOKUP===============================
        // var temp;
        // $('#frm-search').submit(e => {
        //     e.preventDefault();
        //     const txt = $('#timeRecordSearch').val();
        //     // temp = $('#tesst').html();
        //     $('#tesst').empty();
        //     $.ajax({
        //         url: '/lookupAjax',
        //         type: 'GET',
        //         dataType: 'json',
        //         success: (data) => {
        //             let fil = [];
        //             data.timeRecordingId.timeRecording[0].yearItems.forEach((month, index) => {
        //                 let isFil = month.monthItems.filter(i => {
        //                     return i.day.toString().includes(txt);
        //                 })
        //                 if (isFil.length > 0) {
        //                     data.timeRecordingId.timeRecording[0].yearItems[index] = isFil;
        //                 }

    //             })
    //             let str = '';
    //             console.log(data.timeRecordingId.timeRecording[0])
    //             data.timeRecordingId.timeRecording[0].yearItems.forEach(m => {
    //                 // if (m.isNotRecording) {
    //                 str += `<div class = "d-flex align-items-center justify-content-between mb-4">
    //                         <div class = "mb-0" ><h6> Danh sách tháng ${m.month} </h6> 
    //                         <ul class = "list-group list-group-flush align-items-start" >
    //                         <li class = "list-group-item bg-secondary border-0" > Thời gian đã làm:
    //                         ${m.sumTimeInMonth?parseHour(m.sumTimeInMonth,0):'Chưa kết thúc'} </li> 
    //                         <li class = "list-group-item bg-secondary border-0"> 
    //                         Thời gian nghỉ đã đăng ký: ${parseHour(m.sumOffMonthMain,1)} </li> 
    //                         <li class = "list-group-item bg-secondary border-0" > 
    //                         Thời gian bắt buộc của tháng: ${m.numBusinessDay} ngày~(${m.numBusinessDay*8} giờ) </li> 
    //                         </ul> 
    //                         </div>`
    //                     // }
    //             })
    //             $('#tesst').html(str);

    //         }
    //     })
    // })
    // $('#pastHtml').click(() => {
    //     $('#tesst').html("<%=year.year%>");
    // })





    // $('#timeRecordSearch')
    // $.ajax({
    //     url: url,
    //     dataType: "json",
    //     type: "Post",
    //     async: true,
    //     data: { },
    //     success: function (data) {

    //     },
})

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
        // result = hour / 8 > 0 ? parseInt(hour / 8).toString() + ' ngày' : '' + (hour % 8) > 0 ? (hour / 8).toString() + ' giờ' : '';
    }
    return result;
}