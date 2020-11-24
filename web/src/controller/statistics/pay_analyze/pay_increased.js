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
    let initArray = [
        {
            // 活跃情况情况
            form_name: 'statistics_pay-increased_form',
            cols_name: 'statistics_pay-increased_table',
            tableId: 'table_pay-increased',
            form_class: '.form_pay-increased',
            form_id: '#form_pay-increased',
            url: admin.getUrl('/api/recharge/new_recharge')
        },
    ];
    var line = $('#echarts_pay-increased');
    line.css({"width": full.width()});
    // 渲染折线框
    let chart = echarts.init(document.getElementById('echarts_pay-increased'));   // 初始化
    // 初始echarts图
    let option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (axisData) {
                return axisData[0].name + '</br>' +
                    axisData[0].seriesName + ' : ' + axisData[0].data + '</br>' +
                    axisData[1].seriesName + ' : ' + axisData[1].data + '</br>' +
                    axisData[2].seriesName + ' : ' + axisData[2].data + '%</br>' +
                    axisData[3].seriesName + ' : ' + axisData[3].data + '%</br>';
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
            data: ['新增充值人数', '首日充值人数','新增充值率','首日充值率']
        },
        xAxis: [
            {
                type: 'category',
                data: [], // x 轴坐标

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
                name: '充值率',
                min: 0,
                max: 100,
                axisLabel: {
                    formatter: '{value}%'
                }
            },
        ],
        series: [
            {
                name: '新增充值人数',
                field: 'new_recharge_users',
                type: 'bar',
                data: []
            },
            {
                name: '首日充值人数',
                field: 'first_recharge_users',
                type: 'bar',
                data: []
            }
            ,
            {
                name: '新增充值率',
                field: 'new_recharge_rate',
                type: 'line',
                yAxisIndex: 1,
                data: []
            }
            ,
            {
                name: '首日充值率',
                field: 'first_recharge_rate',
                type: 'line',
                yAxisIndex: 1,
                data: []
            }
        ]
    }

    chart.setOption(option, true);

    window.reloadEChartPayIncrease = function(param){
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
                    chart = echarts.init(document.getElementById('echarts_pay-increased')); //  重新初始化
                    // x轴坐标
                    option.xAxis[0]['data'] = [];
                    $.each(res.data.list, function (key, val) {
                        option.xAxis[0]['data'].push(val['day']);
                    });
                    // 数据
                    $.each(option.series, function (k, v) {

                        option.series[k]['data'] = [];
                    })
                    $.each(res.data.list, function (key, val) {
                        $.each(option.series, function (k, v) {
                            if (v.field === 'new_recharge_rate'||v.field === 'first_recharge_rate') {
                                option.series[k]['data'].push(parseFloat(val[v.field].replace('%', '')));
                            } else {
                                option.series[k]['data'].push(val[v.field]);
                            }
                        })
                    })

                    chart.setOption(option, true);
                }
            },
        });
    }

    $.each(initArray, function (i, obj) {
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
                window.reloadEChartPayIncrease(param);
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
                            "count": res.data.total, //解析数据长度
                            "data":returnData, //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: cols,
                    done: function (res) {
                        if (res.data.length>0){
                            res.data.splice(0,1);
                        }

                    }
                });
            });
        });
    });


    //对外暴露的接口
    exports('statistics/pay_analyze/pay_increased', {});
});
