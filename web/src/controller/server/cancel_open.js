layui.define(['admin', 'laydate', 'form'],function (exports) {


    let $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        form = layui.form;

    let parentData = window.parentData.data;
    let serverId = parentData.server_id;

    form.render();

    //  确定
    $("#submitBtn").on('click', function () {
        admin.req({
            url: admin.getUrl('/api/server/cancel_open'),
            method: 'post',
            data: {
                server_id: serverId,
                pwd:$("#cancelPwd").val(),
                old_data:parentData,
            },
            dataType: 'json',
            done: function (res) {
                if(res.code != 0){
                    return;
                }
                parent.layer.msg('取消成功',{icon: 1});
                parent.layer.close(parent.cancelOpenIndex);
                parent.reloadPage();
            },
        });
    });

    //  取消
    $("#cancelBtn").on('click', function () {
        parent.layer.close(parent.cancelOpenIndex);
    });

    exports('server/cancel_open', {});
});
