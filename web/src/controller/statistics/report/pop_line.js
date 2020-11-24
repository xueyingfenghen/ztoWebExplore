layui.define(['common', 'echarts'], function (exports) {


    let $ = layui.jquery,
        echarts = layui.echarts,
        tableData = window.chartReportData,
        field = window.fieldParams.field,
        fieldName = window.fieldParams.fieldName;


    let xAxisData = [],
        seriesData = [];
    let axisLabel = {
        formatter: '{value}'
    };
    let tooltipObj = {
        trigger: 'axis',
    };
    let showPercent = false;

    if(tableData[0]){
        let itemStr = tableData[0][field].toString()
        let strLen = itemStr.length;
        if(itemStr[strLen-1] == '%'){
            axisLabel = {
                formatter: '{value} %'
            };
            showPercent = true;
            tooltipObj = {
                trigger: 'axis',
                formatter: function( axisData ) {
                    return  axisData[0].name + '</br>' + axisData[0].seriesName + ' : ' + axisData[0].data + '%</br>';
                }
            }
        }else {
            axisLabel = {
                formatter: '{value}'
            };
            tooltipObj = {
                trigger: 'axis',
            }
        }
    }

    $.each(tableData, function (index, item) {
        xAxisData.push(item['day']);
        let itemStr = item[field].toString()
        if(showPercent){
            seriesData.push(itemStr.replace('%',''));
        }else {
            seriesData.push(itemStr);
        }
    });



    // xAxisData = xAxisData.reverse();
    // seriesData = seriesData.reverse();


    let myChart = echarts.init(document.getElementById('echarts_div'));   // 初始化
    let option = {
        title: {
            text: fieldName + '趋势'
        },
        tooltip: tooltipObj,
        legend: {
            data: [fieldName]
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
            data: xAxisData,
        },
        yAxis: {
            type: 'value',
            axisLabel: axisLabel,
        },
        series: [
            {
                name: fieldName,
                type: 'line',
                data: seriesData,
            }
        ]
    };

    myChart.setOption(option);

    exports('statistics/report/pop_line', {});
});
