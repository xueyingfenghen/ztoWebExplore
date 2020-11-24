layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'tools/recentDate'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;
    let half = $('#half');
    let full = $('#full');

    let situationArray = [
        {
            // 活跃情况情况
            form_name: 'statistics_active-situation_form',
            cols_name: 'statistics_active-situation_table',
            tableId: 'table_active-situation_list',
            form_class: '.form_active-situation',
            form_id: '#form_active-situation',
            url: admin.getUrl('/api/active/situation')
        },
    ];
    var line = $('#echarts_situation');
    line.css({"width": full.width() });
    // 渲染折线框
    let mySituationChart = echarts.init(document.getElementById('echarts_situation'));   // 初始化
    // 初始echarts图
    let option_situation = {
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
            data: ['活跃设备数', '活跃角色数','活跃用户数']
        },
        xAxis: [
            {
                type: 'category',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // x 轴坐标
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '活跃数量',
                axisLabel: {
                    formatter: '{value}'
                }
            },
        ],
        series: [
            {
                name: '活跃设备数',
                filed: 'device_id',
                type: 'line',
                data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
            },
            {
                name: '活跃角色数',
                filed: 'role_id',
                type: 'line',
                data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 92.0, 6.2]
            }
            ,
            {
                name: '活跃用户数',
                filed: 'user_id',
                type: 'line',
                data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 92.0, 6.2]
            }
        ]
    }

    mySituationChart.setOption(option_situation, true);
    window.reloadEChartActiveSituation = function (param) {
        if (param == undefined) {
            param = admin.getFormParam(situationArray[0].form_class);
        }
        let chartParam = $.extend(true, {}, param);
        chartParam["get_chart"] = 1;
        admin.req({
            url: situationArray[0].url,
            method: 'get',
            data: chartParam,
            dataType: 'json',
            done: function (res) {
                if (res.code == 0) {
                    line.css({"width": full.width()});
                    // 在这里渲染 echars
                    mySituationChart = echarts.init(document.getElementById('echarts_situation')); //  重新初始化
                    // x轴坐标
                    option_situation.xAxis[0]['data'] = [];
                    $.each(res.data.list, function (key, val) {
                        option_situation.xAxis[0]['data'].push(val['day']);

                    });

                    // 数据

                    $.each(option_situation.series, function (k, v) {
                        option_situation.series[k]['data'] = [];
                        $.each(res.data.list, function (key, val) {
                            option_situation.series[k]['data'].push(val[v.filed]);
                        })
                    })

                    mySituationChart.setOption(option_situation, true);
                }
            },
        });
    }
    $.each(situationArray, function (i, obj) {
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围 近7日
            setDefaultRangeTime();
            $("select[name='report_type']").attr('lay-filter', 'time_type');
            $("select[name='report_type'] option[value='']").remove();
            $("select[name='player_type'] option[value='']").remove();

            form.render('select');
            admin.getCols(obj.cols_name).then(function (data) {
                let cols = data.data;
                let param = admin.getFormParam(obj.form_class);
                window.reloadEChartActiveSituation(param);
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
                        console.log(res);
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.count, //解析数据长度
                            "data": res.data.list, //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: cols,

                });
            });
        });
    });
    form.on('select(time_type)', function (data) {
        setDefaultRangeTime();
    });
    //  设置默认时间范围
    function setDefaultRangeTime()
    {
        let timeType = $("select[name='report_type']").val();
        if(timeType == 2){
            $("#situation_time").val(admin.getRecentWeek(4));
        }else if(timeType == 3) {
            $("#situation_time").val(admin.getRecentMonth(3));
        }else {
            $("#situation_time").val(admin.getRecentDay(7));
        }
    }
    //对外暴露的接口
    exports('statistics/active_analyze/active_situation', {});
});
