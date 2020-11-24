layui.define(['admin', 'table', 'form', 'element'], function (exports) {
    $.sendCodeParams = function (params) {
        let $ = layui.jquery;
        let admin = layui.admin;
        let table = layui.table;
        let form = layui.form;
        let element = layui.element;

        //渲染筛选框/复选框
        if (parseInt(params.all_count) > 10000) {
            $('#part-form').show();
            for (var i = 1; i <= Math.ceil(params.all_count / 10000); i++) {
                var text = 'Part' + i + '(' + ((i - 1) * 10000 + 1) + '-';
                if (i * 10000 > params.all_count) {
                    text += (params.all_count + ')');
                } else {
                    text += (i * 10000 + ')');
                }
                $('#part').append('<option value="' + i + '">' + text + '</option>');
            }
        }
        form.render();

        //列表
        var initDataTable = function () {
            var param = admin.getFormParam('#filter-form');
            param.id = params.id;
            param.part = param.part || 0;
            layui.table.render({
                id: 'code-list-tb',
                elem: '#code-list-tb',
                url: admin.getUrl('/api/resource/exchange_code/batch_code_list'),
                parseData: function (res) {
                    return {
                        "code": res.code, //解析接口状态
                        "msg": '', //解析提示文本
                        "count": res.data.total, //解析数据长度
                        "data": res.data.list
                    };
                },
                loading: true,
                where: param,
                page: true,
                method: 'GET',
                request: {
                    pageName: 'page' //页码的参数名称，默认：page
                    , limitName: 'page_size' //每页数据量的参数名，默认：limit
                },
                cols: [[
                    {field: 'code', title: '兑换码', align: 'center', minWidth: '150'},
                    {field: 'receiver_server_id', title: '兑换者区服', align: 'center', templet: '#serverIdTpl'},
                    {field: 'receiver_role_id', title: '兑换者角色ID', align: 'center', templet: '#roleIdTpl'},
                    {field: 'receiver_nick_name', title: '兑换者昵称', align: 'center', templet: '#nickNameTpl'},
                    {field: 'receiver_vip_level', title: '兑换者VIP等级', align: 'center', templet: '#vipTpl'},
                    {field: 'receive_time', title: '兑换时间', align: 'center', templet: '#receiveTimeTpl'},
                    {field: 'created_at', title: '生成时间', align: 'center'}
                ]]
            });
        };

        var reload = function () {
            var param = admin.getFormParam('#filter-form');
            table.reload('code-list-tb', {
                where: param,
                page: {
                    curr: 1
                }
            });
        };

        initDataTable();

        //监听筛选
        form.on('radio(filter-form)', function (data) {
            reload();
        });

        //监听选择部分
        form.on('select(part)', function (data) {
            reload();
        });

        //导出下载
        var exportExcel = function (page = 1) {
            var param = admin.getFormParam('#filter-form');
            param.id = params.id;
            param.export = 1;
            param.page = page;
            param.page_size = 10000;
            admin.download({
                url: admin.getUrl('/api/resource/exchange_code/batch_code_list'),
                data: param,
                method: 'get',
                dataType: 'json'
            });
        };

        //下载
        $(document).off('click', '.export').on('click', '.export', function () {
            exportExcel();
        });
    };

    exports('exchange_code/code_list', {})
});