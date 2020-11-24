layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'formSelects', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;
    let formSelects = layui.formSelects;

    // 渲染折线框
    let myChartKeep = echarts.init(document.getElementById('echars_list_increased_keep'));   // 初始化
    // 初始echarts图
    let option_keep = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            },
            formatter: function( datas ) {
                let htmls = datas[0].name + '</br>';
                for (let i = 0; i < datas.length; i ++) {
                    htmls += datas[i].seriesName + ':' + datas[i].data;
                    htmls += i == 0 ? '' : '%';
                    htmls += '</br>';
                }
                return htmls;
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
                max: 100,
                axisLabel: {
                    formatter: '{value} %'
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


    let initArray = [
        {
            // 充值留存
            form_name: 'statistics_increased_keep_form',
            cols_name: 'statistics_increased_keep_table',
            tableId: 'table_increased_keep_list',
            form_class: '.form_increased_keep',
            form_id: '#form_increased_keep',
            url: admin.getUrl('/api/increase/user_remain')
        }
    ]

    let cols;
    let result;
    let summaryData = {};

    // 下拉多选框赋予默认值
    layui.formSelects.value('keep', ['user_two_remain', 'user_three_remain']);

    $.initEcharts = function (res, cols) {
        // 在这里渲染 echars
        myChartKeep = echarts.init(document.getElementById('echars_list_increased_keep')); //  重新初始化
        option_keep = admin.getOption(option_keep, res.data, cols, ['add_users'], formSelects.value('keep', 'val'), 'day');
        myChartKeep.setOption(option_keep, true);
    }

    //  渲染图表
    window.reloadEChartIncreaseKeep = function(param) {
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
                    $.initEcharts(result, cols);
                }
            },
        });
    }

    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            setDefaultRangeTime();
            $("select[name='time_type']").attr('lay-filter', 'time_type');
            $("select[name='sample_type'] option[value='']").remove();
            $("select[name='time_type'] option[value='']").remove();
            form.render('select');
            admin.getCols(obj.cols_name).then(function (data) {
                cols = data.data;
                let param = admin.getFormParam(obj.form_class);
                //  渲染图表
                window.reloadEChartIncreaseKeep(param);
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
                        let dataList = [];
                        if(res.data.summary_data != undefined){
                            summaryData = res.data.summary_data;
                        }
                        if(summaryData != undefined){
                            dataList.push.apply(dataList,summaryData);
                        }
                        dataList.push.apply(dataList,res.data.list);
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.msg, //解析提示文本
                            "count": res.data.total, //解析数据长度
                            "data": dataList //解析数据列表
                        };
                    },
                    page: true,
                    loading: true,
                    cols: cols,
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

    form.on('select(time_type)', function (data) {
        setDefaultRangeTime();
    });

    // formSelects监听
    layui.formSelects.on('keep', function(id, vals, val, isAdd, isDisabled){
        //id:           点击select的id
        //vals:         当前select已选中的值
        //val:          当前select点击的值
        //isAdd:        当前操作选中or取消
        //isDisabled:   当前选项是否是disabled

        $.initEcharts(result, cols);

    }, true);


    //  设置默认时间范围
    function setDefaultRangeTime()
    {
        let timeType = $("select[name='time_type']").val();
        if(timeType == 2){
            $("input[name='range_time']").val(admin.getRecentWeek(4));
        }else if(timeType == 3) {
            $("input[name='range_time']").val(admin.getRecentMonth(3));
        }else {
            $("input[name='range_time']").val(admin.getRecentDay(7));
        }
    }


    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if(!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    let active = {
        search:search,
        reset:reset,
        export_excel: export_excel
    };

    function search(obj) {
        admin.reload(obj.form_class, obj.tableId);
        showChart(obj);
    }

    function reset(obj) {
        admin.resetForm(obj.form_class);
        admin.reload(obj.form_class, obj.tableId);
        showChart(obj);
    }

    function showChart(obj) {
        switch (obj.tableId) {
            case 'table_increased_keep_list':
                window.reloadEChartIncreaseKeep();
                break;
            case 'table_increased_ltv_list':
                window.reloadEChartIncreaseLtv();
                break;
        }
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
    exports('statistics/newly_increased/increased_keep', {});
});
