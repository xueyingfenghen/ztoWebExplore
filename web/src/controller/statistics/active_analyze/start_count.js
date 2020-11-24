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
    let startCountKey = 'avg';
    let pieOption = {
        tooltip: {
            trigger: 'item',

        },
        legend: {
            // orient: 'vertical',
            left: 10,
            data: ['0~2次', '3~5次', '6~9次', '10~15次', '16~30次', '30次以上']
        },
        series: [
            {
                name: '游戏时长',
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
            data: ['0~2次', '3~5次', '6~9次', '10~15次', '16~30次', '30次以上']
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: []
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
                name: '0~2次',
                field: 'one_time_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '3~5次',
                field: 'three_time_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '6~9次',
                field: 'six_time_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '10~15次',
                field: 'ten_time_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '16~30次',
                field: 'sixteen_time_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            },
            {
                name: '30次以上',
                field: 'thirty_time_rate',
                type: 'line',
                stack: '总量',
                smooth: true,
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                data: []
            }
        ]
    }


    let startArray =
        {
            // 日均
            form_name: 'statistics_start-count_form',

            form_class: '.form_start-count',
            form_id: '#form_start-count',
            tableList: [
                {
                    cols_name: 'statistics_start-count_table_avg',
                    tableId: 'table_start-count_avg',
                    chart_id: 'echarts_start-count_avg',
                    option: pieOption,
                    chartType: 'pie',
                    page: false,
                    spanClass: 'avg_start',
                    url: admin.getUrl('/api/active/start_count_avg')
                },
                {
                    cols_name: 'statistics_start-count_table_detail',
                    tableId: 'table_start-count_detail',
                    chart_id: 'echarts_start-count_detail',
                    option: lineOption,
                    chartType: 'line',
                    page: true,
                    url: admin.getUrl('/api/active/start_count_detail')
                },
            ],

        }

    let pie1 = $("#echarts_start-count_avg");
    let line1 = $("#echarts_start-count_detail");
    pie1.css({"width": half.width()});
    line1.css({"width": full.width()});
    // 渲染折线框
    let echartGameTimeCountPie = echarts.init(document.getElementById('echarts_start-count_avg'));   // 初始化

    // 初始echarts图
    echartGameTimeCountPie.setOption(pieOption, true);


    let echartGameTimeCountLine = echarts.init(document.getElementById('echarts_start-count_detail'));   // 初始化
    echartGameTimeCountLine.setOption(lineOption, true);

    $.initStartCount = function (obj) {
        admin.getCols(obj.cols_name).then(function (data) {
            let cols = data.data;
            let param = admin.getFormParam(startArray.form_class);
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
                        // 在这里渲染 echars
                        var lineData = res.data.reverse();
                        line1.css({"width": full.width()});
                        echartGameTimeCountLine = echarts.init(document.getElementById(obj.chart_id)); //  重新初始化
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
                            })

                        })

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
                            "avg": res.data.avg, //解析数据列表
                        };
                    },
                    page: obj.page,
                    loading: true,
                    cols: cols,
                    done: function (res) {
                        // 在这里渲染 echars
                        if (res.code == 0) {
                            $('.' + obj.spanClass).html(res.avg)
                        }

                        pie1.css({"width": half.width()});

                        echartGameTimeCountPie = echarts.init(document.getElementById(obj.chart_id)); //  重新初始化
                        // x轴坐标
                        // 数据

                        $.each(obj.option.series, function (k, v) {
                            obj.option.series[k]['data'] = res.data
                        });
                        echartGameTimeCountPie.setOption(obj.option, true);
                    }
                });
            }
        });

    }
    admin.initForms(startArray.form_name, startArray.form_id).then(function () {
        //  设置默认时间范围 近7日
        $("input[name='start_time']").val(admin.getRecentDay(7));
        $("select[name='player_type'] option[value='']").remove();
        $("select[name='sample_type'] option[value='']").remove();
        form.render('select');
        $.each(startArray.tableList, function (i, obj) {
            $.initStartCount(obj);

        });
    })

    // 事件绑定
    $(document).off('click', '.button_start_count').on('click', '.button_start_count', function () {
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
        $.each(startArray.tableList, function (i, obj) {
            $.initStartCount(obj);

        });
    }

    function reset4(obj) {
        admin.resetForm(obj.form_class);
        //  设置默认时间范围 近7日
        $("input[name='start_time']").val(admin.getRecentDay(7));
        $.each(startArray.tableList, function (i, obj) {
            $.initStartCount(obj);

        });
    }

    function export_excel4(obj) {
        if (startCountKey === 'avg') {
            obj.url = '/api/stats_export/active/start_count_avg';
        } else {
            obj.url = '/api/stats_export/active/start_count_detail';
        }
        admin.download({
            url: admin.getUrl(obj.url),
            data: admin.getFormParam(obj.form_class),
            method: 'get',
            dataType: 'json',
        });
    }

    $(document).off('click', '.start_avg').on('click', '.start_avg', function () {
        startCountKey = 'avg';

        $('.start_detail').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $('#tab_count_detail').removeClass('layui-show');
        $('#tab_count_detail').addClass('layui-hidden');
        $('#tab_count_avg').removeClass('layui-hidden');
        $('#tab_count_avg').addClass('layui-show');
        layui.table.resize('table_start-count_avg');
    });
    $(document).off('click', '.start_detail').on('click', '.start_detail', function () {
        startCountKey = 'detail';
        $('.start_avg').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $('#tab_count_avg').removeClass('layui-show');
        $('#tab_count_avg').addClass('layui-hidden');
        $('#tab_count_detail').removeClass('layui-hidden');
        $('#tab_count_detail').addClass('layui-show');


    });
    //对外暴露的接口
    exports('statistics/active_analyze/start_count', {});
});
