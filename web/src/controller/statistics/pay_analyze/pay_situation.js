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
            form_name: 'statistics_pay-situation_form',
            cols_name: 'statistics_pay-situation_table',
            tableId: 'table_pay-situation',
            form_class: '.form_pay-situation',
            form_id: '#form_pay-situation',
            url: admin.getUrl('/api/recharge/situation')
        },
    ];
    var line = $('#echarts_pay-situation');
    line.css({"width": full.width()});
    // 渲染折线框
    let situationChart = echarts.init(document.getElementById('echarts_pay-situation'));   // 初始化
    // 初始echarts图
    let situationOption = {
        tooltip: {
            trigger: 'axis',
            formatter: function (axisData) {
                return axisData[2].name + '</br>' +
                    axisData[0].seriesName + ' : ' + axisData[0].data + '</br>' +
                    axisData[1].seriesName + ' : ' + axisData[1].data + '</br>' +
                    axisData[2].seriesName + ' : ' + axisData[2].data + '%</br>';
            }
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
            data: ['ARPU', 'ARPPU', '活跃付费率']
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
                name: '',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: '付费率',
                min: 0,
                max: 100,
                axisLabel: {
                    formatter: '{value}%'
                }
            },
        ],
        series: [
            {
                name: 'ARPU',
                field: 'arpu',
                type: 'bar',
                data: []
            },
            {
                name: 'ARPPU',
                field: 'arppu',
                type: 'bar',
                data: []
            }
            ,
            {
                name: '活跃付费率',
                field: 'recharge_rate',
                type: 'line',
                yAxisIndex: 1,
                data: []
            }
        ]
    }

    situationChart.setOption(situationOption, true);

    window.reloadEChartPaySituation = function(param){
        if(param == undefined) {
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
                if(res.code == 0){
                    line.css({"width": full.width()});
                    situationChart = echarts.init(document.getElementById('echarts_pay-situation')); //  重新初始化
                    // x轴坐标
                    situationOption.xAxis[0]['data'] = [];
                    $.each(res.data.list, function (key, val) {
                        situationOption.xAxis[0]['data'].push(val['day']);
                    });
                    // 数据
                    $.each(situationOption.series, function (k, v) {

                        situationOption.series[k]['data'] = [];
                    });
                    $.each(res.data.list, function (key, val) {
                        $.each(situationOption.series, function (k, v) {
                            if (v.field === 'recharge_rate') {
                                situationOption.series[k]['data'].push(parseFloat(val[v.field].replace('%', '')));
                            } else {
                                situationOption.series[k]['data'].push(val[v.field]);
                            }

                        })
                    });
                    situationChart.setOption(situationOption, true);
                }
            },
        });
    }

    $.each(situationArray, function (i, obj) {
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            $("input[name='range_time']").parent().css('width', '500px');
            $("input[name='range_time']").val(admin.getRecentDay(7));
            $("select[name='sample_type'] option[value='']").remove();
            $("select[name='time_type'] option[value='']").remove();
            form.render('select');
            admin.getCols(obj.cols_name).then(function (data) {
                let cols = data.data;
                let param = admin.getFormParam(obj.form_class);
                // 在这里渲染 echars
                window.reloadEChartPaySituation(param);
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
                            "count": res.data.total, //解析数据长度
                            "data": res.data.list, //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: cols,
                    done: function (res) {

                    }
                });
            });
        });
    });


    //对外暴露的接口
    exports('statistics/pay_analyze/pay_situation', {});
});
