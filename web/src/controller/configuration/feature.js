layui.define( ['table', 'admin', 'form', 'view', 'laydate', 'element', 'common'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let common = layui.common;
    let $ = layui.jquery;
    let feature_area_arr = '';
    let game_area_arr = '';
    let is_detail = null;

    // 渲染表格
    $.initDataTable = function (cols, type, tableId,formClass,form_params = {}) {
        let param = admin.getFormParam(formClass);
        param.type = type;
        param.is_detail = is_detail;
        param.server_id = form_params.server_id;
        param.types = form_params.types;
        // console.log('初始化:',param,cols);
        table.render({
            id: tableId,
            elem: '#'+tableId,
            url: admin.getUrl('/api/configuration/index'),
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

    var initArray = [{formNameConf:"form_feature-toggle", tableId:"table_feature-toggle", formClass:".form_feature-toggle", type:"feature"},
        {formNameConf:"form_game-toggle", tableId:"table_game-toggle", formClass:".form_game-toggle", type:"game"}];

    $.each(initArray, function(i, obj){
        admin.initForms(obj.formNameConf, '#'+obj.formNameConf).then(function () {
            $("select[name=status]").parent().parent('div').hide();
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
        detail:detail,
        closeStatus:closeStatus,
        push_switch:push_switch,
        edit:edit,
        cancel:cancel
    };

    function search(obj) {
        $.reload(obj.formClass, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.formClass);
        $.reload(obj.formClass, obj.tableId);
    }

    function detail(obj){
        if(obj.type == 'feature'){
            var area_arr = feature_area_arr;
        }else {
            var area_arr = game_area_arr;
        }
        if(!area_arr || area_arr == ''){
            layer.msg('请先选择区服',{icon:5});
        }else {
            var checkStatus = admin.checkboxData(obj.tableId);//得到选中的数据
            if(checkStatus.length == 0){
                layer.msg('请先勾选要操作的功能',{icon:5});
            }else {
                let types = [];
                for (i=0;i<checkStatus.length;i++){
                   types.push(checkStatus[i]['type']);
                }
                admin.getCols(obj.formNameConf).then(function (data) {
                    data.data[0][1].hide = false;
                    data.data[0][3].hide = false;
                    is_detail = true;
                    let form_params = {server_id:area_arr.split(","),types:types};
                    $.initDataTable(data.data, obj.type, obj.tableId,obj.formClass,form_params)
                    if(obj.type == 'feature') $("select[name=status]").parent().parent('div').show();
                });
            }
        }
    }

    function closeStatus(obj){
            if(obj.tableId == 'table_feature-toggle'){
                var area_arr = feature_area_arr;
            }else {
                var area_arr = game_area_arr;
            }
            var status = obj.status;
            var area = layui.jquery("input[name=area]").val();
            if(!area || !area_arr){
                layer.msg('请先选择区服',{icon:5});
                //loadTadle();
            }else{
                var data = {};
                var type = obj.type; //游戏功能类型
                if(obj.server_id > 0){
                    data[obj.server_id] = [type];
                }
                layui.admin.req({
                    url: layui.admin.getUrl('/api/configuration/switch'),
                    method: 'post',
                    data: {data:data,status:status == 1 ? 2 : 1,server_id:obj.server_id,feature:obj.feature},
                    dataType: 'json',
                    done: function (res) {
                        if(res.error){
                            layer.msg('开关成功',{icon:1});
                            $.reload(obj.formClass, obj.tableId);
                        }else {
                            layer.msg(res.msg,{icon:5});
                        }
                    }
                })
            }
    }

    function push_switch(obj){
        if(obj.tableId == 'table_feature-toggle'){
            var area_arr = feature_area_arr;
        }else {
            var area_arr = game_area_arr;
        }
        var status = obj.status;
        var area = layui.jquery("input[name=area]").val();
        if(!area || !area_arr){
            layer.msg('请先选择区服',{icon:5});
        }else {
            var checkStatus = admin.checkboxData(obj.tableId);//得到选中的数据
            if(checkStatus.length == 0){
                layer.msg('请先勾选要操作的功能',{icon:5});
            }else if(!is_detail){
                layer.msg('请先查看区服明细',{icon:5});
            }else {
                var data = {};
                    var types = [];
                    for (k=0;k<checkStatus.length;k++){
                        if(checkStatus[k].server_id > 0){
                            if(!data[checkStatus[k].server_id]){ types = [];} //区服不是同一个时 置空上次所选的当前行type类型
                            types.push(checkStatus[k].type);
                            data[checkStatus[k].server_id] = types;
                        }
                    }
                layui.admin.req({
                    url: layui.admin.getUrl('/api/configuration/switch'),
                    method: 'post',
                    data: {data:data,status:status,server_id:getInfo(checkStatus,'server_id'),feature:getInfo(checkStatus,'feature')},
                    dataType: 'json',
                    done: function (res) {
                        if(res.error){
                            layer.msg('开关成功',{icon:1});
                            $.reload(obj.formClass, obj.tableId);
                        }else {
                            layer.msg(res.msg,{icon:5});
                        }
                    }
                })
            }
        }
    }

    function edit(obj){
        var trDom = $(this);
       if(obj.server_id > 0 && trDom[0].text == '修改'){
           admin.allowEdit(trDom,[3],'确定');
           trDom.next().show();
       }else if(obj.server_id > 0 && trDom[0].text == '确定'){
           var data = {};
           var type = obj.type; //游戏功能类型
           var params = trDom.parent().parent().parent('tr')[0].cells[3].innerText; //游戏功能配置参数
           if(obj.server_id > 0) data[obj.server_id] = [type];
           layui.admin.req({
               url: layui.admin.getUrl('/api/configuration/deploy'),
               method: 'post',
               data: {data:data,params:params},
               dataType: 'json',
               done: function (res) {
                   if(res.code == 0){
                       layer.msg('保存成功',{icon:1});
                       $.reload(obj.formClass, obj.tableId);
                   }else {
                       layer.msg(res.msg,{icon:5});
                   }
               }
           })
       }else {
             layer.msg('请先查看区服明细',{icon:5});
        }
    }

    function cancel(obj){
        search(obj);
    }

    function getInfo(arr,flag)
    {
        var str  = '',dot = ',';
        for (var i = 0;i<arr.length;i++){
            if(i == arr.length - 1 ) dot = '';
            str += arr[i][flag] + dot;
        }
        return str;
    }

    $("input[name=area]").on('click',function (e) {
        var id = "#" + $(this).prop('id');
        var obj =  $(this);
        layui.admin.popup({
            title: '选择区服'
            // ,area: layui.admin.screen() < 2 ? ['80%', '300px'] : ['700px', '500px']
            ,area:  ['1200px', '500px']
            ,id: 'select_area'
            ,btn: ['确定', '取消']
            ,btnAlign: 'l'
            ,success: function(layero, index){
                layui.view(this.id).render('area',{area: e.target.value});
            },yes: function(index, layero){
                layui.$(".switch").removeAttr('disabled');
                //layui.jquery('#get_area').val(); 区服拼接后的值
                if(obj.prop('id') == 'featureArea'){
                    feature_area_arr = layui.jquery('#get_area_all').val(); //区服转数组的值
                }else {
                    game_area_arr = layui.jquery('#get_area_all').val(); //区服转数组的值
                }
                layui.jquery(id).val(layui.jquery('#get_area').val());
                layer.close(index);
            }
        });
    })

    exports('configuration/feature', {})

});
