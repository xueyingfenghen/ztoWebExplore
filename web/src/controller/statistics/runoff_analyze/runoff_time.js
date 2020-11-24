layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;

    let initArray = [
        {
            // 充值留存
            form_name: 'statistics_runoff_time_form',
            cols_name: 'statistics_runoff_time_table',
            tableId: 'table_runoff_time_list',
            form_class: '.form_runoff_time',
            form_id: '#form_runoff_time',
            url: admin.getUrl('/api/user_loss/loss_time')
        }
    ];

    let option_time = layui.setter.echarts_option;


    option_time.yAxis = [
        {
            type: 'value',
            name: '3天前活跃玩家',
            axisLabel: {
                formatter: '{value}'
            }
        },
        {
            type: 'value',
            name: '流失玩家',
            axisLabel: {
                formatter: '{value} '
            }
        }
    ];

    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if(!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    let active = {
        search:search,
        reset:reset,
        export_excel: export_excel
    };

    function search(obj) {
        let param = admin.getFormParam(obj.form_class);
        admin.reload(obj.form_class, obj.tableId,param);
        showChart(obj);
    }

    function reset(obj) {
        admin.resetForm(obj.form_class);
        $("input[name='range_time']").val(admin.getRecentDay(7));
        let param = admin.getFormParam(obj.form_class);
        admin.reload(obj.form_class, obj.tableId,param);
        showChart(obj);
    }

    function showChart(obj) {
        if (obj.tableId = 'table_runoff_time_list') {
            window.reloadEChartLossTime();
        }
    }

    // excel导出
    function export_excel(obj) {
        admin.download({
            url: admin.getUrl(obj.url),
            data: admin.getFormParam(obj.form_class),
            method: 'get',
            dataType: 'json',
        });
    }

    let cols, result;
    window.reloadEChartLossTime = function(param) {
        if(param == undefined) {
            param = admin.getFormParam(initArray[0].form_class);
        }
        let chartParam = $.extend(true, {}, param);
        chartParam["get_chart"] = 1;
        admin.req({
            url: initArray[0].url,
            method: 'get',
            data: chartParam,
            dataType: 'json',
            done: function (res) {
                if(res.code == 0){
                    result = res.data.list;
                    let myChartTime = echarts.init(document.getElementById('echars_list_runoff_time')); //  重新初始化
                    option_time = admin.getOption(option_time, result, cols, ['active_users'], ['loss_users'], 'day', 0);
                    myChartTime.setOption(option_time, true);
                }
            },
        });
    }

    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围-近7日
            $("input[name='range_time']").val(admin.getRecentDay(7));
            $("select[name='sample_type'] option[value='']").remove();
            $("select[name='loss_day'] option[value='']").remove();
            form.render('select');

            admin.getCols(obj.cols_name).then(function (data) {
                cols = data.data;

                let param = admin.getFormParam(obj.form_class);
                // 在这里渲染 echars
                window.reloadEChartLossTime(param);
                table.render({
                    id: obj.tableId,
                    elem: '#' + obj.tableId,
                    url: obj.url,
                    method: 'GET',
                    where: param,//请求参数(额外)
                    request: {
                        pageName: 'page' //页码的参数名称，默认：page
                        ,limitName: 'page_size' //每页数据量的参数名，默认：limit
                    },
                    parseData: function(res) { //res 即为原始返回的数据
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.total, //解析数据长度
                            "data": res.data.list //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: data.data,
                    done: function (res) {
                        if (res.code != 0) {
                            res.data = [];
                            res.count = 0;
                        }
                    }
                });
            });
        });
    });


    //对外暴露的接口
    exports('statistics/runoff_analyze/runoff_time', {});
});
