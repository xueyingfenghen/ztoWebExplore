// 财务对账
layui.define(['table', 'admin', 'form', 'view', 'laydate', 'element', 'common', 'upload', 'tools/recentDate'], function (exports) {
    let $ = layui.jquery,
        admin = layui.admin,
        form = layui.form,
        uploads = layui.upload,
        params = {},
        table = layui.table;

    let initItem = {
        formNameConf: "statistics_finance-check_form",
        tableId: "table_finance-check",
        formClass: ".form_finance-check",
        tableUrl: '/api/stats/financial',
        costUrl: '/api/stats/financial/cost',
        incomeUrl: '/api/stats/financial/income',
    };

    //  设置日期范围默认时间
    function setRangeTime(reportType) {
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

    // 处理数据
    $.handleData = function (obj) {
        admin.getCols(obj.formNameConf).then(function (data) {
            $.handleTable(data.data, obj)
        });
    };

    // 处理表格
    $.handleTable = function (cols, obj) {
        params = admin.getFormParam(obj.formClass);
        params.group = $('#group').val();
        if (params.group === 'date') {
            $.each(cols[0], function (index, value) {
                console.log(params.group, value);
                if (value) {
                    if (value.field === 'source_name') {
                        cols[0].splice(index, 1);
                    }
                }
            });
        }

        table.render({
            id: obj.tableId,
            elem: '#' + obj.tableId,
            url: admin.getUrl(obj.tableUrl),
            method: 'GET',
            where: params,  // 请求参数(额外)
            request: {
                pageName: 'page',   // 页码的参数名称，默认：page
                limitName: 'page_size'  // 每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                res.data['summary']['day'] = '汇总';
                var list = [];
                list.push(res.data['summary']);
                list = list.concat(res.data.list);
                return {
                    "code": res.code,          // 解析接口状态
                    "msg": '',                // 解析提示文本
                    "count": res.data.total,  // 解析数据长度
                    "data": list
                };
            },
            page: true,
            loading: true,
            cols: cols
        });
    };

    // 重新加载
    $.reload = function (sel, tableId) {
        params = admin.getFormParam(sel);
        table.reload(tableId, {
            where: params,
            page: {
                curr: 1
            }
        });
    };

    // 账单数据按钮
    $(document).off('click', '.button-statis').on('click', '.button-statis', function () {
        $('.button-statis').addClass('layui-btn-primary');
        $(this).removeClass('layui-btn-primary');
        $("#group").val($(this).val());

        $.handleData(initItem);
    });

    // 按钮点击
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if (!$(this).attr('data-obj')) {
            return false;
        }

        let obj = JSON.parse($(this).attr('data-obj'));
        let event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    // 事件
    let active = {
        search: search,
        reset: reset,
        importCost: importCost,
        importInCome: importInCome,
        export: exportData,
        detail_income: detailIncome,
        detail_cost: detailCost,
    };

    // 查询
    function search(obj) {
        $.reload(obj.formClass, obj.tableId);
    }

    // 重置
    function reset(obj) {
        admin.resetForm(obj.formClass);
        setRangeTime(1);
        $.reload(obj.formClass, obj.tableId);
    }

    //计费点详情
    function detailIncome(obj) {
        var title = obj.day_str;
        if ($('#group').val() !== 'date') {
            title += ('、' + obj.channel_name);
        } else {
            obj.channel_id = 0;
        }
        title += '详情';
        obj.title = title;
        obj.time_type = params.time_type;
        obj.url = initItem.incomeUrl;
        obj.cols = [[
            {field: 'item_name', title: '商品名称', align: 'center'},
            {field: 'money', title: '价格（RMB）', align: 'center'},
            {field: 'money_usd', title: '价格（美金）', align: 'center'},
            {field: 'order_count', title: '笔数', align: 'center'},
            {field: 'sum', title: '小计（RMB）', align: 'center'},
            {field: 'sum_usd', title: '小计（美金）', align: 'center'},
        ]];

        admin.popup({
            title: '计费点详情'
            , area: ['1050px', '750px']
            , id: 'popup-detail-income'
            , shadeClose: true
            , success: function (layero, index) {
                layui.view(this.id).render('statistics/popup/financial_detail', obj);
            }
        });
    }

    //成本详情
    function detailCost(obj) {
        var title = obj.day_str;
        if ($('#group').val() !== 'date') {
            title += ('、' + obj.channel_name);
        } else {
            obj.channel_id = 0;
        }
        title += '详情';
        obj.title = title;
        obj.time_type = params.time_type;
        obj.url = initItem.costUrl;
        obj.cols = [[
            {field: 'date', title: '日期', align: 'center'},
            {field: 'adv_money', title: '广告投放费用', align: 'center'},
            {field: 'server_money', title: '服务器费用', align: 'center'},
            {field: 'third_money', title: '第三方服务', align: 'center'},
            {field: 'other_money', title: '其他', align: 'center'},
            {field: 'total_money', title: '小计', align: 'center'},
        ]];

        admin.popup({
            title: '成本详情'
            , area: ['1050px', '750px']
            , id: 'popup-detail-cost'
            , shadeClose: true
            , success: function (layero, index) {
                layui.view(this.id).render('statistics/popup/financial_detail', obj);
            }
        });
    }

    // 导入成本
    function importCost(obj) {

    }

    // 导入核对收入
    function importInCome(obj) {

    }

    // 导出
    function exportData(obj) {
        var exportParam = admin.getFormParam(obj.formClass);
        exportParam.export = 1;
        exportParam.group = $('#group').val();

        admin.download({
            url: admin.getUrl(initItem.tableUrl),
            data: exportParam,
            method: 'get',
            dataType: 'json',
        });
    }

    function upload(elem, obj) {
        let header = layui.setter.header;
        let headers = {};
        if (header.tokenName) {
            headers[header.tokenName] = layui.data(layui.setter.tableName)[header.tokenName] || '';
        }
        uploads.render({
            elem: '#' + elem
            , url: layui.admin.getUrl('/api/stats/financial/upload') //改成您自己的上传接口
            , accept: 'file'
            , exts: 'xls|xlsx'
            , size: 1024 * 256 //限制最大256MB
            , auto: true
            , headers: headers
            //上传文件时携带参数
            , before: function () {
                layer.load();
                this.data = {
                    event: obj.event
                }
            }
            , done: function (res, index, upload) {
                if (res.code != 0) {
                    layer.msg(res.msg, {icon: 5, anim: 6});
                } else {
                    $.reload(obj.formClass, obj.tableId);
                }
                layer.closeAll('loading');
            }
            , error: function (index, upload) {
                layer.closeAll('loading');
            }
        });
    }

    // 初始数据
    admin.initForms(initItem.formNameConf, '#' + initItem.formNameConf).then(function () {
        setRangeTime(1);
        $.handleData(initItem);
        $('select[name="time_type"] option[value=""]').remove();
        $('select[name="sample_type"] option[value=""]').remove();
        form.render('select');
    });

    $.each($('.upload-btn'), function (idx, item) {
        var obj = $(item).data('obj');
        upload($(item).attr('id'), obj);
    });


    exports('statistics/finance', {});
});
