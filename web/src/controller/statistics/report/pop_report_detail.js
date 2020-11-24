layui.config({
    base: layui.setter.base + 'lib/extend/ext/', // 模块目录
}).extend({
    soulTable: 'soulTable', // 模块别名
}).define(['common', 'admin', 'table', 'soulTable'], function (exports) {

    let table = layui.table,
        admin = layui.admin,
        soulTable = layui.soulTable,
        $ = layui.jquery;

    let searchParam = parent.searchParam;
    let popParam = parent.popParam;

    let parentTableParam = $.extend({}, searchParam);
    parentTableParam.detail_type = popParam.detail_type;
    parentTableParam.show_day = 1;
    let sonTableParam = $.extend({}, searchParam);
    sonTableParam.detail_type = popParam.detail_type;
    sonTableParam.show_day = 2;

    //  从父页面获取展示字段，在子页面展示
    let parentWindowCols = [];
    $.each(popParam.cols[0], function (index, col) {
        parentWindowCols[col.field] = col.hide;
    });
    let commonCols = [
        {field: 'add_users', title: '新增', hide:parentWindowCols['add_users']},
        {field: 'active_users', title: '活跃', hide:parentWindowCols['active_users']},
        {field: 'add_rate', title: '新增占比', hide:parentWindowCols['add_rate']},
        {field: 'money', title: '收入', hide:parentWindowCols['money']},
        {field: 'recharge_users', title: '充值人数', hide:parentWindowCols['recharge_users']},
        {field: 'recharge_rate', title: '活跃付费率', hide:parentWindowCols['recharge_rate']},
        {field: 'arpu', title: 'ARPU', hide:parentWindowCols['arpu']},
        {field: 'arppu', title: 'ARPPU', hide:parentWindowCols['arppu']},
        {field: 'user_two_remain', title: '次日留存率', hide:parentWindowCols['user_two_remain']},
        {field: 'user_three_remain', title: '3日留存率', hide:parentWindowCols['user_three_remain']},
        {field: 'user_seven_remain', title: '7日留存率', hide:parentWindowCols['user_seven_remain']},
        {field: 'user_fifteen_remain', title: '15日留存率', hide:parentWindowCols['user_fifteen_remain']},
        {field: 'user_thirty_remain', title: '30日留存率', hide:parentWindowCols['user_thirty_remain']},
        {field: 'user_sixty_remain', title: '60日留存率', hide:parentWindowCols['user_sixty_remain']},
        {field: 'user_three_ltv', title: 'LTV3', hide:parentWindowCols['user_three_ltv']},
        {field: 'user_seven_ltv', title: 'LTV7', hide:parentWindowCols['user_seven_ltv']},
        {field: 'user_fifteen_ltv', title: 'LTV15', hide:parentWindowCols['user_fifteen_ltv']},
        {field: 'user_thirty_ltv', title: 'LTV30', hide:parentWindowCols['user_thirty_ltv']},
        {field: 'user_forty_five_ltv', title: 'LTV45', hide:parentWindowCols['user_forty_five_ltv']},
        {field: 'user_sixty_ltv', title: 'LTV60', hide:parentWindowCols['user_sixty_ltv']},
        {field: 'user_ninety_ltv', title: 'LTV90', hide:parentWindowCols['user_ninety_ltv']},
        {field: 'user_one_twenty_ltv', title: 'LTV120', hide:parentWindowCols['user_one_twenty_ltv']},
        {field: 'user_one_eighty_ltv', title: 'LTV180', hide:parentWindowCols['user_one_eighty_ltv']},
        {field: 'user_one_year_ltv', title: 'LTV365', hide:parentWindowCols['user_one_year_ltv']},
        {field: 'sum_ltv', title: '累计LTV', hide:parentWindowCols['sum_ltv']},
    ];


    let sonTableOption = function (row){
        if(sonTableParam.detail_type==1){
            sonTableParam.server_id = row.server_id;
        }else {
            sonTableParam.source_id = row.source_id;
        }

        return [
            {
                url: admin.getUrl('/api/report/detail'),
                method: 'GET',
                where: sonTableParam,//请求参数(额外)
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
                parseData: function(res) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        data: res.data.list,
                        total: res.data.total,
                    };
                },
                // data: row.son,
                autoSort:false,
                page: true,
                // limit: 5,
                loading: true,
                cols: [[
                    {title: '', fixed: 'left', width: '80'},
                    {title: '', fixed: 'left', width: '100'},
                    {field: 'day', fixed: 'left', hide:parentWindowCols['day'], title: '时间', width: '120'},
                    ...commonCols,
                ]],
                done: function () {
                    soulTable.render(this);
                }
            }
        ];
    };

    let parentTitleCols = [[
        {title: '', fixed:  'left', width: '80', icon: ['layui-icon layui-icon-addition', 'layui-icon layui-icon-subtraction'], show: 3, childTitle: false, children: sonTableOption},
        {field: popParam.detail_type == 1 ? 'server_id' : 'source_id', title: popParam.detail_type == 1 ? '区服' :'渠道', fixed:  'left', width: '100'},
        {field: 'range_time', title: '时间', fixed:  'left', width: '120'},
        ...commonCols,
    ]];

    table.render({
        id: 'reportDetailTable',
        elem: '#reportDetailTable',
        url: admin.getUrl('/api/report/detail'),
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
        parseData: function(res) {
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
        cols: parentTitleCols,
        done: function () {
            soulTable.render(this);
        }
    });




    exports('statistics/report/pop_report_detail', {});
});
