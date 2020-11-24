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
    $.initDataTable = function (tableId, formClass) {
        let param = admin.getFormParam(formClass);
        table.render({
            id: tableId,
            elem: '#' + tableId,
            url: admin.getUrl('/api/activity/operate_error_list'),
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
                {
                    width: 50,
                    event: 'collapse',
                    templet: function (d) {
                        return '&nbsp<i lay-tips="展开" class="layui-icon layui-colla-icon layui-icon-addition"></i>'
                    }
                }
                , {field: 'server_name', title: '区服', align: 'center', unresize: true}
                , {field: 'activity_type', title: '活动类型', align: 'center', unresize: true}
                , {field: 'activity_title', title: '活动名称', align: 'center', unresize: true}
                , {field: 'logo_start_time', title: '图标出现时间', align: 'center', unresize: true}
                , {field: 'logo_end_time', title: '图标结束时间', align: 'center', unresize: true}
                , {field: 'start_time', title: '活动开始时间', align: 'center', unresize: true}
                , {field: 'end_time', title: '活动结束时间', align: 'center', unresize: true}
                , {field: 'operate_type', title: '操作类型', align: 'center', unresize: true}
                , {field: 'operator', title: '操作人', align: 'center', unresize: true}
                , {field: 'update_time', title: '操作时间', align: 'center', unresize: true}
                , {field: 'state', title: '操作状态', align: 'center', unresize: true, style: "color: red;"}
                , {field: 'op', title: '操作', align: 'center', unresize: true, templet: '#op'}
            ]
            ]
        });
    }


    var initArray =
        {
            formNameConf: "activity_error-list_form",
            tableId: "table_error-list",
            formClass: ".form_error-list"
        };
    admin.initForms(initArray.formNameConf, '#' + initArray.formNameConf).then(function () {
        $("input[name='time']").parent().css('width', '500px');
        $.initDataTable(initArray.tableId, initArray.formClass)
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
        del: del,
        detail: detail,
    };

    function search(obj) {
        $.reload(obj.formClass, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.formClass);
        $.reload(obj.formClass, obj.tableId);
    }

    function del(obj) {
        var data = layui.table.cache[obj.tableId][obj.index];
        layer.confirm('确定删除这条操作日志吗？？', function (index) {
            if (data.id > 0) {
                admin.req({
                    url: layui.admin.getUrl('/api/activity/del_operation'),
                    //表格表头字段获取 如果没有就获取默认
                    data: {error_id: data.id},
                    method: 'get',
                    dataType: 'json',
                    done: function (res) {
                        if (res.code == 0) {
                            layer.msg('删除成功!',{icon:1});
                            layui.table.reload(obj.tableId); //重载表格
                            layer.close(index); //执行关闭
                        } else {
                            layer.msg(res.msg,{icon:5});
                        }
                    }
                })
            } else {
                layer.msg('删除失败',{icon:5});
            }
        });
    }

    function detail(obj) {
        var data = [];
        var item = layui.table.cache[obj.tableId][obj.index];
        item['table_id'] = obj.tableId;
        data.push(item);
        admin.popup({
            title: obj.title
            , area: ['80%', '50%']
            , id: 'LAY-popup-content-detail'
            , success: function (layero, index) {
                view(this.id).render('activity/error_detail', data, index).done(function () {
                    //form.render(null, 'layuiadmin-app-form-list');

                    $(document).off('click', '#re-operation').on('click', '#re-operation', function () {
                        var obj = JSON.parse($(this).attr('data-obj'));
                        var data = layui.table.cache[obj.tableId][obj.index];
                        layer.confirm('你是否重新推送这条操作？', function () {
                            if (data.id > 0) {
                                admin.req({
                                    url: layui.admin.getUrl('/api/activity/re_operation'),
//表格表头字段获取 如果没有就获取默认
                                    data: {error_id: data.id},
                                    method: 'get',
                                    dataType: 'json',
                                    done: function (res) {
                                        if (res.code == 0) {
                                            layer.msg('操作成功!');
                                            layui.table.reload(data['table_id']); //重载表格
                                            layer.close(index); //执行关闭
                                        } else {
                                            layer.msg(res.msg);
                                        }
                                    }
                                })
                            } else {
                                layer.msg('操作失败');
                            }
                        });
                    });
                });
            }
        });
    }


    //监听工具条
    table.on('tool(test)',
        function (obj) {
            var data = obj.data;
            var column_name = data.column_name;//cols
            var cols = [];
            $.each(column_name,function (en,cn) {
                cols.push(
                    {
                        field: en,
                        title: cn,
                        align:'center',
                        unresize:true
                    }
                );
            })
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
    exports('activity/errorList', {})

});
