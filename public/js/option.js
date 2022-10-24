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
    let data;
    $('.lookup-page').ready(() => {
        $.ajax({
            url: '/lookupAjax',
            dataType: 'Json',
            type: 'GET',
            data: {},
            success: (result) => {
                data = result;
            }
        })
    })
    $('#salary-option').change(() => {
        const fil = $('#salary-option').val().split('-');
        if (fil == 0) {
            $('.detail-salary').empty();
            $('.detail-salary').removeClass('border-end');
        } else {
            const yearIndex = data.timeRecordingId.timeRecording.findIndex(year => {
                return year.year.toString() === fil[1];
            })
            const result = data.timeRecordingId.timeRecording[yearIndex].yearItems.filter((month) => {
                return month.month.toString() === fil[0];
            })

            let str = `<h3>Lương tháng ${$('#salary-option').val()}</h3><div class="d-flex align-items-center justify-content-between mb-4">
            <div class="mb-0">
                <ul class="list-group list-group-flush align-items-start">
                    <li class="list-group-item bg-secondary border-0">Thời gian đã làm :
                      ${result[0].sumTimeInMonth ? parseHour(result[0].sumTimeInMonth,0):'Chưa kết thúc'}
                    </li>
                    <li class="list-group-item bg-secondary border-0">Thời gian nghỉ đã đăng ký:
                      ${parseHour(result[0].sumOffMonthMain,1)}
                    </li>
                    <li class="list-group-item bg-secondary border-0">Thời gian bắt buộc của tháng:
                      ${result[0].numBusinessDay} ngày ~ (${result[0].numBusinessDay*8} giờ)
                    </li>
                </ul>
            </div>
            <div>
                <ul class="list-group list-group-flush align-items-start">
                    <li class="list-group-item bg-secondary border-0">Thời gian tăng ca:
                       ${parseHour(result[0].upTimeInMonth,0)}
                    </li>
                    <li class="list-group-item bg-secondary border-0">Thời gian làm thiếu:
                       ${parseHour(result[0].missTimeInMonth,0)}
                    </li>
                    <li class="list-group-item bg-secondary border-0">Lương:
                        ${changeMoney(result[0].salary)}
                    </li>
                </ul>
            </div>
        </div>`
            $('.detail-salary').addClass('border-end');
            $('.detail-salary').html(str);
        }
    })

})

function changeMoney(money) {
    let x = '';
    if (typeof(money) == 'number') {
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