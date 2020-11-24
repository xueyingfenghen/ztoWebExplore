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
    let pieOption1 = {
        tooltip: {
            trigger: 'item',
            formatter: function (axisData) {
                return axisData.seriesName + '</br>' +
                    axisData.name + ' : ' + axisData.value + '%</br>'
            }
        },
        legend: {
            // orient: 'vertical',
            left: 10,
            data: []
        },
        series: [
            {
                name: '充值项分布',
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
    let pieOption2 = {
        tooltip: {
            trigger: 'item',
            formatter: function (axisData) {
                return axisData.seriesName + '</br>' +
                    axisData.name + ' : ' + axisData.value + '%</br>'
            }
        },
        legend: {
            // orient: 'vertical',
            left: 10,
            data: []
        },
        series: [
            {
                name: '充值项分布',
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
    let initArray =
        {
            // 日均
            form_name: 'statistics_pay-item_form',
            form_class: '.form_pay-item',
            form_id: '#form_pay-item',
            cols_name: 'statistics_pay-item_table',
            tableId: 'table_pay-item',
            url: admin.getUrl('/api/recharge/props')

        }
    var pie1 = $("#echarts_pay-item_role");
    var pie2 = $("#echarts_pay-item_money");

    pie1.css({"width": half.width()});
    pie2.css({"width": half.width()});
    // 渲染折线框
    let echartPie1 = echarts.init(document.getElementById('echarts_pay-item_role'));   // 初始化
    let echartPie2 = echarts.init(document.getElementById('echarts_pay-item_money'));   // 初始化

    // 初始echarts图
    echartPie1.setOption(pieOption1, true);
    echartPie2.setOption(pieOption2, true);

    admin.initForms(initArray.form_name, initArray.form_id).then(function () {
        //  设置默认时间范围 近7日
        $("input[name='range_time']").parent().css('width', '500px');
        $("input[name='range_time']").val(admin.getRecentDay(7));
        admin.getCols(initArray.cols_name).then(function (data) {
            let cols = data.data;
            let param = admin.getFormParam(initArray.form_class);
            table.render({
                id: initArray.tableId,
                elem: '#' + initArray.tableId,
                url: initArray.url,
                method: 'GET',
                where: param,//请求参数(额外)
                limit: Number.MAX_VALUE,
                parseData: function (res) { //res 即为原始返回的数据
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.msg, //解析提示文本
                        "data": res.data.list, //解析数据列表
                    };
                },
                page: false,
                loading: true,
                cols: cols,
                done: function (res) {

                    pie1.css({"width": half.width()});
                    pie2.css({"width": half.width()});
                    pieOption1.legend['data'] = [];
                    pieOption2.legend['data'] = [];
                    pieOption1.series[0]['data'] = [];
                    pieOption2.series[0]['data'] = [];
                    echartPie1 = echarts.init(document.getElementById('echarts_pay-item_role')); //  重新初始化
                    echartPie2 = echarts.init(document.getElementById('echarts_pay-item_money')); //  重新初始化
                    // x轴坐标

                    $.each(res.data, function (k, v) {
                        pieOption1.legend['data'].push(v.name);
                        pieOption2.legend['data'].push(v.name);
                        pieOption1.series[0]['data'].push({
                            name: v.name,
                            value: parseFloat(v['role_rate'].replace('%', '')),
                        });
                        pieOption2.series[0]['data'].push({
                            name: v.name,
                            value: parseFloat(v['money_rate'].replace('%', '')),
                        });
                    });
                    echartPie1.setOption(pieOption1, true);
                    echartPie2.setOption(pieOption2, true);
                }
            });

        })
    });
    //对外暴露的接口
    exports('statistics/pay_analyze/pay_item', {});
});
