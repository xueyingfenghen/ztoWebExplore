layui.define(['common', 'admin', 'table'], function (exports) {


    let admin = layui.admin,
        table = layui.table,
        $ = layui.jquery;

    let searchParam = parent.searchParam;

    let parentTableParam = $.extend({}, searchParam);

    let rollServerRateConfig = {
        url:admin.getUrl('/api/report/roll_server_rate'),
        tableId:'rollServerRateTable',
        colsCfgName:'roll_server_rate_table',
    };

    let cols = [[
        {field: 'server_id', title: '区服', align: 'center'},
        {field: 'sum_register_roles', title: '累计注册角色', align: 'center'},
        {field: 'sum_roll_roles', title: '累计滚服角色', align: 'center'},
        {field: 'roll_server_rate', title: '累计滚服率', align: 'center'},
    ]];

    function initRollServerRateTable() {
        table.render({
            id: rollServerRateConfig.tableId,
            elem: '#' + rollServerRateConfig.tableId,
            url: rollServerRateConfig.url,
            method: 'GET',
            where: parentTableParam,//请求参数(额外)
            request: {
                pageName: 'page', //页码的参数名称，默认：page
                limitName: 'page_size' //每页数据量的参数名，默认：limit
            },
            response: { //定义后端 json 格式，详细参见官方文档
                statusName: 'code', //状态字段名称
                statusCode: '0', //状态字段成功值
                msgName: 'msg', //消息字段
                countName: 'total', //总页数字段
                dataName: 'data', //数据字段
            },
            parseData: function (res) {
                return {
                    code: res.code,
                    msg: res.msg,
                    data: res.data.list,
                    total: res.data.total,
                };
            },
            page: true,
            // limit: 5,
            loading: true,
            cols: cols,
            done: function () {

            }
        });
    }

    admin.getCols(rollServerRateConfig.colsCfgName).then(function (data) {
        cols = data.data;
        initRollServerRateTable();
    });

    exports('statistics/report/roll_server_rate',{});
});
