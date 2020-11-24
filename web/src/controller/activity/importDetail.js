layui.define(['table', 'admin', 'form', 'view', 'laydate', 'element', 'common'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let common = layui.common;
    let $ = layui.jquery;

    // 渲染表格
    $.initListTable = function (tableId, formClass) {

        let param = admin.getFormParam(formClass);
        table.render({
            id: tableId,
            elem: '#' + tableId,
            url: admin.getUrl('/api/activity/excel_detail'),
            method: 'GET',
            where: param,//请求参数(额外)
            request: {
                pageName: 'page' //页码的参数名称，默认：page
                , limitName: 'limit' //每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                return {
                    "code": res.code, //解析接口状态
                    "msg": '', //解析提示文本
                    "count": res.data.count, //解析数据长度
                    "data": res.data.list
                };
            },
            page: true,
            loading: true,
            cols: [[ //表头
                {field: 'server_id', title: '区服', align: 'center', unresize: true,width:100}
                , {field: 'file_name', title: '文件名', align: 'center', unresize: true,}
                , {field: 'operator', title: '操作人', align: 'center', unresize: true,width: 100}
                , {field: 'create_time', title: '操作时间', align: 'center', unresize: true,width:180}
                , {field: 'state_desc', title: '导入状态', align: 'center', unresize: true,width:120,templet: function (d) {
                    if (d.state>=0){
                        return '<div class="layui-table-cell ">'+d.state_desc+'</div>'
                    }else {
                        return '<div class="layui-table-cell " style="color: red;">'+d.state_desc+'</div>'
                    }
                    }}
                , {field: 'op', title: '操作', align: 'center', unresize: true, templet: '#op',width:180}
            ]
            ]
        });
    }


    var initArray =
        {
            formNameConf: "activity_import-detail_form",
            tableId: "table_import-detail",
            formClass: ".form_import-detail"
        };
    admin.initForms(initArray.formNameConf, '#' + initArray.formNameConf).then(function () {
        $("input[name='time']").parent().css('width', '500px');
        $.initListTable(initArray.tableId, initArray.formClass)
    });


    $.reload = function (sel, tableId) {
        let param = admin.getFormParam(sel);
        table.reload(tableId, {
            where: param,
            page: {
                curr: 1
            }
        });
    }

    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if (!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    var active = {
        search: search,
        reset: reset,
        ac_detail: ac_detail,
        fail_detail: fail_detail
    };

    function search(obj) {
        $.reload(obj.formClass, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.formClass);
        $.reload(obj.formClass, obj.tableId);
    }

    function ac_detail(obj) {
        var param = {
            file_id: layui.table.cache[obj.tableId][obj.index]['id'],
            server_id: layui.table.cache[obj.tableId][obj.index]['server_id']
        };
        admin.popup({
            title: obj.title
            , area: ['80%', '80%']
            , id: 'LAY-popup-content-detail'
            , success: function (layero, index) {
                view(this.id).render('activity/ac_detail', param).done(function () {
                    //form.render(null, 'layuiadmin-app-form-list');
                });
            }
        });
    }

    function fail_detail(obj) {
        var param = {file_id: layui.table.cache[obj.tableId][obj.index]['id']};
        admin.popup({
            title: obj.title
            , area: ['80%', '80%']
            , id: 'LAY-popup-content-detail'
            , success: function (layero, index) {
                view(this.id).render('activity/fail_detail', param).done(function () {
                    //form.render(null, 'layuiadmin-app-form-list');
                });
            }
        });
    }

    //监听工具条
    table.on('tool(table_import-detail)',
        function (obj) {
            var data = obj.data;
            var column_name = data.column_name;//cols
            var cols = [];
            for (i = 0; i < column_name.length; i++) {
                cols.push(
                    {
                        field: i,
                        title: column_name[i],
                        align: 'center',
                        unresize: true
                    }
                );
            }
            if (obj.event === 'collapse') {
                var trObj = layui.$(this).parent('tr'); //当前行
                var accordion = true //开启手风琴，那么在进行折叠操作时，始终只会展现当前展开的表格。
                var content = '<table></table>' //内容
                //表格行折叠方法
                admin.collapseTable({
                    elem: trObj,
                    accordion: accordion,
                    content: content,
                    success: function (trObjChildren, index) { //成功回调函数
                        //trObjChildren 展开tr层DOM
                        //index 当前层索引
                        trObjChildren.find('table').attr("id", index);
                        table.render({
                            elem: "#" + index,
                            //url: '/demo/table/user',
                            limit: Number.MAX_VALUE, // 数据表格默认全部显示-->
                            data: data.activity_config,
                            cols: [cols]
                        });
                    }
                });

            }
        });


    // 操作详情
    exports('activity/importDetail', {})

});
