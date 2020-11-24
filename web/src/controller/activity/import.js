var force_import = false //强制导入
        ,server_id = ''//区服ID 支持批量  上传参数提供给服务端
        ,preview_server_id = '';//区服ID 预览页面使用
    let header = layui.setter.header;
    let headers = {};
    if (header.tokenName) {
        headers[header.tokenName] = layui.data(layui.setter.tableName)[header.tokenName] || '';
    }

    layui.use(['upload','element'],function () {
        var $ = layui.jquery
            ,upload = layui.upload
            ,form = layui.form
            ,element = layui.element
            ,file_name = '' //文件名称
            ,file_size = '' //文件大小
            ,upload_progress = '0%' //上传进度
            ,upload_status = '等待上传'//上传状态
            ,percent = '100%';//默认 百分比
        form.render();

        //多文件列表示例
        var activityListView = $('#activityList')
            ,uploadListIns = upload.render({
            elem: '#uploadActivity'
            //,url: layui.admin.getUrl('/api/activity/test') //改成您自己的上传接口
            // ,url: layui.admin.getUrl('/api/activity/test') //改成您自己的上传接口
            ,url: layui.admin.getUrl('/api/activity/upload_activity') //改成您自己的上传接口
            ,accept: 'file'
            ,size: 1024 * 10 //限制最大10MB
            //,multiple: true
            ,auto: false
            ,headers:headers
            ,bindAction: '#activityListAction'
            ,choose: function(obj){
                console.log('上传开始',obj);
                var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
                //读取本地文件
                obj.preview(function(index, file, result){
                    file_name = file.name;
                    file_size = (file.size/1024).toFixed(1) +'kb';

                    var tr = $(['<tr id="upload-'+ index +'">'
                        ,'<td>'+ file_name +'</td>'
                        ,'<td>'+ file_size +'</td>'
                        ,'<td>'+ upload_progress +'</td>'
                        ,'<td>'+ upload_status +'</td>'
                        ,'<td>'
                        ,'<button class="layui-btn layui-btn-xs layui-btn-danger demo-delete">删除</button>'
                        ,'</td>'
                        ,'</tr>'].join(''));

                    //删除
                    tr.find('.demo-delete').on('click', function(){
                        delete files[index]; //删除对应的文件
                        tr.remove();
                        uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                    });
                    activityListView.empty();
                    activityListView.append(tr);
                    $("#activityListAction").click();
                });
            }
            //上传文件时携带参数
            ,before: function (){
                this.data = {
                    server_list: server_id,
                    force_import: $("input[name='force_import']").is(":checked")
                }
            }
            ,done: function(res, index, upload){
                console.log('开始上传到服务端',res);
                var html = ''
                    ,str = ''
                    ,error_file = '文件名不符合命名规则'
                    ,no_server = '未选择区服'
                    ,error_server = '上传文档的区服范围与勾选的区服范围不符合'
                    ,error_platform = '上传文档中平台与选择的平台不符'
                    ,upload_finish = false;//导入完成
                var tr = activityListView.find('tr#upload-'+ index)
                    ,tds = tr.children();
                tds.eq(2).html('<span style="color: #5FB878;">100%</span>');
                tds.eq(3).html('<span style="color: #5FB878;">上传成功</span>');
                //tds.eq(4).html(''); //清空操作
                $("#setPercent").click();
                upload_status = '完成';
                upload_progress = '100%'
                str =   $(['<tr>'
                    ,'<td>'+file_name+'</td>'
                    ,'<td>'+file_size+'</td>'
                    ,'<td>'+ upload_progress +'</td>'
                    ,'<td>'+upload_status+'</td>'
                    ,'</tr>'].join(''));  //导入文件记录
                if (res.code != 0 && res.msg == error_file || res.msg == no_server || res.msg == error_server || res.msg == error_platform){
                    upload_progress = '0%';
                    str =   $(['<tr>'
                        ,'<td>'+file_name+'</td>'
                        ,'<td>'+file_size+'</td>'
                        ,'<td>'+ upload_progress +'</td>'
                        ,'<td style="color: red">'+res.msg+'</td>'
                        ,'</tr>'].join(''));  //导入文件记录
                }else {
                    if (res.code == 0){
                        upload_finish = true;
                        html =   $(['<tr>'
                            ,'<td></td>'
                            ,'<td>'+res.msg+'</td>'
                            ,'</tr>'].join(''));
                    }else {
                        html =   $(['<tr>'
                            ,'<td style="color: red">'+res.msg+'</td>'
                            ,'<td></td>'
                            ,'</tr>'].join(''));
                    }

                }
                //导入文件记录
                $('#activityLog').append(str);
                //导入情况
                $('#activitySituation').html(html);
                if(upload_finish) up_finish(res.data);
                return delete this.files[index]; //删除文件队列已经上传成功的文件
            }
            ,error: function(index, upload){
                var tr = activityListView.find('tr#upload-'+ index)
                    ,tds = tr.children();
                tds.eq(3).html('<span style="color: #FF5722;">上传失败</span>');
                percent = '10%';
                $("#setPercent").click();
            }
        });

        //触发事件
        var active = {
            setPercent: function(){
                //设置50%进度
                element.progress('demo', percent);
                $('.layui-progress-bar').html(percent);
            }
            ,loading: function(othis){
                var DISABLED = 'layui-btn-disabled';
                if(othis.hasClass(DISABLED)) return;

                //模拟loading
                var n = 0, timer = setInterval(function(){
                    n = n + Math.random()*10|0;
                    if(n>100){
                        n = 100;
                        clearInterval(timer);
                        othis.removeClass(DISABLED);
                    }
                    element.progress('demo', n+'%');
                }, 300+Math.random()*1000);

                othis.addClass(DISABLED);
            }
        };

        $('.site-demo-active').on('click', function(){
            var othis = $(this), type = $(this).data('type');
            active[type] ? active[type].call(this, othis) : '';
        });

        //导入成功
        var up_finish = function (obj) {
            console.log('导入成功了',obj);
            layui.admin.popup({
                title: '活动预览'
                // ,area: layui.admin.screen() < 2 ? ['80%', '300px'] : ['700px', '500px']
                ,area:  ['1200px', '775px']
                ,id: 'start_execute'
                ,btn: ['开始执行']
                ,success: function(layero, index){
                    layui.view(this.id).render('/activity/preview',{data:obj.data,server_id:preview_server_id,file:obj.file});
                },yes: function(index, layero){
                    layui.admin.req({
                        //url: layui.admin.getUrl('/api/activity/test/response'),
                        url: layui.admin.getUrl('/api/activity/execute_plan'),
                        method: 'get',
                        data: {file:obj.file,server_list:server_id,force_import:$("input[name='force_import']").is(":checked")},
                        dataType: 'json',
                        done: function (res) {
                            if (res.code == 0){
                                layer.msg(res.msg,{icon:4});
                                layer.close(index);
                            }else {
                                layer.msg(res.msg, {icon: 5})
                            }
                        }
                    })
                }
            });
        }
    })

//选择区服
    function area(data){
        layui.admin.popup({
            title: '选择区服'
            ,area:  ['1200px', '500px']
            ,id: 'select_area'
            ,btn: ['确定', '取消']
            ,success: function(layero, index){
                layui.view(this.id).render('area',{all:1, ...data});
            },yes: function(index, layero){
                server_id = layui.jquery('#get_area_all').val(); //区服转数组的值
                preview_server_id = layui.jquery('#get_area').val();
                layui.jquery("input[name=area]").val(layui.jquery('#get_area').val());
                layer.close(index);
            }
        });
    }

