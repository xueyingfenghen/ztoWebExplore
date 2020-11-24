/**

 @Name：layuiAdmin 公共业务
 @Author：贤心
 @Site：http://www.layui.com/admin/
 @License：LPPL

 */

layui.define(function (exports) {
    var $ = layui.$,
        layer = layui.layer,
        laytpl = layui.laytpl,
        setter = layui.setter,
        view = layui.view,
        admin = layui.admin,
        form = layui.form;

    //公共业务的逻辑处理可以写在此处，切换任何页面都会执行
    //……

    //退出
    admin.events.logout = function () {
        //执行退出接口
        admin.req({
            url: admin.getUrl("/api/logout"),
            data: {},
            method: "post",
            dataType: "json",
            done: function (res) {
                //这里要说明一下：done 是只有 response 的 code 正常才会执行。而 succese 则是只要 http 为 200 就会执行

                //清空本地记录的 token，并跳转到登入页
                admin.exit();
            },
            error: function (e, code) {
                admin.exit();
            },
        });
    };

    // 获取表格的templet对应的字段名
    admin.getTemplet = function (cols) {
        let temp = [];
        $.each(cols[0], function (key, val) {
            if (
                val.templet != null &&
                val.templet != undefined &&
                val.templet.trim() != ""
            ) {
                temp.push(val.field);
            }
        });
        return temp;
    };

    // 获取需要提交的表单值
    admin.getFormParam = function (sel) {
        let values = {};
        let params = $(sel).serializeArray();
        for (let x in params) {
            values[params[x].name] = params[x].value;
        }
        return values;
    };

    // 重置表单
    admin.resetForm = function (sel) {
        for (let i = 0; i < $(sel).length; i++) {
            $(sel)[i].reset();
        }
    };

    // 渲染时间选择器
    admin.laydateInit = function (sel, laydate) {
        for (let i = 0; i < $(sel + " input").length; i++) {
            if (
                $(sel + " input")
                    .eq(i)
                    .attr("data-laydate") != undefined
            ) {
                laydate.render(
                    JSON.parse(
                        $(sel + " input")
                            .eq(i)
                            .attr("data-laydate")
                    )
                );
            }
        }
    };

    // 渲染下拉框
    admin.initSelect = function (res, sel, placeholder = "请选择") {
        let html = "<option value=''>" + placeholder + "</option>";
        for (let k in res) {
            if (res[k]["disable"]) {
                html +=
                    "<option value='" +
                    res[k]["key"] +
                    "' disabled>" +
                    res[k]["val"] +
                    "</option>";
            } else {
                html +=
                    "<option value='" +
                    res[k]["key"] +
                    "'>" +
                    res[k]["val"] +
                    "</option>";
            }
        }
        $(sel).html(html);
    };

    // 渲染radio
    admin.initRadio = function (res, sel, name, filter = "") {
        let html = "";
        for (let k in res) {
            if (k == 0) {
                html +=
                    "<input type='radio' name='" +
                    name +
                    "' value='" +
                    res[k]["key"] +
                    "' lay-filter='" +
                    filter +
                    "' title='" +
                    res[k]["val"] +
                    "' checked=''>";
            } else {
                html +=
                    "<input type='radio' name='" +
                    name +
                    "' value='" +
                    res[k]["key"] +
                    "' lay-filter='" +
                    filter +
                    "' title='" +
                    res[k]["val"] +
                    "'>";
            }
        }
        $(sel).html(html);
    };

    // 获取下拉框的text值
    admin.selectText = function (sel) {
        let index = $(sel)[0]["selectedIndex"];
        return $(sel)[0][index]["innerText"];
    };

    admin.checkUser = function (title, data) {
        return new Promise(function (resolve, reject) {
            admin.popup({
                title: title,
                area: ["800px", "600px"],
                id: "checkUserDialog",
                // ,btn: ['确定', '取消']
                success: function (layero, index) {
                    view(this.id)
                        .render("/popup/check_user")
                        .done(function () {
                            let checkedNum = 0;
                            $.each(data, function (key, val) {
                                if (val["state"] == 0) {
                                    checkedNum++;
                                }
                            });
                            $(".span_num").eq(0).html(data.length);
                            $(".span_num").eq(1).html(checkedNum);
                            $(".span_num")
                                .eq(2)
                                .html(data.length - checkedNum);

                            // 加载表格
                            layui.table.render({
                                id: "check_user_dialog",
                                elem: "#check_user_dialog",
                                loading: true,
                                cols: [
                                    [
                                        {
                                            field: "index",
                                            title: "序号",
                                            align: "center",
                                        },
                                        {
                                            field: "server_id",
                                            title: "区服",
                                            align: "center",
                                        },
                                        {
                                            field: "role_id",
                                            title: "玩家ID",
                                            align: "center",
                                        },
                                        {
                                            field: "nickname",
                                            title: "昵称",
                                            align: "center",
                                        },
                                        {
                                            field: "vip",
                                            title: "vip",
                                            align: "center",
                                        },
                                        {
                                            field: "state",
                                            title: "校验结果",
                                            align: "center",
                                            templet: function (d) {
                                                return d.state == 0
                                                    ? '<span class="green">校验成功</span>'
                                                    : '<span class="red">校验失败</span>';
                                            },
                                        },
                                    ],
                                ],
                                limit: 500,
                                data: data,
                            });
                        });
                },
                yes: function (index, layero) {
                    layer.close(index);
                    resolve();
                },
            });
        });
    };

    // 渲染搜索框
    admin.initForms = function (name, sel, isReplace) {
        return new Promise(function (resolve, reject) {
            admin.req({
                url: admin.getUrl("/api/base/getFormList"),
                data: {
                    name: name,
                },
                type: "post",
                done: function (data) {
                    isReplace
                        ? layui.jquery(sel).html(data.data["form"])
                        : layui.jquery(sel).append(data.data["form"]);
                    admin.laydateInit(sel, layui.laydate);
                    // 渲染表单
                    layui.form.render();
                    resolve();
                },
            });
        });
    };

    // 获取搜索框cols
    admin.getCols = function (name) {
        return new Promise(function (resolve, reject) {
            admin.req({
                url: admin.getUrl("/api/base/getTableCols"),
                data: {
                    name: name,
                },
                type: "post",
                done: function (data) {
                    resolve(data);
                },
            });
        });
    };

    // 重载表格
    admin.reload = function (
        sel,
        tableId,
        param = "",
        page = {
            curr: 1,
        }
    ) {
        let params = param == "" ? admin.getFormParam(sel) : param;
        layui.table.reload(tableId, {
            where: params,
            page: page,
        });
    };
    // 渲染表格
    admin.initTable = function (url, cols, tableId, formClass) {
        let param = admin.getFormParam(formClass);
        layui.table.render({
            id: tableId,
            elem: "#" + tableId,
            url: url,
            method: "GET",
            where: param, //请求参数(额外)
            request: {
                pageName: "page", //页码的参数名称，默认：page
                limitName: "page_size", //每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                return {
                    code: res.code, //解析接口状态
                    msg: "", //解析提示文本
                    count: res.data.count, //解析数据长度
                    data: res.data.list,
                };
            },
            page: true,
            loading: true,
            cols: cols,
        });
    };
    /**
     * 根据表格数据渲染echars,初步处理
     * @param option option
     * @param tableData table表格data
     * @param cols 表格表头
     * @param barArr 柱状图数组 ex:['user'] 对应表格
     * @param lineArr 折线图数组 对应表格
     * @param x_field x轴显示字段
     * @param type 类型 0 普通折线模式或者柱状图模式 1 折线模式与柱状图模式相结合
     * @returns {*}
     */
    admin.getOption = function (
        option,
        tableData,
        cols,
        barArr,
        lineArr,
        x_field,
        type = 1
    ) {
        // 处理option数据
        let legend = barArr.concat(lineArr);
        option.legend.data = [];
        // 将legend转成对应的中文
        $.each(legend, function (key, val) {
            $.each(cols[0], function (k, v) {
                if (val == v["field"]) {
                    option.legend.data[key] = v["title"];
                    return;
                }
            });
        });

        option.series = [];
        $.each(legend, function (key, val) {
            let serdata = [];
            $.each(tableData, function (k, v) {
                serdata.push(parseFloat(v[val]));
            });

            option.series[key] = {
                name: option.legend.data[key],
                type: barArr.indexOf(val) != -1 ? "bar" : "line",
                // yAxisIndex: barArr.indexOf(val) != -1 ? 0 : 1,
                barWidth: 30,
                data: serdata,
            };

            switch (type) {
                case 0: {
                    option.series[key].yAxisIndex = 0;
                    break;
                }
                case 1: {
                    option.series[key].yAxisIndex =
                        barArr.indexOf(val) != -1 ? 0 : 1;
                    break;
                }
            }
        });

        // 设置x轴
        option.xAxis[0].data = [];
        $.each(tableData, function (key, val) {
            option.xAxis[0].data.push(val[x_field]);
        });

        return option;
    };

    /*
     * jquery 初始化form插件，传入一个json对象，为form赋值
     * version: 1.0.0-2013.06.24
     * @requires  jQuery v1.5 or later
     * Copyright (c) 2013
     * note:  1、此方法能赋值一般所有表单，但考虑到checkbox的赋值难度，以及表单中很少用checkbox，这里不对checkbox赋值
     *		  2、此插件现在只接收json赋值，不考虑到其他的来源数据
     *		  3、对于特殊的textarea，比如CKEditor,kindeditor...，他们的赋值有提供不同的自带方法，这里不做统一，如果项目中有用到，不能正确赋值，请单独赋值
     */
    $.fn.extend({
        initForm: function (options) {
            //默认参数
            var defaults = {
                jsonValue: "",
                isDebug: false, //是否需要调试，这个用于开发阶段，发布阶段请将设置为false，默认为false,true将会把name value打印出来
            };
            //设置参数
            var setting = $.extend({}, defaults, options);
            var form = this;
            jsonValue = setting.jsonValue;
            //如果传入的json字符串，将转为json对象
            if ($.type(setting.jsonValue) === "string") {
                jsonValue = $.parseJSON(jsonValue);
            }
            //如果传入的json对象为空，则不做任何操作
            if (!$.isEmptyObject(jsonValue)) {
                var debugInfo = "";
                $.each(jsonValue, function (key, value) {
                    //是否开启调试，开启将会把name value打印出来
                    if (setting.isDebug) {
                        console.log("name:" + key + "; value:" + value);
                        debugInfo +=
                            "name:" + key + "; value:" + value + " || ";
                    }
                    var formField = form.find("[name='" + key + "']");
                    if ($.type(formField[0]) === "undefined") {
                        if (setting.isDebug) {
                            console.log(
                                "can not find name:[" + key + "] in form!!!"
                            ); //没找到指定name的表单
                        }
                    } else {
                        var fieldTagName = formField[0].tagName.toLowerCase();
                        if (fieldTagName == "input") {
                            if (formField.attr("type") == "radio") {
                                $(
                                    "input:radio[name='" +
                                        key +
                                        "'][value='" +
                                        value +
                                        "']"
                                ).attr("checked", "checked");
                            } else {
                                if (key != "section") {
                                    formField.val(value);
                                }
                            }
                        } else if (fieldTagName == "select") {
                            //do something special
                            formField.val(value);
                        } else if (fieldTagName == "textarea") {
                            //do something special
                            formField.val(value);
                        } else {
                            formField.val(value);
                        }
                    }
                });
                if (setting.isDebug) {
                    console.log(debugInfo);
                }
            }
            return form; //返回对象，提供链式操作
        },
    });

    //新增页面根据后端配置组装html渲染
    admin.renderPopup = function (objSel, obj, edit_obj) {
        $.each(obj, function (i, val) {
            var str = "";
            var edit_field = edit_obj[val.field] || "";
            var idStr = "";
            var showStr = "";
            var layVerifyStr = 'lay-verify="required" ';
            var placeholder = obj[i].title;
            if (val.id !== undefined) idStr = "id=" + val.id;
            if (obj[i].title == "排序序号")
                placeholder = "排序序号，序号越小的公告排序越开靠前";
            if (val.show !== undefined && val.show === false) {
                showStr = "style='display: none'";
                layVerifyStr = 'lay-verify="" ';
            }
            if (val.field == "jump_url") {
                str =
                    '  <div class="layui-form-item"' +
                    idStr +
                    " " +
                    showStr +
                    ">\n" +
                    '    <label class="layui-form-label">' +
                    obj[i].title +
                    "</label>\n" +
                    '    <div class="layui-input-inline">\n' +
                    '      <select name="' +
                    obj[i].field +
                    '">\n' +
                    "      </select>\n" +
                    "    </div>\n" +
                    "  </div>";
            } else if (val.type == "text") {
                str =
                    ' <div class="layui-form-item"' +
                    idStr +
                    " " +
                    showStr +
                    ">\n" +
                    '  <label class="layui-form-label">' +
                    obj[i].title +
                    "</label>\n" +
                    '  <div class="layui-input-block">\n' +
                    '  <input type="text" name="' +
                    obj[i].field +
                    '" value="' +
                    edit_field +
                    '"  placeholder="请输入' +
                    placeholder +
                    '" autocomplete="off" class="layui-input">\n' +
                    "  </div>\n" +
                    "  </div>";
            } else if (val.type == "password") {
                str =
                    ' <div class="layui-form-item">\n' +
                    '  <label class="layui-form-label">' +
                    obj[i].title +
                    "</label>\n" +
                    '  <div class="layui-input-inline">\n' +
                    '  <input type="password" name="' +
                    obj[i].field +
                    '" value="' +
                    edit_field +
                    '"  placeholder="请输入' +
                    obj[i].title +
                    '" autocomplete="off" class="layui-input">\n' +
                    "  </div>\n" +
                    "  </div>";
            } else if (val.type == "textarea") {
                str =
                    '<div class="layui-form-item layui-form-text">\n' +
                    '<label class="layui-form-label"><span style="padding-left: 10px;">' +
                    obj[i].title +
                    "</span></label>\n" +
                    '<div class="layui-input-block">\n' +
                    '<textarea placeholder="请输入' +
                    obj[i].title +
                    '" class="layui-textarea" name="' +
                    obj[i].field +
                    '">' +
                    edit_field +
                    "</textarea>\n" +
                    "</div>\n" +
                    "</div>";
            } else if (val.type == "time") {
                str =
                    '      <div class="layui-form-item"' +
                    idStr +
                    ">\n" +
                    '          <label class="layui-form-label">' +
                    obj[i].title +
                    "</label>\n" +
                    '          <div class="layui-input-inline">\n' +
                    '              <input value="' +
                    edit_field +
                    '" type="text" class="layui-input ' +
                    id +
                    '"  id="' +
                    obj[i].field +
                    '" placeholder="请输入' +
                    obj[i].title +
                    '" name="' +
                    obj[i].field +
                    '">\n' +
                    "          </div>\n" +
                    "      </div>";
                var laydate_id = obj[i].field;
            } else if (val.type == "selServer") {
                //选择区服
                edit_field = edit_field == "全平台" ? "" : edit_field;
                str =
                    ' <div class="layui-form-item"' +
                    idStr +
                    " " +
                    showStr +
                    '">\n' +
                    '  <label class="layui-form-label">' +
                    obj[i].title +
                    "</label>\n" +
                    '  <div class="layui-input-block">\n' +
                    '  <input onclick="area({area:this.value})"readonly value="' +
                    edit_field +
                    '" type="text" name="' +
                    obj[i].field +
                    '" value=""  placeholder="请选择' +
                    obj[i].title +
                    '" autocomplete="off" class="layui-input select_area">\n' +
                    "  </div>\n" +
                    "  </div>";
            } else if (val.type == "radio") {
                var radioInputStr = "";
                $.each(val.radios, function (j, val) {
                    var checkStr = "";
                    if (val.checked) {
                        checkStr = ' checked=""';
                    }
                    radioInputStr +=
                        '<input type="radio" name=' +
                        obj[i].field +
                        " value=" +
                        val.value +
                        " title=" +
                        val.title +
                        checkStr +
                        '><div class="layui-unselect layui-form-radio layui-form-radioed"><i class="layui-anim layui-icon"></i><div>即时编辑</div></div>\n';
                });

                //这个暂时写死 因为有需求要点击”立即发送“隐藏开始时间
                str =
                    '      <div class="layui-form-item" pane>\n' +
                    '          <label class="layui-form-label">' +
                    obj[i].title +
                    "</label>\n" +
                    '          <div class="layui-input-block"' +
                    idStr +
                    ">\n" +
                    radioInputStr +
                    "          </div>\n" +
                    "      </div>";
            }
            $(objSel).prepend(str);
        });
    };
    admin.collapseTable = function collapseTable(options) {
        var trObj = options.elem;
        if (!trObj) return;
        var accordion = options.accordion,
            success = options.success,
            content = options.content || "";
        var tableView = trObj.parents(".layui-table-view"); //当前表格视图
        var id = tableView.attr("lay-id"); //当前表格标识
        var index = trObj.data("index"); //当前行索引
        var leftTr = tableView.find(
            '.layui-table-fixed.layui-table-fixed-l tr[data-index="' +
                index +
                '"]'
        ); //左侧当前固定行
        var rightTr = tableView.find(
            '.layui-table-fixed.layui-table-fixed-r tr[data-index="' +
                index +
                '"]'
        ); //右侧当前固定行
        var colspan = trObj.find("td").length; //获取合并长度
        var trObjChildren = trObj.next(); //展开行Dom
        var indexChildren = id + "-" + index + "-children"; //展开行索引
        var leftTrChildren = tableView.find(
            '.layui-table-fixed.layui-table-fixed-l tr[data-index="' +
                indexChildren +
                '"]'
        ); //左侧展开固定行
        var rightTrChildren = tableView.find(
            '.layui-table-fixed.layui-table-fixed-r tr[data-index="' +
                indexChildren +
                '"]'
        ); //右侧展开固定行
        var lw = leftTr.width() + 15; //左宽
        var rw = rightTr.width() + 15; //右宽
        //不存在就创建展开行
        if (trObjChildren.data("index") != indexChildren) {
            //装载HTML元素
            var tr =
                '<tr data-index="' +
                indexChildren +
                '"><td colspan="' +
                colspan +
                '"><div style="height: auto;padding-left:' +
                lw +
                "px;padding-right:" +
                rw +
                'px" class="layui-table-cell">' +
                content +
                "</div></td></tr>";
            trObjChildren = trObj.after(tr).next().hide(); //隐藏展开行
            var fixTr = '<tr data-index="' + indexChildren + '"></tr>'; //固定行
            leftTrChildren = leftTr.after(fixTr).next().hide(); //左固定
            rightTrChildren = rightTr.after(fixTr).next().hide(); //右固定
        }
        //展开|折叠箭头图标
        trObj
            .find('td[lay-event="collapse"] i.layui-colla-icon')
            .toggleClass("layui-icon-addition layui-icon-subtraction");
        //显示|隐藏展开行
        trObjChildren.toggle();
        //开启手风琴折叠和折叠箭头
        if (accordion) {
            trObj
                .siblings()
                .find('td[lay-event="collapse"] i.layui-colla-icon')
                .removeClass("layui-icon-subtraction")
                .addClass("layui-icon-addition");
            trObjChildren.siblings('[data-index$="-children"]').hide(); //展开
            rightTrChildren.siblings('[data-index$="-children"]').hide(); //左固定
            leftTrChildren.siblings('[data-index$="-children"]').hide(); //右固定
        }
        success(trObjChildren, indexChildren); //回调函数
        heightChildren = trObjChildren.height(); //展开高度固定
        rightTrChildren.height(heightChildren + 115).toggle(); //左固定
        leftTrChildren.height(heightChildren + 115).toggle(); //右固定
    };

    //获取table 复选框数据
    admin.checkboxData = function checkboxData(tableId) {
        return layui.table.checkStatus(tableId).data; //得到选中的数据
    };

    //设置 table 当前行 为可编辑状态
    /**
     * @param obj 当前table 点击某行元素的dom对象;
     * @param arr 当前要设为编辑的列 例 [1,2,3];
     * @param text 设当前此元素的文本值
     */
    admin.allowEdit = function allowEdit(obj, arr, text = "") {
        var trDom = obj.parent().parent().parent("tr"); //获取当前行的dom对象
        obj[0].text = text;
        for (var i = 0; i < arr.length; i++) {
            var len = $(trDom[0].cells[arr[i]]).find("input").length; //当前行每个单元格 DOM
            if (len == 0) {
                trDom[0].cells[arr[i]].dataset.edit = "text";
                var html = trDom[0].cells[arr[i]].innerHTML;
                var text = trDom[0].cells[arr[i]].innerText;
                var str =
                    "<input class='layui-input layui-table-edit' value=" +
                    text +
                    ">";
                trDom[0].cells[arr[i]].innerHTML = html + str;
            }
        }
    };
    // 设置table 当前行 为不可编辑状态
    admin.notAllowEdit = function notAllowEdit(obj, arr, text = "") {
        var trDom = obj.parent().parent().parent("tr"); //获取当前行的dom对象
        obj[0].text = text;
        for (var i = 0; i < arr.length; i++) {
            var len = $(trDom[0].cells[arr[i]]).find("input").length; //当前行每个单元格 DOM
            delete trDom[0].cells[arr[i]].dataset.edit;
            if (len > 0) $(trDom[0].cells[arr[i]]).find("input").remove();
        }
    };

    admin.tabSwitchover = function () {
        // layui.element.on('tab(docDemoTabBrief)', function (data) {
        //     return new Promise(function (resolve, reject) {
        //         let layui_tab_item = $(this).parent().parent().find('.layui-tab-item');
        //         for (let i = 0; i < layui_tab_item.length; i ++) {
        //             layui_tab_item.eq(i).removeClass("layui-show");;
        //         }
        //         for (let i = 0; i < $('.tabs').length; i ++) {
        //             $('.tabs').eq(i).removeClass("layui-show");
        //         }
        //         // 显示list部分
        //         $('#list_' + $(this).attr('data-tab')).addClass("layui-show");
        //         $('#search_' + $(this).attr('data-tab')).addClass("layui-show");
        //         console.log($(this).attr('data-tab'));
        //         let res = {
        //             router: $(this).attr('data-tab')
        //         };
        //         resolve(res)
        //     })
        // });

        return new Promise(function (resolve, reject) {
            layui.element.on("tab(docDemoTabBrief)", function (data) {
                let layui_tab_item = $(this)
                    .parent()
                    .parent()
                    .find(".layui-tab-item");
                for (let i = 0; i < layui_tab_item.length; i++) {
                    layui_tab_item.eq(i).removeClass("layui-show");
                }
                for (let i = 0; i < $(".tabs").length; i++) {
                    $(".tabs").eq(i).removeClass("layui-show");
                }
                // 显示list部分
                $("#list_" + $(this).attr("data-tab")).addClass("layui-show");
                $("#search_" + $(this).attr("data-tab")).addClass("layui-show");
                console.log($(this).attr("data-tab"));
                let res = {
                    router: $(this).attr("data-tab"),
                };

                return resolve(res);
            });
        });
    };

    /***********复选框操作***********/
    // 判断是否全选
    admin.setIsAllCheck = function (name) {
        let count = 0,
            items = $("input[name='" + name + "']");
        for (let i = 0; i < items.length; i++) {
            if (items[i].checked == true) {
                count++;
            }
        }
        if (count == items.length) {
            $("input[name='check_all_" + name + "']")[0].checked = true;
        } else {
            $("input[name='check_all_" + name + "']")[0].checked = false;
        }
    };

    // 监听全选操作
    admin.checkAll = function (name) {
        form.on("checkbox(check_all_" + name + ")", function (data) {
            let child = $("input[name='" + name + "']");
            child.each(function (index, item) {
                item.checked = data.elem.checked;
            });
            form.render("checkbox");
        });
    };

    // 监听反选
    admin.invertSelect = function (name) {
        form.on("checkbox(invert_select_" + name + ")", function (data) {
            let child = $("input[name='" + name + "']");
            child.each(function (index, item) {
                item.checked = !item.checked;
            });
            admin.setIsAllCheck(name);
            form.render("checkbox");
        });
    };

    // 监听单个复选框操作
    admin.checkSingle = function (name) {
        form.on("checkbox(single_" + name + ")", function (data) {
            admin.setIsAllCheck(name);
            form.render("checkbox");
        });
    };

    // 渲染checkbox
    admin.initCheckBox = function (sel, list) {
        let html = "";
        $.each(list, function (key, val) {
            let boxHtml = "";
            $.each(val["data"], function (k, v) {
                boxHtml +=
                    "<input type='checkbox' name='" +
                    key +
                    "' value='" +
                    v["key"] +
                    "' lay-skin='primary' lay-filter='single_" +
                    key +
                    "' title='" +
                    v["val"] +
                    "'>";
            });

            html +=
                "<div class='layui-form-item' pane=''>" +
                "<div class='look_more layui-icon layui-icon-addition'></div>" +
                "<label class='layui-form-label'>" +
                val["name"] +
                "</label>" +
                "<div class='layui-input-block'>" +
                "<input type='checkbox' name='check_all_" +
                key +
                "' lay-skin='primary' lay-filter='check_all_" +
                key +
                "' title='全选'>" +
                "<input type='checkbox' name='invert_select_" +
                key +
                "' lay-skin='primary' lay-filter='invert_select_" +
                key +
                "' title='反选'>" +
                "<div class='layui-clear'></div>" +
                boxHtml +
                "</div>" +
                "</div>";

            $(sel).html(html);
            form.render("checkbox");
        });
    };

    // 全选，反选，单选操作
    admin.checkboxOperator = function (list) {
        $.each(list, function (key, val) {
            admin.checkAll(key);
            admin.checkSingle(key);
            admin.invertSelect(key);
        });
    };

    /***********复选框操作***********/

    admin.area = function (data) {
        admin.popup({
            title: "选择区服",
            area: ["800px", "600px"],
            id: "select_area",
            btn: ["确定", "取消"],
            success: function (layero, index) {
                layui.view(this.id).render("area", {...data});
            },
            yes: function (index, layero) {
                $(".server_list").val($("#get_area").val());
                layer.close(index);
            },
        });
    };

    //防抖器
    admin.debounce = function (fn, delay) {
        let timeout = null;
        return function () {
            let args = arguments;
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    };

    admin.getLocalTime = function (area) {
        if (typeof area !== "number") {
            return new Date();
        }
        const d = new Date();
        const len = d.getTime();
        const offset = d.getTimezoneOffset() * 60000;
        const utcTime = len + offset;
        return utcTime + 3600000 * area;
    };

    // 判断当前路由在游戏选择页面，还是平台页面
    const gamePath = [
        "/user/access",
        "/permission/users",
        "/permission/groups",
        "/config/game",
        "/config/platform",
        "/config/service_channel",
    ];
    admin.hashchange = function (fn) {
        window.addEventListener("hashchange", function () {
            // console.log('hashchange')
            const href = layui.router().href;
            const pathArr = layui.router().path;
            let path = "";
            pathArr.forEach(function (e) {
                if (e) {
                    path += "/" + e;
                }
            });
            // const index = href.lastIndexOf("\/");
            // const path = href.substring(0, index);
            const prevPath_0 = sessionStorage.getItem("prevPath_0");
            sessionStorage.setItem("prevPath_0", path);
            if (prevPath_0 && prevPath_0 !== "/user/login") {
                const nowType = gamePath.includes(path) ? "game" : "admin";
                const prevType = gamePath.includes(prevPath_0)
                    ? "game"
                    : "admin";
                if (prevType === "game" && nowType === "admin") {
                    // fn('admin')
                } else if (prevType === "admin" && nowType === "game") {
                    fn("game");
                }
            }
        });
    };
    admin.openDialog = function openDialog(value, e) {
        const target = e.target;
        admin.popup({
            title: "选择区服",
            type: 1,
            shade: [0.3, "#000"],
            area: ["1000px", "600px"],
            btn: ["确定", "取消"],
            btnAling: "l",
            id: "select_server",
            resize: false,
            success(layero, index) {
                view(this.id).render("/area", value);
            },
            yes: function (index, layero) {
                const value = layero
                    .find("div[id=details]")
                    .text()
                    .split("：")[1];
                const ids = [
                    ...layero
                        .find("input[type=checkbox][name]")
                        .filter(":checked"),
                ].map((item) => item.value);
                server_id = ids.join(",");
                $(target).val(value);
                layer.close(index);
            },
        });
    };
    admin.renderCustomTable = function renderCustomTable(
        initArray,
        collapse,
        param
    ) {
        const table = layui.table;
        const STATUS = {
            2: "进行中",
            1: "结束",
            3: "未开始",
        };
        const STATUS_MAP = {
            PENDDING: 2,
            END: 1,
            NOT_START: 3,
        };
        const statusTemplet = function (d) {
            return STATUS[d.state];
        };
        const actionTemplet = function (d) {
            const status = d.state;
            const switchState = d.close_state;
            let str = "";
            if (status === STATUS_MAP.PENDDING && switchState === 2) {
                str += `<button  class="layui-btn layui-btn-xs" data-event="copy">复制</button>
                <button class="layui-btn layui-btn-xs layui-btn-theme" data-event="edit">修改</button >
                <button class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</button>`;
            } else if (status === STATUS_MAP.PENDDING && switchState === 1) {
                str += `<button  class="layui-btn layui-btn-xs " data-event="copy">复制</button>
                <button class="layui-btn layui-btn-xs  layui-btn-disabled" data-event="edit" disabled>修改</button >
                <button class="layui-btn layui-btn-xs layui-btn-danger layui-btn-disabled" lay-event="del" disabled>删除</button>`;
            } else if (status === STATUS_MAP.NOT_START) {
                str += `<button  class="layui-btn layui-btn-xs"  data-event="copy">复制</button>
                <button class="layui-btn layui-btn-xs layui-btn-theme" lay-event="edit" data-event="edit">修改 </button >
                <button class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</button>`;
            } else if (status === STATUS_MAP.END) {
                str += `<button  class="layui-btn layui-btn-xs" lay-event="copy" data-event="copy">复制</button>
                <button class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</button>`;
            }
            return str;
        };

        const switchTemplet = function (d) {
            const status = d.state;
            const state = d.close_state;
            const checked = state === 1 ? "checked" : "";
            if (status === STATUS_MAP.PENDDING) {
                return `
                <div class="layui-form">
                    <input type="checkbox" name="switch" lay-skin="switch" ${checked}
                    lay-text="开启|关闭" 
                    data-id=${d.plan_id}
                    data-status="PENNDING" lay-filter="status">
                </div>`;
            } else {
                return "";
            }
        };

        form.on("switch(status)", function (data) {
            const id = $(data.elem).attr("data-id");
            console.log(data.elem.checked);
            const value = data.elem.checked ? 1 : 2;
            admin
                .req({
                    url: "/api/rmb_gift/switchState",
                    data: {
                        plan_id: id,
                        state: value,
                    },
                    type: "post",
                })
                .then(() => {
                    table.reload(initArray[0].tableId);
                });
        });
        $.each(initArray, function (i, obj) {
            admin.initForms(obj.form_name, obj.form_id).then(function () {
                admin.getCols(obj.cols_name).then(function (data) {
                    // console.log(data);
                    const cols = data.data[0];
                    data.data[0][0].templet = collapse;
                    data.data[0][0].event = "collapse";
                    cols.forEach((item) => {
                        if (item.field === "state") {
                            item.templet = statusTemplet;
                        } else if (item.field === "action") {
                            item.templet = actionTemplet;
                        } else if (item.field === "exec_status") {
                            item.templet = switchTemplet;
                        }
                    });
                    table.render({
                        id: obj.tableId,
                        elem: "#" + obj.tableId,
                        url: obj.url,
                        method: "",
                        where: {
                            type: param.type === "week" ? 1 : 2,
                        }, //请求参数(额外)
                        parseData: function (res) {
                            return {
                                code: res.code, //解析接口状态
                                msg: "", //解析提示文本
                                count: res.data.count, //解析数据长度
                                data: res.data.list,
                            };
                        },
                        request: {
                            pageName: "page", //页码的参数名称，默认：page
                            limitName: "page_size", //每页数据量的参数名，默认：limit
                        },
                        page: true,
                        loading: true,
                        cols: data.data,
                    });

                    table.on(`tool(${obj.tableId})`, function (tableObj) {
                        const { data, event } = tableObj;
                        if (event === "collapse") {
                            const trObj = layui.$(this).parent("tr"); //当前行
                            const accordion = true; //开启手风琴，那么在进行折叠操作时，始终只会展现当前展开的表格。
                            const content = "<table></table>"; //内容
                            const columns = data.column_name;
                            const subData = data.activity_config;
                            const cols = Object.keys(columns).map((item) => {
                                let width = "";
                                if (
                                    item === "price" ||
                                    item === "discount" ||
                                    item === "rechargeId" ||
                                    item === "sort"
                                ) {
                                    width = 100;
                                } else if (item === "desc") {
                                    width = 120;
                                }
                                return {
                                    field: item,
                                    title: columns[item],
                                    width,
                                    align: "center",
                                };
                            });
                            admin.collapseTable({
                                elem: trObj,
                                accordion: accordion,
                                content: content,
                                success: function (trObjChildren, index) {
                                    //成功回调函数
                                    //trObjChildren 展开tr层DOM
                                    //index 当前层索引
                                    trObjChildren
                                        .find("table")
                                        .attr("id", index);
                                    table.render({
                                        elem: "#" + index,
                                        limit: Number.MAX_VALUE, // 数据表格默认全部显示-->
                                        data: subData,
                                        cols: [cols],
                                    });
                                },
                            });
                        } else if (event === "del") {
                            // console.log(tableObj);
                            const status = tableObj.data.state;
                            let content = "计划正在执行，是否删除？";
                            let flag = false;
                            if (status === STATUS_MAP.PENDDING) {
                                flag = true;
                            } else if (status === STATUS_MAP.END) {
                                flag = false;
                            } else if (status === STATUS_MAP.NOT_START) {
                                content = "计划未执行是否删除？";
                                flag = true;
                            }
                            const delFunc = (tableObj) => {
                                admin
                                    .req({
                                        url: "/api/rmb_gift/delGiftPlan",
                                        data: {
                                            plan_id: tableObj.data.plan_id,
                                            type: param.type,
                                        },
                                        method: "post",
                                    })
                                    .then((res) => {
                                        if (res.code === 0) {
                                            layer.msg(res.msg || "删除成功", {
                                                icon: 6,
                                            });
                                            layer.closeAll();
                                            table.reload(initArray[0].tableId);
                                        } else {
                                            layer.msg(res.msg || "删除失败", {
                                                icon: 5,
                                            });
                                        }
                                    });
                            };
                            if (flag) {
                                layer.open({
                                    type: 0,
                                    content,
                                    area: ["300px", "180px"],
                                    btn: ["确定", "取消"],
                                    // btnAlign: "c", //按钮居中
                                    shade: 0, //不显示遮罩
                                    yes: function () {
                                        delFunc(tableObj);
                                    },
                                });
                            } else {
                                delFunc(tableObj);
                            }
                        }
                    });
                });
            });
        });
    };
    /**
     *
     * @param {Array<string>} arr
     */
    admin.transferData = function transferData(arr) {
        let start = arr.shift();
        let str = `${start}`;
        let end = "";
        let startCharCode = start.charCodeAt();
        while (arr.length) {
            const first = arr.shift();
            const firstCharCode = first.charCodeAt();
            if (firstCharCode === startCharCode + 1) {
                end = first;
                if (!arr.length) {
                    str += `-${end}`;
                }
            } else {
                if (end) {
                    str += `-${end},${first}`;
                } else {
                    str += `,${first}`;
                }
            }
            startCharCode = firstCharCode;
        }
        return str;
    };
    /**
     * 区服字符串转数组
     * "1,2-4,5-7" => [1,2,3,...]
     * */
    admin.strTransferArr = function (str){
      const res = str.replace(/(\d+)-(\d+)/g, function (match,p1, p2) {
        let arr = [];
        for(let i = +p1; i <= +p2; i++){
          arr.push(i)
        }
        return arr.join(',')
      })
      return Function(`return [${res}]`)()
    }
    //对外暴露的接口
    exports("common", {});
});
