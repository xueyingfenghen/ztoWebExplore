// layui.extend({props: '/common/props'});
layui.define(
    ["table", "admin", "form", "view", "laydate", "element"],
    function (exports) {
        let admin = layui.admin;
        let table = layui.table;
        let form = layui.form;
        let view = layui.view;

        let $ = layui.jquery;
        let initArray = [
            {
                // 充值留存
                form_name: "add_welfare_qq_form",
                cols_name: "add_welfare_qq_table",
                tableId: "qq_welfare_list",
                form_class: ".qq_welfare",
                form_id: "#qq_welfare",
                url: admin.getUrl("/api/welfare/getGqList"),
            },
        ];

        // 渲染搜索框
        $.each(initArray, function (i, obj) {
            admin.initForms(obj.form_name, obj.form_id).then(function () {
                admin.getCols(obj.cols_name).then(function (data) {
                    let param = admin.getFormParam(obj.form_class);
                    //  渲染图表
                    table.render({
                        id: obj.tableId,
                        elem: "#" + obj.tableId,
                        url: obj.url,
                        method: "GET",
                        where: {
                            server_id: "",
                            qq_group: "",
                        }, //请求参数(额外)
                        request: {
                            pageName: "page", //页码的参数名称，默认：page
                            limitName: "page_size", //每页数据量的参数名，默认：limit
                        },
                        parseData: function (res) {
                            return {
                                code: res.code, //解析接口状态
                                msg: "", //解析提示文本
                                count: res.countAll, //解析数据长度
                                data: res.data,
                            };
                        },
                        page: true,
                        loading: true,
                        cols: data.data,
                    });
                });
            });
        });
        $("#list_qq-welfare")
            .off("click", ".layui-btn")
            .on("click", ".layui-btn", function () {
                if (!$(this).attr("data-event")) return;
                const event = $(this).data("event");
                const index = $(this).parents("tr").index();
                const obj = layui.table.cache["qq_welfare_list"][index];
                if (event === "modifyAll") {
                    const selectData = table.checkStatus("qq_welfare_list");
                    if (!selectData.data.length) {
                        layer.msg("一键修改需要选中要修改的数据", { icon: 5 });
                        return;
                    }
                    const [data] = selectData.data;
                    const sIds = admin.transferData(
                        selectData.data.map((item) => item.id)
                    );
                    active[event].bind(null, data)(sIds);
                } else {
                    active[event](obj);
                }
            });
        const active = {
            edit,
            modifyAll: edit,
        };
        const param = { url: "add_welfare/qq_welfare" };
        function edit(obj, ids) {
            admin.popup({
                title: "编辑",
                type: 1,
                shade: [0.3, "#000"],
                area: ["1000px", "600px"],
                id: "editQQGroup",
                resize: false,
                success(layero, index) {
                    param.layero = layero;
                    param.index = index;
                    param.obj = obj;
                    param.ids = ids;
                    console.log(param);
                    view(this.id)
                        .render("add_welfare/modifyContent", {})
                        .done(function () {});
                },
            });
        }
        form.on("submit(submit_qq_welfare)", function (obj) {
            const param = obj.field;
            console.log(param);
            table.reload("qq_welfare_list", {
                where: param,
            });
        });
        exports(param.url, param);
    }
);
