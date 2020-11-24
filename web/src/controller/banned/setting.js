layui.define( ['table', 'admin', 'form', 'view', 'laydate', 'element', 'common'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let common = layui.common;
    let $ = layui.jquery;
    let area_arr = '';

    // 渲染表格
    $.initDataTable = function (cols, type, tableId,formClass) {
        let param = admin.getFormParam(formClass);
        param.banned_name = type;
        if(type == 'auto-timing') param.type = 'role_ban';
        console.log('初始化:',param,cols);
        table.render({
            id: tableId,
            elem: '#'+tableId,
            url: admin.getUrl('/api/ban/'+ type +'/index'),
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

    var initArray = [{formNameConf:"form_ban-roles", tableId:"table_ban-roles", formClass:".form_ban-roles", type:"roles"},
        {formNameConf:"form_ban-batch-roles", tableId:"table_ban-batch-roles", formClass:".form_ban-batch-roles", type:"batch-roles"},
        {formNameConf:"form_ban-account", tableId:"table_ban-account", formClass:".form_ban-account", type:"account"},
        {formNameConf:"form_ban-device", tableId:"table_ban-device", formClass:".form_ban-device", type:"device"},
        {formNameConf:"form_auto-timing", tableId:"table_auto-timing", formClass:".form_auto-timing", type:"auto-timing"}];

    $.each(initArray, function(i, obj){
        admin.initForms(obj.formNameConf, '#'+obj.formNameConf).then(function () {
            $("#create_time").parent().css('width', '500px');
            $("#createtime").parent().css('width', '500px');
            $("#time").parent().css('width', '500px');
            $("#Time").parent().css('width', '500px');
            admin.getCols(obj.formNameConf).then(function (data) {
                $.initDataTable(data.data, obj.type, obj.tableId,obj.formClass)
            });
        });
    });

    $.reload = function (sel, tableId) {
        let param = admin.getFormParam(sel);
        if(tableId == 'table_ban-roles') param.server_id = area_arr;
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
        ban_roles:ban_roles,
        ban_batch_roles:ban_roles,
        ban_account:ban_account,
        ban_device:ban_device,
        relieve:relieve,
        detail:detail,
        download:download,
        auto_timing:auto_timing,
        auto_timing_del:auto_timing_del,
        auto_timing_edit:auto_timing_edit
    };

    function auto_timing_edit(obj) {
        if(obj.id > 0){
            layui.admin.popup({
                title: '编辑配置'
                ,area:  ['1135px', '700px']
                ,id: 'auto_timing_edit'
                ,success: function(layero, index){
                    layui.view(this.id).render('ban/auto_timing',{id:obj.id,reason: 'BanReason',type:'role_ban'});
                }
            })
        }else {
            layer.msg('编辑数据有误',{icon:5});
        }
    }

    function auto_timing_del(obj) {
        var Info = [];
        admin.req({
            url: admin.getUrl('/api/ban/autoTiming/ToId'),
            data: {id:obj.id},
            type: 'get',
            done: function (data) {
                if (data.code == 0) {
                    if(data.data.list.banned_min.length > 0){
                        for (var i = 0;i<data.data.list.banned_min.length;i++){
                            Info.push(data.data.list.banned_min[i]);
                        }
                    }
                    admin.req({
                        url:admin.getUrl('/api/ban/autoTimingDel'),
                        data: {
                                ban_reason:data.data.list.banned_reason,
                                before_ban_reason:'',
                                min:data.data.list.min,
                                before_min:'',
                                max:data.data.list.max,
                                before_max:'',
                                data:Info,
                                id:obj.id
                        },
                        method: 'post',
                        dataType: 'json',
                        done: function (res) {
                            if(res.code == 0){
                                table.reload(obj.tableId);
                            }else {
                                layer.msg(res.msg,{icon:5})
                            }
                        }
                    })
                } else {
                    layer.msg(data.msg, {icon: 5, anim: 6});
                }
            }
        });
    }

    function auto_timing() {
        layui.admin.popup({
            title: '添加配置'
            ,area:  ['1135px', '700px']
            ,id: 'auto_timing'
            ,success: function(layero, index){
                layui.view(this.id).render('ban/auto_timing', {reason: 'BanReason',type:'role_ban'});
            }
        })
    }

    function download(obj) {
        var checkStatus = obj.tableId ? layui.table.checkStatus(obj.tableId).data : [{filename:obj.filename,originalname:obj.originalname}];
        if (checkStatus.length == 0) {
            layer.msg('请先选择文件',{icon:5});
            return false;
        }
        for (var i = 0;i<checkStatus.length;i++){
            var filename = checkStatus[i].filename;
            var originalname = checkStatus[i].originalname;
            if(!checkStatus[i].filename || checkStatus[i].filename == ''){
               var str =  checkStatus[i].originalname;
               layer.msg(str ? str + '有误' : 'xlsx文件有误',{icon:5});
            }else {
                admin.req({
                    url:admin.getUrl('/api/ban/export-roles'),
                    data: {check_file:1,filename:filename,originalname:originalname},
                    method: 'get',
                    dataType: 'json',
                    done: function (res) {
                        if(res.code == 0){
                            admin.download({
                                url: admin.getUrl('/api/ban/export-roles'),
                                data: {filename:res.data.filename,check_file:2},
                                method: 'get',
                                dataType: 'json'
                            });
                        }else {
                            layer.msg(res.msg,{icon:5})
                        }
                    }
                })
            }
        }
    }
    function detail(obj) {
        layui.admin.popup({
            title: '账号角色详情'
            ,area:  ['550px', '500px']
            ,id: 'relieve'
            ,success: function(layero, index){
                var data = [{banned_list_id:obj.banned_list_id}];//得到选中的数据
                layui.view(this.id).render('ban/account/detail',data);
            }
        })
    }

    function search(obj) {
        $.reload(obj.formClass, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.formClass);
        layui.jquery("input[name=area]").val('');
        area_arr = '';
        $.reload(obj.formClass, obj.tableId);
    }

    function ban_roles(obj,name = 'roles'){
        if(obj.event == 'ban_batch_roles') name = "batch_roles";
        ban(obj, '添加角色封禁','ban_roles','ban/add_form',name,'/api/ban/roles');
    }

    function ban_account(obj){
        ban(obj,'添加账号封禁','ban_account','ban/account/add_form','account','/api/ban/account');
    }

    function ban_device(obj) {
        ban(obj,'添加设备号封禁','ban_device','ban/device/add_form','device','/api/ban/device');
    }

    function ban(obj,title,id,route,banned_name,api){
        layui.admin.popup({
            title: title
            ,area:  ['800px', '600px']
            ,id: id
            ,success: function(layero, index){
                layui.view(this.id).render(route,obj).done(function () {
                    $("#ban_close").on('click',function () {
                        layer.close(index);
                    })
                    layui.form.on('submit(ban_submit)', function (data) {
                        var formData = data.field;
                        formData.banned_name = banned_name;
                        if(banned_name == 'roles')formData.check_result = $("#checkResult").text();
                        if(banned_name == 'batch_roles'){
                            formData.check_result = $("#check_res").text();
                            formData.user_list = $("#roleid").val();
                            formData.filename = $("#filename").val();
                            formData.originalname = $("#originalname").val();
                        }
                        layui.admin.req({
                            url:layui.admin.getUrl(api),
                            method: 'get',
                            data: formData,
                            dataType: 'json',
                            done: function (res) {
                                if(res.code == 0){
                                    layer.msg(res.msg);
                                    layer.close(index);
                                    $.reload(obj.formClass, obj.tableId);
                                }else {
                                    layer.msg(res.msg,{icon:5});
                                }
                            }
                        })
                        return false;
                    });
                });
            }
        })
    }

    function relieve(obj){
        if(obj.banned_list_id){
            var checkStatus = [{banned_list_id:obj.banned_list_id,type:obj.type,id:obj.id}];//得到选中的数据
            relieves(checkStatus,obj);
        }else {
            var checkStatus = layui.table.checkStatus(obj.tableId).data;//得到选中的数据
            if(checkStatus.length == 0) {
                layer.msg('请勾选要操作的用户',{icon:5});
            }else {
                relieves(checkStatus,obj);
            }
        }
    }
    //处理解禁事件
    function relieves(obj,dom){
        switch (dom.tableId) {
            case 'table_ban-roles':
                layui.admin.popup({
                    title: '角色信息'
                    ,area:  ['550px', '500px']
                    ,id: 'relieve'
                    ,btn: ['下一步', '取消']
                    ,success: function(layero, index){
                        layui.view(this.id).render('ban/relieve',obj);
                    },yes: function(index, layero){
                        relieve_finish(obj,dom,'roles','role');
                    }
                });
                break;
            case 'table_ban-account':
                relieve_finish(obj,dom,'account','user');
                break;
            case 'table_ban-device':
                relieve_finish(obj,dom,'device','device');
                break;
        }
    }
    function relieve_finish(obj,dom,type,banned_name){
        var DataObj = layui.table.cache[dom.tableId][dom.index];
        if(!DataObj){
            DataObj = {};
            DataObj.server_id = getInfo(obj,'server_id'),
            DataObj.banned_list_id = getInfo(obj,'banned_list_id'),
            DataObj.nickname = getInfo(obj,'nickname'),
            DataObj.type_name = getInfo(obj,'type_name')
        }
        layui.admin.popup({
            title: '解禁'
            ,area:  ['555px', '300px']
            ,id: 'relieve_next'
            //,btn: ['确定', '取消']
            ,success: function(layero, index){
                layui.view(this.id).render('ban/relieve_next',[obj,type]).done(function () {
                    $("#relieve_close").on('click',function () {
                        layer.close(index);
                    })
                    layui.form.on('submit(relieve_submit)', function (data) {

                        var relieve_rests_reason = data.field.relieve_rests_reason;
                        var option = $("select[name=relieve_reason]").find("option:selected").text();
                        if(option == '其他' || option == '其它'){
                            if(!relieve_rests_reason){
                                layer.msg('请输入解禁理由', { icon: 5 });
                                return false;
                            }
                        }
                        layui.admin.req({
                            url:layui.admin.getUrl('/api/relieve'),
                            method: 'post',
                            data: {
                                relieve_info:obj,
                                'banned_name':banned_name,
                                server_id:DataObj.server_id,
                                user_list:DataObj.banned_list_id,
                                nickname:DataObj.nickname,
                                type_name:DataObj.type_name,
                                relieve_reason:option,
                                rests_reason:relieve_rests_reason,
                            },
                            dataType: 'json',
                            done: function (res) {
                                if(res.code==0){
                                    layer.msg(res.msg,{icon:1});
                                    layer.closeAll();
                                    $.reload(dom.formClass, dom.tableId);
                                }else {
                                    layer.msg(res.msg,{icon:5});
                                }
                            }
                        })
                        return false;
                    })
                });
            }
        })
    }
    $("input[name=area]").on('click',function (e) {
        layui.admin.popup({
            title: '选择区服'
            ,area:  ['1200px', '500px']
            ,id: 'select_area'
            ,btn: ['确定', '取消']
            ,success: function(layero, index){
                layui.view(this.id).render('area', {area: e.target.value});
            },yes: function(index, layero){
                //layui.jquery('#get_area').val(); 区服拼接后的值
                area_arr = layui.jquery('#get_area_all').val(); //区服转数组的值
                layui.jquery("input[name=area]").val(layui.jquery('#get_area').val());
                layer.close(index);
            }
        });
    })

    function getInfo(arr,flag)
    {
        var str  = '',dot = ',';
        for (var i = 0;i<arr.length;i++){
            if(i == arr.length - 1){
                str += arr[i][flag];
            }else {
                str += arr[i][flag] + dot;
            }
        }
        return str;
    }
    exports('banned/setting', {})

});
