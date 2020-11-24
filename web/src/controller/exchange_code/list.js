layui.extend({props: '/common/props', limitation: '/common/limitation'});
layui.use(['props', 'limitation'], function () {
  layui.define(['table', 'admin', 'form', 'view', 'laydate', 'element', 'common', 'props', 'limitation'], function (exports) {
    let admin = layui.admin;
    let element = layui.element;
    let table = layui.table;
    let form = layui.form;
    let laydate = layui.laydate;
    let $ = layui.jquery;
    let props = layui.props;
    let limitation = layui.limitation;

    const ID = layui.router().search.id;
    const PERMISSIONS = layui.sessionData(layui.setter.tableName)['permissions'];
    const TABS = PERMISSIONS[ID].childrens;


    var initArray = {
      'generate-code': {
        route: admin.getUrl("/api/resource/exchange_code/batch_list"),
        tableId: "table_generate-code",
        formClass: ".form_generate-code",
        init: true,
        col: [[
          {field: 'id', title: '兑换码ID', align: 'center', fixed: 'left', minWidth: '50'},
          {field: 'name', title: '兑换码名称', align: 'center', fixed: 'left', minWidth: '110'},
          {
            field: 'props', title: '道具内容', align: 'center', fixed: 'left', templet: function (d) {
              return props.showPropsText(d.props);
            }, minWidth: '180'
          },
          {
            field: 'type',
            title: '兑换码类型',
            align: 'center',
            fixed: 'left',
            templet: '#typeTpl',
            minWidth: '130'
          },
          {field: 'receive_count', title: '领取类型', align: 'center', templet: '#receiveTpl', minWidth: '92'},
          {
            field: 'limitation', title: '限制条件', align: 'center', minWidth: '250', templet: function (d) {
              return limitation.showLimitationText(d.limitation);
            }
          },
          {field: 'generate_count', title: '生成数量', align: 'center', minWidth: '90'},
          {field: 'remain_count', title: '剩余数量', align: 'center', minWidth: '90'},
          {field: 'start_time', title: '生效时间', align: 'center', minWidth: '180'},
          {field: 'end_time', title: '失效时间', align: 'center', minWidth: '180'},
          {field: 'created_at', title: '申请时间', align: 'center', minWidth: '180'},
          {field: 'updated_at', title: '修改时间', align: 'center', minWidth: '180'},
          {field: 'apply_user_name', title: '申请人', align: 'center', minWidth: '100'},
          {field: 'apply_reason', title: '申请理由', align: 'center', minWidth: '120'},
          {field: 'judge_user_name', title: '审核人', align: 'center', minWidth: '100'},
          {
            field: 'judge_reason',
            title: '审核理由',
            align: 'center',
            templet: '#judgeReasonTpl',
            minWidth: '120'
          },
          {field: 'judge_time', title: '审核时间', align: 'center', templet: '#judgeTimeTpl', minWidth: '180'},
          {
            field: 'judge_status',
            title: '状态',
            align: 'center',
            fixed: 'right',
            templet: '#judgeStatusTpl',
            minWidth: '85'
          },
          {field: '', title: '操作', align: 'center', toolbar: '#bar', fixed: 'right', minWidth: '320'},
          {field: '', title: '开关', align: 'center', fixed: 'right', templet: '#switchStatus', minWidth: '95'}
        ]]
      },
      'judge-code': {
        route: "/api/resource/exchange_code/judge_list",
        tableId: "table_judge-code",
        formClass: ".form_judge-code",
        init: true,
        col: [[
          {field: 'id', title: '兑换码ID', align: 'center', fixed: 'left', minWidth: '50'},
          {field: 'name', title: '兑换码名称', align: 'center', fixed: 'left', minWidth: '110'},
          {
            field: 'props', title: '道具内容', align: 'center', fixed: 'left', templet: function (d) {
              return props.showPropsText(d.props);
            }, minWidth: '180'
          },
          {
            field: 'type',
            title: '兑换码类型',
            align: 'center',
            fixed: 'left',
            templet: '#typeTpl',
            minWidth: '130'
          },
          {field: 'receive_count', title: '领取类型', align: 'center', templet: '#receiveTpl', minWidth: '92'},
          {
            field: 'limitation', title: '限制条件', align: 'center', minWidth: '250', templet: function (d) {
              return limitation.showLimitationText(d.limitation);
            }
          },
          {field: 'generate_count', title: '生成数量', align: 'center', minWidth: '90'},
          {field: 'start_time', title: '生效时间', align: 'center', minWidth: '120'},
          {field: 'end_time', title: '失效时间', align: 'center', minWidth: '120'},
          {field: 'apply_user_name', title: '申请人', align: 'center', minWidth: '100'},
          {field: 'apply_reason', title: '申请原因', align: 'center', minWidth: '120'},
          {field: 'created_at', title: '申请时间', align: 'center', minWidth: '120'},
          {
            field: 'judge_status',
            title: '状态',
            align: 'center',
            fixed: 'right',
            templet: '#judgeStatusTpl',
            minWidth: '85'
          },
          {field: '', title: '操作', align: 'center', toolbar: '#judgeBar', fixed: 'right', minWidth: '50'},
        ]]
      },
      'inquire-code': {
        route: "/api/resource/exchange_code/code_list",
        tableId: "table_inquire-code",
        formClass: ".form_inquire-code",
        init: false,
        col: [[
          {field: 'code', title: '兑换码', align: 'center', minWidth: '150', fixed: 'left'},
          {field: 'batch_id', title: '兑换码ID', align: 'center', minWidth: '20', fixed: 'left'},
          {field: 'name', title: '兑换码名称', align: 'center', minWidth: '70', fixed: 'left'},
          {
            field: 'props', title: '道具', align: 'center', minWidth: '250', templet: function (d) {
              return props.showPropsText(d.props);
            }
          },
          {field: 'created_at', title: '生成时间', align: 'center', minWidth: '90'},
          {field: 'receiver_server_id', title: '兑换者区服', align: 'center'},
          {field: 'receiver_role_id', title: '兑换者角色ID', align: 'center'},
          {field: 'receiver_nick_name', title: '兑换者昵称', align: 'center'},
          {field: 'receiver_vip_level', title: '兑换者VIP等级', align: 'center'},
          {field: 'receive_time', title: '兑换时间', align: 'center', fixed: 'right'}
        ]]
      }
    };

    Object.keys(initArray).forEach(item=>{
      if (TABS.indexOf(item) < 0){
        delete initArray[item]
      }
    })

    console.log(initArray)

    var active = {
      search: search,
      reset: reset,
      exort: exportExcel,
      add: addBatch,
      copy: copyBatch,
      detail: detailBatch,
      delete: delBatch,
      edit: editBatch,
      code_list: codeList,
      append: append,
      download: downloadBatch,
      judge: judgeBatch
    };

    $.reload = function (sel, tableId) {
      let param = admin.getFormParam(sel);
      if (param.date_time != '') {
        var date = param.date_time.split(' - ', 2);
        param.start_time = date[0];
        param.end_time = date[1];
      }

      var route = '';
      $.each(initArray, function (idx, item) {
        if (item.tableId == tableId) {
          route = item.route;
          return;
        }
      });

      table.reload(tableId, {
        url: admin.getUrl(route),
        where: param,
        method: 'get',
        dataType: 'json',
        page: {
          curr: 1
        },
        request: {
          pageName: 'page' //页码的参数名称，默认：page
          , limitName: 'page_size' //每页数据量的参数名，默认：limit
        },
        parseData: function (res) {
          return {
            "code": res.code, //解析接口状态
            "msg": '', //解析提示文本
            "count": res.data.total, //解析数据长度
            "data": res.data.list
          };
        }
      });
    };

    // 渲染表格
    $.initDataTable = function (cols, route, tableId, sel, init) {
      table.render({
        id: tableId,
        elem: '#' + tableId,
        loading: true,
        cols: cols,
        data: []
      });

      if (init) {
        $.reload(sel, tableId);
      }
    };

    //加载申请人列表
    const applyUser = new Promise((resolve, reject) => {
      admin.laydateInit('.date-time-input', laydate);

      //加载申请人列表
      admin.req({
        url: layui.admin.getUrl('/api/resource/apply_user_list'),
        data: {},
        method: 'get',
        dataType: 'json',
        success: function (res) {
          if (res.code == 0) {
            var userList = res.data.list;
            for (i = 0; i < userList.length; i++) {
              var id = userList[i]['user_id'];
              var name = userList[i]['nick_name'];
              $(".apply-user-input").append("<option value='" + id + "'>" + name + "</option>");
            }
            $(".apply-user-input").val(0);
            resolve(res)
          } else {
            reject(res)
          }
        }
      });
    });


    //渲染时间选择器
    const initExchangeBatch = async function () {
      const res = await applyUser;
      form.render('select');
      const tab = TABS[0]
      $.initDataTable(
        initArray[tab].col,
        initArray[tab].route,
        initArray[tab].tableId,
        initArray[tab].formClass,
        initArray[tab].init
      );
    };

    // 事件
    initExchangeBatch().then(r => {
      // 监听选项卡切换事件
      element.on('tab(docDemoTabBrief)', function (data) {
        for (let i = 0; i < $('.tabs').length; i++) {
          $('.tabs').eq(i).removeClass('layui-show');
        }
        $('.tabs').eq(data.index).addClass('layui-show');
        var id = $('.tabs').eq(data.index).data('id');
        var col = initArray[id].col;
        var route = initArray[id].route;
        var tableId = initArray[id].tableId;
        var formClass = initArray[id].formClass;
        var init = initArray[id].init;

        $.initDataTable(col, route, tableId, formClass, init);
      });

      // 事件绑定
      $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if (!$(this).attr('data-obj')) return;
        var obj = JSON.parse($(this).attr('data-obj'));
        var event = obj.event;
        active[event] ? active[event].call(this, obj) : '';
      });
    });

    function search(obj) {
      if (obj.tableId == 'table_inquire-code') {
        let param = admin.getFormParam(obj.formClass);
        param.start_time = param.end_time = '';
        if (param.date_time != '') {
          var date = param.date_time.split(' - ', 2);
          param.start_time = date[0];
          param.end_time = date[1];
        }
        if ((!param.start_time || !param.end_time) && !param.role_id && !param.code) {
          layer.msg('请输入兑换码或角色ID',{icon:5});
          return;
        }
      }
      $.reload(obj.formClass, obj.tableId);
    }

    function reset(obj) {
      admin.resetForm(obj.formClass);
      if (obj.tableId != 'table_inquire-code')
        $.reload(obj.formClass, obj.tableId);
    }

    function exportExcel(obj) {
      let param = admin.getFormParam(obj.formClass);
      if (param.date_time != '') {
        var date = param.date_time.split(' - ', 2);
        param.start_time = date[0];
        param.end_time = date[1];
      }
      if ((!param.start_time || !param.end_time) && !param.role_id && !param.code) {
        layer.msg('请输入兑换码或角色ID',{icon:5});
      } else {
        param.export = 1;
        admin.download({
          url: admin.getUrl('/api/resource/' + obj.route),
          data: param,
          method: 'get',
          dataType: 'json'
        })
      }
    }

    //添加兑换码批次
    function addBatch(obj) {
      admin.popup({
        title: '新增兑换码'
        , area: ['1050px', '750px']
        , id: 'popup-cdkey-add'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/edit', {
            event: 'add', id: 0
          });
        }
      });
    }

    //复制兑换码批次
    function copyBatch(obj) {
      admin.popup({
        title: '新增兑换码'
        , area: ['1050px', '750px']
        , id: 'popup-cdkey-add'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/edit', {
            event: 'copy', id: obj.id
          });
        }
      });
    }

    //编辑兑换码批次
    function editBatch(obj) {
      admin.popup({
        title: '编辑兑换码'
        , area: ['1050px', '750px']
        , id: 'popup-cdkey-add'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/edit', {
            event: 'edit', id: obj.id
          });
        }
      });
    }

    //兑换码批次详情
    function detailBatch(obj) {
      admin.popup({
        title: '兑换码详情'
        , area: ['1050px', '750px']
        , id: 'popup-cdkey-detail'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/detail', obj);
        }
      });
    }

    //兑换码列表
    function codeList(obj) {
      admin.popup({
        title: '查看兑换码'
        , area: ['1050px', '750px']
        , id: 'popup-cdkey-code-list'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/code_list', obj);
        }
      });
    }

    //兑换码下载
    function downloadBatch(obj) {
      admin.download({
        url: layui.admin.getUrl('/api/resource/exchange_code/batch_download'),
        data: {id: obj.id},
        method: 'get',
        dataType: 'json'
      });
    }

    //兑换码追加
    function append(obj) {
      admin.popup({
        title: '追加'
        , area: ['500px', '350px']
        , id: 'popup-cdkey-append'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/append', obj);
        }
      });
    }

    //兑换码删除
    function delBatch(obj) {
      layer.confirm('真的删除?', function (index) {
        admin.req({
          url: admin.getUrl('/api/resource/exchange_code/batch_del?id=' + obj.id),
          data: {},
          method: 'post',
          dataType: 'json',
          done: function (res) {
            if (res.code == 0) {
              layer.close(index);
              $.reload('.form_generate-code', 'table_generate-code');
            }
          }
        });
      });
    }

    //兑换码审核
    function judgeBatch(obj) {
      admin.popup({
        title: '兑换码审核'
        , area: ['1050px', '750px']
        , id: 'popup-cdkey-judge'
        , shadeClose: false
        , success: function (layero, index) {
          layui.view(this.id).render('exchange_code/judge', obj);
        }
      });
    }

    //兑换码启用禁用
    form.on('switch(status)', function (obj) {
      admin.req({
        url: admin.getUrl('/api/resource/exchange_code/change_status?id=' + this.value), //实际使用请改成服务端真实接口
        data: {
          status: obj.elem.checked ? 1 : 0
        },
        method: 'post',
        dataType: 'json',
        done: function (res) {
          table.reload(initArray['generate-code'].tableId, {});
        }
      });
    });

    exports('exchange_code/list', {});
  });
});
