layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'echarts', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let echarts = layui.echarts;
    let $ = layui.jquery;

    let initArray = [
        {
            // 充值留存
            form_name: 'statistics_runoff_node_form',
            cols_name: 'statistics_runoff_node_table_loss_vip',
            tableId: 'table_runoff_node_list_',
            form_class: '.form_runoff_node',
            form_id: '#form_runoff_node',
            url: admin.getUrl('/api/user_loss/loss_node')
            // url: './json/test/node.json'
        }
    ];

    let nodeArr = {loss_vip: 'VIP等级'};
    let echartsKey = 'echars_list_runoff_node_';
    let tableKey = 'table_runoff_node_list_';
    let tableCols = 'statistics_runoff_node_table_';

    let option_node = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            // orient: 'vertical',
            left: 'center',
            bottom: 20,
            top: 10,
            data: []
        },
        series: [
            {
                name: '流失玩家数',
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
                    // {value: 335, name: '直接访问'},
                    // {value: 310, name: '邮件营销'},
                    // {value: 234, name: '联盟广告'},
                    // {value: 135, name: '视频广告'},
                    // {value: 1548, name: '搜索引擎'}
                ]
            }
        ]
    };


    // 请求接口，渲染table和echarts
    $.initNode = function () {
        let param = admin.getFormParam(initArray[0].form_class);
        param.page = 1;
        param.page_size = 100;
        admin.req({
            url: initArray[0].url,
            data: param,
            type: 'get',
            done: function (data) {

                // if (data.data.list.length < 1) {
                //     return ;
                // }

                let ul_html = '';
                let cont_html = '';
                let i = 0;
                $.each(data.data, function (key, val) {
                    // 根据返回的渲染界面
                    ul_html += i == 0 ? "<li class='layui-this'>" + nodeArr[key] + "</li>" : "<li>" + nodeArr[key] + "</li>";
                    let show = i == 0 ? ' layui-show' : '';
                    cont_html +=
                        "<div class='layui-tab-item" + show + "'>" +
                        // "qqq" + i +
                        "<div id='" + echartsKey + key + "' style='width: 100%;height: 500px;'></div>" +
                        "<table id='" + tableKey + key + "'></table>" +
                        "</div>";
                    i ++;
                });

                $('#node_ul').html(ul_html);
                $('#node_cont').html(cont_html);

                $.each(data.data, function (key, val) {
                    // 渲染各个table
                    admin.getCols(tableCols + key).then(function (res) {
                        res.data[0][2]['templet'] = function (d) {
                            let temp = res.data[0][0]['field'];
                            return "<button type='button' class='layui-btn layui-btn-sm detail' data-type='" + key + "' data-data='" + d[temp] + "'>查看详情</button>";
                        };
                        table.render({
                            id: tableKey + key,
                            elem: '#' + tableKey + key,
                            page: false,
                            limit: 1000,
                            loading: true,
                            cols: res.data,
                            data: val
                        });
                    });

                    // 渲染echarts
                    $("#" + echartsKey + key).css({"width":$("#" + echartsKey + key).width(),"height":$("#" + echartsKey + key).height()});
                    let myChart = echarts.init(document.getElementById(echartsKey + key));
                    let option = option_node;
                    option.legend.data = [];
                    option.series[0].data = [];
                    $.each(val, function (k, v) {
                        option.legend.data.push(v['role_vip'])
                        option.series[0].data.push({value: v['loss_users'], name: v['role_vip']});
                    });
                    myChart.setOption(option, true);

                });



            }
        });
    };


    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围-近7日
            $("input[name='range_time']").val(admin.getRecentDay(7));
            $("select[name='sample_type'] option[value='']").remove();
            $("select[name='loss_day'] option[value='']").remove();
            form.render('select');

            $.initNode();
        });
    });

    // 搜索
    $(document).off('click', '#node_search').on('click', '#node_search', function () {
        $.initNode();
    });

    // 重置
    $(document).off('click', '#node_reset').on('click', '#node_reset', function () {
        admin.resetForm(initArray[0].form_class);
        $.initNode();
    });

    $(document).off('click', '.detail').on('click', '.detail', function () {
        let type = $(this).attr('data-type');
        let data = $(this).attr('data-data');
        let param = admin.getFormParam(initArray[0].form_class);
        param[type] = data;
        if (data=="未知"){
            param[type] = -1;
        }
        console.log(param);
        admin.popup({
            title: '查看详情'
            , area: ['60%', '60%']
            , id: 'LAY-popup-content-detail'
            , success: function (layero, index) {
                view(this.id).render('statistics/popup/runoff/detail', param).done(function () {
                    //form.render(null, 'layuiadmin-app-form-list');
                });
            }
        });
    });
    //对外暴露的接口
    exports('statistics/runoff_analyze/runoff_node', {});
});
