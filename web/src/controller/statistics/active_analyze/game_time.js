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
    let key = 'avg';
    let pieOption = {
        tooltip: {
            trigger: 'item',

        },
        legend: {
            // orient: 'vertical',
            left: 10,
            data: ['0~1分钟', '1~3分钟', '3~10分钟', '10~30分钟', '0.5~3小时', '3小时以上']
        },
        series: [
            {
                name: '访问来源',
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
                data: [

                ]
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
            data: ['0~1分钟', '1~3分钟', '3~10分钟', '10~30分钟', '0.5~3小时', '3小时以上']
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
                name: '0~1分钟',
                type: 'line',
                field: 'one_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '1~3分钟',
                type: 'line',
                field: 'three_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '3~10分钟',
                type: 'line',
                field: 'ten_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '10~30分钟',
                type: 'line',
                field: 'thirty_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '0.5~3小时',
                type: 'line',
                field: 'three_hour_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '3小时以上',
                type: 'line',
                field: 'more_rate',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            }
        ]
    }


    let gameArray =
        {
            // 日均 单次
            form_name: 'statistics_game-time_form',

            form_class: '.form_game-time',
            form_id: '#form_game-time',
            tableList: [
                {
                    cols_name: 'statistics_game-time_table_avg',
                    tableId: 'table_game-time_count_avg',
                    chart_id: 'echarts_game-time_count_avg',
                    option: pieOption,
                    chartType: 'pie',
                    page: false,
                    spanClass: 'count_avg_time',
                    url: admin.getUrl('/api/active/game_time_single_avg')
                },
                {
                    // 日均 单日
                    cols_name: 'statistics_game-time_table_avg_2',
                    tableId: 'table_game-time_day_avg',
                    chart_id: 'echarts_game-time_day_avg',
                    option: pieOption,
                    chartType: 'pie',
                    page: false,
                    spanClass: 'day_avg_time',
                    url: admin.getUrl('/api/active/game_time_day_avg')
                },
                {
                    // 详情 单次
                    cols_name: 'statistics_game-time_table_detail',
                    tableId: 'table_game-time_count_detail',
                    chart_id: 'echarts_game-time_count_detail',
                    option: lineOption,
                    chartType: 'line',
                    page: true,
                    url: admin.getUrl('/api/active/game_time_single_detail')
                },
                {
                    // 详情 单日
                    cols_name: 'statistics_game-time_table_detail',
                    tableId: 'table_game-time_day_detail',
                    chart_id: 'echarts_game-time_day_detail',
                    option: lineOption,
                    chartType: 'line',
                    page: true,
                    url: admin.getUrl('/api/active/game_time_day_detail')
                }],
        }


    $.initGameView = function (obj) {
        admin.getCols(obj.cols_name).then(function (data) {
            let cols = data.data;
            console.log(cols);
            let param = admin.getFormParam(gameArray.form_class);
            if (obj.page) {
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
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.count, //解析数据长度
                            "data": res.data.list, //解析数据列表
                        };
                    },
                    page: obj.page,
                    loading: true,
                    cols: cols,
                    done: function (res) {
                        var lineData = res.data.reverse();
                        // 在这里渲染 echars
                        $('#' + obj.chart_id).css({"width": half.width()});
                        var echartGameTimeCountLine = echarts.init(document.getElementById(obj.chart_id)); //  重新初始化
                        // x轴坐标
                        obj.option.xAxis[0]['data'] = [];
                        $.each(lineData, function (key, val) {
                            obj.option.xAxis[0]['data'].push(val['day']);
                        });
                        // 数据
                        $.each(obj.option.series, function (k, v) {

                            obj.option.series[k]['data']=[];
                        })
                        $.each(lineData, function (key, val) {
                            $.each(obj.option.series, function (k, v) {

                                obj.option.series[k]['data'].push(val[v.field].toFixed(2));
                            });

                        });
                        echartGameTimeCountLine.setOption(obj.option, true);
                    }
                });
            } else {
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
                            "avg": res.data.avg
                        };
                    },
                    page: obj.page,
                    loading: true,
                    cols: cols,
                    done: function (res) {

                        if (res.code == 0) {
                            $('.' + obj.spanClass).html(res.avg)
                        }

                        // 在这里渲染 echars
                        $('#' + obj.chart_id).css({"width": half.width()});

                        var echartGameTimeCountPie = echarts.init(document.getElementById(obj.chart_id)); //  重新初始化

                        $.each(obj.option.series, function (k, v) {
                            obj.option.series[k]['data'] = res.data
                        });
                        echartGameTimeCountPie.setOption(obj.option, true);
                    }
                });
            }
        });
    }
        admin.initForms(gameArray.form_name, gameArray.form_id).then(function () {
            //  设置默认时间范围 近7日
            $("input[name='game_time']").val(admin.getRecentDay(7));
            $("select[name='player_type'] option[value='']").remove();
            form.render('select');
            $.each(gameArray.tableList, function (i, obj) {
                $.initGameView(obj);
            });
        })

    // 事件绑定
    $(document).off('click', '.button_game_time').on('click', '.button_game_time', function () {
        if (!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        activeGameTime[event] ? activeGameTime[event].call(this, obj) : '';
    });

    let activeGameTime = {
        search3: search3,
        reset3: reset3,
        export_excel3: export_excel3,
    };

    function search3(obj) {
        $.each(gameArray.tableList, function (i, obj) {
            $.initGameView(obj);
        });
    }

    function reset3(obj) {
        admin.resetForm(obj.form_class);
        //  设置默认时间范围 近7日
        $("input[name='game_time']").val(admin.getRecentDay(7));
        $.each(gameArray.tableList[key], function (i, obj) {
            $.initGameView(obj);
        });
    }

    function export_excel3(obj) {
        if (key === 'avg') {
            obj.url = '/api/stats_export/active/game_time_avg';
        } else {
            obj.url = '/api/stats_export/active/game_time_detail';
        }
        admin.download({
            url: admin.getUrl(obj.url),
            data: admin.getFormParam(obj.form_class),
            method: 'get',
            dataType: 'json',
        });
    }

    // $(document).off('click', '.day_avg').on('click', '.day_avg', function () {
    //     $('.time_detail').addClass('layui-btn-primary');
    //     $(this).removeClass('layui-btn-primary');
    //     key = 'avg';
    //     $.initGameTime(key);
    //
    // });
    // $(document).off('click', '.time_detail').on('click', '.time_detail', function () {
    //     $('.day_avg').addClass('layui-btn-primary');
    //     $(this).removeClass('layui-btn-primary');
    //     key = 'detail';
    //     $.initGameTime(key);
    // });

    $(document).off('click', '.day_avg').on('click', '.day_avg', function () {
        key = 'avg';

        $('.time_detail').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $('#tab_time_detail').removeClass('layui-show');
        $('#tab_time_detail').addClass('layui-hidden');
        $('#tab_day_avg').removeClass('layui-hidden');
        $('#tab_day_avg').addClass('layui-show');
        layui.table.resize('table_game-time_count_avg');
        layui.table.resize('table_game-time_day_avg');
    });
    $(document).off('click', '.time_detail').on('click', '.time_detail', function () {
        key = 'detail';

        $('.day_avg').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $('#tab_day_avg').removeClass('layui-show');
        $('#tab_day_avg').addClass('layui-hidden');
        $('#tab_time_detail').removeClass('layui-hidden');
        $('#tab_time_detail').addClass('layui-show');
        layui.table.resize('table_game-time_count_detail');
        layui.table.resize('table_game-time_day_detail');

    });
    //对外暴露的接口
    exports('statistics/active_analyze/game_time', {});
});
