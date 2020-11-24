layui.define(['admin', 'form', 'laydate'], function (exports) {


    let $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        form = layui.form;

    let parentData = parent.parentData.data;
    let serverId = parentData.server_id;

    let isEditPage = parent.edit_page;




    //  确定
    $("#submitBtn").on('click', function () {
        var postData = {
            server_id: serverId,
            server_name: $("#serverNameInput").val(),
            pwd: $("#openPwd").val(),
            old_data: parentData,
        };

        if(isEditPage == undefined){
            postData.open_time = $("#openTimeInput").val();
        }else {
            postData.edit_open = 1;
        }
        admin.req({
            url: admin.getUrl('/api/server/set_open'),
            method: 'post',
            data: postData,
            dataType: 'json',
            done: function (res) {
                if(res.code != 0){
                    return;
                }
                parent.layer.msg('设置成功',{icon: 1});
                parent.layer.close(parent.setDistrictIndex);
                parent.reloadPage();
            },
        });

    });

    //  取消
    $("#cancelBtn").on('click', function () {
        parent.layer.close(window.setDistrictIndex);
    });


    if(isEditPage != 1 || isEditPage == undefined){
        var dateConfig = {
            elem: '#openTimeInput',
            type: 'datetime',
            value: parentData.open_time,
            trigger: 'click',
        };
        if(parentData.min_open != '' && parentData.min_open != null){
            dateConfig.min = parentData.min_open;
        }
        if(parentData.max_open != '' && parentData.max_open != null){
            dateConfig.max = parentData.max_open;
        }

        laydate.render(dateConfig);
        $("#openTimeItem").show();
        $("#activityItem").show();
    }else {
        $("#openTimeItem").hide();
        $("#activityItem").hide();
    }




    form.render();

    $("#serverNameInput").val(parentData.server_name);
    $("#serverIdInput").val(parentData.server_id);



    exports('server/set_district', {});
});
