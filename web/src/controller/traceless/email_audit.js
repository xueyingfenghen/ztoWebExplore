layui.define( ['table', 'admin', 'form', 'view', 'laydate', 'element'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;


    initForm('traceless_search_audit_form', '#email_audit_form').then(function () {
        let param = admin.getFormParam('.email_audit_form');
        param.state = 0;
        param.is_traceless = 1; // GM邮件
        table.render({
            id: 'audit_list',
            elem: '#audit_list',
            url: admin.getUrl('/api/traceless/audit/getEmailList'),
            method: 'GET',
            where: param,//请求参数(额外)
            request: {
                pageName: 'page' //页码的参数名称，默认：page
                ,limitName: 'limit' //每页数据量的参数名，默认：limit
            },
            response: { //定义后端 json 格式，详细参见官方文档
                statusName: 'code', //状态字段名称
                statusCode: '0', //状态字段成功值
                msgName: 'msg', //消息字段
                countName: 'countAll', //总页数字段
                dataName: 'data', //数据字段
            },
            page: true,
            loading: true,
            cols: [[
                {field:'id', title: '序号', align: 'center',width: '5%', templet: '#index'},
                {field:'server_list', title: '区服', align: 'center'},
                {title: '操作对象信息', align: 'left', templet: '#sendObjMsg'},
                {field: 'operator_type', title: '操作类型', align: 'center'},
                {field:'prop_content', align: 'center', title: '道具内容'},
                {title: '时间信息', align: 'left', templet: '#timeMsg'},
                {title: '操作人员', align: 'left', templet: '#operatorMsg'},
                {field: 'apply_reason', title: '申请原因', align: 'center'},
                {field:'state', title: '状态', align: 'center', templet: '#stateMsg'},
                {title: '操作', align: 'center', templet: '#auditEdit'},
            ]]
        });
    });

    // 查询
    $(document).off('click', '#audit_search_btn').on('click', '#audit_search_btn', function () {
        admin.reload('.email_audit_form', 'audit_list');
    });

    // 重置
    $(document).off('click', '#reset_search_btn').on('click', '#reset_search_btn', function () {
        admin.resetForm('.email_audit_form');
        admin.reload('.email_audit_form', 'audit_list');
    });


    // 审核邮件
    $(document).off('click', '.audit_do').on('click', '.audit_do', function () {
        let id = $(this).attr('data-type');
        admin.popup({
            title: '无痕审核'
            ,area: ['80%', '80%']
            ,id: 'email_audit_dialog'
            // ,btn: ['确定', '取消']
            ,success: function(layero, index){
                view(this.id).render('email/popup/email_audit_dialog', {id: id, is_traceless: 1, toUrl: '/api/traceless/emailAudit'}).done(function(){

                });
            }
        });

    })

    exports('traceless/email_audit', {})

});
