/**
 * navbar.js
 */
layui.define(["element", "common"], function (exports) {
  "use strict";
  var $ = layui.jquery,
    layer = parent.layer === undefined ? layui.layer : parent.layer,
    element = layui.element,
    common = layui.common,
    DATA_NAME = layui.setter.response.dataName,
    cacheName = "tb_navbar";
  var Navbar = function () {
    /**
     *  默认配置
     */
    this.config = {
      elem: undefined, //容器
      param: {},
      data: undefined, //数据源
      url: undefined, //数据源地址
      type: "GET", //读取方式
      cached: false, //是否使用缓存
      spreadOne: true, //设置是否只展开一个二级菜单
      getHtml: undefined, // 外部定义html结构
    };
    this.v = "1.0.0";
  };

  //渲染
  Navbar.prototype.render = function () {
    var that = this;
    var config = that.config;
    var $container;

    if (
      typeof config.elem !== "string" &&
      typeof config.elem !== "object"
    ) {
      console.error(
        "Navbar error: elem参数未定义或设置出错，具体设置格式请参考文档API."
      );
      return false;
    }
    if (typeof config.elem === "string") {
      $container = $("" + config.elem + "");
    }
    if (typeof config.elem === "object") {
      $container = config.elem;
    }
    if ($container.length === 0) {
      console.error("Navbar error:找不到elem参数配置的容器，请检查.");
      return false;
    }
    if (config.data === undefined && config.url === undefined) {
      console.error("Navbar error:请为Navbar配置数据源.");
      return false;
    }

    // 数据赋值渲染
    if (config.data !== undefined && typeof config.data === "object") {
      const html = config.getHtml
        ? config.getHtml(config.data)
        : getHtml(config.data);
      $container.html(html);
      element.init();
      that.config.elem = $container;
    }
    // 数据请求渲染
    else {
      // 使用缓存
      if (config.cached) {
        var cacheNavbar = layui.data(cacheName);
        if (cacheNavbar.navbar === undefined) {
          layui.admin.req({
            url: config.url,
            data: config.param,
            async: false, //config.async,
            method: config.type,
            dataType: "json",
            success: function (res) {
              //添加缓存
              const result = res[DATA_NAME]["list"];
              layui.data(cacheName, {
                key: "navbar",
                value: result,
              });
              config.data = result;
              const html = config.getHtml
                ? config.getHtml(config.data)
                : getHtml(config.data);
              $container.html(html);
              element.init();
            },
            complete: function (xhr, status) {
              that.config.elem = $container;
            },
          });
        } else {
          const html = config.getHtml
            ? config.getHtml(config.data)
            : getHtml(config.data);
          $container.html(html);
          element.init();
          that.config.elem = $container;
        }
      }
      // 不使用缓存
      else {
        //清空缓存
        layui.data(cacheName, null);
        layui.admin.req({
          url: config.url,
          data: config.param,
          async: false, //config.async,
          method: config.type,
          dataType: "json",
          success: function (res) {
            config.data = res[DATA_NAME]["list"];
            const html = config.getHtml
              ? config.getHtml(config.data)
              : getHtml(config.data);
            $container.html(html);
            element.init();
          },
          complete: function () {
            that.config.elem = $container;
          },
        });
      }
    }

    //只展开一个二级菜单
    if (config.spreadOne) {
      var $ul = $container.children("ul");
      $ul.find("li.layui-nav-item").each(function () {
        $(this).on("click", function () {
          $(this).siblings().removeClass("layui-nav-itemed");
        });
      });
    }

    // render结束后的回调
    config.success && config.success.call(that, config.data);

    return that;
  };

  /**
   * 配置Navbar
   * @param {Object} options
   */
  Navbar.prototype.set = function (options) {
    var that = this;
    that.config.data = undefined;
    $.extend(true, that.config, options);
    return that;
  };
  /**
   * 绑定事件
   * @param {String} events
   * @param {Function} callback
   */
  Navbar.prototype.on = function (events, callback) {
    var that = this;
    var _con = that.config.elem;
    if (typeof events !== "string") {
      common.throwError("Navbar error:事件名配置出错，请参考API文档.");
    }
    var lIndex = events.indexOf("(");
    var eventName = events.substr(0, lIndex);
    var filter = events.substring(lIndex + 1, events.indexOf(")"));
    if (eventName === "click") {
      if (_con.attr("lay-filter") !== undefined) {
        _con.children("ul")
          .find("li")
          .each(function () {
            var $this = $(this);
            if ($this.find("dl").length > 0) {
              var $dd = $this.find("dd").each(function () {
                $(this).on("click", function () {
                  var $a = $(this).children("a");
                  var breadcrumbs = JSON.parse(
                    decodeURIComponent(
                      $a.data("breadcrumbs")
                    )
                  );
                  var tabs = JSON.parse(
                    decodeURIComponent($a.data("tabs"))
                  );
                  var data = {
                    elem: $a,
                    field: {
                      breadcrumbs: breadcrumbs,
                      tabs: tabs,
                    },
                  };
                  callback(data);
                });
              });
            } else {
              $this.on("click", function () {
                var $a = $this.children("a");
                var breadcrumbs = JSON.parse(
                  decodeURIComponent($a.data("breadcrumbs"))
                );
                var tabs = JSON.parse(
                  decodeURIComponent($a.data("tabs"))
                );
                var data = {
                  elem: $a,
                  field: {
                    breadcrumbs: breadcrumbs,
                    tabs: tabs,
                  },
                };
                callback(data);
              });
            }
          });
      }
    }
  };
  /**
   * 清除缓存
   */
  Navbar.prototype.cleanCached = function () {
    layui.data(cacheName, null);
  };

  /**
   * 获取html字符串
   * @param {Object} data
   */
  function getHtml(data) {
    // 快捷菜单
      //获取快捷菜单数据
      var quick_menu_data = {};
      layui.admin.req({
          url: layui.admin.getUrl('/api/system/getQuickMenu')
          , data: {}
          , method: 'get'
          , async: false
          , done: function (res) {
              quick_menu_data = res.data;
          }
      });
    try {
      var quick_menu = {
        name: '快捷菜单',
        id: 'quick_menu',
        route: '',
        spread: true,
        icon: "layui-icon-release",
        list: []
      };
      var user_id = layui.data(layui.setter.tableName)['user_id'];
      var platformId = layui.sessionData(layui.setter.tableName)['gameselect'].platformId;
      var key = 'm_'+user_id+'_'+platformId;
      var arr = [];
      if(quick_menu_data[key] && quick_menu_data[key] != '[]') arr = JSON.parse(quick_menu_data[key]);
      if (arr.length > 0 && data.length > 0) {
        for (var i = 0; i < data.length; i++) {//鉴权后的一级菜单
          if (data[i].list.length < 1) continue;
          for (var k = 0; k < data[i].list.length; k++) {//一级菜单下的二级菜单
            var exist = arr.indexOf(data[i].list[k].name);//二级菜单是否存在与快捷菜单选中的一致
            if(exist > -1 ) quick_menu.list.push(data[i].list[k]);
          }
        }
        // 快捷菜单存入数据
        data.unshift(quick_menu)
      }

      var ulHtml =
        '<ul class="layui-nav layui-nav-tree">' +
        '<li class="layui-nav-item layui-hide"><a href="javascript:;" lay-href="welcome/mode=2"></a></li>';
      for (var i = 0; i < data.length; i++) {
        var breadcrumbs = [];
        breadcrumbs.push(data[i].name);
        if (data[i].spread && i == 0) {
          ulHtml += '<li class="layui-nav-item">'; //修改初始进来状态不展开第一个菜单
        } else {
          ulHtml += '<li class="layui-nav-item">';
        }
        if (
          data[i].spread &&
          data[i].list !== undefined &&
          data[i].list !== null &&
          data[i].list.length > 0
        ) {
          ulHtml += `<a href="javascript:;"><i class="layui-icon ${data[i].icon}"></i><cite>${data[i].name}</cite><span class="layui-nav-more"></span></a>`;
          ulHtml += '<dl class="layui-nav-child">';
          //二级菜单
          for (var j = 0; j < data[i].list.length; j++) {
            breadcrumbs.push(data[i].list[j].name);
            //是否有孙子节点
            if (
              data[i].list[j].spread &&
              data[i].list[j].list !== undefined &&
              data[i].list[j].list !== null &&
              data[i].list[j].list.length > 0
            ) {
              ulHtml += "<dd>";
              ulHtml +=
                '<a href="javascript:;">' + data[i].list[j].name;
              ulHtml += '<span class="layui-nav-more"></span>';
              ulHtml += "</a>";
              //三级菜单
              ulHtml += '<dl class="layui-nav-child">';
              var grandsonNodes = data[i].list[j].list;
              for (var k = 0; k < grandsonNodes.length; k++) {
                breadcrumbs.push(grandsonNodes.name);
                var route =
                  grandsonNodes.route === undefined ||
                  grandsonNodes.route === ""
                    ? "user/main/id=" + grandsonNodes.id
                    : grandsonNodes.route;
                var tabs = JSON.stringify(grandsonNodes.list);
                ulHtml += "<dd>";
                if (
                  grandsonNodes.icon !== undefined &&
                  grandsonNodes.icon !== ""
                ) {
                  if (data[i].icon.indexOf("fa-") !== -1) {
                    ulHtml +=
                      '<i class="fa ' +
                      grandsonNodes.icon +
                      '" aria-hidden="true" data-icon="' +
                      grandsonNodes.icon +
                      '" data-id="' +
                      grandsonNodes.id +
                      '"></i>';
                  } else {
                    ulHtml +=
                      '<i class="layui-icon ' +
                      grandsonNodes.icon +
                      '" data-icon="' +
                      grandsonNodes.icon +
                      '"></i>';
                  }
                }
                ulHtml +=
                  '<a lay-href="' +
                  route +
                  '" data-breadcrumbs="' +
                  encodeURIComponent(
                    JSON.stringify(breadcrumbs)
                  ) +
                  '" data-tabs="' +
                  encodeURIComponent(tabs) +
                  '" data-id="' +
                  grandsonNodes.id +
                  '">' +
                  grandsonNodes[k].name +
                  "</a>";
                ulHtml += "</dd>";
                breadcrumbs.pop();
              }
              ulHtml += "</dl>";
              ulHtml += "</dd>";
            } else {
              // 需要处理页面路由内部切换的id写到这个数组里面
              let useRouterArr = [
                "player-log",
                "activity-import",
                "system-log",
                "feature-log",
                "server-state",
                "public-dictionary",
                "game-chat",
                "player-info",
                "player-league",
                "player-chat", // 玩家聊天管理
                "email-gm", // gm邮件
                "email-traceless", // 无痕邮件
                "welfare-number", // 福利号监控
                "announce",
                "operation-error",
                "pay-analyze",
                "newly-increased",
                "active-analyze",
                "runoff-analyze",
                "game-activity",
                "activity-open-server",
                "activity-import-detail",
                "finance",
                "consume",
                "player-interior-pay", // 内部充值
                "template-list",
                "toogle",
                "exchange-code",
                "ban-set",
                "open-set",
                "server-status",
                "real-time-data",
                "data-report",
                "add-welfare",
                "limit-gift-config",
                  'whale-user-analyze',
              ];
              var route =
                data[i].list[j].route === undefined ||
                data[i].list[j].route === ""
                  ? "user/mainorg/id=" + data[i].list[j].id
                  : data[i].list[j].route;
              if (useRouterArr.indexOf(data[i].list[j].id) != -1) {
                //todo liubucai 做了特殊处理，因为有些功能没做完，只能先临时这么处理
                route = "user/main/id=" + data[i].list[j].id;
              }
              var tabs = JSON.stringify(data[i].list[j].list);
              ulHtml += "<dd>";
              if (
                data[i].list[j].icon !== undefined &&
                data[i].list[j].icon !== ""
              ) {
                if (data[i].icon.indexOf("fa-") !== -1) {
                  ulHtml +=
                    '<i class="fa ' +
                    data[i].list[j].icon +
                    '" aria-hidden="true" data-icon="' +
                    data[i].list[j].icon +
                    '" data-id="' +
                    data[i].list[j].id +
                    '"></i>';
                } else {
                  ulHtml +=
                    '<i class="layui-icon ' +
                    data[i].list[j].icon +
                    '" data-icon="' +
                    data[i].list[j].icon +
                    '"></i>';
                }
              }
              ulHtml +=
                '<a lay-href="' +
                route +
                '" data-breadcrumbs="' +
                encodeURIComponent(JSON.stringify(breadcrumbs)) +
                '" data-tabs="' +
                encodeURIComponent(tabs) +
                '" data-id="' +
                data[i].list[j].id +
                '">' +
                data[i].list[j].name;
              ulHtml += "</a>";
              ulHtml += "</dd>";
            }
            //ulHtml += '<dd title="' + data[i].children[j].title + '">';
            breadcrumbs.pop();
          }
          ulHtml += "</dl>";
        } else {
          //ulHtml += '<a href="javascript:;" ' + dataUrl + '>';
          var route =
            data[i].route === undefined || data[i].route === ""
              ? "user/main/id=" + data[i].id
              : data[i].route;
          var tabs = encodeURIComponent(JSON.stringify(data[i].list));
          if (data[i].icon !== undefined && data[i].icon !== "") {
            if (data[i].icon.indexOf("fa-") !== -1) {
              ulHtml +=
                '<i class="fa ' +
                data[i].icon +
                '" aria-hidden="true" data-icon="' +
                data[i].icon +
                '" data-id="' +
                data[i].id +
                '"></i>';
            } else {
              ulHtml +=
                '<i class="layui-icon ' +
                data[i].icon +
                '" data-icon="' +
                data[i].icon +
                '"></i>';
            }
          }
          ulHtml +=
            '<a lay-href="' +
            route +
            '" data-breadcrumbs="' +
            encodeURIComponent(JSON.stringify(breadcrumbs)) +
            '" data-tabs="' +
            encodeURIComponent(tabs) +
            '">';
          ulHtml += "<cite>" + data[i].name + "</cite>";
          ulHtml += "</a>";
        }
        ulHtml += "</li>";
      }
      ulHtml += "</ul>";

      return ulHtml;
    }catch (e) {
      // 报错：未经选择外层平台 直接输入内层平台地址
      // console.log(e)
       location.hash = "#/user/login"
        //layer.msg('未正常选中平台',{icon:5})
    }
  }

  var navbar = new Navbar();

  exports("navbar", function (options) {
    return navbar.set(options);
  });
});
