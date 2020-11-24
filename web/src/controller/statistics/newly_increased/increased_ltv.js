layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'formSelects', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;
    let formSelects = layui.formSelects;

    // 渲染折线框
    let myChartLTV = echarts.init(document.getElementById('echars_list_increased_ltv'));   // 初始化
    // 初始echarts图
    let option_ltv = {
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
            data: ['新增人数', '留存率']
        },
        xAxis: [
            {
                type: 'category',
                data: [], // x 轴坐标
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
            yAxis: [
        {
            type: 'value',
            name: '新增人数',
            axisLabel: {
                formatter: '{value}'
            }
        },
        {
            type: 'value',
            name: '留存率',
            min: 0,
            max: 1,
            axisLabel: {
                formatter: '{value} '
            }
        }
    ],
        series: [
        {
            name: '新增人数',
            type: 'bar',
            barWidth: 30,
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
        },
        {
            name: '留存率',
            type: 'line',
            yAxisIndex: 1,
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 92.0, 6.2]
        }
    ]
    }

    option_ltv.yAxis = [
        {
            type: 'value',
            axisLabel: {
                formatter: '{value}'
            }
        },
    ];

    let initArray = [
        {
            // 充值留存
            form_name: 'statistics_increased_ltv_form',
            cols_name: 'statistics_increased_ltv_table',
            tableId: 'table_increased_ltv_list',
            form_class: '.form_increased_ltv',
            form_id: '#form_increased_ltv',
            url: admin.getUrl('/api/increase/user_ltv')
        }
    ];

    let cols;
    let result;

    $.initEchartsLTV = function (res, cols) {
        // 在这里渲染 echars
        myChartLTV = echarts.init(document.getElementById('echars_list_increased_ltv')); //  重新初始化
        option_ltv = admin.getOption(option_ltv, res.data, cols, [], formSelects.value('ltv', 'val'), 'day', 0);
        myChartLTV.setOption(option_ltv, true);
    }

    // 下拉多选框赋予默认值
    layui.formSelects.value('ltv', ['user_three_ltv', 'user_seven_ltv']);

    //  渲染图表
    window.reloadEChartIncreaseLtv =function(param) {
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
                    result = {
                        "data": res.data.list,
                    };
                    $.initEchartsLTV(result, cols);
                }
            },
        });
    }

    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围-近7日
            $("input[name='range_time']").val(admin.getRecentDay(7));
            $("select[name='sample_type'] option[value='']").remove();
            form.render('select');

            admin.getCols(obj.cols_name).then(function (data) {
                cols = data.data;
                let param = admin.getFormParam(obj.form_class);
                window.reloadEChartIncreaseLtv(param);
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
                            "count": res.data.total, //解析数据长度
                            "data": res.data.list //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: data.data,
                    done: function (res) {
                        if (res.code != 0) {
                            res.data = [];
                            res.count = 0;
                        }
                    }
                });
            });
        });
    });

    // formSelects监听
    layui.formSelects.on('ltv', function(id, vals, val, isAdd, isDisabled){
        //id:           点击select的id
        //vals:         当前select已选中的值
        //val:          当前select点击的值
        //isAdd:        当前操作选中or取消
        //isDisabled:   当前选项是否是disabled

        $.initEchartsLTV(result, cols);

    }, true);


    //对外暴露的接口
    exports('statistics/newly_increased/increased_ltv', {});
});
