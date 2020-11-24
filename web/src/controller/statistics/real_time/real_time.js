layui.define(['admin', 'form', 'laydate', 'common', 'echarts', 'table'], function (exports) {

        let admin = layui.admin,
            form = layui.form,
            laydate = layui.laydate,
            echarts = layui.echarts,
            $ = layui.jquery,
            table = layui.table,
            upIcon = '▲',
            downIcon = '▼',
            chart_type = 1, // 1 昨日收入 2 昨日充值玩家 3 昨日活跃 4 昨日新增玩家
            cur_day = 1, // 1 昨日 2 今日
            myChart = echarts.init(document.getElementById('monitorChart')),   // 初始化
            dateArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        const yesterdayChartOption = {
            name: '昨日',
            type: 'line',
            // stack: '总量',
            data: dateArr
        };
        const todayChartOption = {
            name: '今日',
            type: 'line',
            // stack: '总量',
            data: dateArr
        };

        function getDayChartOption() {
            if(cur_day == 1){
                return yesterdayChartOption;
            }else {
                return todayChartOption;
            }
        }
        const avgChartOption = {
            name: '前三天平均',
            type: 'line',
            // stack: '总量',
            data: dateArr
        };
        const extChartOption = {
            name: '额外对比',
            type: 'line',
            // stack: '总量',
            data: dateArr
        };
        let legendData = ['昨日', '前三天平均'],
            legendTodayData = ['今日', '前三天平均'],
            legendExtData = ['昨日', '前三天平均', '额外对比'],
            legendTodayExtData = ['今日', '前三天平均', '额外对比'];

        function getLegendData() {
            if(cur_day == 1){
                return legendData;
            }else {
                return legendTodayData;
            }
        }
        function getLegendExtData() {
            if(cur_day == 1){
                return legendExtData;
            }else{
                return legendTodayExtData;
            }
        }

        const chartOption = {
            title: {
                text: '昨日收入'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['昨日', '前三天平均']
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
                data: ['00:00:00', '01:00:00', '02:00:00', '03:00:00', '04:00:00', '05:00:00', '06:00:00', '07:00:00', '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00',
                    '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00', '21:00:00', '22:00:00', '23:00:00']
            },
            yAxis: {
                type: 'value'
            },
            series: [yesterdayChartOption, avgChartOption]
        };

        let hourInfoCols = [[
            {field: 'name', title: '收入', fixed: 'left',width:'7%'},
            {field: '00', title: '00:00:00', align: 'center', width:'100'},
            {field: '01', title: '01:00:00', align: 'center', width:'100'},
            {field: '02', title: '02:00:00', align: 'center', width:'100'},
            {field: '03', title: '03:00:00', align: 'center', width:'100'},
            {field: '04', title: '04:00:00', align: 'center', width:'100'},
            {field: '05', title: '05:00:00', align: 'center', width:'100'},
            {field: '06', title: '06:00:00', align: 'center', width:'100'},
            {field: '07', title: '07:00:00', align: 'center', width:'100'},
            {field: '08', title: '08:00:00', align: 'center', width:'100'},
            {field: '09', title: '09:00:00', align: 'center', width:'100'},
            {field: '10', title: '10:00:00', align: 'center', width:'100'},
            {field: '11', title: '11:00:00', align: 'center', width:'100'},
            {field: '12', title: '12:00:00', align: 'center', width:'100'},
            {field: '13', title: '13:00:00', align: 'center', width:'100'},
            {field: '14', title: '14:00:00', align: 'center', width:'100'},
            {field: '15', title: '15:00:00', align: 'center', width:'100'},
            {field: '16', title: '16:00:00', align: 'center', width:'100'},
            {field: '17', title: '17:00:00', align: 'center', width:'100'},
            {field: '18', title: '18:00:00', align: 'center', width:'100'},
            {field: '19', title: '19:00:00', align: 'center', width:'100'},
            {field: '20', title: '20:00:00', align: 'center', width:'100'},
            {field: '21', title: '21:00:00', align: 'center', width:'100'},
            {field: '22', title: '22:00:00', align: 'center', width:'100'},
            {field: '23', title: '23:00:00', align: 'center', width:'100'},
        ]];

        function initHourInfoTable(data)
        {
            switch (parseInt(chart_type)) {
                case 1:
                    hourInfoCols[0][0]['title'] = cur_day == 1 ? '昨日收入' : '今日收入';
                    break;
                case 2:
                    hourInfoCols[0][0]['title'] = cur_day == 1 ? '昨日充值玩家' : '今日充值玩家';
                    break;
                case 3:
                    hourInfoCols[0][0]['title'] = cur_day == 1 ? '昨日活跃' : '今日活跃';
                    break;
                case 4:
                    hourInfoCols[0][0]['title'] = cur_day == 1 ? '昨日新增玩家' : '今日新增玩家';
                    break;
            }
            let dataList = [];
            let i = 0;
            if(Object.keys(data.now).length>0){
                dataList[i++] = $.extend({name:cur_day==1?'昨日':'今日'}, data.now);
            }
            if(Object.keys(data.avg).length>0){
                dataList[i++] = $.extend({name:'前三天平均'}, data.avg);
            }
            if(Object.keys(data.ext).length>0){
                dataList[i++] = $.extend({name:'额外对比'}, data.ext);
            }
            table.render({
                id: 'hour_info_table',
                elem: '#hour_info_table',
                data: dataList,
                page: false,
                loading: true,
                cols: hourInfoCols,
            });
        }

        //  额外日期
        laydate.render({
            elem: '#extraDate',
            type: 'date',
            trigger: 'click',
            done:function (value, date) {
                if(Object.keys(date).length == 0){
                    chartOption.series = [getDayChartOption(), avgChartOption];
                    chartOption.legend.data = getLegendData();
                    myChart.setOption(chartOption, true);
                }else {
                    let param = admin.getFormParam('.real_time_data_search');
                    initChart(param);
                }
            }
        });

        // 渲染数据
        let initMonitor = function () {
            let param = admin.getFormParam('.real_time_data_search');
            admin.req({
                url: admin.getUrl('/api/stat/monitor'),
                method: 'get',
                data: {
                    server_id:param.server_id != ''? param.server_id : 0,
                    source_id:param.source_id != '' ? param.source_id : 0,
                    sample_type:param.sample_type != '' ? param.sample_type : 0,
                    cur_day:cur_day,
                },
                dataType: 'json',
                done: function (res) {
                    if(Object.keys(res.data).length > 0){
                        let stat = res.data;

                        //  本月收入
                        $("#monthIncome").text(stat.incomeMonth.number);
                        $("#monthIncomeRate").text(showRate('#monthIncomeRate', stat.incomeMonth.rate));
                        $("#historyTotal").text(stat.incomeMonth.history_total);

                        //  昨日收入
                        $("#dayIncome").text(stat.incomeDay.number);
                        $("#dayIncomeRate").text(showRate('#dayIncomeRate', stat.incomeDay.rate));
                        $("#dayArpu").text(stat.incomeDay.arpu);
                        $("#dayArppu").text(stat.incomeDay.arppu);

                        //  昨日充值玩家
                        $("#rechargePlayer").text(stat.rechargeUserDay.number);
                        $("#rechargePlayerRate").text(showRate('#rechargePlayerRate', stat.rechargeUserDay.rate));
                        $("#rechargeNum").text(stat.rechargeUserDay.recharge_num);
                        $("#rechargeAvgNum").text(stat.rechargeUserDay.avg_recharge_num);
                        $("#activeRechargeRate").text(stat.rechargeUserDay.active_recharge_rate + "%");

                        //  昨日活跃
                        $("#activeUserNum").text(stat.activeUserDay.number);
                        $("#activeUserRate").text(showRate('#activeUserRate', stat.activeUserDay.rate));
                        $("#onlineMax").text(stat.activeUserDay.online_num);

                        //  昨日新增玩家
                        $("#newUserNum").text(stat.newUserDay.number);
                        $("#newUserRate").text(showRate('#newUserRate', stat.newUserDay.rate));
                        $("#monthNewUser").text(stat.newUserDay.add_user);
                        $("#userTwoRemain").text(stat.newUserDay.two_remain_rate + "%");
                    }
                },
            });

            //  切换标题
            changeCurDayTitle();
            //  渲染折线图
            initChart(param);
        };

        function initChart(param) {
            admin.req({
                url: admin.getUrl('/api/stat/hour_info'),
                method: 'get',
                data: {
                    server_id:param.server_id != ''? param.server_id : 0,
                    source_id:param.source_id != '' ? param.source_id : 0,
                    sample_type:param.sample_type != '' ? param.sample_type : 0,
                    cur_day:cur_day,
                    chart_type:chart_type,
                    ext_date:$("#extraDate").val(),
                },
                dataType: 'json',
                done: function (res) {
                    if(Object.keys(res.data).length == 0){
                        return;
                    }
                    initHourInfoTable(res.data);
                    let tempNowArr = [], tempAvgArr = [], tempExtArr = [];
                    $.each(dateArr, function (index, value) {
                        let tempHour = (index+'').padStart(2,'0');
                        //  昨日、今日
                        if(res.data.now[tempHour] != undefined){
                            tempNowArr.push(res.data.now[tempHour]);
                        }else{
                            tempNowArr.push(value);
                        }
                        //  前三天平均
                        if(res.data.avg[tempHour] != undefined){
                            tempAvgArr.push(res.data.avg[tempHour]);
                        }else{
                            tempAvgArr.push(value);
                        }
                        //  额外对比
                        if(res.data.ext[tempHour] != undefined){
                            tempExtArr.push(res.data.ext[tempHour]);
                        }else{
                            tempExtArr.push(value);
                        }
                    });

                    let dayChartOption = getDayChartOption();
                    dayChartOption.data = tempNowArr;
                    avgChartOption.data = tempAvgArr;
                    chartOption.series = [dayChartOption, avgChartOption];
                    chartOption.legend.data = getLegendData();
                    if(this.data.ext_date != ''){
                        extChartOption.data = tempExtArr;
                        chartOption.series.push(extChartOption);
                        chartOption.legend.data = getLegendExtData();
                    }
                    chartOption.title.text = showChartTitle();
                    myChart.setOption(chartOption, true);
                }
            });
        }

        //  折线图标题
        function showChartTitle() {
            switch (parseInt(chart_type)) {
                case 1:
                    return cur_day == 1 ? '昨日收入' : '今日收入';
                case 2:
                    return cur_day == 1 ? '昨日充值玩家' : '今日充值玩家';
                case 3:
                    return cur_day == 1 ? '昨日活跃' : '今日活跃';
                case 4:
                    return cur_day == 1 ? '昨日新增玩家' : '今日新增玩家';
            }
        }

        //  显示比率
        function showRate(target, rate)
        {
            if(rate > 0){
                $(target).removeClass("layui-bg-gray");
                $(target).addClass("layui-bg-green");
                return upIcon + rate + "%";
            }else if(rate < 0){
                $(target).removeClass("layui-bg-gray");
                $(target).removeClass("layui-bg-green");
                return downIcon + (0 - rate)  + "%";
            }
            $(target).removeClass("layui-bg-green");
            $(target).addClass("layui-bg-gray");
            return "--";
        }

        //  切换标题
        function changeCurDayTitle()
        {
            if(cur_day == 1){
                $("#monthIncomeRate").show();
                $("#userTwoRemainItem").show();

                $("#incomeTitle").text("昨日收入");
                $("#rechargePlayerTitle").text("昨日充值玩家");
                $("#activeTitle").text("昨日活跃");
                $("#newUserTitle").text("昨日新增玩家");
                $("#activeUserTitle").text("昨日最高在线");
            }else {
                $("#monthIncomeRate").hide();
                $("#userTwoRemainItem").hide();

                $("#incomeTitle").text("今日收入");
                $("#rechargePlayerTitle").text("今日充值玩家");
                $("#activeTitle").text("今日活跃");
                $("#newUserTitle").text("今日新增玩家");
                $("#activeUserTitle").text("今日最高在线");
            }
        }

        // 渲染搜索框
        admin.initForms('statistics_real_time_data_search', '#real_time_data_search').then(function () {
            $("select[name='sample_type'] option[value='']").remove();
            form.render('select');
            initMonitor();
        });

        // 切换统计类型
        $('.number_show').click(function () {
            $('.number_show').addClass('underline');
            $(this).removeClass('underline');
            chart_type = $(this).data('type');
            let param = admin.getFormParam('.real_time_data_search');
            initChart(param);
        })

        // 切换 昨日统计 or 今日实时
        $('.yesterday_or_now').click(function () {
            $('.yesterday_or_now').addClass('layui-btn-primary');
            $(this).removeClass('layui-btn-primary');
            cur_day = $(this).data('type');
            initMonitor();
        })

        $('#search-btn').click(function () {
            initMonitor();
        })

        //  标注信息
        $(".statHelp").on('click', function () {
            let type = parseInt($(this).data('type'));
            let helpTitle = '', helpContent = '';
            switch (type) {
                case 0:
                    if(cur_day == 1){
                        helpTitle = '本月收入';
                        helpContent = '本月收入：本月（按查询时的实际月份）1号到昨天的总收入<br/>' +
                            '历史总计收入：从开服开始到昨天的总收入<br/>' +
                            '月收入对比：本月1号到昨天的总收入，对比上月同期（相同天数）的总收入涨跌情况。月收入对比=（本月收入-上月同期收入）/上月同期收入';
                    }else {
                        helpTitle = '本月收入';
                        helpContent = '本月收入：本月（按查询时的实际月份）1号到当前的总收入<br/>' +
                            '历史总计收入：从开服开始到当前的总收入<br/>' +
                            '月收入对比：此时本月收入天数不完整，情况特殊，不进行计算。';
                    }
                    break;
                case 1:
                    if(cur_day == 1){
                        helpTitle = '昨日收入';
                        helpContent = '昨日收入：昨日整天的总收入<br/>' +
                            '昨日ARPU：昨日收入/昨日活跃数<br/>' +
                            '昨日ARPPU：昨日收入/昨日充值玩家数<br/>' +
                            '日收入对比=（昨日收入-前天收入）/前天收入';
                    }else {
                        helpTitle = '今日收入';
                        helpContent = '今日收入：今日整天的总收入（从当天0点起，到查询时为止的收入）<br/>' +
                            '今日ARPU：今日收入/今日登录过游戏的玩家数<br/>' +
                            '今日ARPPU：今日收入/今日充值玩家数<br/>' +
                            '日收入对比=（今日收入-昨日同期收入）/昨日同期收入';
                    }
                    break;
                case 2:
                    if(cur_day == 1){
                        helpTitle = '昨日充值玩家';
                        helpContent = '昨日充值玩家数：昨日进行过充值的玩家数<br/>' +
                            '昨日充值次数：昨日充值笔数<br/>' +
                            '昨日人均充值次数=昨日充值次数/昨日充值玩家数<br/>' +
                            '昨日付费率=昨日充值玩家数/昨日活跃玩家数<br/>' +
                            '日充值玩家数对比=（昨日充值玩家数-前天充值玩家数）/前天充值玩家数';
                    }else {
                        helpTitle = '今日充值玩家';
                        helpContent = '今日充值玩家数：今日进行过充值的玩家数<br/>' +
                            '今日充值次数：今日充值笔数<br/>' +
                            '今日人均充值次数=今日充值次数/今日充值玩家数<br/>' +
                            '今日付费率=今日充值玩家数/今日活跃玩家数<br/>' +
                            '日充值玩家数对比=（今日充值玩家数-昨日同期充值玩家数）/昨日同期充值玩家数';
                    }
                    break;
                case 3:
                    if(cur_day == 1){
                        helpTitle = '昨日活跃';
                        helpContent = '昨日活跃数：昨日登录过游戏的玩家数<br/>' +
                            '昨日最高在线：昨日最高同时在线的玩家数<br/>' +
                            '日活跃数对比=（昨日活跃数-前天活跃数）/前天活跃数';
                    }else {
                        helpTitle = '今日活跃';
                        helpContent = '今日活跃数：今日登录过游戏的玩家数<br/>' +
                            '今日最高在线：今日最高同时在线的玩家数<br/>' +
                            '日活跃数对比=（今日活跃数-昨日同期活跃数）/昨日同期活跃数';
                    }
                    break;
                case 4:
                    if(cur_day == 1){
                        helpTitle = '昨日新增玩家';
                        helpContent = '昨日新增玩家数：昨日新激活的设备（或新创建的角色数）<br/>' +
                            '次日留存率：昨日新增玩家在今日的留存率<br/>' +
                            '本月新增玩家数：本月1号起到昨天新激活的设备/新创建的角色数<br/>' +
                            '日新增数对比=（昨日新增数-前天新增数）/前天新增数';
                    }else {
                        helpTitle = '今日新增玩家';
                        helpContent = '今日新增玩家数：今日新激活的设备（或新创建的角色数）<br/>' +
                            '本月新增玩家数：本月1号起到当前新激活的设备/新创建的角色数<br/>' +
                            '日新增数对比=（今日新增数-昨日同期新增数）/昨日同期新增数';
                    }
                    break;
            }

            layer.open({
                title: helpTitle,
                content: helpContent,
                area: ['auto', 'auto'],
                shadeClose: true,
            });
        });


        exports('statistics/real_time/real_time', {});
});
