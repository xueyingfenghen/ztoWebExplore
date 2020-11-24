layui.define(['table', 'admin', 'form', 'view', 'laydate', 'tools/recentDate'], function (exports) {

    let admin = layui.admin,
        table = layui.table,
        form = layui.form,
        view = layui.view,
        laydate = layui.laydate,
        $ = layui.jquery,
        roleType = 0,   //  默认全部玩家 0 全部玩家 1 滚服角色  2 首创角色
        reportType = 1; // 默认为日报 1 日报 2 周报 3 月报

    let cols,           //    表格列数据
        searchParam,    //    搜索栏参数
        tableObj;       //    表格对象

    let reportConfig = {
        url:admin.getUrl('/api/report/index'),
        formId:'#data_report_search',
        formClass:'.data_report_search',
        tableId:'data_report_list',
        exportUrl:admin.getUrl('/api/stats_export/report/index'),
        colsCfgName:'statistics_data_report_table',
        formCfgName:'statistics_data_report_search',
        renderDetail:'statistics/popup/data_report/report_detail',
        renderLine:'statistics/popup/data_report/tendency_broken_line',
        renderRollServerRate:'statistics/popup/data_report/roll_server_rate',
    };


    window.reloadEChartReport = function (param) {
        if(param == undefined) {
            param = admin.getFormParam(reportConfig.formId);
        }
        let chartParam = $.extend(true, {}, param);
        chartParam["get_chart"] = 1;
        admin.req({
            url: reportConfig.url,
            method: 'get',
            data: chartParam,
            dataType: 'json',
            done: function (res) {
                if(res.code == 0){
                    window.chartReportData = res.data.list;
                }
            },
        });
    }

    //  渲染表格
    let initDataTable = function () {
        let param = admin.getFormParam(reportConfig.formClass);
        window.reloadEChartReport(param);
        searchParam = {
            server_id:param.server_id != ''? param.server_id : 0,
            source_id:param.source_id != '' ? param.source_id : 0,
            sample_type:param.sample_type != '' ? param.sample_type : 0,
            report_type: reportType,
            role_type: roleType,
            range_time: param.range_time,
        };
        tableObj = table.render({
            id: reportConfig.tableId,
            elem: '#' + reportConfig.tableId,
            url: reportConfig.url,
            method: 'GET',
            toolbar: '#toolbarDemo', //开启头部工具栏，并为其绑定左侧模板
            defaultToolbar: ['filter'],
            where: searchParam,//请求参数(额外
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


        table.on('toolbar(data_report_list)', function(obj){
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

    admin.initForms(reportConfig.formCfgName, reportConfig.formId).then(function () {

        // 报表类型添加lay-filter属性，用来监听此下拉框改变
        $('#data_report_search #report_type').attr('lay-filter', 'report_type');
        $("select[name='sample_type'] option[value='']").remove();
        $("select[name='report_type'] option[value='']").remove();
        $("select[name='role_type'] option[value='']").remove();
        form.render('select');
        setRangeTime();

        admin.getCols(reportConfig.colsCfgName).then(function (data) {
            cols = data.data;
            freshSessionTableCols();
            initDataTable();
            showRollServerRate();
        });
    });


    //  设置日期范围默认时间
    function setRangeTime() {
        let rangeTime;
        switch (reportType) {
            case 2:
                rangeTime = admin.getRecentWeek(4);
                break;
            case 3:
                rangeTime = admin.getRecentMonth(3);
                break;
            default:
                rangeTime = admin.getRecentDay(7);
                break;
        }

        $("input[name='range_time']").val(rangeTime);
    }


    // 切换报表类型时 日报周报月报按钮显示不同
    function initReportBtns() {
        $(".report_type").addClass('layui-btn-primary');
        $(".report_type[data-type='"+ reportType + "']").removeClass('layui-btn-primary');
        if (reportType == 1) {
            $('.layui-table-tool-temp .showDetail').show();
        } else {
            $('.layui-table-tool-temp .showDetail').hide();
        }
    };

    //
    form.on('select(report_type)', function (data) {
        reportType = parseInt(data.value);
        setRangeTime();
        freshSessionTableCols();
        initDataTable();
        initReportBtns();
        showRollServerRate();
    });

    //  切换 日报、周报、月报
    $('.report_type').on('click',function () {
        reportType = parseInt($(this).data('type'));
        $("select[name='report_type']").val(reportType);
        setRangeTime();
        form.render();
        freshSessionTableCols();
        initDataTable();
        initReportBtns();
        showRollServerRate();
    });

    function showRollServerRate()
    {
        if(roleType == 1 && reportType == 1){
            $("#showRollServerRate").show();
        }else {
            $("#showRollServerRate").hide();
        }
    }

    form.on('select(role_type)', function (data) {
        roleType = parseInt(data.value);
        switch (roleType) {
            case 1:
                //  滚服角色
            case 2:
                //  首创角色
                $("select[name='sample_type']").val(2);
                form.render('select');
                $('#search-btn').trigger('click');
                break;
            default:
                //  全部玩家
                break;
        }
        showRollServerRate();
    });

    // 搜索
    $('#search-btn').click(function () {
        freshSessionTableCols();
        initDataTable();
        initReportBtns();
    });

    // 重置
    $('#reset-btn').click(function () {
        admin.resetForm(reportConfig.formClass);
        reportType = 1;
        initReportBtns();
        admin.reload(reportConfig.formClass, reportConfig.tableId);
    })

    // 查看区服、渠道详情
    $(document).off('click', '.showDetail').on('click', '.showDetail', function () {
        window.searchParam = searchParam;
        window.popParam = {
            detail_type: parseInt($(this).data('type')),
            cols: tableObj.config.cols,
        };
        admin.popup({
            title: window.popParam.detail_type == 1 ? '区服详情' : '渠道详情',
            area: ['80%', '80%'],
            id: 'detailPopPage',
            // btn: ['确定', '取消'],
            success: function(layero, index){
                view(this.id).render(reportConfig.renderDetail).done(function(){

                });
            }
        });
    });

    $(document).off('click', '.showRollServerRate').on('click', '.showRollServerRate', function () {
        window.searchParam = searchParam;
        admin.popup({
            title: '各区服滚服率',
            area: ['60%', '60%'],
            id: 'rollServerRatePage',
            // btn: ['确定', '取消'],
            success: function(layero, index){
                view(this.id).render(reportConfig.renderRollServerRate).done(function(){

                });
            }
        });
    });

    //  点击展示折线图弹窗
    $(document).off('click', '#form_data_card_body thead tr th').on('click', '#form_data_card_body thead tr th', function () {
        let field = $(this).attr('data-field');
        if(field == 'day' || field == 'range_time'){
            return;
        }
        let fieldName = '';
        $.each(cols[0], function (key, val) {
            if (cols[0][key]['field'] == field) {
                fieldName = cols[0][key]['title'];
            }
        });
        window.fieldParams = {field: field, fieldName: fieldName};
        admin.popup({
            title: fieldName + '趋势'
            ,area: ['80%', '80%']
            ,id: 'tendency_broken_line_dialog'
            ,success: function(layero, index){
                view(this.id).render(reportConfig.renderLine).done(function(){

                });
            }
        });
    });


    //  导出
    $("#export-btn").on('click',function () {

        admin.download({
            url: reportConfig.exportUrl,
            data: searchParam,
            method: 'get',
            dataType: 'json',
        });

    });





    //  缓存用户数据报表  表格字段展示数据
    function setSessionTableCols()
    {
        let showCols = {};
        $.each(tableObj.config.cols[0],function (index, item) {
            showCols[item['field']] = item['hide'];
        });
        let local = layui.data(layui.setter.tableName);
        layui.data(layui.setter.tableName, {
            key: 'reportTableCols' + local['user_id'],
            remove: true,
        });
        layui.data(layui.setter.tableName, {
            key: 'reportTableCols' + local['user_id'],
            value: showCols,
        });
    }

    //  获取用户数据报表  表格字段展示数据
    function freshSessionTableCols()
    {
        let local = layui.data(layui.setter.tableName);
        let showCols = layui.data(layui.setter.tableName)['reportTableCols' + local['user_id']] || {};
        if(Object.keys(showCols).length > 0){
            layui.each(cols[0],function (index, item) {
                if(item['field'] == 'range_time') {
                    cols[0][index]['hide'] = reportType == 1 ? true : false;
                }else {
                    cols[0][index]['hide'] = showCols[item['field']];
                }
            });
        }
    }



    exports('statistics/report/report', {})
})
