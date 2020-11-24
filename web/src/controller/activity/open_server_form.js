var open_server = true //开区活动
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
                    open_server : open_server
                }
            }
            ,done: function(res, index, upload){
                console.log('开始上传到服务端',res);
                var html = ''
                    ,upload_finish = false;//导入完成
                var tr = activityListView.find('tr#upload-'+ index)
                    ,tds = tr.children();
                tds.eq(2).html('<span style="color: #5FB878;">100%</span>');
                tds.eq(3).html('<span style="color: #5FB878;">上传成功</span>');
                //tds.eq(4).html(''); //清空操作
                $("#setPercent").click();
                    if (res.code == 0){
                        var msg = res.msg == "" ? 'ok' : res.msg;
                        upload_finish = true;
                        html =   $(['<tr>'
                            ,'<td></td>'
                            ,'<td>'+msg+'</td>'
                            ,'</tr>'].join(''));
                    }else {
                        html =   $(['<tr>'
                            ,'<td style="color: red">'+res.msg+'</td>'
                            ,'<td></td>'
                            ,'</tr>'].join(''));
                    }
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
                ,success: function(layero, index){
                    layui.view(this.id).render('/activity/preview',{data:obj.data,open_server:open_server,file:obj.file});
                },
                end: function(index, layero){
                    layui.table.reload('table_activity_open_server'); //重载表格
                }
            });
        }
    })

