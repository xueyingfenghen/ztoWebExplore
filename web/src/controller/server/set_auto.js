layui.define(['admin', 'form', 'laydate'], function (exports) {


    let $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        form = layui.form;

    let parentData = parent.tableData.list[0];

    //  确定
    $("#submitBtn").on('click', function () {
        var postData = {
            server_id: parentData.server_id,
            pwd: $("#autoOpenPwd").val(),
            open_num:$("#openNum").val(),
            start_time:$("#startTime").val(),
            end_time:$("#endTime").val(),
            old_data: parentData,
        };

        if(!postData.open_num){
            layer.msg('开区条件不能为空',{icon:5});
            return;
        }

        if(postData.open_num < 1000){
            layer.msg('开区条件需≥1000',{icon:5});
            return;
        }

        if(!postData.start_time){
            layer.msg('最早开始时间不能为空',{icon:5});
            return;
        }

        if(!postData.end_time){
            layer.msg('最晚开始时间不能为空',{icon:5});
            return;
        }

        if(!postData.pwd){
            layer.msg('密码不能为空',{icon:5});
            return;
        }

        // if(new Date(postData.start_time) > new Date(postData.end_time)){
        //     layer.msg('最晚自动开区时间需大于最早自动开区时间', {icon:5});
        //     return;
        // }

        admin.req({
            url: admin.getUrl('/api/server/set_auto'),
            method: 'post',
            data: postData,
            dataType: 'json',
            done: function (res) {
                if(res.code == 0){
                    parent.layer.msg(res.msg,{icon: 1});
                    parent.layer.close(parent.setAutoOpenIndex);
                    parent.reloadAutoOpenList();
                }else {
                    return;
                }
            },
        });

    });

    //  取消
    $("#cancelBtn").on('click', function () {
        parent.layer.close(window.setAutoOpenIndex);
    });

    laydate.render({
        elem: '#startTime',
        type: 'time',
        value: parentData.auto_start_time,
        trigger: 'click',
    });

    laydate.render({
        elem: '#endTime',
        type: 'time',
        value: parentData.auto_end_time,
        trigger: 'click',
    });

    form.render();

    $("#startTime").val(parentData.auto_start_time);
    $("#endTime").val(parentData.auto_end_time);
    $("#openNum").val(parentData.open_num);

    exports('server/set_auto', {});
});
