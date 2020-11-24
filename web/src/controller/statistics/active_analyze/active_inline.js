layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;


    let initArray = [
        {
            // 在线情况
            form_name: 'statistics_active_inline_form',
            cols_name: 'statistics_active_inline_table',
            tableId: 'table_active_inline_list',
            form_class: '.form_active_inline',
            form_id: '#form_active_inline',
            url: admin.getUrl('/api/active/online')
        }
    ];

    // 渲染折线框
    let myChartOnline = echarts.init(document.getElementById('echarts_online'));   // 初始化
    // 初始echarts图
    let option_online = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        legend: {
            data: ['最高平均在线']
        },
        xAxis: [
            {
                type: 'category',
                data: [1,2,3,3,3,3,3,3,3,3,3,3], // x 轴坐标
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '最高平均在线',
                axisLabel: {
                    formatter: '{value}'
                }
            },
        ],
        series: [
            {
                name: '最高平均在线',
                type: 'line',
                yAxisIndex: 0,
                data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 92.0, 6.2]
            }
        ]
    };

    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围 近7日
            $("input[name='range_time']").val(admin.getRecentDay(7));

            admin.getCols(obj.cols_name).then(function (data) {
                let cols = data.data;
                let param = admin.getFormParam(obj.form_class);
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
                            "count": 1, //解析数据长度
                            "data": [res.data.online], //解析数据列表
                            "cur_online": res.data.cur_online
                        };
                    },
                    page: true,
                    loading: true,
                    cols: data.data,
                    done: function (res) {
                        if (res.code == 0) {
                            $('.online_now').html(res.cur_online)
                        }

                        // 在这里渲染 echars
                        myChartOnline = echarts.init(document.getElementById('echarts_online')); //  重新初始化
                        // x轴坐标
                        option_online.xAxis[0]['data'] = [];
                        $.each(cols[0], function (key, val) {
                            if (key != 0) {
                                option_online.xAxis[0]['data'].push(val['title']);
                            }
                        });

                        // 数据
                        option_online.series[0]['data'] = [];

                        let timeArr = {
                            0: '00', 1: '01', 2: '02', 3: '03', 4: '04', 5: '05', 6: '06', 7: '07', 8: '08', 9: '09', 10: '10', 11: '11', 12: '12',
                            13: '13', 14: '14', 15: '15', 16: '16', 17: '17', 18: '18', 19: '19', 20: '20', 21: '21', 22: '22', 23: '23'
                        }

                        for (let k in timeArr) {
                            let temp = 0;
                            $.each(res.data[0], function (key, val) {
                                if (key == timeArr[k]) {
                                    temp ++;
                                }
                            })
                            if (temp != 0) {
                                option_online.series[0]['data'].push(res.data[0][timeArr[k]]);
                            } else {
                                option_online.series[0]['data'].push(0);
                            }
                        }

                        myChartOnline.setOption(option_online, true);
                    }
                });
            });
        });
    });

    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if(!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    var active = {
        search:search,
        reset:reset,
        export_excel: export_excel
    };

    function showChart(obj) {
        switch (obj.tableId) {
            case 'table_active-situation_list':
                //  充值
                let param = admin.getFormParam(obj.form_class);
                window.reloadEChartActiveSituation(param);
                break;
        }
    }

    function search(obj) {
        admin.reload(obj.form_class, obj.tableId);
        showChart(obj);
    }

    function reset(obj) {
        console.log(obj.form_class)
        admin.resetForm(obj.form_class);
        showChart(obj);
        admin.reload(obj.form_class, obj.tableId);
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
    exports('statistics/active_analyze/active_inline', {});
});
