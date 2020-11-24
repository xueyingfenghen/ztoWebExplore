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
    let pieOption = {
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
                data: []
            }
        ]
    }

    let initArray =
        {
            // 日均
            form_name: 'statistics_pay-area_form',
            form_class: '.form_pay-area',
            form_id: '#form_pay-area',
            cols_name: 'statistics_pay-area_table',
            tableId: 'table_pay-area',
            url: admin.getUrl('/api/recharge/range'),
            chart_id: 'echarts_pay-area',

        };
    var pie1 = $("#echarts_pay-area");

    pie1.css({"width": half.width()});
    // 渲染折线框
    let echartPie1 = echarts.init(document.getElementById(initArray.chart_id));   // 初始化

    // 初始echarts图
    echartPie1.setOption(pieOption, true);

    window.reloadEChartPayArea = function (param) {
        if (param == undefined) {
            param = admin.getFormParam(initArray.form_class);
        }
        let chartParam = $.extend(true, {}, param);
        chartParam["get_chart"] = 1;
        admin.req({
            url: initArray.url,
            method: 'get',
            data: chartParam,
            dataType: 'json',
            done: function (res) {
                if (res.code == 0) {
                    pie1.css({"width": half.width()});
                    pieOption.legend['data'] = [];
                    pieOption.series[0]['data'] = []
                    echartPie1 = echarts.init(document.getElementById(initArray.chart_id)); //  重新初始化
                    // x轴坐标
                    // 数据
                    $.each(res.data.list, function (k, v) {
                        pieOption.legend['data'].push(v.range_money);
                        pieOption.series[0]['data'].push({
                            name: v.range_money,
                            value: parseFloat(v['avg_role_rate'].replace('%', '')),
                        })
                    });

                    echartPie1.setOption(pieOption, true);
                }
            },
        });
    }

    $.initPayArea = function (cols, param) {
        layui.table.render({
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

            }
        });
    }
    admin.initForms(initArray.form_name, initArray.form_id).then(function () {
        //  设置默认时间范围 近7日
        $("input[name='range_time']").val(admin.getRecentDay(7));
        $("input[name='range_time']").parent().css('width', '500px');
        admin.getCols(initArray.cols_name).then(function (data) {
            let cols = data.data;
            let param = admin.getFormParam(initArray.form_class);
            //  渲染饼图
            window.reloadEChartPayArea(param);
            $.initPayArea(cols, param);
        })
    });
    //  选择区服
    $("#selectArea").on('click', function () {
        admin.popup({
            title: '输入区间'
            , area: ['650px', '500px']
            , id: 'area_input'
            , btn: ['确定', '取消']
            , success: function (layero, index) {
                layui.view(this.id).render('/statistics/popup/pay/area');
            }, yes: function (index, layero) {
                var params = $('#area_body').serializeArray();
                var area = '';
                var lastArea = 0;
                for (var i = 0; i < params.length; i++) {
                    if (params[i].value === '') {
                        layer.msg('请输入充值金额',{icon:5});
                        return;
                    }

                    if (i % 2) {
                        if (parseInt(params[i].value) < lastArea) {
                            layer.msg('充值区间不符合输入规则，请重新输入',{icon:5});
                            return;
                        }

                        if (i === 1) {
                            area = lastArea + '-' + parseInt(params[i].value);
                        } else {
                            area += ',' + lastArea + '-' + parseInt(params[i].value);
                        }

                    }

                    lastArea = parseInt(params[i].value);
                }
                $("input[name='range_money']").val(area);
                layer.close(index);
            }
        });
    });
    //对外暴露的接口
    exports('statistics/pay_analyze/pay_area', {});
});
