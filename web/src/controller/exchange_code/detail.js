layui.extend({props: '/common/props', limitation: '/common/limitation'});
layui.use(['props', 'limitation'], function () {
    layui.define(['table', 'admin', 'form', 'jquery'], function (exports) {
        let admin = layui.admin;
        let props = layui.props;
        let limitation = layui.limitation;
        let $ = layui.jquery;

        $.sendDetailParams = function (params) {
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
                        $('#modify-time-edit').val(dataInfo.updated_at);
                        $('#apply-user-edit').val(dataInfo.apply_user_name);
                        $('#apply-reason-edit').val(dataInfo.apply_reason);
                        $('#judge-user-edit').val(dataInfo.judge_user_name);
                        if (dataInfo.judge_status >= 10) {
                            $('#judge-time-edit').val(dataInfo.judge_time);
                            $('#judge-reason-edit').val(dataInfo.judge_reason);
                        } else {
                            $('#judge-time-edit').val('-');
                            $('#judge-reason-edit').val('-');
                        }

                        //审核状态
                        if (dataInfo.judge_status == 10) {
                            $('#status-edit').val('拒绝');
                        } else if (dataInfo.judge_status == 20) {
                            $('#status-edit').val('通过');
                        } else {
                            $('#status-edit').val('待审核');
                        }
                    }
                }
            });
        };

        exports('exchange_code/detail', {})
    });
});