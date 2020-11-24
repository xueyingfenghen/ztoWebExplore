layui.extend({props: '/common/props', limitation: '/common/limitation'});
layui.use(['props', 'limitation'], function () {
    layui.define(['table', 'admin', 'form'], function (exports) {
        let admin = layui.admin;
        let form = layui.form;
        let props = layui.props;
        let limitation = layui.limitation;

        $.sendJudgeParams = function (params) {
            admin.req({
                url: admin.getUrl('/api/resource/exchange_code/batch_get?id=' + params.id),
                data: {},
                method: 'get',
                dataType: 'json',
                done: function (res) {
                    if (res.code == 0) {
                        var dataInfo = res.data.info;
                        //渲染数据
                        $('#id-edit').val(dataInfo.id);
                        $('#name-edit').val(dataInfo.name);
                        var textProps = props.showPropsText(dataInfo.props);
                        $('#props-edit').val(textProps);

                        if (dataInfo.type == 2) {
                            var typeText = '通用兑换码:' + dataInfo.code;
                        } else {
                            var typeText = '动态兑换码';
                        }
                        $('#type-edit').val(typeText);

                        if (dataInfo.receive_count > 1) {
                            var receiveText = '多次领取:' + dataInfo.receive_count;
                        } else {
                            var receiveText = '单次领取';
                        }
                        $('#receive-type-edit').val(receiveText);

                        $('#limitation-edit').val(limitation.showLimitationText(dataInfo.limitation));
                        $('#amount-edit').val(dataInfo.generate_count);
                        $('#remainder-amount-edit').val(dataInfo.remain_count);
                        $('#start-time-edit').val(dataInfo.start_time);
                        $('#end-time-edit').val(dataInfo.end_time);
                        $('#generate-time-edit').val(dataInfo.end_time);
                        $('#apply-time-edit').val(dataInfo.created_at);
                        $('#apply-user-edit').val(dataInfo.apply_user_name);
                        $('#apply-reason-edit').val(dataInfo.apply_reason);

                        if (!dataInfo.pass_valid) {
                            $('.judge-pass').prop('disabled', true);
                            form.render('radio');
                        }
                    }
                }
            });

            form.render();

            form.on('submit(judge-submit)', function (data) {
                var field = data.field; //获取提交的字段
                admin.req({
                    url: admin.getUrl('/api/resource/exchange_code/batch_judge?id=' + params.id), //实际使用请改成服务端真实接口
                    data: field,
                    method: 'post',
                    dataType: 'json',
                    done: function (res) {
                        if (res.code == 0) {
                            layer.closeAll();
                            $.reload('.form_judge-code', 'table_judge-code');
                        }
                    }
                });
            });

            //表单验证
            layui.form.verify({
                judge_result: function (value, item) { //value：表单的值、item：表单的DOM对象
                    value = $('input[name=judge_result]:checked').val();
                    console.log(value);
                    if (value != 20 && value != 10) {
                        return '请先选择审核结果';
                    }
                }
                ,
                reason: function (value, item) {
                    if (value.length <= 0) {
                        return '请填写申请理由';
                    }
                    if (value.length >= 500) {
                        return '申请理由必须限制在1-500个字符';
                    }
                }
                ,
                password: function (value, item) {
                    if (value.length <= 0) {
                        return '请填写密码';
                    }
                }
            });

            //  取消
            $("#cancelBtn").on('click', function () {
                parent.layer.closeAll();
            });

        };

        exports('exchange_code/judge', {})
    });
});
