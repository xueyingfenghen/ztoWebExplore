layui.extend({props: '/common/props'});
layui.define(['table', 'admin', 'form', 'view', 'laydate', 'element', 'common', 'echarts', 'props','tools/recentDate'], function (exports) {
    let $ = layui.jquery,
        admin = layui.admin,
        echarts = layui.echarts,
        table = layui.table,
        element = layui.element,
        form = layui.form,
        props = layui.props;

    let item = {
        //消耗元宝数
        'gc-change': {
            formConf: "statistics_gc-change_form",
            formClass: ".form_gc-change",
            tableId: "table_gc-change",
            echart: 'echart_gc-change',
            echartType: 'line',
            echartName: '元宝变更',
            echartLegend: {output_list: '产出元宝数', consume_list: '消耗元宝数'},
            echartUrl: '/api/stats/ingots/list_chart',
            tableUrl: '/api/stats/ingots/list',
            exportUrl: '/api/stats_export/ingots/list',
        },
        //元宝消费分布
        ingots_consume_distributed: {
            conf: "summ_gc-change_out",
            title: "消费分布",
            formClass: ".form_gc-change",
            tableId: "table_summ",
            echart: 'echart_summ',
            echartType: 'pie',
            echartName: '',
            tableUrl: '/api/stats/ingots/consume_scatter',
            echartUrl: '/api/stats/ingots/consume_chart',
            detail_id: 'ingots_consume_detail'
        },
        //元宝产出分布
        ingots_output_distributed: {
            conf: "summ_gc-change_in",
            title: "产出分布",
            formClass: ".form_gc-change",
            tableId: "table_summ",
            echart: 'echart_summ',
            echartType: 'pie',
            echartName: '',
            tableUrl: '/api/stats/ingots/output_scatter',
            echartUrl: '/api/stats/ingots/output_chart',
            detail_id: 'ingots_output_detail'
        },
        //元宝消费详情
        ingots_consume_detail: {
            conf: "detail_gc-change_out",
            title: "消费详情",
            tableId: "table_detail",
            tableUrl: '/api/stats/ingots/consume_detail',
            exportUrl: '/api/stats_export/ingots/consume_detail',
        },
        //元宝产出详情
        ingots_output_detail: {
            conf: "detail_gc-change_in",
            title: "产出详情",
            tableId: "table_detail",
            tableUrl: '/api/stats/ingots/output_detail',
            exportUrl: '/api/stats_export/ingots/output_detail',
        },
        // 1 -> 道具分布
        'prop-change': {
            formConf: "statistics_prop-change_form",
            formClass: ".form_prop-change",
            tableId: "table_prop-change",
            echart: 'echart_prop-change',
            echartType: 'line',
            echartName: '道具变更',
            echartLegend: {output_list: '产出道具数', consume_list: '消耗道具数'},
            echartUrl: '/api/stats/props/list_chart',
            tableUrl: '/api/stats/props/list',
            exportUrl: '/api/stats_export/props/list',
        },
        // 1 -> 消耗道具分布
        props_consume_distributed: {
            conf: "summ_prop-change_out",
            title: "消耗分布",
            formClass: ".form_prop-change",
            tableId: "table_summ",
            echart: 'echart_summ',
            echartType: 'pie',
            echartName: '道具变更',
            echartUrl: '/api/stats/props/consume_chart',
            tableUrl: '/api/stats/props/consume_scatter'
        },
        // 1 -> 产出道具分布
        props_output_distributed: {
            conf: "summ_prop-change_in",
            title: "产出分布",
            formClass: ".form_prop-change",
            tableId: "table_summ",
            echart: 'echart_summ',
            echartType: 'pie',
            echartName: '道具变更',
            echartUrl: '/api/stats/props/output_chart',
            tableUrl: '/api/stats/props/output_scatter'
        },
        // 7 -> 道具消耗详情
        props_consume_detail: {
            conf: "detail_prop-change_out",
            title: "消耗详情",
            tableId: "table_detail",
            tableUrl: '/api/stats/props/consume_detail',
            exportUrl: '/api/stats_export/props/consume_detail',
        },
        // 7 -> 道具产出详情
        props_output_detail: {
            conf: "detail_prop-change_in",
            title: "产出详情",
            tableId: "table_detail",
            tableUrl: '/api/stats/props/output_detail',
            exportUrl: '/api/stats_export/props/output_detail',
        },

        // 2 -> 道具库存
        'prop-stock': {
            formConf: "statistics_prop-stock_form",
            tableId: "table_prop-stock",
            formClass: ".form_prop-stock",
            tableUrl: '/api/stats/prop_stock/list',
            exportUrl: '/api/stats_export/prop_stock/list',
        },
        // 1 -> 道具库存分布
        props_stock_distributed: {
            conf: "summ_prop-stock",
            title: "分布情况",
            formClass: ".form_prop-stock",
            tableId: "table_detail",
            tableUrl: '/api/stats/prop_stock/scatter'
        },
        // 7 -> 道具库存详情
        props_stock_detail: {
            conf: "detail_prop-stock",
            title: "库存详情",
            formClass: ".form_prop-stock",
            tableId: "table_detail",
            tableUrl: '/api/stats/prop_stock/detail',
            exportUrl: '/api/stats_export/prop_stock/detail',
        },
        // 3 -> 商城购买
        'shop-buy': {
            formConf: "statistics_shop-buy_form",
            tableId: "table_shop-buy",
            formClass: ".form_shop-buy",
            echart: 'echart_shop-buy',
            echartType: 'pie',
            echartName: '商城购买',
            echartUrl: '/api/stats/shop_buy/list_chart',
            tableUrl: '/api/stats/shop_buy/list',
            exportUrl: '/api/stats_export/shop_buy/list',
        }
    };

    //  设置日期范围默认时间
    function setRangeTime(reportType) {
        let rangeTime;
        switch (reportType) {
            case 'week':
                rangeTime = admin.getRecentWeek(4);
                break;
            case 'month':
                rangeTime = admin.getRecentMonth(3);
                break;
            default:
                rangeTime = admin.getRecentDay(7);
                break;
        }

        $("input[name='select_time']").val(rangeTime);
    }

    // 加载数据,table与echart
    $.loadData = function (obj) {
        admin.initForms(obj.formConf, '#' + obj.formConf, true).then(function () {
            $('select[name="serverId"] option[value=""]').remove();
            $('select[name="dimension"] option[value=""]').remove();
            $('select[name="typeItemId"] option[value=""]').remove();
            $('select[name="typeId"] option[value=""]').remove();
            if ('.form_prop-stock' != obj.formClass)
                $('select[name="item_id"] option[value=""]').remove();
            if ('.form_shop-buy' == obj.formClass)
                $('select[name="type_item_id"] option[value=""]').remove();
            form.render('select');

            setRangeTime('day');


            if (obj.formConf === 'statistics_prop-change_form')
                props.renderSelector('propType', 'propId', true);
            else
                props.renderSelector('propType', 'propId', false);

            let params = admin.getFormParam(obj.formClass);
            // params.propType = '道具大类id_1';
            // params.propId = '道具id_1';
            admin.getCols(obj.formConf).then(function (data) {
                let headers = data.data;
                $.handleTable(obj, headers, params);
                if (obj.echart) {
                    $.echartData(obj, params);
                }
            });
        });
    };

    // 初始表格
    $.handleTable = function (obj, headers, params) {
        table.render({
            id: obj.tableId,
            elem: '#' + obj.tableId,
            url: admin.getUrl(obj.tableUrl),
            method: 'POST',
            where: params,          // 请求参数(额外)
            request: {
                pageName: 'page',  // 页码的参数名称，默认：page
                limitName: 'pageSize' // 每页数据量的参数名，默认：limit
            },
            parseData: function (res) {
                return {
                    "code": res.code,          // 解析接口状态
                    "msg": '',                // 解析提示文本
                    "count": res.data.total,  // 解析数据长度
                    "data": res.data.list
                };
            },
            page: true,
            loading: true,
            cols: headers
        });
    };

    // 重载table数据
    $.reload = function (tableId, params) {
        table.reload(tableId, {
            where: params,
            page: {
                curr: 1
            }
        });
    };

    // echart 处理入口
    $.echartData = function (obj, params) {
        layui.admin.req({
            url: admin.getUrl(obj.echartUrl),
            data: params,
            type: 'POST',
            success: function (res) {
                if (!res.data) {
                    return false;
                }

                if (obj.echartType === 'line') {
                    $.handleLineEchart(obj, res);
                } else if (obj.echartType === 'pie') {
                    $.handlePieEchart(obj, res);
                }
            }
        });
    };

    // 处理线性echart图
    $.handleLineEchart = function (obj, res) {

        let legend = [];
        let series = [];

        for (let key in obj.echartLegend) {
            legend.push(obj.echartLegend[key]);
            series.push({
                name: obj.echartLegend[key],
                type: 'line',
                data: res.data[key],
            });
        }

        let xData = res.data.date_list;

        $.lineEchart(obj, legend, xData, series);
    };

    // 线性图
    $.lineEchart = function (obj, legend, xData, series) {

        let myChart = echarts.init(document.getElementById(obj.echart));
        let option = {
            title: {
                text: obj.echartName
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: legend
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xData
            },
            yAxis: {
                type: 'value'
            },
            series: series
        };

        myChart.setOption(option);
    };

    // 处理饼图echart
    $.handlePieEchart = function (obj, res) {
        let series = [];
        let legend = [];
        res.data.list.forEach((v, i) => {
            legend.push(v.item_name);
            series.push({
                name: v.item_name,
                value: v.consume_sum,
            });
        });

        $.pieEchart(obj, legend, series);
    };

    // 饼图
    $.pieEchart = function (obj, legend, series) {
        let myChart = echarts.init(document.getElementById(obj.echart));
        let option = {
            legend: {                 // 图例
                orient: 'horizontal',   // 图例的布局，竖直    horizontal为水平
                x: 'center',            // 图例显示在右边
                y: 'bottom',
                data: legend,
            },
            series: [
                {
                    type: 'pie',
                    radius: ['50%', '75%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    labelLine: {
                        show: false
                    },
                    data: series,
                }
            ],
        };

        myChart.setOption(option);
    };

    // tab点击事件
    element.on('tab(docDemoTabBrief)', function (data) {
        for (let i = 0; i < $('.tabs').length; i++) {
            $('.tabs').eq(i).removeClass('layui-show');
        }
        $('.tabs').eq(data.index).addClass('layui-show');

        // 切换时候重载表格

        console.log($('.tabs').eq(data.index).data('tab'), $('.tabs').eq(data.index));
        let obj = item[$('.tabs').eq(data.index).data('tab')];
        $.loadData(obj);
    });

    // 事件集合
    let active = {
        search: search,
        reset: reset,
        exportData: exportData,
        distributed: distributed,
        detail: detail,
        stock: stock
    };

    // 事件绑定
    $(document).off('click', '.layui-btn').on('click', '.layui-btn', function () {
        if (!$(this).attr('data-obj')) {
            return;
        }

        let data = JSON.parse($(this).attr('data-obj'));
        let event = data.event;
        active[event] ? active[event].call(this, data) : '';
    });

    // 查询
    function search(data) {
        let params = admin.getFormParam(data.formClass);
        // params.propType = '道具大类id_1';
        // params.propId = '道具id_1';
        $.reload(data.tableId, params);

        let obj = item[data.itemId];
        if (obj.echart) {
            $.echartData(obj, params);
        }
    }

    // 重置
    function reset(data) {
        admin.resetForm(data.formClass);
        setRangeTime('day');
        let params = admin.getFormParam(data.formClass);
        $.reload(data.tableId, params);

        let obj = item[data.itemId];
        if (obj.echart)
            $.echartData(obj, params);
    }

    // 分布
    function distributed(data) {
        let obj = item[data.itemId];
        let params = admin.getFormParam(obj.formClass);
        let dimension = params.dimension ? params.dimension : 'day';

        let reqParam = {
            serverId: params.serverId,
            dimension: dimension,
            curTime: data.date.replace(new RegExp('/', 'g'), '')
        };

        let record = {curTime: data.date, dimension: dimension};
        if (params.serverId) {
            record.serverId = params.serverId;
        }

        if (/^props_.*/.test(data.itemId)) {    //道具分布
            // params.propType = '道具大类id_1';
            // params.propId = '道具id_1';
            reqParam.propType = params.propType;
            reqParam.propId = params.propId;
            record.propType = params.propType;
            record.propId = params.propId;
        }

        $('#record').val(JSON.stringify(record));

        admin.popup({
            title: obj.title
            , area: ['1050px', '750px']
            , id: 'popup-distributed'
            , shadeClose: true
            , success: function (layero, index) {
                layui.view(this.id).render('statistics/popup/consume/distributed', obj);

                admin.req({
                    url: admin.getUrl(obj.echartUrl),
                    data: reqParam,
                    type: 'POST',
                    success: function (res) {
                        if (!res.data) {
                            return false;
                        }

                        let series = [];
                        let legend = [];
                        for (var key in res.data.list) {
                            series.push({
                                name: res.data.list[key].res_name,
                                value: res.data.list[key].total_num,
                            });
                            legend.push(res.data.list[key].res_name);
                        }

                        $.pieEchart(obj, legend, series);
                    }
                });

                admin.getCols(obj.conf).then(function (r) {
                    let headers = r.data;
                    table.render({
                        id: 'table_summ',
                        elem: '#table_summ',
                        url: admin.getUrl(obj.tableUrl),
                        method: 'POST',
                        where: reqParam,
                        request: {
                            pageName: 'page',  // 页码的参数名称，默认：page
                            limitName: 'pageSize' // 每页数据量的参数名，默认：limit
                        },
                        parseData: function (res) {
                            return {
                                "code": 0,              // 解析接口状态
                                "msg": '',             // 解析提示文本
                                "data": res.data.list,
                                "count": res.data.total
                            };
                        },
                        loading: true,
                        page: true,
                        cols: headers
                    });
                });
            }
        });
    }

    // 详细
    function detail(data) {
        let record = JSON.parse($('#record').val());
        let obj = item[data.itemId];

        record['resId'] = data.id;
        record['resName'] = data.name;
        admin.popup({
            title: obj.title
            , area: ['1050px', '750px']
            , id: 'popup-consume-detail'
            , shadeClose: true
            , success: function (layero, index) {
                layui.view(this.id).render('statistics/popup/consume/detail', obj);
                admin.getCols(obj.conf).then(function (r) {
                    let headers = r.data;
                    table.render({
                        id: obj.tableId,
                        elem: '#' + obj.tableId,
                        url: admin.getUrl(obj.tableUrl),
                        method: 'POST',
                        where: record,              // 请求参数(额外)
                        request: {  // 请求参数(额外)
                            pageName: 'page',  // 页码的参数名称，默认：page
                            limitName: 'pageSize' // 每页数据量的参数名，默认：limit
                        },
                        parseData: function (res) {
                            return {
                                "code": 0,              // 解析接口状态
                                "msg": '',             // 解析提示文本
                                "data": res.data.list,
                                'count': res.data.total
                            };
                        },
                        page: true,
                        loading: true,
                        cols: headers
                    });

                    // 导出事件绑定
                    $('#export-detail').off('click').on('click', function () {
                        admin.download({
                            url: obj.exportUrl,
                            data: record,
                            method: 'post',
                            dataType: 'json'
                        });
                    });
                });
            }
        });
    }

    //道具库存弹窗
    function stock(data) {
        let obj = item[data.itemId];
        let params = admin.getFormParam(obj.formClass);
        let reqParam = {
            propType: data.prop_type,
            propId: data.prop_id,
        };

        if (params.serverId) {
            reqParam.serverId = params.serverId;
        }

        admin.popup({
            title: obj.title
            , area: ['1050px', '750px']
            , id: 'popup-sotck'
            , shadeClose: true
            , success: function (layero, index) {
                layui.view(this.id).render('statistics/popup/consume/stock_detail', obj);
                admin.getCols(obj.conf).then(function (r) {
                    let headers = r.data;
                    table.render({
                        id: 'table_detail',
                        elem: '#table_detail',
                        url: admin.getUrl(obj.tableUrl),
                        method: 'POST',
                        where: reqParam,              // 请求参数(额外)
                        request: {  // 请求参数(额外)
                            pageName: 'page',  // 页码的参数名称，默认：page
                            limitName: 'pageSize' // 每页数据量的参数名，默认：limit
                        },
                        parseData: function (res) {
                            return {
                                "code": 0,              // 解析接口状态
                                "msg": '',             // 解析提示文本
                                "data": res.data.list,
                                "count": res.data.total,
                            };
                        },
                        page: true,
                        loading: true,
                        cols: headers
                    });

                    if (obj.exportUrl) {
                        $('#export-block').show();
                        // 导出事件绑定
                        $('#export-detail').off('click').on('click', function () {
                            admin.download({
                                url: obj.exportUrl,
                                data: reqParam,
                                method: 'POST',
                                dataType: 'json'
                            });
                        });
                    }

                });
            }
        });
    }

    form.on('select(dimension)', function (data) {
        setRangeTime(data.value);
    });

    // excel导出
    function exportData(obj) {
        let export_url = admin.getUrl(item[obj.itemId]['exportUrl']);
        let params = admin.getFormParam(obj.formClass);
        // params.propType = '道具大类id_1';
        // params.propId = '道具id_1';
        layui.admin.download({
            url: export_url,
            data: params,
            method: 'post',
            dataType: 'json'
        });
    }

    // 初始数据
    var firstTab = $('.tabs').eq(0).data('tab');
    $.loadData(item[firstTab]);

    exports('statistics/consume', {})
});
