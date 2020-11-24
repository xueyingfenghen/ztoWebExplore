layui.define(['table', 'admin', 'form', 'view', 'laydate', 'element', 'common'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;

    let jkCols;

    // 聊天监控搜索框
    $.initJkForm = function () {
        return new Promise(function (resolve, reject) {
            admin.req({
                url: admin.getUrl('/api/base/getFormList'),
                data: {
                    name: 'player_chat_monitoring_search_form',
                },
                type: 'post',
                done: function (data) {
                    $('#jkSearch').html(data.data['form']);
                    // 此方法用于渲染时间选择器
                    admin.laydateInit('#jkSearch', laydate);
                    // 渲染表单
                    form.render();
                    resolve();
                }
            });
        });
    };

    $.jkList = function (cols) {
        let param = admin.getFormParam('.jkSearch');
        // 玩家列表
        table.render({
            id: 'jk_list',
            elem: '#jk_list',
            url: admin.getUrl('/api/player/monitoringList'),
            method: 'GET',
            where: param,//请求参数(额外)
            request: {
                pageName: 'page' //页码的参数名称，默认：page
                ,limitName: 'limit' //每页数据量的参数名，默认：limit
            },
            response: { //定义后端 json 格式，详细参见官方文档
                statusName: 'code', //状态字段名称
                statusCode: '0', //状态字段成功值
                msgName: 'msg', //消息字段
                countName: 'countAll', //总页数字段
                dataName: 'data', //数据字段
            },
            page: true,
            loading: true,
            cols: cols
        });
    }

    // 重新加载表格（包括表头）
    $.loadJkTable = function (name) {
        admin.getCols(name).then(function (data) {
            let cols = data.data;
            jkCols = cols;
            templet3 = admin.getTemplet(cols);
            $.jkList(cols)
        })
    }

    // 监控搜索框
    $.initJkForm().then(function () {
        // 默认隐藏私聊对象昵称
        $("#jkSearch input[name='school']").parent().parent().hide();
        $("#jkSearch input[name='chat_nickname']").parent().parent().hide();
        $("#jkSearch input[name='chat_role_id']").parent().parent().hide();

        // 搜索框渲染完成则添加门派聊天类型的select监听
        $("select[name='chat_type']").attr('lay-filter', 'chat_type');
        $('#chat_time').parent().css('width', '500px');

        $.loadJkTable('player_chat_monitoring_list');

    });

    // 聊天类型切换
    form.on('select(chat_type)', function(data){
        switch (parseInt(data.value)) {
            case 1: {
                // 世界聊天
                $("#jkSearch input[name='school']").parent().parent().hide();
                $("#jkSearch input[name='chat_nickname']").parent().parent().hide();
                $("#jkSearch input[name='chat_role_id']").parent().parent().hide();
                $("#jkSearch input[name='school']").val('');
                $("#jkSearch input[name='chat_nickname']").val('');
                $("#jkSearch input[name='chat_role_id']").val('');
                form.render();
                $.loadJkTable('player_chat_monitoring_list');
                break;
            }
            case 2: {
                // 系统消息
                $("#jkSearch input[name='school']").parent().parent().hide();
                $("#jkSearch input[name='chat_nickname']").parent().parent().hide();
                $("#jkSearch input[name='chat_role_id']").parent().parent().hide();
                $("#jkSearch input[name='school']").val('');
                $("#jkSearch input[name='chat_nickname']").val('');
                $("#jkSearch input[name='chat_role_id']").val('');
                form.render();
                $.loadJkTable('player_chat_monitoring_list');
                break;
            }
            case 3: {
                // 私聊
                $("#jkSearch input[name='school']").parent().parent().hide();
                $("#jkSearch input[name='chat_nickname']").parent().parent().show();
                $("#jkSearch input[name='chat_role_id']").parent().parent().show();
                $("#jkSearch input[name='school']").val('');
                $("#jkSearch input[name='chat_nickname']").val('');
                $("#jkSearch input[name='chat_role_id']").val('');
                form.render();
                $.loadJkTable('player_chat_monitoring_list_by_private_chat');
                break;
            }
            case 4: {
                // 帮会
                $("#jkSearch input[name='school']").parent().parent().show();
                $("#jkSearch input[name='chat_nickname']").parent().parent().hide();
                $("#jkSearch input[name='chat_role_id']").parent().parent().hide();
                $("#jkSearch input[name='school']").val('');
                $("#jkSearch input[name='chat_nickname']").val('');
                $("#jkSearch input[name='chat_role_id']").val('');
                form.render();
                $.loadJkTable('player_chat_monitoring_list_by_school');
                break;
            }
            default: {
                $("#jkSearch input[name='school']").parent().parent().hide();
                $("#jkSearch input[name='chat_nickname']").parent().parent().hide();
                $("#jkSearch input[name='chat_role_id']").parent().parent().hide();
                $("#jkSearch input[name='school']").val('');
                $("#jkSearch input[name='chat_nickname']").val('');
                $("#jkSearch input[name='chat_role_id']").val('');
                form.render();
                $.loadJkTable('player_chat_monitoring_list');
                break;
            }
        }
    })

    // 查询
    $(document).off('click', '#search_jk').on('click', '#search_jk', function () {
        if ($("#jkSearch select[name='server_id']").val() == '') {
            layer.msg('请选选择区服', {icon: 5, anim: 6});
            return ;
        }
        $.reload('.jkSearch', 'jk_list');
    })

    // 重置
    $(document).off('click', '#reset_jk').on('click', '#reset_jk', function () {
        admin.resetForm('.jkSearch');
        $.reload('.jkSearch', 'jk_list');
    });

    // 导出
    $(document).off('click', '#export_jk').on('click', '#export_jk', function () {
        admin.download({
            url: admin.getUrl('/api/player/monitoringListExport'),
            data: {
                param: admin.getFormParam('.jkSearch'),
                cols: jkCols,
                title: '聊天监控'
            },
            method: 'post',
            dataType: 'json',
        });
    })

    $.doBannedChat = function () {
        admin.popup({
            title: '角色校验结果'
            ,area: ['800px', '600px']
            ,id: 'chat_check_result'
            ,btn: ['下一步', '取消']
            ,success: function(layero, index){
                view(this.id).render('player/popup/chat_check_result').done(function(){
                    // 输入框等完成渲染
                    admin.getCols('player_chat_role_check_result').then(function (data) {
                        table.render({
                            id: 'chat_check_list',
                            elem: '#chat_check_list',
                            url: admin.getUrl('/api/public/getUserBaseInfoList'),
                            method: 'GET',
                            where: {idArr: idArr},//请求参数(额外)
                            request: {
                                pageName: 'page' //页码的参数名称，默认：page
                                ,limitName: 'limit' //每页数据量的参数名，默认：limit
                            },
                            response: { //定义后端 json 格式，详细参见官方文档
                                statusName: 'code', //状态字段名称
                                statusCode: '0', //状态字段成功值
                                msgName: 'msg', //消息字段
                                countName: 'countAll', //总页数字段
                                dataName: 'data', //数据字段
                            },
                            page: true,
                            loading: true,
                            cols: data.data,
                            done: function (d) {
                                $('#chat_check_result .player_num').html(d.countAll);
                            }
                        });
                    })
                });
            }
            ,yes: function(index, layero){
                // layer.close(index);
                admin.popup({
                    title: '添加禁言'
                    ,area: ['800px', '500px']
                    ,id: 'banned_dialog'
                    ,btn: ['确定', '取消']
                    ,success: function(layero, index){
                        view(this.id).render('player/popup/chat_banned').done(function(){
                            $.initBannedReason(false)
                        });
                    }
                    ,yes: function(index, layero){
                        // // 执行禁言操作
                        // if (!check_type) {
                        //     layer.msg('未校验角色或角色校验失败', {icon: 5, anim: 6});
                        //     return ;
                        // }
                        let param = admin.getFormParam('.banned_dialog');
                        param.banned_from = 2; // 默认为聊天监控禁言
                        param.user_list = '';
                        $.each(idArr, function (key, val) {
                            param.user_list += key == 0 ? val : ',' + val;
                        });
                        let loading = layer.msg('正在执行。。。', {icon: 16, shade: 0.2, time:0});
                        admin.req({
                            url: admin.getUrl('/api/banned/bannedChat'),
                            data: param,
                            type: 'post',
                            done: function (data) {
                                layer.close(loading);
                                if (data.code == 0) {
                                    layer.msg('禁言成功', {icon: 6, anim: 0});
                                    layer.closeAll();
                                    admin.reload('.jkSearch', 'jk_list');
                                } else {
                                    layer.msg(data.msg, {icon: 5, anim: 6});
                                }
                            }
                        });

                    }
                    ,btn2: function(index, layero){
                        //按钮【按钮二】的回调
                    }
                    ,cancel: function(){
                        //右上角关闭回调
                    },
                });
            }
            ,btn2: function(index, layero){
                //按钮【按钮二】的回调
            }
            ,cancel: function(){
                //右上角关闭回调
            },
        });
    }

    // 禁言
    $(document).off('click', '.do_banned_jk').on('click', '.do_banned_jk', function () {
        let id = $(this).attr('data-type');
        idArr = [id];
        $.doBannedChat();

    })

    // 一键解除禁言
    $(document).off('click', '#one_key_banned_speak').on('click', '#one_key_banned_speak', function () {
        let checkStatus = table.checkStatus('jk_list').data;
        if (checkStatus.length < 1) {
            layer.msg('请选择禁言对象', {icon: 5, anim: 6});
        } else {
            idArr = [];
            for (let i = 0; i < checkStatus.length; i ++) {
                idArr.push(checkStatus[i][templet3[0]]);
            }
            $.doBannedChat();

        }
    });




    // 邮件详情
    exports('banned/chat_jk', {})

});
