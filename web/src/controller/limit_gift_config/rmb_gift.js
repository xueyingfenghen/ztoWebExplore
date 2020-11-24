// const { add } = require("lodash");

// layui.extend({props: '/common/props'});
layui.define(
    ["table", "admin", "form", "view", "laydate", "element"],
    function (exports) {
        let admin = layui.admin;
        let table = layui.table;
        let form = layui.form;
        let view = layui.view;
        const param = {};
        let $ = layui.jquery;
        let initArray = [
            {
                // 充值留存
                form_name: "limit_gift_config_rmb_form",
                cols_name: "limit_gift_config_rmb_table",
                tableId: "rmb_gift_list",
                form_class: ".rmb-gift",
                form_id: "#rmb-gift",
                url: admin.getUrl("/api/rmb_gift/list"),
            },
        ];

        // 渲染搜索框
        $.each(initArray, function (i, obj) {
            admin.initForms(obj.form_name, obj.form_id).then(function () {
                admin.getCols(obj.cols_name).then(function (data) {
                    // let param = admin.getFormParam(obj.form_class);
                    //  渲染图表
                    table.render({
                        id: obj.tableId,
                        elem: "#" + obj.tableId,
                        url: obj.url,
                        method: "GET",
                        where: {
                            price_rank: "",
                            gift_name: "",
                            gift_type: "",
                        }, //请求参数(额外)
                        request: {
                            pageName: "page", //页码的参数名称，默认：page
                            limitName: "page_size", //每页数据量的参数名，默认：limit
                        },
                        parseData: function (res) {
                            return {
                                code: res.code, //解析接口状态
                                msg: res.data.msg, //解析提示文本
                                count: res.data.count, //解析数据长度
                                data: res.data.list,
                            };
                        },
                        page: true,
                        loading: true,
                        cols: data.data,
                    });
                });
            });
        });
        $("#list_rmb-gift")
            .off("click", ".layui-btn")
            .on("click", ".layui-btn", function () {
                if (!$(this).attr("data-event")) return;
                const event = $(this).data("event");
                const index = $(this).parents('tr[data-index]').attr('data-index');
                const tableData =layui.table.cache["rmb_gift_list"]
                // console.log(tableData)
                const obj = tableData[index];

                active[event](obj);
            });
        const active = {
            edit: editRMB,
            addRMB,
            sync,
        };
        form.on("submit(query)", function (obj) {
            const param = obj.field;
            table.reload(initArray[0].tableId, {
                where: param,
            });
        });

        function addRMB() {
            admin.popup({
                title: "新增",
                type: 1,
                shade: [0.3, "#000"],
                area: ["1000px", "800px"],
                id: "rmb_gift_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = {};
                    param.event = "addRMB";
                    view(this.id).render(
                        "limit_gift_config/rmb_gift_popup",
                        {}
                    );
                },
            });
        }
        function sync(obj) {
            admin.popup({
                title: "同步",
                type: 1,
                shade: [0.3, "#000"],
                area: ["1000px", "600px"],
                id: "sync_platform_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = obj;
                    param.event = "sync";
                    view(this.id).render(
                        "limit_gift_config/sync_platform_popup",
                        {}
                    );
                },
            });
        }
        function editRMB(obj) {
            // debugger
            admin.popup({
                title: "编辑",
                type: 1,
                shade: [0.3, "#000"],
                area: ["1000px", "800px"],
                id: "rmb_gift_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = obj;
                    // console.log(param);
                    param.event = "edit";
                    view(this.id).render(
                        "limit_gift_config/rmb_gift_popup",
                        obj
                    );
                },
            });
        }
        exports("limit_gift_config/rmb_gift", param);
    }
);
