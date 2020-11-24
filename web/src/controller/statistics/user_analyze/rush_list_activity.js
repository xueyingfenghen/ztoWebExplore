layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'tools/recentDate'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;
    let colsName;

    var initArray =
        {
            formNameConf: "form_rush-list-activity",
            tableId: "table_rush-list-activity",
            formClass: ".form_rush-list-activity",
            colsConf: "rush-list-activity_table",
            url: admin.getUrl('/api/activity/activity_list'),
        };

    admin.initForms(initArray.formNameConf, '#' + initArray.formNameConf).then(function () {
        $("input[name='range_time']").parent().css('width', '500px');
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $("select[name='rush_type'] option[value='']").remove();
        $("select[name='rush_list'] option[value='']").remove();
        $("select[name='rank_field'] option[value='']").remove();
        $("select[name='rush_type']").attr('lay-filter', 'rush_type');
        form.render('select');
        let param = admin.getFormParam(initArray.formClass);
        let rushType = param.rush_type;

        console.log(rushType);

        switch (parseInt(rushType)) {
            case 1:
                colsName = initArray.colsConf + '_solo';
                break;
            case 2:
                colsName = initArray.colsConf + '_league';
                break;
            case 3:
                colsName = initArray.colsConf + '_cross_server';
                break;
        }
        console.log(colsName);
        admin.getCols(colsName).then(function (data) {

            admin.initTable(initArray.url, data.data, initArray.tableId, initArray.formClass)
        })

    });
    // 切换道具类型联动
    form.on('select(rush_type)', function (data) {
        admin.req({
            url: admin.getUrl('/api/select/getRushListActivity'),
            data: {
                rush_type: data.value
            },
            type: 'get',
            done: function (data) {
                admin.initSelect(data.data, "select[name='rush_list']", '请选择冲榜活动');
                $("select[name='rush_list'] option[value='']").remove();
                form.render();
            }
        });
    });
    //
    //
    // // 事件绑定
    // $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
    //     if (!$(this).attr('data-obj')) return;
    //     var obj = JSON.parse($(this).attr('data-obj'));
    //     var event = obj.event;
    //     active[event] ? active[event].call(this, obj) : '';
    // });


    // 操作详情
    exports('statistics/user_analyze/rush_list_activity', {})

});
