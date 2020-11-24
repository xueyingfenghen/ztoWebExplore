/**

 @Name：layuiAdmin 内容系统
 @Author：star1029
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */


layui.define(['table', 'form'], function(exports){
  var $ = layui.$
      ,admin = layui.admin
      ,view = layui.view
      ,table = layui.table
      ,form = layui.form
      ,router = layui.router();
  var div_id = !router.search.notice || router.search.notice == 1 ? '#LAY-app-content-list' : '#LAY-app-content-list2';
  var menu_id = !router.search.notice || router.search.notice == 1 ? 'login' : 'game';
  //公告管理
  var cols1 = [
    {field: 'title', title: '公告标题', align: 'center'}
    ,{field: 'content', title: '公告内容', align: 'center'}
    ,{field: 'op_user_id', title: '操作人', align: 'center'}
    ,{field: 'update_time', title: '操作时间', align: 'center'}
    ,{field: 'start_time', title: '开始时间', sort: true,align: 'center'}
    ,{field: 'end_time', title: '结束时间', align: 'center'}
    ,{title: '操作', align: 'center', fixed: 'right', toolbar: '#table-content-list'}
    ,{field: 'close', title: '启用', templet: '#buttonTpl', align: 'center'}
  ];
  var cols2 = [
    {field: 'server_id', title: '区服', align: 'center'}
    ,{field: 'no', title: '排序序号', align: 'center'}
    ,{field: 'title', title: '公告标题', align: 'center'}
    ,{field: 'content', title: '公告内容', align: 'center'}
    ,{field: 'is_jump', title: '是否跳转', align: 'center'}
    ,{field: 'op_user_id', title: '操作人', align: 'center',width:80}
    ,{field: 'update_time', title: '操作时间', align: 'center'}
    ,{field: 'start_time', title: '开始时间', sort: true,align: 'center'}
    ,{field: 'end_time', title: '结束时间', align: 'center'}
    ,{title: '操作', align: 'center', fixed: 'right', toolbar: '#table-content-list'}
    ,{field: 'close', title: '启用', templet: '#buttonTpl', align: 'center'}
  ];
  //筛选字段
  var filter1 = [
    {field: 'title', title: '公告标题1',type:'text'},
    {field: 'content', title: '公告内容',type:'text'},
    {field: 'close',title: '启用状态',type:'select'},
    {field: 'op_user_id',title: '操作人',type:'select'},
    {field: 'update_time', title: '操作时间', type:'zonetime'}
  ];
  var filter2 = [
    {field: 'title', title: '公告标题2',type:'text'},
    {field: 'content', title: '公告内容',type:'text'},
    {field: 'close',title: '启用状态',type:'select'},
    {field: 'op_user_id',title: '操作人',type:'select'},
    {field: 'update_time', title: '操作时间', type:'zonetime'}
  ];
  admin.req({
    url:admin.getUrl('/api/menu/content'),
    //表格表头字段获取 如果没有就获取默认
    data: {
      'menu_id': menu_id,
      'game_id': 1
    },
    method: 'post',
    dataType: 'json',
    done: function (res) {
      var COLS = div_id == '#LAY-app-content-list' ? cols1 : cols2;
      if(res.data[0] && res.data[0].json){
        //没有进来说明没有配置 读取默认字段
        let json = JSON.parse(res.data[0].json);
        if(json.table_list.length > 0)
        COLS = json.table_list;
      }
      table.render({
        elem: div_id
        ,url: layui.admin.getUrl('/api/notice/index') //模拟接口
        ,where: {menu_id:menu_id}
        ,cols: [COLS]
        ,parseData: function(res){
          return {
            "code":res.code, //解析接口状态
            "msg": '', //解析提示文本
            "count": res.data.count, //解析数据长度
            "data": res.data.list
          };
        }
        ,page: true,limit: 10,limits: [10, 15, 20, 25, 30]
      });
    },
    success:function (res) {
      //回调传递筛选数据
      var filter = div_id == '#LAY-app-content-list' ? filter1 : filter2;
      if(res.data[0] && res.data[0].json){
        //没有进来说明没有配置 读取默认字段
        let json = JSON.parse(res.data[0].json);
        if(json.filter.length > 0)
         filter = json.filter;
      }
      var str = div_id == '#LAY-app-content-list' ? 'form1' : 'form2';
      getFilter(filter,str);
    }
  });

  var tab_id = !layui.router().search.notice || layui.router().search.notice == 1 ? 'LAY-app-content-list': 'LAY-app-content-list2';
  //监听工具条
  table.on('tool(LAY-app-content-list)', function(obj){
    //console.log('监听表单',obj);
    var data = obj.data;
    if(obj.event === 'del'){
      layer.confirm('确定删除当前公告内容吗？', function(index){
        if(data.id > 0){
          admin.req({
            url:layui.admin.getUrl('/api/notice/delete'),
            //表格表头字段获取 如果没有就获取默认
            data:{id:data.id,menu_id:menu_id},
            method: 'post',
            dataType: 'json',
            done: function (res) {
              if(res.code == 0){
                layer.msg('删除成功!',{icon:1});
                layui.table.reload(tab_id); //重载表格
                layer.close(index); //执行关闭
              }else {
                  layer.msg(res.msg,{icon:5});
              }
            }
          })
        }else {
          layer.msg('删除失败',{icon:5});
        }
         //obj.del();
        //layer.close(index);
      });
    } else if(obj.event === 'edit'){
      admin.popup({
        title:  '修改' + $('.layui-tab-title .layui-this')[0].innerText
        ,area: ['550px', '550px']
        ,id: 'LAY-popup-content-edit'
        ,success: function(layero, index){
          data.event = 'edit';
          view(this.id).render('app/content/listform', data).done(function(){
            form.render(null, 'layuiadmin-app-form-list');
            //监听提交
            form.on('submit(layuiadmin-app-form-submit)', function(data){
              var field = data.field; //获取提交的字段
              // field.game_id = 1;//临时写死
              field.menu_id = menu_id;//临时写死
              //提交 Ajax 成功后，关闭当前弹层并重载表格
              admin.req({
                url:layui.admin.getUrl('/api/notice/modify'),
                //表格表头字段获取 如果没有就获取默认
                data:field,
                method: 'post',
                dataType: 'json',
                done: function (res) {
                  if(res.code == 0){
                    layer.msg('修改成功!',{icon:1});
                    layui.table.reload(tab_id); //重载表格
                    layer.close(index); //执行关闭
                  }else {
                      layer.msg(res.msg,{icon:5});
                  }
                }
              })
            });
          });
        }
      });
    }else if (obj.event === 'detail') {
      admin.popup({
        title: $('.layui-tab-title .layui-this')[0].innerText + '详情'
        ,area: ['550px', '550px']
        ,id: 'LAY-popup-content-detail'
        ,success: function(layero, index){
          data.event = 'detail';
          data.type = menu_id;
          view(this.id).render('app/content/detail', data).done(function(){
            //form.render(null, 'layuiadmin-app-form-list');
          });
        }
      });
    }
  });
  exports('contlist', {})
});
