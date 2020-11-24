layui.define( ['table', 'admin', 'form', 'view', 'element', 'common'], function(exports){
    let admin = layui.admin;
    let table = layui.table;
    let form = layui.form;
    let view = layui.view;
    let laydate = layui.laydate;
    let element = layui.element;
    let $ = layui.jquery;

    let initFormName = 'email_search_channel_send_form';   // 初始化搜索框的name
    let initFormSel = '#email_channel_send_form';  // 搜索框所在div的id
    let formDivClassSel = '.email_channel_send_form';
    let paramType = 5;
    let searchBtnSel = '#search_channel_send';
    let resetBtnSel = '#reset_channel_send';
    let tableId = 'channel_list';

    initForm(initFormName, initFormSel).then(function () {
        let param = admin.getFormParam(formDivClassSel);
        param.type = paramType; // 群发邮件
        param.is_traceless = 0; // GM邮件
        table.render({
            id: tableId,
            elem: '#' + tableId,
            url: admin.getUrl('/api/email/channel/getEmailList'),
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
                {title: '发送对象信息', align: 'left', templet: '#sendObjMsg'},
                {title: '邮件信息', align: 'left', templet: '#emailMsg'},
                {field:'prop_content', align: 'center', title: '道具内容'},
                {title: '时间信息', align: 'left', templet: '#timeMsg'},
                {title: '操作人员', align: 'left', templet: '#operatorMsg'},
                {field: 'apply_reason', title: '申请原因', align: 'center'},
                {field:'state', title: '状态', align: 'center', templet: '#stateMsg'},
                {title: '操作', align: 'center', templet: '#emailEdit'},
            ]]
        });
    });

    $.reload = function (sel, tableId) {
        let param = admin.getFormParam(sel);
        table.reload(tableId, {
            where: param,
            page: {
                curr: 1
            }
        });
    }

    // 查询
    $(document).off('click', searchBtnSel).on('click', searchBtnSel, function () {
        $.reload(formDivClassSel, tableId);
    });

    // 重置
    $(document).off('click', resetBtnSel).on('click', resetBtnSel, function () {
        admin.resetForm(formDivClassSel);
        $.reload(formDivClassSel, tableId);
    });

    exports('email/email_channel_send', {})

});
