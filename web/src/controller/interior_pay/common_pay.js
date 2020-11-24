layui.define(['table', 'admin', 'view', 'common'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let view = layui.view;
    let $ = layui.jquery;

    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if(!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
    });

    let active = {
        search:search,
        reset:reset,
        export_excel: export_excel
    };

    function search(obj) {
        console.log(dataTab);
        admin.reload(obj.form_class, obj.tableId);
    }

    function reset(obj) {
        admin.resetForm(obj.form_class);
        admin.reload(obj.form_class, obj.tableId);
    }

    function export_excel(obj) {
        admin.download({
            url: admin.getUrl(obj.url),
            data: {
                param: admin.getFormParam(obj.form_class),
                cols: routerArray[dataTab].cols,
                title: obj.title
            },
            method: 'post',
            dataType: 'json',
        });
    }

    /****************充值失败列表dialog***************/

    // 充值失败详情
    $.failDialog = function (data, name, type) {
        admin.popup({
            title: '充值失败详情'
            ,area: ['80%', '80%']
            ,id: 'interior_pay_fail_detail'
            ,success: function(layero, index){
                view(this.id).render('player/popup/interior_pay/interior_fail_dialog').done(function(){
                    if (type == 1) {
                        $('#re_more_interior_pay').show()
                    }
                    if (type == 2) {
                        $('#re_more_interior_pay').hide()
                    }

                    admin.req({
                        url: admin.getUrl('/api/base/getTableCols'),
                        data: {
                            name: name,
                        },
                        type: 'post',
                        done: function (res) {
                            let cols = res.data;
                            table.render({
                                id: 'pay_fail_list',
                                elem: '#pay_fail_list',
                                loading: true,
                                cols: cols,
                                data: data,
                                limit: 1000
                            });
                        }
                    });


                });
            }
        });
    }

    /**
     * 获取补单状态， 若全部成功则弹框提示全部充值成功，有失败则列出所有失败的，方便一键补单
     * */
    $.getReplenishState = function (voucher) {
        admin.req({
            url: admin.getUrl('/api/player/getPayFailList'),
            data: {
                voucher: voucher
            },
            type: 'post',
            done: function (data) {
                if (data.code == 400) {
                    layer.msg(data.msg, {icon: 5, anim: 6});
                }
                if (data.code == 0) {
                    admin.reload(routerArray[dataTab].form_class, routerArray[dataTab].tableId); // 重新加载表格
                    // layer.msg('充值成功！', {icon: 6, anim: 0});
                    // return ;

                    // todo 补单存在失败的情况稍后再处理
                    if (data.data.length < 1) {
                        // 充值全部成功
                        layer.msg('充值成功！', {icon: 6, anim: 0});
                    } else {
                        // 存在补单失败的情况，用表格将补单失败的情况全部列出来
                        $.failDialog(data.data, 'player_interior_pay_fail_detail_table', 1);
                    }
                }
            }
        });
    };

    // 重新补单后重载表格
    $.reloadReplenishTable = function (voucher) {
        admin.req({
            url: admin.getUrl('/api/player/getPayFailList'),
            data: {
                voucher: voucher
            },
            type: 'post',
            done: function (data) {
                if (data.code == 400) {
                    layer.msg(data.msg, {icon: 5, anim: 6});
                }
                if (data.code == 0) {
                    admin.reload(routerArray[dataTab].form_class, routerArray[dataTab].tableId); // 重新加载表格
                    if (data.data.length < 1) {
                        // 关闭弹框
                        layer.closeAll();
                        // 补单全部成功
                        layer.msg('充值成功！', {icon: 6, anim: 0});
                    } else {
                        // layer.msg('补单失败', {icon: 5, anim: 6});
                        table.reload(
                            'pay_fail_list',{
                                data: data.data
                            }
                        );
                    }
                }
            }
        });
    }

    // 单个补单操作
    $(document).off('click', '.repay_id').on('click', '.repay_id', function () {
        let id = $(this).attr('data-type');
        idArr = [id];
        admin.req({
            url: admin.getUrl('/api/player/reInteriorPay'),
            data: {
                idArr: idArr,
                dataArr: table.cache['pay_fail_list']
            },
            type: 'post',
            done: function (data) {
                if (data.code == 400) {
                    layer.msg(data.msg, {icon: 5, anim: 6});
                }
                if (data.code == 0) {
                    admin.req({
                        url: admin.getUrl('/api/player/getRepayDataById'),
                        data: {
                            id: id
                        },
                        type: 'post',
                        done: function (data) {
                            if (data.data[0]['state'] == 0) {
                                layer.closeAll();
                                admin.reload(routerArray[dataTab].form_class, routerArray[dataTab].tableId); // 重新加载表格
                                layer.msg('充值成功', {icon: 6, anim: 0});
                            } else {
                                table.reload(
                                    'pay_fail_list',{
                                        data: data.data
                                    }
                                );
                                layer.msg('充值失败', {icon: 5, anim: 6});
                            }
                        }
                    });

                }
            }
        });
    });

    // 充值失败--查看详情
    $(document).off('click', '.look').on('click', '.look', function () {
        let id = $(this).attr('data-type');
        admin.req({
            url: admin.getUrl('/api/player/getRepayDataById'),
            data: {
                id: id
            },
            type: 'post',
            done: function (data) {
                $.failDialog(data.data, 'player_interior_pay_fail_detail_table2', 2);
            }
        });
    })


    exports('interior_pay/common_pay', {})

})
