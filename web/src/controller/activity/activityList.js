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
            url: admin.getUrl('/api/activity/activity_list'),
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
                {type: 'checkbox', fixed: 'left'},
                {
                    width: 50,
                    event: 'collapse',
                    templet: function (d) {
                        return '&nbsp<i lay-tips="展开" class="layui-icon layui-colla-icon layui-icon-addition"></i>'
                    }
                }
                , {field: 'server_id', title: '区服', align: 'center', unresize: true}
                , {field: 'activity_type', title: '活动类型', align: 'center', unresize: true}
                , {field: 'activity_title', title: '活动名称', align: 'center', unresize: true}
                , {field: 'logo_start_time', title: '图标出现时间', align: 'center', unresize: true}
                , {field: 'logo_end_time', title: '图标结束时间', align: 'center', unresize: true}
                , {field: 'start_time', title: '活动开始时间', align: 'center', unresize: true}
                , {field: 'end_time', title: '活动结束时间', align: 'center', unresize: true}
                , {field: 'state_desc', title: '状态', align: 'center', unresize: true}
                , {field: 'op', title: '操作', align: 'center', unresize: true, templet: '#op'}
            ]
            ]
        });
    }


    var initArray =
        {
            formNameConf: "activity_activity-list_form",
            tableId: "table_activity-list",
            formClass: ".form_activity-list"
        };

    admin.initForms(initArray.formNameConf, '#' + initArray.formNameConf).then(function () {
        $("input[name='time']").parent().css('width', '500px');
        $("select[name='server_id'] option[value='']").remove();

        form.render('select');
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
        del: del,
        edit: edit,
        batch_edit: batchEdit,
        batch_del: batchDel,
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
        layer.confirm('确定删除这场活动？', function (index) {
            if (data.activity_id > 0) {
                admin.req({
                    url: layui.admin.getUrl('/api/activity/del_activity'),
                    //表格表头字段获取 如果没有就获取默认
                    data: {activity_id: data.local_id},
                    method: 'post',
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

    function edit(obj) {
        var param = {
            data: [layui.table.cache[obj.tableId][obj.index]],
            serverDesc: '区服' + layui.table.cache[obj.tableId][obj.index].server_id,
            activity_id: layui.table.cache[obj.tableId][obj.index].local_id,
        };
        admin.popup({
            title: obj.title
            , area: ['80%', '500px']
            , id: 'LAY-popup-content-edit'
            , btn: ['确定', '取消']
            , success: function (layero, index) {

                view(this.id).render('activity/edit_activity', param).done(function () {
                    //监听提交
                });
            }
            , yes: function (index, layero) {
                var reqParam = {
                    start_time: $("#start_time").val(),
                    end_time: $("#end_time").val(),
                    logo_start_time: $("#logo_start_time").val(),
                    logo_end_time: $("#logo_end_time").val(),
                    activity_id: param.activity_id
                }
                //提交 Ajax 成功后，关闭当前弹层并重载表格
                admin.req({
                    url: layui.admin.getUrl('/api/activity/edit_activity'),
                    //表格表头字段获取 如果没有就获取默认
                    data: reqParam,
                    method: 'post',
                    dataType: 'json',
                    done: function (res) {
                        if (res.code == 0) {
                            layer.msg('修改成功!');
                            layui.table.reload(obj.tableId); //重载表格
                            layer.close(index); //执行关闭
                        } else {
                            layer.msg(res.msg);
                        }
                    }
                })
            }
            , btn2: function (index, layero) {
                //按钮【按钮二】的回调
                layer.close(index);
            }
            , cancel: function () {
                //右上角关闭回调
            },
        });
    }

    function batchEdit(obj) {

        var checkStatus = layui.table.checkStatus('table_activity-list').data;
        var activityId = [];
        var serverList = [];
        if (checkStatus.length == 0) {
            layer.msg('请先勾选要操作的活动', {icon: 5});
        } else {
            for (k = 0; k < checkStatus.length; k++) {
                if (checkStatus[k].local_id > 0) {
                    activityId.push(checkStatus[k].local_id);
                }
                serverList.push(checkStatus[k].server_id);
            }
            serverList.sort();
            var serverDesc = getServerDesc(serverList);
            var activity_id = activityId.join(',');
            var param = {
                activity_id: activity_id,
                data: [checkStatus[0]],
                serverDesc: serverDesc,
            };
            admin.popup({
                title: obj.title
                , area: ['80%', '500px']
                , id: 'LAY-popup-content-edit'
                , btn: ['确定', '取消']
                , success: function (layero, index) {

                    view(this.id).render('activity/edit_activity', param).done(function () {

                    });
                }
                , yes: function (index, layero) {
                    var reqParam = {
                        start_time: $("#start_time").val(),
                        end_time: $("#end_time").val(),
                        logo_start_time: $("#logo_start_time").val(),
                        logo_end_time: $("#logo_end_time").val(),
                        activity_id: param.activity_id
                    }
                    //提交 Ajax 成功后，关闭当前弹层并重载表格
                    admin.req({
                        url: layui.admin.getUrl('/api/activity/edit_activity'),
                        //表格表头字段获取 如果没有就获取默认
                        data: reqParam,
                        method: 'post',
                        dataType: 'json',
                        done: function (res) {
                            if (res.code == 0) {
                                layer.msg('修改成功!');
                                layui.table.reload(obj.tableId); //重载表格
                                layer.close(index); //执行关闭
                            } else {
                                layer.msg(res.msg);
                            }
                        }
                    })
                }
                , btn2: function (index, layero) {
                    //按钮【按钮二】的回调
                    layer.close(index);
                }
                , cancel: function () {
                    //右上角关闭回调
                },
            });

        }

    }

    function getServerDesc(serverList) {

        var lastServerId = 0;
        var serverDesc = '';
        for (j = 0; j < serverList.length; j++) {
            if (lastServerId === 0) {
                serverDesc = '区服' + serverList[j];
            } else {
                if (parseInt(serverList[j]) !== lastServerId) {
                    if (j + 1 < serverList.length) {
                        if (serverList[j] - lastServerId === 1 && serverList[j + 1] - serverList[j] === 1) {
                        } else {
                            if (serverList[j] - lastServerId === 1 && serverList[j + 1] - serverList[j] !== 1) {
                                serverDesc = serverDesc + '-区服' + serverList[j];
                            } else {
                                serverDesc = serverDesc + ',区服' + serverList[j];
                            }
                        }
                    } else {
                        if (serverList[j] - lastServerId === 1) {
                            serverDesc = serverDesc + '-区服' + serverList[j];
                        } else {
                            serverDesc = serverDesc + ',区服' + serverList[j];
                        }
                    }
                }
            }
            lastServerId = parseInt(serverList[j]);
        }
        return serverDesc;
    }

    function batchDel(obj) {

        var checkStatus = layui.table.checkStatus('table_activity-list').data;
        var activityId = [];
        if (checkStatus.length == 0) {
            layer.msg('请先勾选要操作的活动', {icon: 5});
        } else {
            layer.confirm('确定删除勾选活动？', function (index) {
                for (k = 0; k < checkStatus.length; k++) {
                    if (checkStatus[k].local_id > 0) {
                        activityId.push(checkStatus[k].local_id);
                    }
                }
                var activity_id = activityId.join(',');
                admin.req({
                    url: layui.admin.getUrl('/api/activity/del_activity'),
                    //表格表头字段获取 如果没有就获取默认
                    data: {activity_id: activity_id},
                    method: 'post',
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
            });
        }

    }

    //  选择区服
    $("#selectArea").on('click', function (e) {
        admin.popup({
            title: '选择区服'
            , area: ['1200px', '500px']
            , id: 'select_area'
            , btn: ['确定', '取消']
            , success: function (layero, index) {
                layui.view(this.id).render('area',{area: e.target.value});
            }, yes: function (index, layero) {
                server_ids = layui.jquery('#get_area_all').val(); //区服转数组的值
                console.log(server_ids);
                layui.jquery("input[name=server_id]").val(layui.jquery('#get_area').val());
                layer.close(index);
            }
        });
    });
    //监听工具条
    table.on('tool(table_activity-list)',
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
    exports('activity/activityList', {})

});
