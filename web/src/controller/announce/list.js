layui.define( ['table', 'admin', 'form', 'view', 'laydate', 'element', 'common'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let common = layui.common;
    let $ = layui.jquery;

    // 渲染表格
    $.initDataTable = function (cols, type, tableId) {
        let param = admin.getFormParam('.form_login-announce');
        param.type = type;
        table.render({
            id: tableId,
            elem: '#'+tableId,
            url: admin.getUrl('/api/notice/index'),
            method: 'GET',
            where: param,//请求参数(额外)
            request: {
                pageName: 'page' //页码的参数名称，默认：page
                ,limitName: 'limit' //每页数据量的参数名，默认：limit
            },
            parseData: function(res){
                return {
                    "code":res.code, //解析接口状态
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

    var initArray = [{formNameConf:"announce_login-announce_form", tableId:"table_login-announce", formClass:".form_login-announce", type:"login"},
        {formNameConf:"announce_game-announce_form", tableId:"table_game-announce", formClass:".form_game-announce", type:"game"}];

    $.each(initArray, function(i, obj){
        admin.initForms(obj.formNameConf, '#'+obj.formNameConf).then(function () {
            $("input[name='update_time']").parent().css('width', '500px');
            admin.getCols(obj.formNameConf).then(function (data) {
                $.initDataTable(data.data, obj.type, obj.tableId)
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
        if(!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    var active = {
        search:search,
        reset:reset,
        add: addAnnounce,
        edit: edit,
        del: del,
        detail: detail,
        closeStatus : closeStatus,
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
        layer.confirm('确定删除当前公告内容吗？', function(index){
            if(data.id > 0){
                admin.req({
                    url:layui.admin.getUrl('/api/notice/delete'),
                    //表格表头字段获取 如果没有就获取默认
                    data:data,
                    method: 'post',
                    dataType: 'json',
                    done: function (res) {
                        if(res.code == 0){
                            layer.msg('删除成功!',{icon:1});
                            layui.table.reload(obj.tableId); //重载表格
                            layer.close(index); //执行关闭
                        }else {
                            layer.msg(res.msg,{icon:5});
                        }
                    }
                })
            }else {
                layer.msg('删除失败',{icon:5});
            }
        });
    }

    function detail(obj) {
        var data = layui.table.cache[obj.tableId][obj.index];
        data.type = obj.type;
        obj.title = data.type == 'login' ? '登录前公告详情' : '游戏内公告详情';
        admin.popup({
            title: obj.title
            ,area: ['60%', '60%']
            ,id: 'LAY-popup-content-detail'
            ,success: function(layero, index){
                view(this.id).render('app/content/detail', data).done(function(){
                    //form.render(null, 'layuiadmin-app-form-list');
                });
            }
        });
    }

    function addAnnounce(obj){
        var area = ['60%', '60%'];
        switch(obj.type) {
            case "login" : {
                area = ['60%', '60%'];
                break;
            }
            case "game" : {
                area = ['60%', '85%'];
                break;
            }
            default : {
                break;
            }
        }
        admin.popup({
            title: this.innerText
            ,area: area
            ,id: 'announce-add'
            ,success: function(layero, index){
                view(this.id).render('app/content/listform',obj).done(function(){
                    form.render(null, 'layuiadmin-app-form-list');

                    //监听提交
                    form.on('submit(layuiadmin-app-form-submit)', function(data){
                        var field = data.field; //获取提交的字段
                        field.type = obj.type;
                        //提交 Ajax 成功后，关闭当前弹层并重载表格
                        admin.req({
                            url:layui.admin.getUrl('/api/notice/modify'),
                            //表格表头字段获取 如果没有就获取默认
                            data:field,
                            method: 'post',
                            dataType: 'json',
                            done: function (res) {
                                if(res.code == 0){
                                    layer.msg('添加成功!',{icon:1});
                                    layui.table.reload(obj.tableId); //重载表格
                                    layer.close(index); //执行关闭
                                } else {
                                    if(res.data.code == 1999  && res.data.is_add && res.data.repeatNum == 1){
                                        var str = res.data.action == 'delete_id' ? '与未执行的公告时间冲突，确定要覆盖吗？' : '与正在执行的公告时间冲突,确定要覆盖吗？';
                                        layer.confirm(str, {
                                            btn : [ '是', '否' ]//按钮
                                        }, function(index) {
                                            //此处请求后台程序，下方是成功后的前台处理……
                                            //layer.load(2,{shade: [0.7, '#393D49']}, {shadeClose: true}); //0代表加载的风格，支持0-2
                                            field.action = res.data.action;
                                            field.action_id = res.data.id;
                                            admin.req({
                                                url:layui.admin.getUrl('/api/notice/modify'),
                                                //表格表头字段获取 如果没有就获取默认
                                                data:field,
                                                method: 'post',
                                                dataType: 'json',
                                                done: function (res) {
                                                    if(res.code == 0){
                                                        layer.msg('添加成功!',{icon:1});
                                                        layui.table.reload(obj.tableId); //重载表格
                                                        layer.closeAll();
                                                    }else {
                                                        layer.msg(res.msg,{icon:5});
                                                    }
                                                }
                                            })
                                        });
                                    }else {
                                        if(res.data.repeatNum == 1) res.msg = '新增失败，与正在执行的公告时间冲突';
                                        if(res.data.repeatNum > 1) res.msg = '新增失败，该时段已存在公告<br>重叠公告数量:' + res.data.repeatNum + ',请先删除';
                                        layer.msg(res.msg,{icon:5});
                                    }
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
        console.log(data);
        data.type = obj.type;
        var area = ['60%', '60%'];
        var before_all_platform = data.all_platform;
        var before_server_id = data.area;
        var before_no = data.no;
        var before_jump_url = data.jump_url;
        var before_title = data.title;
        var before_cont  = data.content;
        var before_start_time = data.start_time;
        var before_end_time = data.end_time;
        switch(obj.type) {
            case "login" : {
                area = ['60%', '60%'];
                break;
            }
            case "game" : {
                area = ['60%', '85%'];
                break;
            }
            default : {
                break;
            }
        }
        obj.title = data.type == 'login' ? '修改登录前公告' : '修改游戏内公告';
        admin.popup({
            title:  obj.title
            ,area: area
            ,id: 'LAY-popup-content-edit'
            ,success: function(layero, index){

                view(this.id).render('app/content/listform', data).done(function(){
                    form.render(null, 'layuiadmin-app-form-list');
                    //监听提交
                    form.on('submit(layuiadmin-app-form-submit)', function(data){
                        var field = data.field; //获取提交的字段
                        field.type = obj.type;
                        field.before_title = before_title;
                        field.before_cont = before_cont;
                        field.before_start_time = before_start_time;
                        field.before_end_time = before_end_time;

                        field.before_all_platform = before_all_platform;
                        field.before_server_id = before_server_id;
                        field.before_no = before_no;
                        field.before_jump_url = before_jump_url;
                        //提交 Ajax 成功后，关闭当前弹层并重载表格
                        admin.req({
                            url:layui.admin.getUrl('/api/notice/modify'),
                            //表格表头字段获取 如果没有就获取默认
                            data:field,
                            method: 'post',
                            dataType: 'json',
                            done: function (res) {
                                if(res.code == 0){
                                    layer.msg('修改成功!',{icon:1});
                                    layui.table.reload(obj.tableId); //重载表格
                                    layer.close(index); //执行关闭
                                } else {
                                    if(res.data.code == 1999  && res.data.is_add && res.data.repeatNum == 1){
                                        var str = res.data.action == 'delete_id' ? '与未执行的公告时间冲突，确定要覆盖吗？' : '与正在执行的公告时间冲突,确定要覆盖吗？';
                                        layer.confirm(str, {
                                            btn : [ '是', '否' ]//按钮
                                        }, function(index) {
                                            //此处请求后台程序，下方是成功后的前台处理……
                                            //layer.load(2,{shade: [0.7, '#393D49']}, {shadeClose: true}); //0代表加载的风格，支持0-2
                                            field.action = res.data.action;
                                            field.action_id = res.data.id;
                                            admin.req({
                                                url:layui.admin.getUrl('/api/notice/modify'),
                                                //表格表头字段获取 如果没有就获取默认
                                                data:field,
                                                method: 'post',
                                                dataType: 'json',
                                                done: function (res) {
                                                    if(res.code == 0){
                                                        layer.msg('修改成功!',{icon:1});
                                                        layui.table.reload(obj.tableId); //重载表格
                                                        layer.closeAll();
                                                    }else {
                                                        layer.msg(res.msg,{icon:5});
                                                    }
                                                }
                                            })
                                        });
                                    }else {
                                        if(res.data.repeatNum == 1) res.msg = '修改失败，与正在执行的公告时间冲突';
                                        if(res.data.repeatNum > 1) res.msg = '修改失败，该时段已存在公告<br>重叠公告数量:' + res.data.repeatNum + ',请先删除';
                                        layer.msg(res.msg,{icon:5});
                                    }
                                }
                            }
                        })
                    });
                });
            }
        });
    }

    function closeStatus(obj) {
        var data = layui.table.cache[obj.tableId][obj.index];
        if(obj.id > 0){
            layui.admin.req({
                url:layui.admin.getUrl('/api/notice/close'),
                //表格表头字段获取 如果没有就获取默认
                data:data,
                method: 'post',
                dataType: 'json',
                done: function (res) {
                    if(res.code == 0){
                        layer.msg('关闭成功!',{icon:1});
                        layui.table.reload(obj.tableId); //重载表格
                    }else {
                        layer.msg(res.msg);
                    }
                }
            })
        }else {
            layer.msg('关闭失败',{icon:5});
        }
    }

    // 邮件详情
    exports('announce/list', {})

});
