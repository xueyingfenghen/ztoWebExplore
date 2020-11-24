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
    $.initTemplateTable = function (cols, formClass, tableId, url) {
        let param = admin.getFormParam(formClass);
        table.render({
            id: tableId,
            elem: '#' + tableId,
            url: admin.getUrl(url),
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
            cols: cols
        });
    }

    var initArray = new Array(
        {
            formNameConf: "template_gift-list_form",
            tableId: "table_gift-list",
            formClass: ".form_gift-list",
            url: '/api/gift_template/list'
        }, {
            formNameConf: "template_gift-audit_form",
            tableId: "table_gift-audit",
            formClass: ".form_gift-audit",
            url: '/api/gift_template/audit_list'
        },
        {
            formNameConf: "template_email-list_form",
            tableId: "table_email-list",
            formClass: ".form_email-list",
            url: '/api/email_template/list'
        }, {
            formNameConf: "template_email-audit_form",
            tableId: "table_email-audit",
            formClass: ".form_email-audit",
            url: '/api/email_template/audit_list'
        },
    );

    $.each(initArray, function (i, obj) {
        admin.initForms(obj.formNameConf, '#' + obj.formNameConf).then(function () {
            $("input[name='time']").parent().css('width', '500px');
            admin.getCols(obj.tableId).then(function (data) {
                $.initTemplateTable(data.data, obj.formClass, obj.tableId, obj.url)
            });
        });
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
        add: add,
        edit: edit,
        del: del,
        audit_log: audit_log,
        audit: audit,
    };

    function search(obj) {
        $.reload(obj.formClass, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.formClass);
        $.reload(obj.formClass, obj.tableId);
    }

    function audit(obj) {
        var url = '';
        var html = '';
        if (obj.type === 'email') {
            url = layui.admin.getUrl('/api/email_template/audit');
        } else {
            url = layui.admin.getUrl('/api/gift_template/audit');

        }
        $.each(layui.table.cache[obj.tableId][obj.index],function (k,v) {
            obj[k] = v;
        })
        // obj.param = layui.table.cache[obj.tableId][obj.index];
        var area = ['60%', '60%'];
        admin.popup({
            title: this.innerText
            , area: area
            , id: 'template-email-audit'
            , success: function (layero, index) {
                view(this.id).render('template_manage/auditform', obj).done(function () {
                    form.render(null, 'layuiadmin-app-form-list');

                    //监听提交
                    form.on('submit(layuiadmin-app-form-submit)', function (data) {
                        var field = data.field; //获取提交的字段
                        //提交 Ajax 成功后，关闭当前弹层并重载表格
                        admin.req({
                            url: layui.admin.getUrl(url),
                            //表格表头字段获取 如果没有就获取默认
                            data: field,
                            method: 'post',
                            dataType: 'json',
                            done: function (res) {
                                if (res.code == 0) {
                                    layer.msg('审核成功!', {icon: 1});
                                    layui.table.reload(obj.tableId); //重载表格
                                    layer.close(index); //执行关闭
                                } else {
                                    layer.msg(res['msg'], {icon: 5, anim: 6});
                                }
                            }
                        })
                    });
                });
            }
        });
    }

    function del(obj) {
        var data = layui.table.cache[obj.tableId][obj.index];

        layer.confirm('确定删除当前模板吗？', function (index) {
            if (data.id > 0) {
                admin.req({
                    url: layui.admin.getUrl('/api/' + data.type + '_template/del'),
                    //表格表头字段获取 如果没有就获取默认
                    data: {id: data.id},
                    method: 'GET',
                    dataType: 'json',
                    done: function (res) {
                        if (res.code == 0) {
                            layer.msg('删除成功!',{icon:1});
                            layui.table.reload(obj.tableId); //重载表格
                            layer.close(index); //执行关闭
                        } else {
                            layer.msg(res.msg, {icon: 5, anim: 6});
                        }
                    }
                })
            } else {
                layer.msg('删除失败',{icon:5});
            }
        });
    }

    function audit_log(obj) {
        var data = layui.table.cache[obj.tableId][obj.index];
        obj.title = this.innerText
        admin.popup({
            title: obj.title
            , area: ['60%', '60%']
            , id: 'LAY-popup-content-detail'
            , success: function (layero, index) {
                view(this.id).render('template_manage/audit_log', data).done(function () {
                    //form.render(null, 'layuiadmin-app-form-list');
                });
            }
        });
    }

    function add(obj) {
        var area = ['60%', '60%'];
        var url = '';
        var html = '';
        if (obj.type === 'email') {
            url = layui.admin.getUrl('/api/email_template/add_template');
            html = 'template_manage/listform';
        } else {
            url = layui.admin.getUrl('/api/gift_template/add_template');
            html = 'template_manage/add_gift';
        }
        admin.popup({
            title: this.innerText
            , area: area
            , id: 'template-email-add'
            , success: function (layero, index) {
                view(this.id).render(html, obj).done(function () {
                    form.render(null, 'layuiadmin-app-form-list');

                    //监听提交
                    form.on('submit(layuiadmin-app-form-submit)', function (data) {
                        var field = data.field; //获取提交的字段
                        field.prop_content = table.cache.prop_content;
                        //提交 Ajax 成功后，关闭当前弹层并重载表格
                        admin.req({
                            url: url,
                            //表格表头字段获取 如果没有就获取默认
                            data: field,
                            method: 'post',
                            dataType: 'json',
                            done: function (res) {
                                if (res.code == 0) {
                                    layer.msg('添加成功!', {icon: 1});
                                    layui.table.reload(obj.tableId); //重载表格
                                    layer.close(index); //执行关闭
                                } else {
                                    layer.msg(res['msg'], {icon: 5, anim: 6});
                                }
                            }
                        })
                    });
                });
            }
        });
    }

    function edit(obj, self) {
        var data = layui.table.cache[obj.tableId][obj.index];
        data.area = data.server_id;
        data.event = obj.event;
        var area = ['60%', '60%'];
        var html = '';
        if (data.type === 'email') {
            html = 'template_manage/listform';
        } else {
            html = 'template_manage/add_gift';
        }
        obj.title = this.innerText;
        admin.popup({
            title: obj.title
            , area: area
            , id: 'LAY-popup-content-edit'
            , success: function (layero, index) {

                view(this.id).render(html, data).done(function () {
                    form.render(null, 'layuiadmin-app-form-list');
                    //监听提交
                    form.on('submit(layuiadmin-app-form-submit)', function (formData) {
                        var field = formData.field; //获取提交的字段
                        field.prop_content = table.cache.prop_content;
                        //提交 Ajax 成功后，关闭当前弹层并重载表格
                        admin.req({
                            url: layui.admin.getUrl('/api/' + data.type + '_template/edit'),
                            //表格表头字段获取 如果没有就获取默认
                            data: field,
                            method: 'post',
                            dataType: 'json',
                            done: function (res) {
                                if (res.code == 0) {
                                    layer.msg('修改成功!', {icon: 1});
                                    layui.table.reload(obj.tableId); //重载表格
                                    layer.close(index); //执行关闭
                                } else {
                                    layer.msg(res.msg, {icon: 5, anim: 6});
                                }
                            }
                        })
                    });
                });
            }
        });
    }

    // 邮件详情
    exports('template_manage/list', {})

});
