layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;



    var initArray =
        {
            formNameConf: "form_time-limit-activity",
            tableId: "table_time-limit-activity",
            formClass: ".form_time-limit-activity",
            colsConf: "time-limit-activity_table",
            url:admin.getUrl('/api/activity/activity_list'),
        };

    admin.initForms(initArray.formNameConf, '#' + initArray.formNameConf).then(function () {
        $("input[name='range_time']").parent().css('width', '500px');
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $("select[name='activity_id'] option[value='']").remove();
        form.render('select');
        admin.getCols(initArray.colsConf).then(function (data) {
           admin.initTable(initArray.url,data.data ,initArray.tableId, initArray.formClass)
        })

    });



    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if (!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    var active = {
        search: search,
        reset: reset,
        level_spread: level_spread,
        detail: detail,
    };

    function search(obj) {
        admin.reload(obj.form_class, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.form_class);
        $("input[name='range_time']").val(admin.getRecentDay(7));
        admin.reload(obj.form_class, obj.tableId);
    }

    function  level_spread(obj) {
        var param = admin.getFormParam(obj.formClass);
        param.id = layui.table.cache[obj.tableId][obj.index]['id'];
        param.cols = 'level_spread_table';
        param.url = '/api/user_analyze/level_spread';
        admin.popup({
                title: obj.title
                , area: ['80%', '80%']
                , id: 'LAY-popup-rank-check'
                , success: function (layero, index) {

                    view(this.id).render('statistics/popup/user_data/detail', param).done(function () {
                        //监听提交
                    });
                }
            }
        );
    }
    function  detail(obj) {
        var param = admin.getFormParam(obj.formClass);
        param.id = layui.table.cache[obj.tableId][obj.index]['id'];
        param.cols = 'detail_table';
        param.url = '/api/user_analyze/detail';
        admin.popup({
                title: obj.title
                , area: ['80%', '80%']
                , id: 'LAY-popup-rank-check'
                , success: function (layero, index) {

                    view(this.id).render('statistics/popup/user_data/detail', param).done(function () {
                        //监听提交
                    });
                }
            }
        );
    }
    // 操作详情
    exports('statistics/user_analyze/time_limit_activity', {})

});
