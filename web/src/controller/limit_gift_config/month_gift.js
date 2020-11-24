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
                form_name: "limit_gift_config_month_form",
                cols_name: "limit_gift_config_week_table",
                tableId: "month_gift_list",
                form_class: ".month-gift",
                form_id: "#month-gift",
                url: admin.getUrl("/api/rmb_gift/getAllPlan"),
            },
        ];
        function collapse() {
            return '&nbsp<i lay-tips="展开" class="layui-icon layui-colla-icon layui-icon-addition"></i>';
        }
        // 渲染搜索框
        admin.renderCustomTable(initArray, collapse, {
            type: "month",
        });

        $("#list_month-gift")
            .off("click", ".layui-btn")
            .on("click", ".layui-btn", function () {
                if (!$(this).attr("data-event")) return;
                const event = $(this).data("event");
                const index = $(this).parents("tr").index();
                const obj = layui.table.cache[initArray[0].tableId][index];
                active[event] && active[event](obj);
            });
        const active = {
            edit: editMonth.bind(null, "edit"),
            addPlanMonth,
            copy: editMonth.bind(null, "copy"),
        };

        function addPlanMonth() {
            admin.popup({
                title: "添加投放月礼包",
                type: 1,
                shade: [0.3, "#000"],
                area: ["1540px", "600px"],
                id: "week_gift_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = {};
                    param.event = "add";
                    layui.type = "month";
                    view(this.id)
                        .render("limit_gift_config/week_gift_popup", {})
                        .done(function () {});
                },
            });
        }

        function editMonth(event, obj) {
            // debugger;
            const title =
            event === "edit" ? "编辑" : event === "copy" ? "复制" : "";
            admin.popup({
                title:`${title}月礼包计划`,
                type: 1,
                shade: [0.3, "#000"],
                area: ["1540px", "600px"],
                id: "week_gift_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.event = event || "edit";
                    param.obj = obj;
                    layui.type = "month";
                    view(this.id)
                        .render("limit_gift_config/week_gift_popup", obj)
                        .done(function () {});
                },
            });
        }
        form.on("submit(search_month-gift)", function (formObj) {
            // debugger;
            const param = formObj.field;
            table.reload(initArray[0].tableId, {
                where: param,
            });
        });
        exports("limit_gift_config/month_gift", param);
    }
);
