layui.define(['admin', 'table', 'form'], function (exports) {
    $.sendAppendParams = function (params) {
        let $ = layui.jquery;
        let admin = layui.admin;
        let form = layui.form;
        //渲染筛选框
        layui.form.render('form', 'add-code-form');

        //监听提交按钮
        form.on('submit(append-code-submit)', function (data) {
            var field = data.field; //获取提交的字段
            admin.req({
                url: admin.getUrl('/api/resource/exchange_code/append?id=' + params.id),
                data: field,
                method: 'post',
                dataType: 'json',
                done: function (res) {
                    if (res.code == 0) {
                        layer.closeAll();
                        $.reload('.form_generate-code', 'table_generate-code');
                    }
                }
            });
        });

        //表单验证
        form.verify({
            amount: function (value, item) { //value：表单的值、item：表单的DOM对象
                if (value === '') {
                    return '请先填写追加数量';
                }
                if (!/^[1-9]\d*$/.test(value) || value < 1) {
                    return '必须填写正整数';
                }
            },
            password: function (value, item) { //value：表单的值、item：表单的DOM对象
                if (value === '') {
                    return '请输入密码';
                }
            }
        });

        //  取消
        $("#cancelBtn").on('click', function () {
            parent.layer.closeAll();
        });

    };

    exports('exchange_code/append', {})
});
