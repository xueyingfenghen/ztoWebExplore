layui.define(['table', 'admin', 'form', 'view', 'element'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let element = layui.element;
    let $ = layui.jquery;

    // 渲染权限表格
    $.loadPermissionTable = function (groupId) {
        /**
         * name layui合并tbody中单元格的方法
         * @param fieldName  要合并列的field属性值
         * @param index 表格的索引值 从1开始
         * @desc 此方式适用于没有列冻结的单元格合并
         */
        var alarmTableRowSpan = function (fieldName, index) {
            var fixedNode = $(".layui-table-body")[index - 1];
            if (!fixedNode) {
                return false;
            }
            var child = fixedNode.getElementsByTagName("td");
            var childFilterArr = [];
            // 获取data-field属性为fieldName的td
            for (var i = 0; i < child.length; i++) {
                if (child[i].getAttribute("data-field") == fieldName) {
                    childFilterArr.push(child[i]);
                }
            }
            // 获取td的个数和种类
            var childFilterTextObj = {};
            for (var i = 0; i < childFilterArr.length; i++) {
                var childText = childFilterArr[i].textContent;
                if (childFilterTextObj[childText] == undefined) {
                    childFilterTextObj[childText] = 1;
                } else {
                    var num = childFilterTextObj[childText];
                    childFilterTextObj[childText] = num * 1 + 1;
                }
            }
            // 给获取到的td设置合并单元格属性
            for (var key in childFilterTextObj) {
                var tdNum = childFilterTextObj[key];
                var canRowSpan = true;
                for (var i = 0; i < childFilterArr.length; i++) {
                    if (childFilterArr[i].textContent == key) {
                        if (canRowSpan) {
                            childFilterArr[i].setAttribute("rowspan", tdNum);
                            canRowSpan = false;
                        } else {
                            childFilterArr[i].style.display = "none";
                        }
                    }
                }
            }
        };

        var generateTableData = function ($dataList) {
            var tableData = [];
            //仅支持三级内
            $.each($dataList, function (idx, item) {
                var tmp1 = '<input type="checkbox" class="chk-lv-1" name="permission_ids[]" value="' + item.id + '"/>' + item.name + ' ';
                if (item.list !== undefined && item.list.length > 0) {  //二级大于0
                    $.each(item.list, function (idx2, itemLv2) {
                        var tmp2 = '<input type="checkbox" class="chk-lv-2" name="permission_ids[]" value="' + itemLv2.id + '"/>' + itemLv2.name + ' ';
                        var tmp3 = '';
                        if (itemLv2.list !== undefined && itemLv2.list.length > 0) {
                            $.each(itemLv2.list, function (idx3, itemLv3) {
                                tmp3 = (tmp3 + '<input type="checkbox" class="chk-lv-3" name="permission_ids[]" value="' + itemLv3.id + '"/>' + itemLv3.name + ' ');
                            });
                        }
                        tableData.push({level_1: tmp1, level_2: tmp2, level_3: tmp3});
                    });
                } else {    //只有一级
                    tableData.push({level_1: tmp1});
                }
            });

            return tableData;
        };

        var getMapData = function (permissionList) {
            var mapParent = {};
            var mapChild = {};
            //仅支持三级内
            $.each(permissionList, function (idx, item) {
                if (item.list !== undefined && item.list.length > 0) {  //二级大于0
                    $.each(item.list, function (idx2, itemLv2) {
                        if (mapParent[itemLv2.id] === undefined) {
                            mapParent[itemLv2.id] = [];
                        }
                        mapParent[itemLv2.id].push(item.id);

                        if (mapChild[item.id] === undefined) {
                            mapChild[item.id] = [];
                        }
                        mapChild[item.id].push(itemLv2.id);

                        if (itemLv2.list !== undefined && itemLv2.list.length > 0) {
                            $.each(itemLv2.list, function (idx3, itemLv3) {
                                if (mapParent[itemLv3.id] === undefined) {
                                    mapParent[itemLv3.id] = [];
                                }
                                mapParent[itemLv3.id].push(itemLv2.id, item.id);
                                mapChild[item.id].push(itemLv3.id);

                                if (mapChild[itemLv2.id] === undefined) {
                                    mapChild[itemLv2.id] = [];
                                }
                                mapChild[itemLv2.id].push(itemLv3.id);
                            });
                        }

                    });
                }
            });

            return {'parent_map': mapParent, 'child_map': mapChild};
        };

        admin.req({
            url: layui.admin.getUrl('/api/system/group/permission_list'),
            data: {
                group_id: groupId
            },
            method: 'get',
            dataType: 'json',
            done: function (res) {
                if (res.code == 0) {
                    var networkResponse = res.data;
                    var tableData = generateTableData(res.data.all_permission_list);
                    var map = getMapData(res.data.all_permission_list);
                    //渲染
                    table.render({
                        id: 'permission_list',
                        elem: '#permission_list',
                        loading: true,
                        limit: Number.MAX_VALUE,
                        cols: [[
                            {
                                field: 'level_1',
                                title: '<input type="checkbox" class="chk-all"/>一级菜单',
                                align: 'left'
                            },
                            {field: 'level_2', title: '二级菜单', align: 'left'},
                            {field: 'level_3', title: '三级菜单', align: 'left', minWidth: '800'}
                        ]],
                        data: tableData,
                        done: function (res, curr, count) {
                            alarmTableRowSpan('level_1', 1);
                            //复选框样式渲染
                            $('.layui-form-checkbox').remove();

                            $.each($('.chk-all,.chk-lv-1,.chk-lv-2,.chk-lv-3'), function (idx, obj) {
                                if ($(this).is('.chk-all')) {
                                    return;
                                }
                                var checkName = $(this).val();
                                if ($.inArray(checkName, networkResponse.pid_permission_ids) < 0) {
                                    $(this).prop('disabled', true);
                                } else if ($.inArray(checkName, networkResponse.selected_permission_ids) >= 0) {
                                    $(this).prop('checked', true);
                                }
                            });

                            $('.chk-all,.chk-lv-1,.chk-lv-2,.chk-lv-3').show();
                            $('.chk-all,.chk-lv-1,.chk-lv-2,.chk-lv-3').change(function () {
                                var checked = $(this).prop('checked');
                                if ($(this).is('.chk-all')) {
                                    $('.chk-lv-1:enabled,.chk-lv-2:enabled,.chk-lv-3:enabled').prop('checked', checked);
                                } else {
                                    var checkName = $(this).val();
                                    if (checked) {
                                        $.each(map.parent_map[checkName] === undefined ? [] : map.parent_map[checkName], function (k, v) {
                                            if (!$('input[value="' + v + '"]').prop('disabled')) {
                                                $('input[value="' + v + '"]').prop('checked', true);
                                            }
                                        });

                                        $.each(map.child_map[checkName] === undefined ? [] : map.child_map[checkName], function (k, v) {
                                            if (!$('input[value="' + v + '"]').prop('disabled')) {
                                                $('input[value="' + v + '"]').prop('checked', true);
                                            }
                                        });
                                    } else {
                                        $.each(map.child_map[checkName] === undefined ? [] : map.child_map[checkName], function (k, v) {
                                            $('input[value="' + v + '"]').prop('checked', false);
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });

        //监听权限配置提交按钮
        form.on('submit(permission-form-submit)', function (data) {
            permissionConfigCommit(groupId, data.field);
        });
    };

    //加载道具列表
    $.loadPropsTable = function (groupId, platformId) {
        table.render({
            id: 'props-type-list',
            elem: '#props-type-list',
            url: admin.getUrl('/api/system/group/props_type_list'),
            method: 'GET',
            where: {group_id: groupId, platform_id: platformId},//请求参数(额外)
            parseData: function (res) {
                return {
                    "code": res.code, //解析接口状态
                    "msg": '', //解析提示文本
                    "data": res.data.list
                };
            },
            limit: Number.MAX_VALUE,
            loading: true,
            cols: [[
                {field: 'type', title: 'ID'},
                {field: 'name', title: '道具类型'},
                {field: 'limit', title: '上限数量（个）', edit: 'text'},
                {
                    title: '操作', align: 'center', minWidth: 95, toolbar: '#bar'
                }
            ]],
        });

        // 事件绑定
        table.on('tool(props-type-list)', function (obj) {
            switch (obj.event) {
                case 'props':
                    admin.popup({
                        title: '查看道具'
                        , area: ['1050px', '750px']
                        , id: 'popup-props-list'
                        , shadeClose: false
                        , success: function (layero, index) {
                            layui.view(this.id).render('permission/group_props_type', {
                                group_id: groupId, type: obj.data.type, platform_id: $('#platform-select').val()
                            });
                        }
                    });
                    break;
            }
        });

        // 事件绑定
        table.on('edit(props-type-list)', function (obj) {
            if (obj.value === '' || /^[1-9]\d*$/.test(obj.value)) {
                admin.req({
                    url: layui.admin.getUrl('/api/system/group/props_type'), //实际使用请改成服务端真实接口
                    data: {
                        type_ids: [obj.data.type],
                        group_id: groupId,
                        limit: obj.value,
                        platform_id: $('#platform-select').val()
                    },
                    method: 'post',
                    async: false,
                    dataType: 'json',
                    done: function (res) {
                        if (res.code === 0) {
                            layer.msg('修改成功', {icon: 1});
                        } else {
                            layer.msg(res.msg, {icon: 5});
                            table.reload('props-type-list', {});
                        }
                    }
                });
            } else {
                layer.msg('请填写合法的正整数', {icon: 5});
                table.reload('props-type-list', {});
            }
        });
    };

    $.loadPlatformList = function (gameId, groupId) {
        admin.req({
            url: admin.getUrl('/api/game/platform_select'), //实际使用请改成服务端真实接口
            data: {
                'game_id': gameId,
                'rewrite': 1
            },
            method: 'get',
            dataType: 'json',
            loading: true,
            done: function (res) {
                $.each(res.data.list, function (column, item) {
                    $.each(item.platforms, function (line, platform) {
                        if (platform.id && platform.name) {
                            $('#platform-select').append('<option value="' + platform.id + '">' + platform.name + '</option>');
                        }
                    });
                });
                form.render('select');
            }
        });

        //平台选择事件
        form.on('select(platform-select)', function (data) {
            $.loadPropsTable(groupId, data.value);
        });
    };

    //权限配置提交事件
    var permissionConfigCommit = function (groupId, field) {
        //提交修改
        console.log(field);
        admin.req({
            url: layui.admin.getUrl('/api/system/group/set_permission?group_id=' + groupId), //实际使用请改成服务端真实接口
            data: field,
            method: 'post',
            dataType: 'json',
            done: function (res) {
                if (res.code == 0) {
                    layer.msg('修改成功', {icon: 6});
                    $.loadPermissionTable(groupId);
                } else {
                    layer.msg(res.msg, {icon: 5});
                }
            }
        });
    };

    exports('permission/group_config', {})
});
