// const { add } = require("lodash");

// layui.extend({props: '/common/props'});
layui.define(
    ["table", "admin", "form", "view", "laydate", "element"],
    function (exports) {
        let admin = layui.admin;
        let view = layui.view;
        const form = layui.form;
        const table = layui.table;
        const param = {};
        let $ = layui.jquery;

        // console.log(layui.setter.baseUrl);
        let initArray = [
            {
                // 充值留存
                form_name: "limit_gift_config_week_form",
                cols_name: "limit_gift_config_week_table",
                tableId: "week_gift_list",
                form_class: ".week-gift",
                form_id: "#week-gift",
                url: admin.getUrl("/api/rmb_gift/getAllPlan"),
            },
        ];
        function collapse() {
            return '&nbsp<i lay-tips="展开" class="layui-icon layui-colla-icon layui-icon-addition"></i>';
        }
        // 渲染搜索框
        // console.log(admin);
        admin.renderCustomTable(initArray, collapse, { type: "week" });
        $("#list_week-gift")
            .off("click", ".layui-btn")
            .on("click", ".layui-btn", function () {
                if (!$(this).attr("data-event")) return;
                const event = $(this).data("event");
                const index = $(this).parents("tr").index();
                const obj = layui.table.cache[initArray[0].tableId][index];
                console.log(event);
                active[event] && active[event](obj);
            });
        const active = {
            edit: editWeek.bind(null, "edit"),
            addPlanWeek,
            copy: editWeek.bind(null, "copy"),
        };
        form.on("submit(search_week-gift)", function ({ field }) {
            table.reload(initArray[0].tableId, {
                where: field,
            });
        });
        function addPlanWeek(obj, event) {
            admin.popup({
                title: "新增周礼包计划",
                type: 1,
                shade: [0.3, "#000"],
                area: ["1540px", "600px"],
                id: "week_gift_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = {};
                    param.event = event || "add";
                    layui.type = "week";
                    view(this.id)
                        .render("limit_gift_config/week_gift_popup", {})
                        .done(function () {});
                },
            });
        }
        function editWeek(event = "edit", obj) {
            // debugger
            const title =
                event === "edit" ? "编辑" : event === "copy" ? "复制" : "";
            admin.popup({
                title:`${title}周礼包计划`,
                type: 1,
                shade: [0.3, "#000"],
                area: ["1540px", "600px"],
                id: "week_gift_popup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = obj;

                    param.event = event || "edit";
                    console.log(param);
                    layui.type = "week";
                    // console.log(this)
                    view(this.id)
                        .render("limit_gift_config/week_gift_popup", obj)
                        .done(function () {});
                },
            });
        }
        exports("limit_gift_config/week_gift", param);
    }
);
