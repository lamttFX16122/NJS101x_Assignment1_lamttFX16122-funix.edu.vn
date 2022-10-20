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
})