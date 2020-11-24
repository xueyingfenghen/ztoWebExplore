layui.define(['table', 'admin', 'form', 'view', 'element'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let $ = layui.jquery;

    //加载道具列表
    $.loadPropsLimitTable = function (groupId, platformId, type, propName = '') {
        var where = {group_id: groupId, platform_id: platformId, prop_type: type};
        if (propName !== '') {
            where.prop_name = propName;
        }
        table.render({
            id: 'props-list',
            elem: '#props-list',
            url: admin.getUrl('/api/system/group/props_list'),
            method: 'GET',
            where: where,//请求参数(额外)
            parseData: function (res) {
                return {
                    "code": res.code, //解析接口状态
                    "msg": '', //解析提示文本
                    "data": res.data.list,
                    "count": res.data.total //解析数据长度
                };
            },
            loading: true,
            page: {
                curr: 1
            },
            request: {
                pageName: 'page' //页码的参数名称，默认：page
                , limitName: 'page_size' //每页数据量的参数名，默认：limit
            },
            cols: [[
                {checkbox: true},
                {field: 'prop_conf', title: 'ID'},
                {field: 'name', title: '道具名称'},
                {field: 'limit', title: '上限数量（个）', edit: 'text'}
            ]],
        });

        // 事件绑定
        table.on('edit(props-list)', function (obj) {
            if (obj.value === '' || /^[1-9]\d*$/.test(obj.value)) {
                admin.req({
                    url: layui.admin.getUrl('/api/system/group/props'), //实际使用请改成服务端真实接口
                    data: {
                        conf_ids: [obj.data.prop_conf],
                        group_id: groupId,
                        limit: obj.value,
                        platform_id: platformId,
                        prop_type: type
                    },
                    method: 'post',
                    async: false,
                    dataType: 'json',
                    done: function (res) {
                        if (res.code === 0) {
                            layer.msg('修改成功', {icon: 1});
                        } else {
                            layer.msg(res.msg, {icon: 5});
                            table.reload('props-list', {});
                        }
                    }
                });
            } else {
                layer.msg('请填写合法的正整数', {icon: 5});
                table.reload('props-list', {});
            }
        });

        var active = {
            search: search,
            multi_set: multiSet
        };

        function multiSet(obj) {
            var selected_props = table.checkStatus('props-list');
            if (selected_props.data.length <= 0) {
                layer.msg('请先选择道具', {icon: 5});
                return;
            }
            admin.popup({
                title: '一键操作'
                , area: ['650px', '350px']
                , id: 'popup-props-set'
                , shadeClose: false
                , success: function (layero, index) {
                    layui.view(this.id).render('permission/props_multi_set', {
                        selected_props: selected_props.data,
                        type: type,
                        platform_id: platformId,
                        group_id: groupId,
                        popup_index: index
                    });
                }
            });
        }

        function search(obj) {
            let param = admin.getFormParam(obj.formClass);
            $.loadPropsLimitTable(groupId, platformId, type, param.prop_name);
        }

        // 事件绑定
        $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
            if (!$(this).attr('data-obj')) return;
            var obj = JSON.parse($(this).attr('data-obj'));
            var event = obj.event;
            active[event] ? active[event].call(this, obj) : '';
        });
    };

    exports('permission/group_props', {});
});