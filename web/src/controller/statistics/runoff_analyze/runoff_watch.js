layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let $ = layui.jquery;

    // 渲染表格
    $.initDataTable = function (cols, formClass, tableId, url) {
        let param = admin.getFormParam(formClass);
        table.render({
            id: tableId,
            elem: '#' + tableId,
            url: url,
            method: 'GET',
            where: param,//请求参数(额外)
            request: {
                pageName: 'page' //页码的参数名称，默认：page
                , limitName: 'page_size' //每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                return {
                    "code": res.code, //解析接口状态
                    "msg": res.msg, //解析提示文本
                    "count": res.data.total, //解析数据长度
                    "data": res.data.list
                };
            },
            page: true,
            loading: true,
            cols: cols
        });
    }

    var initArray = [
        {
            form_name: 'statistics_runoff-watch_form',
            cols_name: 'statistics_runoff-watch_table',
            tableId: 'table_runoff-watch_list',
            form_class: '.form_runoff-watch',
            form_id: '#form_runoff-watch',
            url: admin.getUrl('/api/user_loss/loss_monitor')
        }
    ]

    $.each(initArray, function (i, obj) {
        admin.initForms(obj.form_name,   obj.form_id).then(function () {
            $("input[name='range_time']").parent().css('width', '500px');
            $("input[name='range_time']").val(admin.getRecentDay(7));
            $("select[name='loss_day'] option[value='']").remove();
            form.render('select');
            admin.getCols(obj.cols_name).then(function (data) {//字段a,字段b这种需要查数据字典附加
                $.initDataTable(data.data, obj.form_class, obj.tableId, obj.url)
            });
        });
    });


    // 邮件详情
    exports('statistics/runoff_analyze/runoff_watch', {});

});
