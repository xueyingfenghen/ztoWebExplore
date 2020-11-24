layui.define(['table', 'admin', 'form', 'view'], function (exports) {
    let admin = layui.admin,
        table = layui.table,
        view = layui.view,
        $ = layui.jquery;

    let cols,           //    表格列数据
        searchParam,    //    搜索栏参数
        tableObj;       //    表格对象

    //  渲染表格
    let initDataTable = function () {
        let param = admin.getFormParam('.data_whale_search');
        searchParam = {
            server_id: param.server_id != '' ? param.server_id : 0,
            source_id: param.source_id != '' ? param.source_id : 0,
            role_id: param.role_id != '' ? param.role_id : ''
        };

        tableObj = table.render({
            id: 'data_whale_list',
            elem: '#data_whale_list',
            url: admin.getUrl('/api/stats/whale_user'),
            method: 'GET',
            where: searchParam,//请求参数(额外)
            request: {
                pageName: 'page', //页码的参数名称，默认：page
                limitName: 'page_size' //每页数据量的参数名，默认：limit
            },
            parseData: function (res) { //将原始数据解析成 table 组件所规定的数据
                return {
                    "code": res.code, //解析接口状态
                    "msg": res.msg, //解析提示文本
                    "count": res.data.total, //解析数据长度
                    "data": res.data.list, //解析数据列表
                };
            },
            page: true,
            loading: true,
            cols: cols,
        });


        $(document).off('click', '.detail').on('click', '.detail', function () {
            id = $(this).attr('data-id');
            admin.popup({
                title: '玩家详情'
                ,area: ['80%', '80%']
                ,id: 'content-alert'
                ,success: function(layero, index){
                    view(this.id).render('player/popup/userInfo', {id: id}).done(function(){

                    });
                }
            });
        });
    };

    admin.initForms('whale_user', '#data_whale_search').then(function () {
        admin.getCols('whale_user').then(function (data) {
            cols = data.data;
            initDataTable();
        });
    });

    // 搜索
    $('#search-btn').click(function () {
        // freshSessionTableCols();
        initDataTable();
    });

    // 重置
    $('#reset-btn').click(function () {
        admin.resetForm('.data_whale_search');
        admin.reload('.data_whale_search', 'data_whale_list');
    });


    //  导出
    $("#export-btn").on('click', function () {
        var exportParams = $.extend({},searchParam);
        exportParams.export = 1;
        admin.download({
            url: admin.getUrl('/api/stats/whale_user'),
            data: exportParams,
            method: 'get',
            dataType: 'json',
        });

    });

    exports('statistics/whale_user', {})
});
