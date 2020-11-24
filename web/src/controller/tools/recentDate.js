layui.define(function (exports) {

    let admin = layui.admin;

    admin.doHandleDate = function(dateStr){
        if(dateStr.toString().length == 1){
            return "0" + dateStr;
        }else {
            return dateStr;
        }
    }

    //  获取当前日期
    admin.getCurrentDate = function()
    {
        let now  = new Date();

        let year = now.getFullYear(),
            month = admin.doHandleDate(now.getMonth()+1),
            day = admin.doHandleDate(now.getDate());

        return year + '-' + month + '-' + day;
    }

    //  近几天
    admin.getRecentDay = function(days){
        let now = new Date(),
            beforeDate = new Date(now.getTime()-86400000*days),
            beforeYear = beforeDate.getFullYear(),
            beforeMonth = admin.doHandleDate(beforeDate.getMonth()+1),
            beforeDay = admin.doHandleDate(beforeDate.getDate()),
            afterDate = new Date(now.getTime()-86400000*1),
            afterYear = afterDate.getFullYear(),
            afterMonth = admin.doHandleDate(afterDate.getMonth()+1),
            afterDay = admin.doHandleDate(afterDate.getDate());

        return  beforeYear + "-" + beforeMonth +"-" + beforeDay + ' - ' + afterYear + "-" + afterMonth +"-" + afterDay;
    }

    //  近几周
    admin.getRecentWeek = function(weeks){
        let now = new Date(),
            week = now.getDay() == 0 ? 7 : now.getDay(),
            mondayTime = now.getTime() - (week - 1) * 86400000,  // 当前周周一
            beforeDate = new Date(mondayTime - 86400000*7*weeks),
            beforeYear = beforeDate.getFullYear(),
            beforeMonth = admin.doHandleDate(beforeDate.getMonth()+1),
            beforeDay = admin.doHandleDate(beforeDate.getDate()),
            afterDate = new Date(mondayTime - 86400000*1),
            afterYear = afterDate.getFullYear(),
            afterMonth = admin.doHandleDate(afterDate.getMonth()+1),
            afterDay = admin.doHandleDate(afterDate.getDate());

        return  beforeYear + "-" + beforeMonth +"-" + beforeDay + ' - ' + afterYear + "-" + afterMonth +"-" + afterDay;
    }

    //  近几月
    admin.getRecentMonth = function(months){
        let now = new Date();
        let m= now.getMonth()+1;
        let yNum = 0, mNum = 0;
        if(months%12 == 0){
            yNum = months/12;
        }else{
            yNum = parseInt(months/12);
            mNum = months%12;
        }

       let beforeYear = now.getFullYear() - yNum;
       let beforeMonth = admin.doHandleDate(m-mNum);
       let beforeDay = '01';
       now.setDate(1);
       let oneTime = now.getTime();  // 当前月1号
       let afterDate = new Date(oneTime - 86400000*1);
       let afterYear = afterDate.getFullYear();
       let afterMonth = admin.doHandleDate(afterDate.getMonth()+1);
       let afterDay = admin.doHandleDate(afterDate.getDate());

        return  beforeYear + "-" + beforeMonth +"-" + beforeDay + ' - ' + afterYear + "-" + afterMonth +"-" + afterDay;
    }


    exports('tools/recentDate', {});
});
