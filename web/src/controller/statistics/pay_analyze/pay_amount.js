layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'tools/recentDate'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;
    let half = $('#half');
    let full = $('#full');
    let summary = {};
    let money = 0;
    let initArray = [
        {
            // 活跃情况情况
            form_name: 'statistics_pay-amount_form',
            cols_name: 'statistics_pay-amount_table',
            tableId: 'table_pay-amount',
            form_class: '.form_pay-amount',
            form_id: '#form_pay-amount',
            url: admin.getUrl('/api/recharge/amount')
        }];
    var line = $('#echarts_pay-amount');
    line.css({"width": full.width()});

    // 渲染折线框
    let chart = echarts.init(document.getElementById('echarts_pay-amount'));   // 初始化
    // 初始echarts图
    let option = {
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        legend: {
            data: ['充值金额', '充值笔数']
        },
        xAxis: [
            {
                type: 'category',
                data: [], // x 轴坐标
                boundaryGap: false,
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '充值金额',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: '充值笔数',
                axisLabel: {
                    formatter: '{value}'
                }
            },
        ],
        series: [
            {
                name: '充值金额',
                field: 'money',
                type: 'line',
                data: []
            },
            {
                name: '充值笔数',
                field: 'recharge_nums',
                type: 'line',
                yAxisIndex: 1,
                data: []
            }
        ]
    }

    chart.setOption(option, true);

    window.reloadEChartPayAmount = function (param) {
        if (param == undefined) {
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
                if (res.code == 0) {
                    line.css({"width": full.width()});
                    chart = echarts.init(document.getElementById('echarts_pay-amount')); //  重新初始化
                    // x轴坐标
                    option.xAxis[0]['data'] = [];
                    $.each(res.data.list, function (key, val) {
                        option.xAxis[0]['data'].push(val['day']);
                    });
                    // 数据
                    $.each(option.series, function (k, v) {
                        option.series[k]['data'] = [];
                    });
                    $.each(res.data.list, function (key, val) {
                        $.each(option.series, function (k, v) {
                            option.series[k]['data'].push(val[v.field]);
                        })

                    });
                    chart.setOption(option, true);
                }
            },
        });
    }

    $.each(initArray, function (i, obj) {
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围 近7日
            $("input[name='range_time']").parent().css('width', '500px');
            $("input[name='range_time']").val(admin.getRecentDay(7));
            $("select[name='hour_type'] option[value='']").remove();
            $("select[name='time_type'] option[value='']").remove();
            $(obj.form_id + ' #time_type').attr('lay-filter', 'time_type');
            form.render('select');
            admin.getCols(obj.cols_name).then(function (data) {
                let cols = data.data;
                let param = admin.getFormParam(obj.form_class);
                // 在这里渲染 echars
                window.reloadEChartPayAmount(param);
                table.render({
                    id: obj.tableId,
                    elem: '#' + obj.tableId,
                    url: obj.url,
                    method: 'GET',
                    where: param,//请求参数(额外)
                    request: {
                        pageName: 'page' //页码的参数名称，默认：page
                        , limitName: 'page_size' //每页数据量的参数名，默认：limit
                    },
                    parseData: function (res) { //res 即为原始返回的数据
                        var returnData = [];
                        if (res.data.list.length > 0) {
                            if (res.data.summary !== undefined) {
                                summary = res.data.summary;
                                summary.day = "汇总";
                            }
                            returnData = [summary];
                            returnData.push.apply(returnData, res.data.list);
                        }
                        if (res.data.money !== undefined && res.data.money > 0) {
                            money = res.data.money;
                        }
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.total, //解析数据长度
                            "data": returnData, //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: cols,
                    done: function (res) {
                        // 在这里渲染 echars
                        if (res.code == 0) {
                            $('.total_money').html(money);
                        }
                        if (res.data.length > 0) {
                            res.data.splice(0, 1);
                        }
                    }
                });
            });
        });
    });
    // 邮件选择 0 即时邮件 1 邮件模版
    form.on('select(time_type)', function (data) {
        if (data.value == '1' || data.value == '2' || data.value == '3') {
            $('#show_way').parent().parent().addClass('layui-hidden');
        } else {
            $('#show_way').parent().parent().removeClass('layui-hidden');
        }
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
        export_excel: export_excel
    };

    function search(obj) {
        let param = admin.getFormParam(obj.form_class);
        switch (obj.tableId) {
            case 'table_pay-amount':
                if (parseInt(param.time_type) === 0 && parseInt(param.hour_type) === 1){
                    admin.reload(obj.form_class, obj.tableId,'',false);
                }else {
                    admin.reload(obj.form_class, obj.tableId);
                }
                break;
            case 'table_pay-item':
            case 'table_pay-area':
                //  充值项分布
                admin.reload(obj.form_class, obj.tableId,'',false);
                break;
            default:
                admin.reload(obj.form_class, obj.tableId);
        }
        showChart(obj);
    }

    function reset(obj) {
        admin.resetForm(obj.form_class);
        $("input[name='range_time']").val(admin.getRecentDay(7));
        switch (obj.tableId) {
            case 'table_pay-amount':
            case 'table_pay-item':
            case 'table_pay-area':
                //  充值项分布
                admin.reload(obj.form_class, obj.tableId,'',false);
                break;
            default:
                admin.reload(obj.form_class, obj.tableId);
        }
        showChart(obj);
    }

    function showChart(obj) {
        switch (obj.tableId) {
            case 'table_pay-amount':
                //  充值
                window.reloadEChartPayAmount();
                break;
            case 'table_pay-situation':
                //  充值情况
                window.reloadEChartPaySituation();
                break;
            case 'table_pay-exchange_detail':
                //  充值转化

                break;
            case 'table_pay-increased':
                //  新增充值
                window.reloadEChartPayIncrease();
                break;
            case 'table_pay-rank':
                //  充值排行

                break;
            case 'table_pay_running_water_list':
                //  充值流水

                break;
            case 'table_pay-item':
                //  充值项分布

                break;
            case 'table_pay-area':
                //  充值区间分布
                window.reloadEChartPayArea();
                break;
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

    //对外暴露的接口
    exports('statistics/pay_analyze/pay_amount', {});
});
