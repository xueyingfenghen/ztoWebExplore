layui.define(['admin', 'table', 'form'], function (exports) {
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let $ = layui.jquery;

    var categroyList = [];
    var propsList = [];
    var PropsApiData = {};

    var propTypeCountData = {};
    var propCountData = {};

    var aliasMap = {};  //字段别名
    admin.req({
        url: admin.getUrl('/api/config/props'),
        method: 'get',
        dataType: 'json',
        async: false,
        done: function (res) {
            if (res.code == 0) {
                categroyList = res.data.category_list;
                propsList = res.data.props_list;
                $.each(res.data.category_list, function (idx, item) {
                    PropsApiData[item.type] = {
                        props: {},
                        name: item.name,
                        limit: item.limit === undefined ? Number.MAX_VALUE : item.limit
                    };
                });

                $.each(res.data.props_list, function (idx, item) {
                    if (PropsApiData[item.type] !== undefined) {
                        PropsApiData[item.type]['props'][item.conf_id] = {
                            name: item.name,
                            limit: item.limit === undefined ? Number.MAX_VALUE : item.limit
                        };
                    }
                });
                console.log(PropsApiData);
            }
        }
    });

    var setFieldAlias = function (aliases) {
        $.each(aliases, function (key, alias) {
            aliases[alias] = key;
        });
        aliasMap = aliases;
    };

    var getPropsInfo = function () {
        return PropsApiData;
    };

    var showPropsText = function (value) {
        //渲染数据
        var text = '';
        $.each(value, function (idx, item) {
            console.log($.type(item), typeof item);
            var typeField = aliasMap.type === undefined ? 'type' : aliasMap.type;
            var confIdField = aliasMap.conf_id === undefined ? 'conf_id' : aliasMap.conf_id;
            var numField = aliasMap.num === undefined ? 'num' : aliasMap.num;
            if (typeof item === 'object') {
                if (PropsApiData[item[typeField]] === undefined) {
                    var typeName = item[typeField];
                } else {
                    var typeName = PropsApiData[item[typeField]]['name'];
                }

                if (PropsApiData[item[typeField]] === undefined || PropsApiData[item[typeField]]['props'][item[confIdField]] === undefined) {
                    var propName = item[confIdField];
                } else {
                    var propName = PropsApiData[item[typeField]]['props'][item[confIdField]]['name'];
                }
                var name = propName + '[' + typeName + ']';
                text += name + '*' + item[numField] + ',';
            }
        });

        return text === '' ? '-' : text;
    };

    /**
     * 简单渲染道具选择组
     * @param typeEleName
     * @param propEleName
     * @param required
     */
    var renderSelector = function (typeEleName, propEleName, required = false) {
        console.log(PropsApiData);
        $('select[name=' + typeEleName + ']').html('');
        $('select[name=' + propEleName + ']').html('');
        if (!required) {
            $('select[name=' + typeEleName + ']').append('<option value="">请选择道具类型</option>');
            $('select[name=' + typeEleName + ']').val('');
        }
        //类型渲染
        $.each(PropsApiData, function (type, typeInfo) {
            $('select[name=' + typeEleName + ']').append('<option value="' + type + '">' + typeInfo.name + '</option>');
            if (required && !$('select[name=' + typeEleName + ']').val()) {
                $('select[name=' + typeEleName + ']').val(type);
            }
        });

        //道具渲染
        var propRender = function (typeId) {
            console.log(typeId);
            $('select[name=' + propEleName + ']').html('');
            if (!required) {
                $('select[name=' + propEleName + ']').append('<option value="">请选择道具</option>');
            }

            if (PropsApiData[typeId] !== undefined) {
                $.each(PropsApiData[typeId]['props'], function (confId, propInfo) {
                    $('select[name=' + propEleName + ']').append('<option value="' + confId + '">' + propInfo.name + '</option>');
                });
            }

            form.render('select');
        };

        propRender($('select[name=' + typeEleName + ']').val());
        // 切换道具类型联动
        form.on('select(' + typeEleName + ')', function (data) {
            console.log('43243:' + data.value);
            propRender(data.value);
        });
    };

    //礼包配置
    var getGiftConfig = function () {
        var result = {type_list: [], gift_list: []};
        admin.req({
            url: layui.admin.getUrl('/api/resource/gift_config'),
            data: {},
            method: 'get',
            dataType: 'json',
            async: false,
            done: function (res) {
                if (res.code == 0) {
                    var typeList = res.data.type_list;
                    var giftList = res.data.gift_list;
                    result.type_list = typeList;
                    result.gift_list = giftList;
                }
            }
        });
        return result;
    };

    layui.data.propsSendParams = function (params) {

        var propData = [];

        if (params.propData != undefined) {
            propData = params.propData;
            console.log(propData);
        }

        //根据参数隐藏无
        if (params.required_props) {
            $('.no-prop-choose').remove();
        }

        // 添加道具档位
        var addProp = function (pushParam) {
            pushParam.prop_num = parseInt(pushParam.prop_num);
            for (let k in propData) {
                if (pushParam.prop_id == propData[k]['prop_id'] && pushParam.prop_type == propData[k]['prop_type']) {
                    propData[k]['prop_num'] += pushParam.prop_num;
                    propCountData[pushParam.prop_type][pushParam.prop_id] += pushParam.prop_num;
                    return;
                }
            }

            if (propCountData[pushParam.prop_type] === undefined) {
                propCountData[pushParam.prop_type] = {};
            }
            propTypeCountData[pushParam.prop_type] = propTypeCountData[pushParam.prop_type] ? propTypeCountData[pushParam.prop_type] : 0;
            propCountData[pushParam.prop_type][pushParam.prop_id] = propCountData[pushParam.prop_type][pushParam.prop_id] ? propCountData[pushParam.prop_type][pushParam.prop_id] : 0;

            propCountData[pushParam.prop_type][pushParam.prop_id] += pushParam.prop_num;
            propTypeCountData[pushParam.prop_type] += 1;
            propData.push(pushParam);
        };

        //删除道具档位
        var delProp = function (prop_id, prop_type) {
            for (let k in propData) {
                if (propData[k]['prop_id'] == prop_id && propData[k]['prop_type'] == prop_type) {
                    propCountData[prop_type][prop_id] -= propData[k].prop_num;
                    propTypeCountData[prop_type] -= 1;
                    propData.splice(k, 1);
                    return;
                }
            }
        };

        //清空道具档位
        var flushProp = function () {
            propData = [];
            propCountData = {};
            propTypeCountData = {};
        };

        // 设置表格（记录道具内容）
        var initTable = function () {
            if ($('.prop_choose_type:checked').val() == 1) {
                var cols = [[
                    {field: 'prop_type_name', title: '道具类型', align: 'center'},
                    {field: 'prop_name', title: '道具名称', align: 'center'},
                    {field: 'prop_num', title: '数量', align: 'center'},
                    {field: 'prop_id', title: '操作', align: 'center', templet: '#prop_edit', hide: true}
                ]];
            } else {
                var cols = [[
                    {field: 'prop_type_name', title: '道具类型', align: 'center'},
                    {field: 'prop_name', title: '道具名称', align: 'center'},
                    {field: 'prop_num', title: '数量', align: 'center'},
                    {field: 'prop_id', title: '操作', align: 'center', templet: '#prop_edit'}
                ]];
            }
            table.render({
                id: 'prop_content',
                elem: '#prop_content',
                page: false,
                loading: true,
                cols: cols,
                limit: 100,
                data: propData
            });
        };

        //道具模式选择
        var propChooseTypeShow = function (value) {
            if (value == 0) {
                $('.gift_bag').hide();
                $('.prop_conf').show();
                $('.prop_content').show();
                $('#email_add_dialog .audit').show();
                initTable();
            }
            if (value == 1) {
                $('.gift_bag').show();
                $('.prop_conf').hide();
                $('.prop_content').show();
                $('#email_add_dialog .audit').show();
                flushProp();
                initTable();
            }
            if (value == 2) {
                $('.gift_bag').hide();
                $('.prop_conf').hide();
                $('.prop_content').hide();
                $('#email_add_dialog .audit').hide();
                flushProp();
                initTable();
            }
        };

        var giftConfig = getGiftConfig();

        //表单初始化
        var initForm = function () {
            flushProp();    //防止上次道具添加编辑的缓存影响
            //初始化即时配置
            var list = [];
            $.each(categroyList, function (idx, item) {
                var name = item.name;
                if (PropsApiData[item.type]['limit'] < 10000) {
                    name += ('≤' + PropsApiData[item.type]['limit'] + '种');
                }
                list.push({key: item.type, val: name});
            });
            admin.initSelect(list, "select[name='prop_type']", '请选择道具类别');

            //初始化礼包配置
            list = [];
            $.each(giftConfig.type_list, function (idx, item) {
                list.push({key: item.id, val: item.name, disable: false});
            });
            admin.initSelect(list, "select[name='gift_bag_type']", '请选择礼包类型');

            var typeMap = {};

            if (params.is_email != undefined) {
                $.each(params.props_list, function (idx, item) {
                    var pushParam = {
                        prop_type: item.prop_type,
                        prop_type_name: item.prop_type_name,
                        prop_id: item.prop_id,
                        prop_name: item.prop_name,
                        prop_num: item.prop_num
                    };
                    addProp(pushParam);
                });
            } else {
                $.each(params.props_list, function (idx, item) {
                    // console.log(PropsApiData);
                    console.log(item);
                    if (PropsApiData[item.type] !== undefined && PropsApiData[item.type]['props'][item.conf_id] !== undefined) {
                        // 获取选择
                        var prop_name = PropsApiData[item.type]['props'][item.conf_id]['name'];
                        var prop_type_name = PropsApiData[item.type]['name'];
                        var pushParam = {
                            prop_type: item.type,
                            prop_type_name: prop_type_name,
                            prop_id: item.conf_id,
                            prop_name: prop_name,
                            prop_num: item.num
                        };

                        //上限过滤
                        typeMap[item.type] = typeMap[item.type] === undefined ? 1 : (typeMap[item.type]++);
                        if (typeMap[item.type] <= PropsApiData[item.type]['limit'] && PropsApiData[item.type]['props'][item.conf_id]['limit'] >= item.num) {
                            addProp(pushParam);
                        }
                    }
                });
            }

            initTable();

            form.render();
        };

        initForm();

        // 道具选择 0 即时配置 1 礼包模版 2 无
        form.on('radio(prop_choose_type)', function (data) {
            propChooseTypeShow(data.value);
        });

        // 切换道具类型联动
        form.on('select(prop_type)', function (data) {
            var list = [];
            if (PropsApiData[data.value] !== undefined && PropsApiData[data.value]['props'] !== undefined) {
                $.each(PropsApiData[data.value]['props'], function (propId, propInfo) {
                    var name = propInfo.name;
                    if (PropsApiData[data.value]['props'][propId]['limit'] < 10000000000000000) {
                        name += ('≤' + PropsApiData[data.value]['props'][propId]['limit']);
                    }
                    list.push({key: propId, val: name});
                });
            }
            admin.initSelect(list, "select[name='prop_id']", '请选择道具名称');
            $("select[name='prop_id']").val('');
            form.render();
        });

        // 添加道具
        $(document).off('click', '#add_prop').on('click', '#add_prop', function () {
            console.log(propData);
            let prop_id = $("select[name='prop_id']").val();
            let prop_num = $("input[name='prop_num']").val();
            let prop_type = $("select[name='prop_type']").val();
            if (prop_id.trim() === '') {
                layer.msg('请选择道具', {icon: 5, anim: 6});
                return;
            }
            if (prop_num.trim() === '') {
                layer.msg('请输入道具数量', {icon: 5, anim: 6});
                return;
            }
            if (!(/(^[1-9]\d*$)/.test(prop_num))) {
                layer.msg('道具数量必须为正整数', {icon: 5, anim: 6});
                return;
            }

            var beforeTypeCount = (propTypeCountData[prop_type] === undefined ? 0 : propTypeCountData[prop_type]);
            var beforeCount = ((propCountData[prop_type] === undefined || propCountData[prop_type][prop_id] === undefined) ? 0 : propCountData[prop_type][prop_id]);
            if (beforeTypeCount >= PropsApiData[prop_type]['limit'] && beforeCount <= 0) {
                layer.msg('超出了道具类型上限', {icon: 5, anim: 6});
                return;
            }

            if (beforeCount + parseInt(prop_num) > PropsApiData[prop_type]['props'][prop_id]['limit']) {
                layer.msg('超出了道具数量上限(必须≤' + (PropsApiData[prop_type]['props'][prop_id]['limit'] - beforeCount) + ')', {
                    icon: 5,
                    anim: 6
                });
                return;
            }

            // 获取选择
            let pushParam = {
                prop_type: prop_type,
                prop_type_name: PropsApiData[prop_type]['name'],
                prop_id: prop_id,
                prop_name: PropsApiData[prop_type]['props'][prop_id]['name'],
                prop_num: prop_num
            };
            addProp(pushParam);
            initTable();
        });

        $.change_gift_type = function (value) {
            var list = [];
            $.each(giftConfig.gift_list, function (idx, item) {
                var typeMap = {};
                var disable = false;

                if (item.type != value) {
                    return;
                }

                $.each(item.props_list, function (idx2, itemProp) {
                    typeMap[itemProp.type] ? (typeMap[itemProp.type] += 1) : typeMap[itemProp.type] = 1;
                    if (PropsApiData[itemProp.type] === undefined || PropsApiData[itemProp.type]['props'][itemProp.conf_id] === undefined) {
                        disable = true;
                        return;
                    }

                    if (typeMap[itemProp.type] > PropsApiData[itemProp.type]['limit']) {
                        disable = true;
                        return;
                    }

                    if (itemProp.num > PropsApiData[itemProp.type]['props'][itemProp.conf_id]['limit']) {
                        disable = true;
                        return;
                    }
                });

                list.push({key: item.id, val: item.name, disable: disable});
            });

            admin.initSelect(list, "select[name='gift_bag_name']", '请选择礼包名称');
            $("select[name='gift_bag_name']").val('');
            form.render();
        }

        // 切换礼包类型联动
        form.on('select(gift_type)', function (data) {
            let value = data.value;
            $.change_gift_type(value);
        });

        // 添加礼包道具
        form.on('select(gift_id)', function (data) {
            var list = [];
            flushProp();
            if (data.value > 0) {
                $.each(giftConfig.gift_list, function (idx, giftItem) {
                    if (giftItem.id == data.value) {
                        var propsList = giftItem.props_list;
                        $.each(propsList, function (idx, item) {
                            var pushParam = {
                                prop_type: item.type,
                                prop_type_name: PropsApiData[item.type]['name'],
                                prop_id: item.conf_id,
                                prop_name: PropsApiData[item.type]['props'][item.conf_id]['name'],
                                prop_num: item.num
                            };
                            addProp(pushParam);
                            initTable();
                        });
                    }
                });
            }

            // admin.initSelect(list, "select[name='gift_bag_name']", '请选择礼包名称');
            // $("select[name='gift_bag_name']").val('');
            // $("select[name='gift_bag_type']").val('');
            form.render();
        });


        // 删除道具
        $(document).off('click', '.prop_del').on('click', '.prop_del', function () {
            delProp($(this).attr('data-type'), $(this).attr('data-prop-type'));
            initTable();
        });

        //表单验证
        layui.form.verify({
            props_gift_type: function (value, item) { //value：表单的值、item：表单的DOM对象
                if ($('.prop-type-select:checked').val() == 1) {
                    if ($('.props-list').length <= 0 && value <= 0) {
                        return '请选择礼包类型';
                    }
                }
            },
            props_rightnow: function (value, item) { //value：表单的值、item：表单的DOM对象
                if ($('.prop_choose_type:checked').val() != 2) {
                    if (propData.length <= 0) {
                        return '请选择道具';
                    }
                }
            },
            props_gift: function (value, item) { //value：表单的值、item：表单的DOM对象
                if ($('.prop-type-select:checked').val() == 1) {
                    if ($('.props-list').length <= 0) {
                        return '请选择礼包名称';
                    }
                }
            }
        });
    };

    exports('props', {
        getPropsInfo: getPropsInfo,
        showPropsText: showPropsText,
        setFieldAlias: setFieldAlias,
        renderSelector: renderSelector
    });
});

