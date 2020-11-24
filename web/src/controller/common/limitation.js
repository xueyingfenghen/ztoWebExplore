layui.define([], function (exports) {
    let $ = layui.jquery;
    let form = layui.form;
    let admin = layui.admin;
    //区服限制文本
    var getServerLimitText = function (item, includeTitle) {
        var text = '';
        if (includeTitle) {
            text = '限制区服:';
        }

        var serverList = item.server_ids.sort(function (a, b) {
            return a - b;
        });

        if (serverList.length > 0) {
            var last = '';
            for (j = 0; j < serverList.length; j++) {
                if (serverList[j] - 1 == serverList[j - 1]) {
                    last = '-' + serverList[j];
                } else {
                    text += last;
                    last = '';
                    if (j > 0) {
                        text += ',';
                    }
                    text += serverList[j];
                }
            }
            text += last;
        }

        return text;
    };

    //展示限制条件文本
    var showLimitationText = function (value) {
        var text = '';
        $.each(value.list, function (idx, item) {
            switch (item.type) {
                case 'server_filter':
                    text += getServerLimitText(item, true);
            }
            if (idx > 0)
                text += ';';
        });
        return text === '' ? '-' : text;
    };

    layui.data.limitationSendParams = function (params) {
        var hideLimitation = function (isShow) {
            $('.is-limit-select').prop('checked', false);
            if (isShow) {
                $('.limitation-hide').show();
                $('.is-limit-select[value=1]').prop('checked', true);
            } else {
                $('.limitation-hide').hide();
                $('.is-limit-select[value=0]').prop('checked', true);
            }
        };
        hideLimitation(false);

        //监听是否限制选择
        form.on('radio(is-limit-select)', function (data) {
            hideLimitation(parseInt(data.value));
        });

        //渲染已选条件
        var selectedTextList = {};
        var renderSelectedLimitation = function () {
            var finaltext = '';
            $('#list-form-hidden').html('');
            $.each(selectedTextList, function (idx, item) {
                switch (idx) {
                    case 'server_filter':
                        finaltext += ('限制区服:' + item.text + ';');
                        $('#list-form-hidden').append('<input type="hidden" id="server-filter-hidden" name="limitation[server_filter]" value="' + item.value + '" lay-verify="required" autocomplete="off">');
                        break;
                }
            });
            $('#limitation-edit').html(finaltext);
            form.render();
        };

        //填充数据
        if (params.limitation_data !== undefined && params.limitation_data.list !== undefined && params.limitation_data.list.length > 0) {
            $.each(params.limitation_data.list, function (idx, item) {
                switch (item.type) {
                    case 'server_filter':   //区服类型
                        hideLimitation(true);
                        var text = getServerLimitText(item, false);
                        var value = item.server_ids.join();
                        $('#server-limit-show').val(text);
                        selectedTextList.server_filter = {text: text, value: value};
                        renderSelectedLimitation();
                        break;
                }
            });
        }

        //加载配置
        admin.req({
            url: admin.getUrl('/api/system/game_config'),
            data: {permission_id: params.permission_id},
            method: 'get',
            dataType: 'json',
            done: function (res) {
                if (res.code == 0) {
                    if (res.data.config !== undefined && typeof res.data.config.limitation === 'object') {
                        $.each(res.data.config.limitation, function (idx, item) {
                            switch (item.form_type) {
                                case 'server_filter': //区服类型
                                    $('#list-container').append(server_limit.innerHTML);
                                    $('#server-limit-show').click(function (e) {
                                        admin.popup({
                                            title: '选择区服',
                                            area: ['1200px', '500px'],
                                            id: 'select-server',
                                            btn: ['确定', '取消'],
                                            success: function (layero, index) {
                                                layui.view(this.id).render('area',{area: e.target.value});
                                            },
                                            yes: function (index, layero) {
                                                var text = $('#get_area').val();
                                                var value = $('#get_area_all').val();
                                                $('#server-limit-show').val(text);
                                                selectedTextList.server_filter = {text: text, value: value};
                                                renderSelectedLimitation();
                                                layer.close(index);
                                            }
                                        });
                                    });
                                    break;
                            }
                        });

                        form.render();
                    }
                }
            }
        });

        form.render();

        //表单验证
        form.verify({
            server_limit: function (value, item) { //value：表单的值、item：表单的DOM对象
                if (parseInt($('.is-limit-select:checked').val()) > 0) {
                    var serverIds = $('#server-filter-hidden').val();
                    serverIds = serverIds === undefined ? '' : serverIds;
                    if (serverIds == '') {
                        return '请选择区服';
                    }
                    serverIds = serverIds.split(',');
                    if (serverIds.length <= 0) {
                        return '请选择区服';
                    }
                }
            }
        });
    };

    exports('limitation', {getServerLimitText: getServerLimitText, showLimitationText: showLimitationText});
});

