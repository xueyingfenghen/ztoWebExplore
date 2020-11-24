/**

 @Name：layuiAdmin 设置
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License: LPPL

 */

layui.define(['form', 'upload', 'element', 'transfer'], function (exports) {
  var $ = layui.$
    , layer = layui.layer
    , laytpl = layui.laytpl
    , setter = layui.setter
    , view = layui.view
    , admin = layui.admin
    , form = layui.form
    , upload = layui.upload
    , element = layui.element; //导航的hover效果、二级菜单等功能，需要依赖element模块
  var $body = $('body');
  var menu = [];
  var child_menu = [];
  var is_upload = false;
  var file = '';
  var game_id = '';
  var p_id = '';
  var user_id = layui.data(layui.setter.tableName)['user_id'];
  var quick_menu_data = {};
  //模拟数据
  var data = [];
  element.init();
  form.render();
  //定义标题及数据源
  // transfer.render({
  //     elem: '#menu_child'
  //     ,title: ['子功能', '已添加的功能']  //自定义标题
  //     ,data: data
  //     //,width: 150 //定义宽度
  //     ,height: 210 //定义高度
  // })

  function init() {
    admin.req({
      url: admin.getUrl('/api/system/user/get')
      , method: 'get'
      , done: function (res) {
        if (res.code == 0) {
          form.val('user_info', {
            "tel": res.data.info.tel,
            "nick_name": res.data.info.nick_name,
            "email": res.data.info.email
          })
          $("#img").attr('src', layui.data(layui.setter.tableName)['avatar']);

        }
      }
    });

    layui.admin.req({
      url: layui.admin.getUrl('/api/game'), //实际使用请改成服务端真实接口
      data: {},
      method: 'get',
      dataType: 'json',
      done: function (res) {
        var html = '';
        layui.each(res['data']['list'], function (index, item) {
          var p = '';
          layui.admin.req({
            url: layui.admin.getUrl('/api/game/platform_select'), //实际使用请改成服务端真实接口
            data: {game_id: item.id},
            method: 'get',
            dataType: 'json',
            done: function (res) {
              var platforms = res.data.list[0].platforms;
              if (platforms.length > 0) {
                for (var i = 0; i < platforms.length; i++) {
                  p += '<dd><a data-game_id="' + item.id + '" data-p_id="' + platforms[i].id + '">' + platforms[i].name + '</a></dd>';
                }
              }
              html = '                                    <li  class="layui-nav-item">\n' +
                '                                        <a href="javascript:;">' + item.name + '</a>\n' +
                '                                        <dl class="layui-nav-child scroll">\n' +
                p + '\n' +
                '                                        </dl>\n' +
                '                                    </li>';
              $('.rapid_game').append(html);
              element.init();
            }
          })
        });
      }
    })
    $("#game_height").height($("#menu_height").height() - 38);

    //获取快捷菜单数据
      admin.req({
          url: admin.getUrl('/api/system/getQuickMenu')
          , data: {}
          , method: 'get'
          , done: function (res) {
              quick_menu_data = res.data;
              console.log(res.data);
          }
      });
  }

  init();


  //监听导航点击
  element.on('nav(demo)', function (elem) {
     game_id = $(this).data('game_id');
     p_id = $(this).data('p_id');
     var key = 'm_'+user_id+'_'+p_id;
     //quick_menu_data = layui.data('quick_menu');
     var add_menu_input = '';
     var arr = [];
     if(quick_menu_data[key] && quick_menu_data[key] != '[]') arr = JSON.parse(quick_menu_data[key]);
     console.log(key,quick_menu_data,arr,quick_menu_data[key]);
     if(arr.length > 0){
         for (x in arr){
             add_menu_input += '<input  type="checkbox" lay-skin="primary" name="' + arr[x] + '" title="' + arr[x] + '">';
         }
     }
      $("#add_menu").html(add_menu_input);
      $("#child_menu").html('');
      form.render();
    if (game_id && p_id) {
      layui.admin.req({
        url: layui.admin.getUrl('/api/game/platform_select'), //实际使用请改成服务端真实接口
        data: {'game_id': game_id, 'platform_id': p_id},
        method: 'post',
        dataType: 'json'
      })
      layui.admin.req({
        url: layui.admin.getUrl('/api/permission/menu_list'),
        data: {},
        method: 'get',
        dataType: 'json',
        done: function (res) {
          menu = [];let input = '';
          if (res.code == 0) {
            for (var i = 0; i < res.data.list.length; i++) {
              menu.push(res.data.list[i]);
            }
              for (let i = 0; i < menu.length; i++) {
                  input += '<input lay-filter="menu" type="radio"  name="menu" title="' + menu[i].name + '">'
              }
            $("#menu").html(input);
            form.render();
          }
        }
      })
    }
  });

  //菜单切换
  form.on('radio(menu)', function (obj) {
    child_menu = [];
    var child_input = '';
      for (let x = 0; x < menu.length; x++) {
          if(menu[x].name == $(this).attr('title')){
              for (let y = 0; y < menu[x].list.length; y++) {
                  //点击二级菜单(功能)获取已添加功能 给子功能回显选中效果
                  var str = '#add_menu input[type=checkbox][' + 'name=' + menu[x].list[y].name + ']';
                  var checked = '';
                  if($(str).length > 0) checked = 'checked';
                  child_input += '<input  '+checked+' lay-filter="child_menu" type="checkbox" lay-skin="primary" name="' + menu[x].list[y].name + '" title="' + menu[x].list[y].name + '">'
              }
          }
      }
    $("#child_menu").html(child_input);
    form.render();
  });


  //添加
  $("#add").on('click', function () {
    var add_menu_input = '';
    $("#child_menu input[type=checkbox]:checked").each(function () {
      var name = $(this).attr('title');
      var str = 'input[name="' + name + '"]';
      if ($("#add_menu " + str).length > 0) return true;
      add_menu_input += '<input  type="checkbox" lay-skin="primary" name="' + name + '" title="' + name + '">';
    })
    if (add_menu_input != '') $("#add_menu").append(add_menu_input);
    form.render();
  })
  //移除
  $("#del").on('click', function () {
    var del_menu_input = '';
    $("#add_menu input[type=checkbox]:checked").each(function () {
      $(this).next('.layui-form-checkbox').remove();//移除美化复选框样式
      $(this).remove();//移除复选框
      // 点击移除时获取已添加功能 不存在的取消选中效果
      del_menu_input = '#child_menu input[type=checkbox][name=' + $(this).attr('title') + ']';
      $(del_menu_input).attr('checked',false);
    })
    form.render();
  })

  //确定
  $("#submit").on('click', function () {
    var quick_menu = [];
    var key = 'm_' + user_id + '_' + p_id;
    $("#add_menu input[type=checkbox]").each(function () {
      quick_menu.push($(this).attr('title'));
    })

    if (p_id > 0) {
        // layui.data('quick_menu',{
        //     key:key,
        //     value:quick_menu
        // });
        admin.req({
            url: admin.getUrl('/api/system/quickMenu')
            , data: {'key':key,'value':quick_menu}
            , method: 'post'
            , done: function (res) {
                parent.location.reload();
            }
        });
    } else {
      layer.msg('请先选择平台', {icon: 5})
    }
  })
  //普通图片上传
  var header = layui.setter.header;
  var headers = {};
  if (header.tokenName) {
    headers[header.tokenName] = layui.data(layui.setter.tableName)[header.tokenName] || '';
  }
  var uploadInst = upload.render({
    elem: '#img'
    , url: admin.getUrl('/api/system/userUploadImg')
    , headers: headers
    , before: function (obj) {
      is_upload = true
      //预读本地文件示例，不支持ie8
      obj.preview(function (index, file, result) {
        $('#img').attr('src', result); //图片链接（base64）
      });
    }
    , done: function (res) {
      //如果上传失败
      if (res.code == 0) {
        layer.msg('头像上传成功', {icon: 1});
        file = res.data.tmp_filename
      } else {
        layer.msg(res.msg, {icon: 5});
        file = '';
      }
      //上传成功
    }
  });

  //自定义验证
  form.verify({
    //我们既支持上述函数式的方式，也支持下述数组的形式
    //数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
    pass: function (value, item) {
      if (value.length < 1 || value.match(/^\s+$/)) {
        return '原密码不能为空';
      }
    }
    , newpass: [
      /^[\S]{6,12}$/
      , '密码必须6到12位，且不能出现空格'
    ]
    //确定密码
    , repass: function (value) {
      if (value !== $('#newpass').val()) {
        return '两次密码输入不一致';
      }
    }
  });

  //设置我的资料
  form.on('submit(setmyinfo)', function (obj) {
    obj.field.file = file;
    obj.field.is_upload = is_upload;
    admin.req({
      url: admin.getUrl('/api/system/userMod')
      , data: obj.field
      , method: 'post'
      , done: function (res) {
        if (res.code == 0) {
          is_upload = false;
          file = '';
          layer.msg(res.msg, {icon: 1});
          const avatar = admin.correctRouter(res.data.avatar);
          layui.data(layui.setter.tableName, {
            key: 'avatar'
            , value: avatar
          });
          $("#userAvatar").attr('src', avatar)
        } else {
          layer.msg(res.msg, {icon: 5});
        }
      }
    });
    return false;
  });

  //设置密码
  form.on('submit(pass)', function (obj) {
    admin.req({
      url: admin.getUrl('/api/system/modifyPassword')
      , data: obj.field
      , method: 'post'
      , done: function (res) {
        if (res.code == 0) {
          layer.msg(res.msg, {icon: 1});
        } else {
          layer.msg(res.msg, {icon: 5});
        }
      }
    });
    return false;
  });

  //对外暴露的接口
  exports('set', {});
});
