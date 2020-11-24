layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'tools/recentDate'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;
    let commonChart = '';
    let half = $('#half');
    let full = $('#full');
    let exchangeKey = 'avg';
    let summary = {};
    let pieOption = {
        tooltip: {
            trigger: 'item',

        },
        legend: {
            // orient: 'vertical',
            left: 10,
            data: []
        },
        series: [
            {
                name: '充值转化',
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: []
            }
        ]
    }
    let lineOption = {
        tooltip: {
            trigger: 'axis',
            formatter: function (datas) {
                let htmls = datas[0].name + '</br>';
                for (let i = 0; i < datas.length; i++) {
                    htmls += datas[i].seriesName + ':' + datas[i].data;
                    htmls += '%';
                    htmls += '</br>';
                }
                return htmls;
            }
        },
        legend: {
            // data: ['0~3小时', '3~12小时', '12~24小时', '1~3天', '3~10天', '10~30天', '30天以上']
            data: ['0~10分钟', '11~20分钟', '21~30分钟', '31~60分钟', '1~3小时', '3~6小时', '6~12小时',
                '12~24小时', '1~2天', '2~3天', '3~7天', '7~15天', '15~30天', '30天以上']
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '占比',
                min: 0,
                max: 100,
                axisLabel: {
                    formatter: '{value} %'
                }
            }
        ],
        series: [
            {
                name: '0~10分钟',
                type: 'line',
                field: 'ten_minute_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [20, 20, 1, 34, 9, 30, 10, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '11~20分钟',
                type: 'line',
                field: 'twenty_minute_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [20, 12, 11, 24, 20, 3, 3, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '21~30分钟',
                field: 'thirty_minute_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [10, 22, 21, 14, 10, 3, 10, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '31~60分钟',
                field: 'sixty_minute_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [30, 3, 3, 3, 9, 3, 3, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '1~3小时',
                field: 'three_hour_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [8, 1, 1, 3, 10, 3, 13, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '3~6小时',
                field: 'six_hour_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [8, 32, 1, 3, 10, 3, 13, 20, 20, 1, 34, 9, 30, 10]
            }
            ,
            {
                name: '6~12小时',
                field: 'twelve_hour_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [8, 20, 12, 13, 10, 3, 13, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '12~24小时',
                type: 'line',
                field: 'one_day_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [20, 20, 1, 34, 9, 30, 10, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '1~2天',
                type: 'line',
                field: 'two_day_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [20, 12, 11, 24, 20, 3, 3, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '2~3天',
                field: 'three_day_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [10, 22, 21, 14, 10, 3, 10, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '3~7天',
                field: 'seven_day_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [30, 3, 3, 3, 9, 3, 3, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '7~15天',
                field: 'fifteen_day_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [8, 1, 1, 3, 10, 3, 13, 20, 20, 1, 34, 9, 30, 10]
            },
            {
                name: '15~30天',
                field: 'thirty_day_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [8, 32, 1, 3, 10, 3, 13, 20, 20, 1, 34, 9, 30, 10]
            }
            ,
            {
                name: '30天以上',
                field: 'one_month_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: [8, 20, 12, 13, 10, 3, 13, 20, 20, 1, 34, 9, 30, 10]
            }
        ]
    }


    let initExchangeArray =
        {
            // 日均
            form_name: 'statistics_pay-exchange_form',

            form_class: '.form_pay-exchange',
            form_id: '#form_pay-exchange',
            tableList: [
                {
                    cols_name: 'statistics_pay-exchange_table_avg',
                    tableId: 'table_pay-exchange_avg',
                    chart_id: 'echarts_pay-exchange_avg',
                    option: pieOption,
                    chartType: 'pie',
                    page: false,
                    url: admin.getUrl('/api/recharge/transform')
                },
                {
                    cols_name: 'statistics_pay-exchange_table_detail',
                    tableId: 'table_pay-exchange_detail',
                    chart_id: 'echarts_pay-exchange_detail',
                    option: lineOption,
                    chartType: 'line',
                    page: true,
                    url: admin.getUrl('/api/recharge/transform')
                },
            ],

        }
    var pie1 = $("#echarts_pay-exchange_avg");
    var line1 = $("#echarts_pay-exchange_detail");

    pie1.css({"width": half.width()});
    line1.css({"width": full.width()});
    // 渲染折线框
    let echartGameTimeCountPie = echarts.init(document.getElementById('echarts_pay-exchange_avg'));   // 初始化

    // 初始echarts图
    echartGameTimeCountPie.setOption(pieOption, true);


    let echartGameTimeCountLine = echarts.init(document.getElementById('echarts_pay-exchange_detail'));   // 初始化
    echartGameTimeCountLine.setOption(lineOption, true);

    $.initPayExchange = function (obj) {
        admin.getCols(obj.cols_name).then(function (data) {
            let cols = data.data;
            let param = admin.getFormParam(initExchangeArray.form_class);
            if (obj.page) {
                param.show_type = 2;
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
                        if (res.data.list.length>0){
                            if (res.data.summary!==undefined){
                                summary = res.data.summary;
                                summary.day = "汇总";
                            }
                            returnData = [summary];
                            returnData.push.apply(returnData,res.data.list);
                        }
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.count, //解析数据长度
                            "data":returnData, //解析数据列表
                        };
                    },
                    page: obj.page,
                    loading: true,
                    cols: cols,
                    done: function (res) {
                        // 在这里渲染 echars
                        if (res.data.length>0){
                            res.data.splice(0,1);
                        }
                        line1.css({"width": full.width()});
                        echartGameTimeCountLine = echarts.init(document.getElementById(obj.chart_id)); //  重新初始化
                        // x轴坐标
                        obj.option.xAxis[0]['data'] = [];
                        $.each(res.data, function (key, val) {
                            obj.option.xAxis[0]['data'].push(val['day']);
                        });
                        // 数据
                        $.each(obj.option.series, function (k, v) {

                            obj.option.series[k]['data'] = [];
                        })
                        $.each(res.data, function (key, val) {
                            $.each(obj.option.series, function (k, v) {

                                obj.option.series[k]['data'].push(parseFloat(val[v.field].replace('%', '')));
                            })

                        })

                        echartGameTimeCountLine.setOption(obj.option, true);
                    }
                });
            } else {
                param.show_type = 1;
                table.render({
                    id: obj.tableId,
                    elem: '#' + obj.tableId,
                    url: obj.url,
                    method: 'GET',
                    where: param,//请求参数(额外)
                    limit: Number.MAX_VALUE,
                    parseData: function (res) { //res 即为原始返回的数据
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "data": res.data.list, //解析数据列表
                            "avg": res.data.avg, //解析数据列表
                        };
                    },
                    page: obj.page,
                    loading: true,
                    cols: cols,
                    done: function (res) {

                        pie1.css({"width": half.width()});
                        obj.option.legend['data'] = [];
                        echartGameTimeCountPie = echarts.init(document.getElementById(obj.chart_id)); //  重新初始化
                        // x轴坐标
                        // 数据
                        $.each(res.data, function (k, v) {
                            obj.option.legend['data'].push(v.name);
                        });

                        $.each(obj.option.series, function (k, v) {
                            obj.option.series[k]['data'] = res.data
                        });
                        echartGameTimeCountPie.setOption(obj.option, true);
                    }
                });
            }
        });

    }
    admin.initForms(initExchangeArray.form_name, initExchangeArray.form_id).then(function () {
        //  设置默认时间范围 近7日
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $("input[name='range_time']").parent().css('width', '500px');
        $("select[name='sample_type'] option[value='']").remove();
        form.render('select');
        $.each(initExchangeArray.tableList, function (i, obj) {
            $.initPayExchange(obj);
        });
    })

    // 事件绑定
    $(document).off('click', '.button_exchange').on('click', '.button_exchange', function () {
        if (!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        activeStartCount[event] ? activeStartCount[event].call(this, obj) : '';
    });

    let activeStartCount = {
        search4: search4,
        reset4: reset4,
        export_excel4: export_excel4,
    };

    function search4(obj) {
        $.each(initExchangeArray.tableList, function (i, obj) {
            $.initPayExchange(obj);

        });
    }

    function reset4(obj) {
        admin.resetForm(obj.form_class);
        //  设置默认时间范围 近7日
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $.each(initExchangeArray.tableList, function (i, obj) {
            $.initPayExchange(obj);

        });
    }

    function export_excel4(obj) {
        var data = admin.getFormParam(obj.form_class);
        if (exchangeKey === 'avg') {
            obj.url = '/api/stats_export/recharge/transform';
            data.show_type = 1;
        } else {
            obj.url = '/api/stats_export/recharge/transform';
            data.show_type = 2;
        }
        admin.download({
            url: admin.getUrl(obj.url),
            data: data,
            method: 'get',
            dataType: 'json',
        });
    }

    $(document).off('click', '.exchange_avg').on('click', '.exchange_avg', function () {
        exchangeKey = 'avg';
        $('.exchange_detail').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $('#tab_exchange_detail').removeClass('layui-show');
        $('#tab_exchange_detail').addClass('layui-hidden');
        $('#tab_exchange_total').removeClass('layui-hidden');
        $('#tab_exchange_total').addClass('layui-show');
        layui.table.resize('table_pay-exchange_avg');
    });
    $(document).off('click', '.exchange_detail').on('click', '.exchange_detail', function () {
        exchangeKey = 'detail';
        $('.exchange_avg').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $('#tab_exchange_total').removeClass('layui-show');
        $('#tab_exchange_total').addClass('layui-hidden');
        $('#tab_exchange_detail').removeClass('layui-hidden');
        $('#tab_exchange_detail').addClass('layui-show');


    });
    //对外暴露的接口
    exports('statistics/pay_analyze/pay_exchange', {});
});
