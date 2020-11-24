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
    $.initDataTable = function (cols,tableId) {
        let param = admin.getFormParam('.activity_open_server_form');
        table.render({
            id: tableId,
            elem: '#'+tableId,
            url: admin.getUrl('/api/activity/config_list'),
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

    var initArray = new Array(
        {formNameConf:"activity_open_server_form", tableId:"table_activity_open_server", formClass:".activity_open_server_form"}
    );
    $.each(initArray, function(i, obj){
        admin.initForms(obj.formNameConf, '#'+obj.formNameConf).then(function () {
            $("input[name='time']").parent().css('width', '500px');
            admin.getCols(obj.formNameConf).then(function (data) {
                $.initDataTable(data.data,obj.tableId)
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
        del: del,
        detail: detail,
        set_default: set_default,
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
        layer.confirm('确定删除当前活动吗？', function(index){
            if(data.id > 0){
                admin.req({
                    url:layui.admin.getUrl('/api/activity/del_config'),
                    //表格表头字段获取 如果没有就获取默认
                    data:{id:data.id},
                    method: 'get',
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
        admin.req({
            url: layui.admin.getUrl('/api/activity/open_server_detail'),
            method: 'get',
            data: {file_id:data.id},
            dataType: 'json',
            done: function (res) {
                if(res.code ==0){
                    admin.popup({
                        title: obj.title
                        ,area:['80%', '300px']
                        ,id: 'LAY-popup-content-detail'
                        ,success: function(layero, index){
                            view(this.id).render('/activity/preview',{data:res.data.list,open_server:true});
                        }
                    });
                }
            }
        })
    }

    function addAnnounce(obj){
        admin.popup({
            title: this.innerText
            ,area: layui.admin.screen() < 2 ? ['80%', '300px'] : ['700px', '500px']
            ,id: 'announce-add'
            ,success: function(layero, index){
                view(this.id).render('activity/open_server_form',obj);
            }
        });
    }

    function set_default(obj){
        var data = layui.table.cache[obj.tableId][obj.index];
        layer.confirm('确定设置当前活动为默认开区活动吗？', function(index){
            if(data.id > 0){
                admin.req({
                    url:layui.admin.getUrl('/api/activity/set_default_config'),
                    //表格表头字段获取 如果没有就获取默认
                    data:{id:data.id},
                    method: 'get',
                    dataType: 'json',
                    done: function (res) {
                        if(res.code == 0){
                            layer.msg('默认开区成功!');
                            layui.table.reload(obj.tableId); //重载表格
                            layer.close(index); //执行关闭
                        }else {
                            layer.msg(res.msg);
                        }
                    }
                })
            }else {
                layer.msg('设置失败');
            }
        });
    }
    exports('activity/open_server', {})

});
