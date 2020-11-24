layui.define(['admin', 'form', 'table'],function (exports) {

    let $ = layui.jquery,
        admin = layui.admin,
        form = layui.form,
        table = layui.table;

    window.tableData = {};

    let pageSize = 1,
        page = 1;

    let cols = [[ //表头
        {field: 'server_id', title: '即将开区区服编号',sort: true,align: 'center',fixed: 'left', templet: '#serverIdAutoTpl'},
        {field: 'server_name', title: '即将开区区服名称',align: 'center', templet: '#serverNameAutoTpl'},
        {field: 'activity', title: '开区活动',align: 'center', templet: '#serverActivityAutoTpl'},
        {field: 'activity_write', title: '活动写入',align: 'center', templet: '#serverActivityWriteAutoTpl'},
        {field: 'open_num', title: '开区条件',align: 'center',templet: '#serverOpenNumTpl'},
        {field: 'people_num', title: '当前区服人数',align: 'center',templet: '#serverPeopleNumTpl'},
        {field: 'open_range', title: '开区时间范围',align: 'center',templet: '#serverOpenRangeTpl'},
        {field: 'operate', title: '操作',align: 'center', width: 200,fixed: 'right', templet: '#autoOperateTpl'}
    ]];

    //  初始化表格
    function initAutoOpenList(){

        var getAutoOpenList = new Promise(function (resolve, reject) {

            admin.getCols('server_auto_open_table').then(function (data) {
                cols = data.data;
                admin.req({
                    url: admin.getUrl('/api/server/auto_list'),
                    method: 'get',
                    data: {},
                    dataType: 'json',
                    done: function (res) {
                        if(res.code != 0){
                            return;
                        }
                        window.tableData = res.data;
                        resolve();
                    },
                });
            });
        });

        //  渲染表格
        getAutoOpenList.then(function () {

            table.render({
                elem: '#auto-open-list',
                cols: cols,
                data: window.tableData.list,
                page: {
                    layout:['refresh'],
                },
                limit: pageSize
            });

            //  刷新 & 切换tab
            $(".layui-laypage-refresh, li[data-id='auto-open']").on('click', function (obj) {
                initAutoOpenList();
            });
        });
    }

    initAutoOpenList();

    window.reloadAutoOpenList = initAutoOpenList;

    //  开启、关闭自动开区
    form.on('switch(openAuto)', function (obj) {

        let isOpen = obj.elem.checked?2:1;
        let list =  window.tableData.list[0];
        if(list.server_id == undefined || list.server_id == 0){
            layer.msg('不存在自动开区的区服，不能开启/关闭自动开区',{icon:5});
            obj.elem.checked = !obj.elem.checked;
            form.render();
            return;
        }
        if(isOpen == 2){
            let errMsg = '';
            //  开启自动开区
            if(!list.auto_start_time || !list.auto_end_time || !list.open_num || !list.people_num){
                errMsg = '请先设置自动开区';
            }else if(list.open_time != undefined && list.open_time != ''){
                errMsg = '更改失败，请先取消定时开区任务';
            }else if(list.auto_switch_id.length > 0 && list.interval_time > 0){
                errMsg = '更改失败，请先取消自动切换任务';
            }

            if(errMsg != ''){
                layer.msg(errMsg, {icon:5});
                obj.elem.checked = false;
                form.render();
                return;
            }
        }

        admin.req({
            url:admin.getUrl('/api/server/auto_open'),
            method: 'post',
            data: {
                server_id: list.server_id,
                opened: isOpen,
            },
            dataType: 'json',
            done: function (res) {
                if(res.code == 0){
                    layer.msg(res.msg, {icon:1});
                    initAutoOpenList();
                    return;
                }
                obj.elem.checked = !obj.elem.checked;
                form.render();
                layer.msg(res.msg, {icon:5});
            },
        });
    });

    //  设置自动开区
    $("#setAutoOpenBtn").on('click', function () {
        if(window.tableData.list[0].server_id == 0){
            layer.msg('不存在自动开区的区服，不能设置自动开区',{icon:5});
            return;
        }
        if(window.tableData.list[0].opened == 2){
            layer.msg('请先关闭自动开区',{icon:5});
            return;
        }
        window.setAutoOpenIndex = layui.admin.popup({
            title: '设置自动开区'
            ,area:  ['600px', '450px']
            ,id: 'setAutoOpenPage'
            ,success: function(layero, index){
                layui.view(this.id).render('server/set_auto');
            }
        });
    });

    exports("server/auto_open",{})
});
