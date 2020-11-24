layui.define(['table', 'admin', 'form', 'view', 'laydate', 'element', 'common'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;
    voucher = '';

    let initArray = [
        {
            // 单个内充
            form_name: 'interior_pay_form',
            cols_name: 'interior_pay_table_list',
            tableId: 'interior_pay_person_list',
            form_class: '.form_interior_pay_person',
            form_id: '#form_interior_pay_person',
            url: admin.getUrl('/api/player/getInteriorPayList')
        }
    ];

    // 渲染搜索框
    $.each(initArray, function(i, obj){
        admin.initForms(obj.form_name, obj.form_id).then(function () {

            $("input[name='operator_time']").parent().css('width', '500px');

            admin.getCols(obj.cols_name).then(function (data) {
                let cols = data.data;
                let param = admin.getFormParam(obj.form_class);
                routerArray[dataTab]['cols'] = cols;
                table.render({
                    id: obj.tableId,
                    elem: '#' + obj.tableId,
                    url: obj.url,
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
            });
        });
    });


    /**
     * 新增单个内充--dialog
     */
    $(document).off('click', '#add_interior_pay_dialog').on('click', '#add_interior_pay_dialog', function () {
        admin.popup({
            title: '新增单个内充'
            ,area: ['80%', '80%']
            ,id: 'relieve_banned_dialog'
            // ,btn: ['确定', '取消']
            ,success: function(layero, index){
                view(this.id).render('player/popup/interior_pay/interior_pay_dialog').done(function(){
                    voucher = '';


                    $(document).off('click', '#add-interior-pay').on('click', '#add-interior-pay', function () {
                        let param = admin.getFormParam('.replenish_person_add_dialog');
                        param.recharge = table.cache.pay_content;
                        param.rmb_gift = table.cache.rmb_list;
                        admin.req({
                            url: admin.getUrl('/api/player/interiorPayPerson'),
                            data: param,
                            type: 'post',
                            done: function (data) {
                                if (data.code == 400) {
                                    layer.msg(data.msg, {icon: 5, anim: 6});
                                }
                                if (data.code == 0) {
                                    layer.close(index);
                                    voucher = data.data['voucher']; // 本次的操作凭证
                                    // 查看补单失败详情
                                    $.getReplenishState(voucher);
                                }
                            }
                        });
                    })

                    $(document).off('click', '#channel-interior-pay').on('click', '#channel-interior-pay', function () {
                        layer.close(index);
                    })


                });
            }
        });
    })

    /**
     * 补单失败界面 重新补单（checkbox多选）
     * */
    $(document).off('click', '#re_more_interior_pay').on('click', '#re_more_interior_pay', function () {
        let checkData = table.checkStatus('pay_fail_list').data;
        idArr = [];
        for (let k in checkData) {
            idArr.push(checkData[k]['id']);
        }
        if (idArr.length < 1) {
            layer.msg('请勾选重新充值的数据', {icon: 5, anim: 6});
        } else {
            // 重新补单请求
            admin.req({
                url: admin.getUrl('/api/player/reInteriorPay'),
                data: {
                    idArr: idArr,
                    dataArr: checkData
                },
                type: 'post',
                done: function (data) {
                    if (data.code == 400) {
                        layer.msg(data.msg, {icon: 5, anim: 6});
                    }
                    if (data.code == 0) {
                        $.reloadReplenishTable(voucher);
                    }
                }
            });
        }
    });

    exports('interior_pay/person_pay', {})

})
