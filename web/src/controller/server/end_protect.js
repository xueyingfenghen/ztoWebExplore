layui.define(['admin', 'form'], function (exports) {


    let $ = layui.jquery,
        admin = layui.admin,
        form = layui.form;


    form.render();


    //  确定更改
    $("#submitBtn").on('click', function () {
        admin.req({
            url: admin.getUrl('/api/server/end_protect'),
            method: 'post',
            data: {
                server_ids: parent.serverIds,
                pwd:$("#endProtectPwd").val(),
            },
            dataType: 'json',
            done: function (res) {
                if(res.code != 0){
                    return;
                }
                parent.layer.msg('取消维护成功',{icon: 1});
                parent.layer.close(parent.endProtectIndex);
                parent.reloadDistrictList();
            },
        });

    });

    //  取消更改
    $("#cancelBtn").on('click', function () {
        parent.layer.close(parent.endProtectIndex);
    });


    exports('server/end_protect', {});
});
