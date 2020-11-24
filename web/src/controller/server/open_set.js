layui.define(['admin', 'form', 'laydate', 'table'], function (exports) {


    let $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        admin = layui.admin,
        table = layui.table;

    form.render();

    let tableData = {};
    let autoOpenData = {};


    const cols = [ //表头
        {field: 'server_id', title: '区服编号',sort: true,align: 'center'}
        ,{field: 'server_name', title: '区服名称',align: 'center'}
        ,{field: 'state', title: '区服状态',align: 'center', templet: function (obj) {
                return showStateTpl(obj);
            }}
        ,{field: 'open_time', title: '开区时间',align: 'center',templet: function (obj) {
                return obj.open_time?obj.open_time:'---';
            }}
        ,{field: 'activity', title: '开区活动',align: 'center'}
        ,{field: 'activity_write', title: '活动写入',align: 'center', templet: function (obj) {
                if(obj.activity_write == 1){
                    return '失败';
                }else if(obj.activity_write == 2){
                    return '成功';
                }else{
                    return '---';
                }
            }}
        ,{field: 'operator_name', title: '操作人',align: 'center',templet: function (obj) {
                return obj.operator_name?obj.operator_name:'---';
            }}
        ,{field: 'operator_time', title: '操作时间',align: 'center',templet: function (obj) {
                return obj.operator_time?obj.operator_time:'---';
            }}
        ,{field: 'operate', title: '操作',align: 'center', width: 200,fixed: 'right', toolbar: "#operateTpl"}
    ];

    let pageSize = 10,
        page = 1,
        state = 0,
        open_time = '',
        server_id = 0,
        server_name = '',
        sort_field = 'server_id',
        sort = 'desc';

    let getServerNoList = function() {
        admin.req({
            url: admin.getUrl('/api/server/server_ids'),
            method: 'get',
            data: {
                game_id:0,
                platform_id:0,
            },
            dataType: 'json',
            done: function (res) {
                if(res.code != 0){
                    return;
                }
                var list = res.data.list;
                if(res.data.auto_open != undefined && res.data.auto_open.server_id != undefined){
                    autoOpenData = res.data.auto_open;
                }
                list.forEach(function (item, index) {
                    $("#serverIdSelect").append('<option value="'+item.server_id+'">'+item.server_name+'</option>');
                })
                form.render('select');
            },
        });
    };

    getServerNoList();


    let initDistrictList = function () {

        let filter = {
            page:page,
            page_size: pageSize,
            server_id: server_id,
            state:state,
            open_time:open_time,
            server_name:server_name,
            sort_field:sort_field,
            sort:sort
        };

        var getOpenSetList = new Promise(function (resolve, reject) {

            admin.req({
                url:admin.getUrl('/api/server/open_list'),
                method: 'get',
                data: filter,
                dataType: 'json',
                done: function (res) {
                    if(res.code != 0){
                        return;
                    }
                    tableData = res.data;
                    if(res.data.auto_open != undefined && res.data.auto_open.server_id != undefined){
                        autoOpenData = res.data.auto_open;
                    }
                    resolve();

                },
            });
        });

        getOpenSetList.then(function () {
            layer.closeAll('loading');

            table.render({
                elem: '#district-set-list'
                ,cols: [cols]
                ,data: tableData.list,
                limit: pageSize
            });

            layui.laypage.render({
                elem: 'district-set-page'
                ,count: tableData.total //数据总数
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


    laydate.render({
        elem: '#openTime',
        type: 'datetime',
        range: true,
        trigger: 'click',
    });

    table.on('sort(district-set-list)', function (obj) {
        sort_field = obj.field;
        sort = obj.type;
        //  重新渲染
        initDistrictList();
    });

    table.on('tool(district-set-list)', function (obj) {
        window.parentData = obj;
        if(obj.event == 'cancelOpen'){
            layer.confirm('是否取消开区？',{
                btn:['是','否'],
                // cancel:function(index, layero){
                //  关闭按钮
                // }
            },function (index) {
                cancelOpenPop(obj);
                layer.close(index);
            },function(index){
                layer.close(index);
            });
        }else if(obj.event == 'setOpen'){
            window.edit_page = undefined;
            setDistrictPop(obj, '设置开区');
        }else if(obj.event == 'editOpen'){
            window.edit_page = 1;
            setDistrictPop(obj, '修改区服名称');
        }
    });

    //  取消开区
    let cancelOpenPop = function(obj){
        window.cancelOpenIndex = layui.admin.popup({
            title: '取消开区'
            ,area:  ['450px', '300px']
            ,id: 'setDistrictPage'
            ,success: function(layero, index){
                layui.view(this.id).render('server/cancel_open');
            }
        });
    }

    //  设置开区
    let setDistrictPop = function(obj, title){
        if(autoOpenData.server_id != undefined && autoOpenData.server_id == obj.data.server_id && autoOpenData.opened == 2){
            layer.msg('请先取消自动开区任务', {icon:5});
            return;
        }
        window.setDistrictIndex = layui.admin.popup({
            title: title
            ,area:  ['800px', '450px']
            ,id: 'setDistrictPage'
            ,success: function(layero, index){
                layui.view(this.id).render('server/set_district');
            }
        });
    }

    window.reloadPage = initDistrictList;

    let showStateTpl = function(obj){
        var showHtml = '';
        var curTime = new Date();
        var openTime = new Date(obj.open_time);
        var startTime = new Date(obj.start_time);
        var endTime = new Date(obj.end_time);
        if(obj.open_time == '' || obj.open_time == null || openTime > curTime){
            showHtml += '<span>未开区</span>';
        }else if(obj.start_time != '' && obj.start_time != null && startTime < curTime  && obj.end_time != '' && obj.end_time != null && endTime > curTime){
            showHtml += '<span>维护</span>';
        }else if((obj.start_time == '' || obj.start_time == null) && obj.end_time != '' && obj.end_time != null && endTime > curTime){
            showHtml += '<span>维护</span>';
        }else{
            if(obj.state == 1){
                showHtml += '<span style="color: green;">推荐</span>';
            }else if(obj.state == 2) {
                showHtml += '<span style="color: red;">火爆</span>';
            }
        }
        return showHtml;
    }

    //  搜索确定按钮
    $("#districtSearchBtn").on('click', function () {

        state = $("#stateSelect").val();
        open_time = $("#openTime").val();
        server_name = $("#serverName").val();
        server_id = $("#serverIdSelect").val() === '' ? 0 : $("#serverIdSelect").val();

        initDistrictList();
    });

    //  搜索重置按钮
    $("#districtResetBtn").on('click', function () {

        $("#stateSelect").val(0);
        $("#openTime").val('');
        $("#serverName").val('');
        $("#serverIdSelect").val('');
        form.render("select");
    });


    //  新增区服
    // $("#add-district").on('click', function () {
    //     admin.req({
    //         url: admin.getUrl('/api/server/add'),
    //         method: 'post',
    //         data: {
    //             game_id:0,
    //             platform_id:0,
    //         },
    //         dataType: 'json',
    //         done: function (res) {
    //             layer.msg('添加成功',{icon: 1});
    //             page = 1;
    //             initDistrictList();
    //         },
    //     });
    // });


    exports('server/open_set', {});
});
