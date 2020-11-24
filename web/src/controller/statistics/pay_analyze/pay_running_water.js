layui.define(['table', 'admin', 'form', 'view', 'laydate', 'common', 'tools/recentDate'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let $ = layui.jquery;


    let initArray = [
        {
            // 充值流水
            form_name: 'statistics_pay_running_water_form',
            cols_name: 'statistics_pay_running_water_table',
            tableId: 'table_pay_running_water_list',
            form_class: '.form_pay_running_water',
            form_id: '#form_pay_running_water',
            url: admin.getUrl('/api/recharge/flow'),
        }
    ];

    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {
            //  设置默认时间范围-今天
            $("input[name='range_time']").val(admin.getCurrentDate() + ' - ' + admin.getCurrentDate());

            admin.getCols(obj.cols_name).then(function (data) {
                let param = admin.getFormParam(obj.form_class);
                console.log(param);
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
                            "data": res.data.list, //解析数据列表
                            "money": res.data.money
                        };
                    },
                    page: true,
                    loading: true,
                    cols: data.data,
                    done: function (res) {
                        if (res.code == 0) {
                            $('.pay_running_water_money').html(res.money)
                        }
                    }
                });
            });
        });
    });



    //对外暴露的接口
    exports('statistics/pay_analyze/pay_running_water', {});
});
