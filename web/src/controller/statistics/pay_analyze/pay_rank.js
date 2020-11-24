layui.define(['table', 'admin', 'form', 'view', 'laydate', 'tools/recentDate'], function (exports) {

    let admin = layui.admin,
        table = layui.table,
        form = layui.form,
        view = layui.view,
        laydate = layui.laydate,
        $ = layui.jquery,
        reportType = 1; // 默认为日报 1 日报 2 周报 3 月报

    let cols,           //    表格列数据
        searchParam;   //    搜索栏参数
    let initArray = {
        // 充值排行
        form_name: 'statistics_pay-rank_form',
        cols_name: 'statistics_pay-rank_table_',
        tableId: 'table_pay-rank',
        form_class: '.form_pay-rank',
        form_id: '#form_pay-rank',
        url: admin.getUrl('/api/recharge/ranking'),
    }
    $.initRankData = function () {
        let param = admin.getFormParam(initArray.form_class);
        var cols_name = initArray.cols_name;
        switch (parseInt(param.ranking_type)) {
            case 2:
                cols_name = cols_name + 'role';
                break;
            case 3:
                cols_name = cols_name + 'device';
                break;
            default:
                cols_name = cols_name + 'server';
        }

        admin.getCols(cols_name).then(function (data) {
            console.log(param);
            table.render({
                id: initArray.tableId,
                elem: '#' + initArray.tableId,
                url: initArray.url,
                method: 'GET',
                where: param,//请求参数(额外)
                request: {
                    pageName: 'page' //页码的参数名称，默认：page
                    , limitName: 'page_size' //每页数据量的参数名，默认：limit
                },
                parseData: function (res) { //res 即为原始返回的数据
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.msg, //解析提示文本
                        "count": res.data.total, //解析数据长度
                        "data": res.data.list, //解析数据列表
                    };
                },
                page: true,
                loading: true,
                cols: data.data,
            });
        });
    }
    admin.initForms(initArray.form_name, initArray.form_id).then(function () {
        $("input[name='range_time']").parent().css('width', '500px');
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $("select[name='ranking_type'] option[value='']").remove();
        form.render('select');
        $(initArray.form_id+' #ranking_type').attr('lay-filter', 'ranking_type');
        $.initRankData();
    });

    // 邮件选择 0 即时邮件 1 邮件模版
    form.on('select(ranking_type)', function (data) {
        reportType = parseInt(data.value);
        $.initRankData();
    });


    // 搜索
    $('#search-btn').click(function () {
        $.initRankData();
    });

    // 重置
    $('#reset-btn').click(function () {
        admin.resetForm('.data_report_search');
        $.initRankData();
    })
    // 事件绑定
    $(document).off('click', '.check_role').on('click', '.check_role', function () {
        if(!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    var active = {
        check:check
    };
    function  check(obj) {
        var param = admin.getFormParam(obj.formClass);
        param.device_id = layui.table.cache[obj.tableId][obj.index]['device_id'];
        admin.popup({
            title: obj.title
            , area: ['80%', '80%']
            , id: 'LAY-popup-rank-check'
            , success: function (layero, index) {

                view(this.id).render('statistics/popup/pay/check', param).done(function () {
                    //监听提交
                });
            }
            }
        );
    }


    exports('statistics/pay_analyze/pay_rank', {})
})
