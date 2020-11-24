layui.define(['admin', 'form', 'laydate', 'table'],function (exports) {


    let $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        admin = layui.admin,
        table = layui.table;

    let server_ids = '';
    let tableData = {};
    let autoSwitch = {};
    window.autoOpenData = {};
    window.serverIds = '';
    window.firstServerData = {};


    //  选择区服
    $("#selectArea").on('click', function (e) {
        admin.popup({
            title: '选择区服'
            , area: ['1200px', '500px']
            , id: 'select_area'
            , btn: ['确定', '取消']
            , success: function (layero, index) {
                layui.view(this.id).render('area', {area: e.target.value});
            }, yes: function (index, layero) {
                server_ids = layui.jquery('#get_area_all').val(); //区服转数组的值
                layui.jquery("input[name=area]").val(layui.jquery('#get_area').val());
                layer.close(index);
                initDistrictList();
            }
        });
    });


    //  取消定时切换状态
    $("#cancelAutoSwitch").on("click", function () {
        if (autoSwitch == {} || autoSwitch.server_id.length == 0 || !autoSwitch.interval_time) {
            layer.msg("没有区服可以取消",{icon: 5});
            return;
        }
        admin.req({
            url: admin.getUrl('/api/server/cancel_switch'),
            method: 'post',
            data: {
                old_data: autoSwitch,
            },
            dataType: 'json',
            done: function (res) {
                if(res.code != 0){
                    return;
                }
                layer.msg("取消定时切换成功", {icon:1});
                page = 1;
                initDistrictList();
            },
        });


    });

    //  更改区服状态
    $("#changeStateBtn").on("click", function () {

        if (Object.keys(autoSwitch).length > 0 && autoSwitch.server_id.length > 0 && autoSwitch.interval_time > 0) {
            layer.msg('有定时切换状态任务，无法更改区服状态，请先取消定时切换',{icon:5});
            return;
        }
        if (window.serverIds == '' || window.serverIds == undefined) {
            layer.msg('请选择区服',{icon:5});
            return;
        }


        var serverIdArr = window.serverIds.split(',');
        var serverIdLength = serverIdArr.length;

        var recommendHotArr = [];      //  推荐、 火爆
        var immediatelyArr = [];   // 立即维护
        var scheduledArr = [];     //  定时维护
        var isReturn = false;
        var i = 0;
        var curTime = new Date();

        tableData.list.forEach(function (item, index) {
            if (serverIdArr.includes(item.server_id + '')) {
                var openTime = new Date(item.open_time);
                var startTime = new Date(item.start_time);
                var endTime = new Date(item.end_time);
                if (item.open_time == '' || item.open_time == null || openTime > curTime) {
                    layer.msg('所选区服，包含未开区区服',{icon:5});
                    isReturn = true;
                    return;
                }
                if (i == 0) {
                    window.firstServerData = item;
                }
                i++;

                if (scheduledArr[item.start_time + '-' + item.end_time] == undefined) {
                    scheduledArr[item.start_time + '-' + item.end_time] = [];
                }
                if (immediatelyArr[item.end_time] == undefined) {
                    immediatelyArr[item.end_time] = [];
                }
                if ((item.start_time != '' && item.start_time != null) && (item.end_time != '' && item.end_time != null)) {
                    //  定时维护
                    scheduledArr[item.start_time + '-' + item.end_time].push(item.server_id);
                } else if ((item.start_time == '' || item.start_time == null) && item.end_time != '' && item.end_time != null) {
                    //  立即维护
                    immediatelyArr[item.end_time].push(item.server_id);
                } else if (item.state == 1 || item.state == 2) {
                    //  推荐、火爆
                    recommendHotArr.push(item.server_id);
                } else {
                    layer.msg('所选区服中有不同的维护任务，无法更改区服状态',{icon:5});
                    isReturn = true;
                    return;
                }
            }
        });


        if (isReturn) {
            return;
        }

        if (immediatelyArr[window.firstServerData.end_time].length > 0 && serverIdLength != immediatelyArr[window.firstServerData.end_time].length ||
            scheduledArr[window.firstServerData.start_time + '-' + window.firstServerData.end_time].length > 0 && serverIdLength != scheduledArr[window.firstServerData.start_time + '-' + window.firstServerData.end_time].length) {
            layer.msg('所选区服中有不同维护任务，无法更改区服状态',{icon:5});
            return;
        }

        if (recommendHotArr.length > 0 && serverIdLength != recommendHotArr.length) {
            layer.msg('所选区服中有不同的维护任务，无法更改区服状态',{icon:5});
            return;
        }
        window.autoSwitch = autoSwitch;

        //  打开修改区服弹窗
        window.changeStateIndex = layui.admin.popup({
            title: '更改区服状态'
            , area: ['800px', '500px']
            , id: 'changeState'
            // ,btn: ['确定', '取消']
            , success: function (layero, index) {
                layui.view(this.id).render('server/change_state');
            }
        });
    });

    //  结束维护操作
    $("#endProtect").on('click', function () {
        if (window.serverIds == '' || window.serverIds == undefined) {
            layer.msg('请选择区服',{icon:5});
            return;
        }

        let serverIdArr = window.serverIds.split(',');  //  选中的区服
        let curTime = new Date();
        let notProtect = 0; //  不是维护状态的数量
        let immediatelyArr = [],
            scheduledArr = [];
        let firstItem;
        let i=0;

        tableData.list.forEach(function (item, index) {
            if (serverIdArr.includes(item.server_id + '')) {
                let startTime = new Date(item.start_time);
                let endTime = new Date(item.end_time);
                if (i == 0){
                    firstItem = item;
                }
                i++;
                if(immediatelyArr[item.start_time+'_'+item.end_time] == undefined){
                    immediatelyArr[item.start_time+'_'+item.end_time] = 0;
                }
                if(scheduledArr[item.start_time+'_'+item.end_time] == undefined){
                    scheduledArr[item.start_time+'_'+item.end_time] = 0;
                }
                if ((item.start_time == '' || item.start_time == null) && item.end_time != '' && item.end_time != null && endTime > curTime) {
                    //  立即维护
                    immediatelyArr[item.start_time+'_'+item.end_time]++;
                } else if (item.start_time != '' && item.start_time != null && item.end_time != '' && item.end_time != null && (startTime < curTime && endTime > curTime)) {
                    //  定时维护
                    scheduledArr[item.start_time+'_'+item.end_time]++;
                }else {
                    // 不是维护状态
                    notProtect++;
                }
            }
        });

        let lenOne = immediatelyArr[firstItem.start_time+'_'+firstItem.end_time];
        let lenTwo = scheduledArr[firstItem.start_time+'_'+firstItem.end_time];
        let lenServer = serverIdArr.length;
        if (notProtect > 0) {
            layer.msg('所选区服必须全是维护状态',{icon:5});
            return;
        }else if(lenOne>0 && lenTwo>0 || lenOne > 0 && lenOne != lenServer || lenTwo > 0 && lenTwo != lenServer){
            layer.msg('所选区服必选是相同维护任务',{icon:5});
            return;
        }


        window.endProtectIndex = layui.admin.popup({
            title: '结束维护'
            , area: ['450px', '300px']
            , id: 'endProtectPage'
            , success: function (layero, index) {
                layui.view(this.id).render('server/end_protect');
            }
        });
    });


    form.render();


    laydate.render({
        elem: '#openTime',
        type: 'datetime',
        trigger: 'click',
        range: true
    });

    $(".help-pop").on("click", function () {
        layer.open({
            title: '区服状态'
            , content: '用于查看、手动调整区服状态，设置定时维护任务'
        });
    });

    const cols = [ //表头
        {type: 'checkbox', fixed: 'left'}
        , {field: 'server_id', title: '区服编号', sort: true, align: 'center'}
        , {field: 'server_name', title: '区服名称', align: 'center'}
        , {
            field: 'state', title: '区服状态', align: 'left', templet: function (obj) {
                return viewStateHtml(obj);
            }
        }
        , {field: 'open_time', title: '开区时间', align: 'center'}
    ];

    let pageSize = 10,
        page = 1,
        state = 0,
        open_time = '',
        sort_field = 'server_id',
        sort = 'desc';

    //  列表渲染
    let initDistrictList = function () {

        let filter = {
            page: page,
            page_size: pageSize,
            server_ids: server_ids,
            state: state,
            open_time: open_time,
            sort_field: sort_field,
            sort: sort
        }

        var getList = new Promise(function (resolve, reject) {
            admin.req({
                url: admin.getUrl('/api/server/list'),
                method: 'get',
                data: filter,
                dataType: 'json',
                done: function (res) {
                    if(res.code != 0){
                        return;
                    }
                    tableData = res.data;
                    if (tableData.auto_switch != undefined && tableData.auto_switch.server_id != undefined) {
                        autoSwitch = tableData.auto_switch;
                    }
                    if(tableData.auto_open != undefined && tableData.auto_open.server_id != undefined){
                        //  自动开区数据
                        window.autoOpenData = tableData.auto_open;
                    }
                    resolve();
                },
            });
        });

        getList.then(function () {
            layer.closeAll('loading');
            table.render({
                elem: '#districtTable'
                , cols: [cols]
                , data: tableData.list,
                autoSort:false,
                limit: pageSize
            });
            setTableHeight();

            window.serverIds = '';
            window.firstServerData = {};
            window.serverIdsInput = '';

            layui.laypage.render({
                elem: 'district-page'
                , count: tableData.total //数据总数
                , limit: pageSize
                , curr: page
                , limits: [10, 20, 30, 40, 50]
                , layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
                , prev: '<i class="layui-icon">&#xe603;</i>'
                , next: '<i class="layui-icon">&#xe602;</i>'
                , jump: function (obj, first) {
                    page = obj.curr;
                    pageSize = obj.limit;
                    if (!first) {
                        initDistrictList();
                    }
                }
            });
        });
    };

    initDistrictList();


    window.reloadDistrictList = initDistrictList;

    //  排序
    table.on('sort(districtTable)', function (obj) {
        sort_field = obj.field;
        sort = obj.type;
        //  重新渲染
        initDistrictList();
    });

    //  复选框
    table.on('checkbox(districtTable)', function (obj) {
        var checkStatus = table.checkStatus('districtTable');
        var arr = [];
        $.each(checkStatus.data, function (index, item) {
            arr.push(item.server_id);
        })
        window.serverIds = arr.join(',');
        window.serverIdsInput = serverIdsStr(arr);

    });

    let serverIdsStr = function (arr) {
        if (arr.length <= 1) {
            return arr.join(',');
        }

        //  数组排序 升序
        arr = arr.sort(function (cur, prev) {
            return cur - prev;
        });

        var newArr = [];
        var i = 0;
        newArr[i] = [arr[0]];
        arr.reduce(function (prev, cur) {
            cur - prev === 1 ? newArr[i].push(cur) : newArr[++i] = [cur];
            return cur;
        });

        var serverIdStr = [];
        $.each(newArr, function (index, item) {
            var itemLength = item.length;
            if (itemLength == 1) {
                serverIdStr.push(item[0]);
            } else {
                serverIdStr.push(item[0] + '-' + item[itemLength - 1]);
            }
        });

        return serverIdStr.join(',');
    };


    //  搜索按钮
    $("#districtSearchBtn").on('click', function () {

        state = $("#stateSelect").val();
        open_time = $("#openTime").val();

        initDistrictList();
    });


    //  重置按钮
    $("#districtResetBtn").on('click', function () {

        $("#selectArea").val('');
        $("#stateSelect").val(0);
        $("#openTime").val('');
        server_ids = '';

        form.render('select');

    });

    let viewStateHtml = function (obj) {
        var showHtml = '';
        var curTime = new Date();
        var startTime = new Date(obj.start_time);
        var endTime = new Date(obj.end_time);
        var openTime = new Date(obj.open_time);
        if (obj.open_time == '' || obj.open_time == null || openTime > curTime) {
            showHtml += '<span>当前状态：未开区</span>';
        } else if (obj.start_time != '' && obj.start_time != null && obj.end_time != '' && obj.end_time != null) {
            if(startTime < curTime && endTime > curTime){
                showHtml += '<span>当前状态：维护</span>';
            }else{
                if (obj.state == 1) {
                    showHtml += '<span>当前状态：推荐</span>';
                } else if (obj.state == 2) {
                    showHtml += '<span>当前状态：火爆</span>';
                }
            }
            showHtml += '<br/><sapn '+ (startTime < curTime && endTime > curTime ? 'class="state-color"' : '') + '>任务类型：定时维护</sapn>';
            showHtml += '<br/><sapn '+ (startTime < curTime && endTime > curTime ? 'class="state-color"' : '') + '>开始时间：' + obj.start_time + '   结束时间：' + obj.end_time + '</sapn>';
        } else if ((obj.start_time == '' || obj.start_time == null) && obj.end_time != '' && obj.end_time != null) {
            showHtml += '<span>当前状态：维护</span>';
            showHtml += '<br/><sapn '+ (endTime > curTime ? 'class="state-color"' : '') + '>任务类型：立即维护</sapn>';
            showHtml += '<br/><sapn '+ (endTime > curTime ? 'class="state-color"' : '') + '>结束时间：' + obj.end_time + '</sapn>';
        } else {
            if (obj.state == 1) {
                showHtml += '<span>当前状态：推荐</span>';
            } else if (obj.state == 2) {
                showHtml += '<span>当前状态：火爆</span>';
            }
            if (autoSwitch.server_id.includes(obj.server_id+'') && autoSwitch.interval_time > 0) {
                showHtml += '<br/><span>任务类型：' + (autoSwitch.interval_time/60) + '分钟后轮流切换</span>';
            }
        }


        return showHtml;
    };

    function setTableHeight(){
        $("td[data-field='state']").each(function (index, item) {
            let tableKey = $(this).data('key').split('-');
            $("td[data-key='" + tableKey[0] + "-" + tableKey[1] + "-0']").height($(this).height());
        });
    }

    exports('server/server_state', {});
});
