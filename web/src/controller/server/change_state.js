layui.define(['admin', 'form', 'laydate'], function (exports) {

    let $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        admin = layui.admin;

    let serverIds = parent.serverIds;

    $("#selectedServer").val(parent.serverIdsInput);

    //  确定更改
    $("#submitBtn").on('click', function () {


        var status = $("#districtStateSelect").val();
        var postData = {
            server_ids: serverIds,
            // server_str: parent.serverIdsInput,
            status: status,
            old_data: parent.firstServerData,
            // server_name: $("#serverNameInput").val(),
        };
        var curTime = new Date();

        var errMsg = '';

        switch (parseInt(status)) {
            case 1:
                postData.protect_type = $(".protectType:checked").val();

                postData.end_time = $("#endTime").val();
                if(postData.end_time == ''){
                    errMsg = '结束时间不能为空';
                    break;
                }
                if(postData.protect_type == 2){
                    postData.start_time = $("#startTime").val();
                    if(postData.start_time == ''){
                        errMsg = '开始时间不能为空';
                        break;
                    }
                    if((postData.old_data.start_time == undefined || !postData.old_data.start_time) && new Date(postData.start_time) < curTime){
                        errMsg = '开始时间需大于当前时间';
                        break;
                    }
                    if(new Date(postData.end_time) < new Date(postData.start_time)){
                        errMsg = '结束时间需大于开始时间';
                        break;
                    }
                }

                if((parent.firstServerData.start_time != '' || parent.firstServerData.start_time != null)){
                    var startTime = new Date(parent.firstServerData.start_time);
                    if(startTime > curTime){
                        //  取消定时维护
                        postData.cancel_protect = $("#cancelProtect").is(":checked")?1:0;
                    }
                }
                break;
            case -1:
                postData.interval_time = $("#intervalTime").val();
                if(postData.interval_time == ''){
                    errMsg = '间隔时间不能为空';
                    return;
                }
                break;
        }

        if(errMsg != ''){
            layer.msg(errMsg, {icon:5});
            return;
        }

        admin.req({
            url: admin.getUrl('/api/server/change_state'),
            method: 'post',
            data: postData,
            dataType: 'json',
            done: function (res) {
                if(res.code != 0){
                    return;
                }
                parent.layer.msg('修改成功',{icon: 1});
                parent.layer.close(parent.changeStateIndex);
                parent.reloadDistrictList();
            },
        });
    });

    //  取消更改
    $("#cancelBtn").on('click', function () {
        parent.layer.close(parent.changeStateIndex);
    });


    let showStartTime = false;
    let startTimeObj = {};
    let endTimeObj = {};

    let startOption = {
        elem: '#startTime',
        type: 'datetime',
        trigger: 'click',
        done:function (value, date) {
            if(Object.keys(date).length == 0){
                var ds = new Date();
                endTimeObj.config.min = {
                    year: ds.getFullYear(),
                    month: ds.getMonth(),
                    date:ds.getDate(),
                    hours:ds.getHours()+1,
                    minutes:ds.getMinutes(),
                    seconds:ds.getSeconds(),
                };
            }else {
                endTimeObj.config.min = {
                    year: date.year,
                    month: date.month,
                    date:date.date,
                    hours:date.hours+1,
                    minutes:date.minutes,
                    seconds:date.seconds,
                }
            }
        },
    };

    let endOption = {
        elem: '#endTime',
        type: 'datetime',
        trigger: 'click',
        done: function (value, date) {
            if (showStartTime) {
                if (Object.keys(date).length == 0) {
                    startTimeObj.config.max = {
                        year: 2100,
                        month: 1,
                        date: 1,
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                    };
                } else {
                    startTimeObj.config.max = {
                        year: date.year,
                        month: date.month-1,
                        date: date.date,
                        hours: date.hours - 1,
                        minutes: date.minutes,
                        seconds: date.seconds,
                    }
                }
            }
        },
    };




    //  初始化页面
    let initChangeState = function () {
        var item = parent.firstServerData;
        var curTime = new Date();
        var startTime = new Date(item.start_time);
        var endTime = new Date(item.end_time);
        if((item.start_time != '' && item.start_time != null) && item.end_time != '' && item.end_time != null){
            //  定时维护

            $("#protectItem").show();
            $("#timeOneItem").show();
            $("#startTimeItem").show();
            $(".protectType[value='1']").prop('checked', false);
            $(".protectType[value='1']").attr('disabled', true);
            $(".protectType[value='2']").prop('checked', true);
            $(".protectType[value='2']").attr('disabled', true);
            if(startTime < curTime && endTime > curTime){
                // 维护开始
                $("#cancelItem").hide();
                endOption.min = 'nowTime';
                endOption.value = parent.firstServerData.end_time;
                endTimeObj = laydate.render(endOption);
            }else if(startTime > curTime){
                //  任务未开始
                $("#cancelItem").show();
                $("#endTime").attr('disabled', true);
                $("#endTime").addClass("disabledColor");
            }


            form.render('radio');

            $("#districtStateSelect").val(1);
            $("#districtStateSelect").prop("disabled", "disabled");
            $("#startTime").val(parent.firstServerData.start_time);
            $("#startTime").attr('disabled', true);
            $("#startTime").addClass("disabledColor");
            $("#endTime").val(parent.firstServerData.end_time);

        }else if((item.start_time == '' || item.start_time == null) && item.end_time != '' && item.end_time != null && endTime > curTime){
            //  立即维护
            $("#protectItem").show();
            $("#timeOneItem").show();
            $("#startTimeItem").hide();
            $(".protectType[value='1']").prop('checked', true);
            $(".protectType[value='1']").attr('disabled', true);
            $(".protectType[value='2']").prop('checked',false);
            $(".protectType[value='2']").attr('disabled', true);

            form.render('radio');

            $("#districtStateSelect").val(1);
            $("#districtStateSelect").prop("disabled", "disabled");

            showStartTime = false;
            endOption.min = parent.firstServerData.start_time ? parent.firstServerData.start_time : 'nowTime';
            endOption.value = parent.firstServerData.end_time;
            endTimeObj = laydate.render(endOption);
        }else if(item.state == 1 || item.state == 2){
            //  推荐、火爆
            // if(item.interval_time > 0){
            //     $("#districtStateSelect").val(-1);
            //     $("#timeTwoItem").show();
            //     $("#intervalTime").val(item.interval_time);
            // }else
            if(item.state == 1){
                $("#districtStateSelect").val(3);
            }else {
                $("#districtStateSelect").val(2);
            }
        }
    };

    initChangeState();

    form.on('select(districtStateSelect)', function (obj) {
        $("#protectItem").hide();
        $("#startTimeItem").hide();
        $("#timeOneItem").hide();
        $("#cancelItem").hide();
        $("#timeTwoItem").hide();
        switch (parseInt(obj.value)) {
            case 1:
                $("#protectItem").show();
                $("#timeOneItem").show();

                $(".protectType[value='1']").prop('checked', true);
                $(".protectType[value='2']").prop('checked',false);


                form.render('radio');

                showStartTime = false;
                $("#startTimeItem").hide();
                endOption.min = 'nowTime';
                endTimeObj = laydate.render(endOption);
                break;
            case 2:
            case 3:

                break;
            case -1:
                if(parent.autoOpenData != undefined && parent.autoOpenData.server_id != undefined && parent.autoOpenData.opened == 2){
                    layer.msg('更改失败，请先取消自动开区任务',{icon:5});
                    return;
                }
                $("#timeTwoItem").show();
                $("#intervalTime").val('');
                break;
        }

    });

    form.on('radio(radioProtect)', function (obj) {
        switch (parseInt(obj.value)) {
            case 1:
                $("#startTimeItem").hide();
                showStartTime = false;
                break;
            case 2:
                $("#startTimeItem").show();
                showStartTime = true;
                break;
        }
        $("#startTime").val('');
        $("#endTime").val('');
        startOption.min = 'nowTime';
        startTimeObj = laydate.render(startOption);
        endOption.min = 'nowTime';
        endTimeObj = laydate.render(endOption);
    });

    form.render();





    exports('server/change_state', {});
});
