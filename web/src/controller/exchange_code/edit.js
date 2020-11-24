layui.extend({props: '/common/props', limitation: '/common/limitation'});
layui.use(['props', 'limitation'], function () {
    layui.define(['table', 'admin', 'form', 'laydate', 'jquery'], function (exports) {
        let admin = layui.admin;
        let form = layui.form;
        let laydate = layui.laydate;
        let $ = layui.jquery;

        $.editBatchParams = function (params) {
            //渲染时间选择器
            admin.laydateInit('.date-time-input', laydate);
            //审核人列表
            admin.req({
                url: admin.getUrl('/api/resource/judge_user_list'),
                data: {},
                method: 'get',
                dataType: 'json',
                async: false,
                done: function (res) {
                    if (res.code == 0) {
                        $.each(res.data.list, function (idx, item) {
                            $("#judge-user-edit").append("<option value='" + item.user_id + "'>" + item.nick_name + "</option>");
                        });
                    }
                }
            });

            //申请原因列表
            admin.req({
                url: admin.getUrl('/api/resource/apply_reason_list'),
                data: {},
                method: 'get',
                dataType: 'json',
                async: false,
                done: function (res) {
                    if (res.code == 0) {
                        $.each(res.data.list, function (idx, reasonText) {
                            $("#reason-type-edit").append("<option value='" + reasonText + "'>" + reasonText + "</option>");
                        });
                    }
                }
            });
            $("#reason-type-edit").append('<option value="" style="color: black">其它</option>');

            //设置兑换码类型
            var setCodeType = function (val) {
                $('.type-edit:checked').prop('checked', false);
                $('.type-edit[value=' + val + ']').prop('checked', true);
                if (val >= 2) {
                    $('#code-field').show();
                } else {
                    $('#code-field').hide();
                }
            };
            form.on('radio(type-edit)', function (data) {
                setCodeType(data.value);
            });

            //设置领取次数
            var setReceiveType = function (val) {
                if (val > 1 || val === '') {
                    $('.receive-count-edit[value=2]').prop('checked', true);
                    $('#receive-count-edit').val(val);
                    $('#receive-count-field').show();
                } else {
                    $('.receive-count-edit[value=1]').prop('checked', true);
                    $('#receive-count-edit').val('');
                    $('#receive-count-field').hide();
                }
            };
            form.on('radio(receive-type-edit)', function (data) {
                setReceiveType(data.value > 1 ? '' : 1);
            });

            //设置申请理由
            var setReasonType = function (val) {
                if (val != '' && $('#reason-type-edit option[value=' + val + ']').length > 0) {
                    $("#reason-type-edit").val(val);
                    $('#reason-edit').val(val);
                    $('#reason-edit-field').hide();
                } else {
                    $("#reason-type-edit").val('');
                    $('#reason-edit').val(val);
                    $('#reason-edit-field').show();
                }
            };
            form.on('select(reason-type-edit)', function (data) {
                console.log(data.value);
                setReasonType(data.value);
            });

            //设置审核人
            var setJudgeUser = function (val) {
                if ($("#judge-user-edit option[value=" + val + "]").length > 0) {
                    $("#judge-user-edit").val(val);
                } else {
                    $("#judge-user-edit").val('');
                }
            };

            //初始化表单
            setCodeType(1);
            setReceiveType(1);
            setReasonType($('#reason-type-edit option:first').val());
            //获取信息-by id
            admin.req({
                url: admin.getUrl('/api/resource/exchange_code/batch_get?id=' + params.id),
                data: {},
                method: 'get',
                dataType: 'json',
                done: function (res) {
                    if (res.code == 0) {
                        if (params.event != 'add') {   //填充数据
                            //渲染数据
                            $('#name-edit').val(res.data.info.name);
                            setCodeType(res.data.info.type);
                            $('#code').val(res.data.info.code);
                            setReceiveType(res.data.info.receive_count);
                            $('#generate-count-edit').val(res.data.info.generate_count);
                            $('#start-time-edit').val(res.data.info.start_time);
                            $('#end-time-edit').val(res.data.info.end_time);
                            $("#reason-edit").val(res.data.info.apply_reason);
                            setReasonType(res.data.info.apply_reason);
                            setJudgeUser(res.data.info.judge_user_id);

                            layui.view('props-container').render('common/prop_select', {
                                props_list: res.data.info.props,
                                required_props: true
                            });
                            layui.view('limitation-container').render('common/limitation', {
                                permission_id: 'exchange-code',
                                limitation_data: res.data.info.limitation
                            });
                        } else {
                            layui.view('props-container').render('common/prop_select', {
                                props_list: [],
                                required_props: true
                            });
                            layui.view('limitation-container').render('common/limitation', {
                                permission_id: 'exchange-code',
                                limitation_data: res.data.info.limitation
                            });
                        }

                        if (params.event != 'edit') {  //赋予最新id
                            $('#id-edit').val(res.data.new_id);
                        } else {
                            $('.event-edit-hide').remove();
                            $('.event-edit-show').show();
                            $('#id-edit').val(res.data.info.id);
                            $('#name-edit').prop('disabled', true);
                        }
                    }
                    form.render(null, 'generate-code-form');
                }
            });

            //  取消
            $("#cancelBtn").on('click', function () {
                parent.layer.closeAll();
            });

            //监听提交按钮
            form.on('submit(exchange-batch-submit)', function (data) {
                var field = data.field; //获取提交的字段
                if (!field.hasOwnProperty('props[0]')) {
                    layer.msg('请添加道具！',{icon: 5})
                    return false
                }

                if (params.event == 'add' || params.event == 'copy') {
                    if (!$.isNumeric(field.judge_user_id) || field.judge_user_id <= 0) {
                        layer.msg('请选择审核人',{icon: 5})
                        return false
                    }
                }
                if (params.event != 'edit') {   //填充数据
                    admin.req({
                        url: admin.getUrl('/api/resource/exchange_code/batch_add'),
                        data: field,
                        method: 'post',
                        dataType: 'json',
                        done: function (res) {
                            if (res.code == 0) {
                                layer.closeAll();
                                layer.msg('新增兑换码ID:' + res.data.id,{icon:1});
                                $.reload('.form_generate-code', 'table_generate-code');
                            }
                        }
                    });
                } else {
                    admin.req({
                        url: admin.getUrl('/api/resource/exchange_code/batch_edit?id=' + params.id),
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
                }
            });

            //表单验证
            form.verify({
                name_length: function (value, item) { //value：表单的值、item：表单的DOM对象
                    if (value.length <= 0) {
                        return '请先填写兑换码名称';
                    }
                    if (value.length < 5 || value.length > 60) {
                        return '兑换码名称长度必须要5到60个字符';
                    }
                }

                //我们既支持上述函数式的方式，也支持下述数组的形式
                //数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
                , common_code: function (value, item) { //value：表单的值、item：表单的DOM对象
                    if ($('.type-edit:checked').val() == 2) {
                        if (value.length <= 0) {
                            return '请填写通用兑换码';
                        }
                        if (!new RegExp("^[0-9a-zA-Z]{1,16}$").test(value)) {
                            return '通用兑换码必须是不大于16位的数字或字母';
                        }
                    }
                }

                , generate: function (value, item) {
                    if (params.event == 'add') {
                        if (value == '') {
                            return '请输入生成数量';
                        }
                        if (!$.isNumeric(value) || value <= 0) {
                            return '生成数量必须填写大于0的数字';
                        }
                    }
                }, judge_user: function (value, item) {
                    if (params.event == 'add' || params.event == 'copy') {
                        if (!$.isNumeric(value) || value <= 0) {
                            return '请选择审核人';
                        }
                    }
                }
                , receive_count: function (value, item) {
                    if ($('.receive-count-edit:checked').val() == 2) {
                        if (value < 2) {
                            return '领取次数必须填写大于等于2的数字';
                        }
                    }
                }
                , start_datetime: function (value, item) {
                    if (params.event == 'add' || params.event == 'copy') {
                        var timestamp = Date.parse(value);
                        console.log(value, timestamp, parseInt(timestamp));
                        if (value == '' || timestamp == NaN || timestamp <= 0) {
                            return '请选择生效时间';
                        }

                        if (parseInt(timestamp) >= parseInt(Date.parse($('#end-time-edit').val()))) {
                            return '生效时间必须小于失效时间';
                        }
                    }
                }
                , end_datetime: function (value, item) {
                    var timestamp = Date.parse(value);
                    console.log(value, timestamp, parseInt(timestamp));
                    if (value == '' || timestamp == NaN || timestamp <= 0) {
                        return '请选择失效时间';
                    }
                },
                reason: function (value, item) {
                    var text = $('#reason-edit').val();
                    if (text == '') {
                        return '请先输入申请理由';
                    }
                    if (text.length <= 0 || text.length >= 500) {
                        return '申请理由必须限制在1-500个字符';
                    }
                },
                password_edit: function (value, item) {
                    if (params.event == 'edit' && value.length <= 0) {
                        return '请输入密码';
                    }
                },
            });
        };

        exports('exchange_code/edit', {})
    });
});
