//layui模块的定义
layui.define(['admin'], function (exports) {

    var $ = layui.jquery;

    var PropsApiData = {};
    layui.admin.req({
        url: layui.admin.getUrl('/api/config/props'),
        method: 'get',
        dataType: 'json',
        async: false,
        done: function (res) {
            if (res.code == 0) {
                $.each(res.data.category_list, function (idx, item) {
                    PropsApiData[item.type] = {props: {}, name: item.name};
                });

                $.each(res.data.props_list, function (idx, item) {
                    if (PropsApiData[item.type] !== undefined) {
                        PropsApiData[item.type]['props'][item.conf_id] = {name: item.name};
                    }
                });
            }
        }
    });

    var getPropsInfo = function () {
        return PropsApiData;
    };

    var showPropsText = function (value) {
        //渲染数据
        var text = '';
        $.each(value, function (idx, item) {
            console.log($.type(item), typeof item);
            if (typeof item === 'object') {
                if (PropsApiData[item.type] === undefined) {
                    var typeName = item.type;
                } else {
                    var typeName = PropsApiData[item.type]['name'];
                }

                console.log(PropsApiData);
                if (PropsApiData[item.type] === undefined || PropsApiData[item.type]['props'][item.conf_id] === undefined) {
                    var propName = item.conf_id;
                } else {
                    var propName = PropsApiData[item.type]['props'][item.conf_id]['name'];
                }
                var name = propName + '[' + typeName + ']';
                text += name + '*' + item.num + ',';
            }
        });

        return text;
    };


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

    exports('commonShow', {
        getPropsInfo: getPropsInfo,
        showLimitationText: showLimitationText,
        showPropsText: showPropsText,
        getServerLimitText: getServerLimitText
    });//把mod绑定到layui对象上，注意mod的名字必须喝use的时候一样
});

