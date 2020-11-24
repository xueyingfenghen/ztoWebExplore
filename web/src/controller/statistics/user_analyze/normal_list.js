layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'tools/recentDate'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;

    var initArray =
        {
            formNameConf: "form_normal-list",
            tableId: "table_normal-list",
            formClass: ".form_normal-list",
            colsConf: "normal-list_table",
            url: admin.getUrl('/api/user_analyze/normal_list'),
        };

    admin.initForms(initArray.formNameConf, '#' + initArray.formNameConf).then(function () {
        $("input[name='range_time']").parent().css('width', '500px');
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $("select[name='rank_field'] option[value='']").remove();
        $("select[name='list_type'] option[value='']").remove();
        form.render('select');
        admin.getCols(initArray.colsConf).then(function (data) {
            admin.initTable(initArray.url, data.data, initArray.tableId, initArray.formClass)
        })

    });

    // 操作详情
    exports('statistics/user_analyze/normal_list', {})

});
