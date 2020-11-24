layui.define(['table', 'admin', 'form', 'laydate', 'tools/recentDate'], function (exports) {

    let admin = layui.admin,
        table = layui.table,
        form = layui.form,
        laydate = layui.laydate,
        $ = layui.jquery;


    let cols,
        sourceDataSearchParam,
        sourceDataTableObj;

    let sourceDataConfig = {
        url:admin.getUrl('/api/report/source_data'),
        formId:'#source_data_search',
        formClass:'.source_data_search',
        tableId:'source_data_list',
        exportUrl:admin.getUrl('/api/stats_export/report/source_data'),
        colsCfgName:'source_data_table',
        formCfgName:'source_data_search_form',
    };

    //  渲染表格
    let initDataTable = function () {
        let param = admin.getFormParam(sourceDataConfig.formClass);
        sourceDataSearchParam = {
            source_id: param.source_id != '' ? param.source_id : 0,
            range_time: param.range_time,
        };
        sourceDataTableObj = table.render({
            id: sourceDataConfig.tableId,
            elem: '#' + sourceDataConfig.tableId,
            url: sourceDataConfig.url,
            method: 'GET',
            toolbar: '#toolbarSourceData',
            defaultToolbar: ['filter'],
            where: sourceDataSearchParam,//请求参数(额外
            request: {
                pageName: 'page', //页码的参数名称，默认：page
                limitName: 'page_size' //每页数据量的参数名，默认：limit
            },
            response: { //定义后端 json 格式，详细参见官方文档
                statusName: 'code', //状态字段名称
                statusCode: '0', //状态字段成功值
                msgName: 'msg', //消息字段
                countName: 'total', //总页数字段
                dataName: 'list', //数据字段
            },
            parseData: function(res){ //将原始数据解析成 table 组件所规定的数据
                window.tableData = res.data.list;
                return {
                    "code": res.code, //解析接口状态
                    "msg": res.msg, //解析提示文本
                    "total": res.data.total, //解析数据长度
                    "list": res.data.list, //解析数据列表
                };
            },
            page: true,
            loading: true,
            cols: cols,
        });


        table.on('toolbar(source_data_list)', function(obj){
            switch(obj.event){
                //自定义头工具栏右侧图标
                case 'LAYTABLE_COLS':
                    $("div[lay-event='LAYTABLE_COLS'] ul li div.layui-form-checkbox").on('click',function () {
                        setSessionTableCols();
                    });
                    break;
            };
        });
    };

    admin.initForms(sourceDataConfig.formCfgName, sourceDataConfig.formId).then(function () {

        setRangeTime();

        admin.getCols(sourceDataConfig.colsCfgName).then(function (data) {
            cols = data.data;
            freshSessionTableCols();
            initDataTable();
        });
    });


    // 搜索
    $('#source-search-btn').click(function () {
        freshSessionTableCols();
        initDataTable();
    });

    // 重置
    $('#source-reset-btn').click(function () {
        admin.resetForm(sourceDataConfig.formClass);
        admin.reload(sourceDataConfig.formClass, sourceDataConfig.tableId);
    });


    //  设置日期范围默认时间
    function setRangeTime() {
        $("input[name='range_time']").val(admin.getRecentDay(7));
    }

    //  缓存用户数据报表  表格字段展示数据
    function setSessionTableCols()
    {
        let showCols = {};
        $.each(sourceDataTableObj.config.cols[0],function (index, item) {
            showCols[item['field']] = item['hide'];
        });
        let local = layui.data(layui.setter.tableName);
        layui.data(layui.setter.tableName, {
            key: 'sourceDataTableCols' + local['user_id'],
            remove: true,
        });
        layui.data(layui.setter.tableName, {
            key: 'sourceDataTableCols' + local['user_id'],
            value: showCols,
        });
    }

    //  获取用户数据报表  表格字段展示数据
    function freshSessionTableCols()
    {
        let local = layui.data(layui.setter.tableName);
        let showCols = layui.data(layui.setter.tableName)['sourceDataTableCols' + local['user_id']] || {};
        if(Object.keys(showCols).length > 0){
            layui.each(cols[0],function (index, item) {
                cols[0][index]['hide'] = showCols[item['field']];
            });
        }
    }

    exports('statistics/report/source_data',{});
});
