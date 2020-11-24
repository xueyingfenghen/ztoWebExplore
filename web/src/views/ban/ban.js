//读取字典配置封禁类型  复选框的
var $ = layui.$;
 function loadBanType(){
    layui.admin.req({
        url:layui.admin.getUrl('/api/dict'),
        method: 'post',
        data: {type:'BanType'},
        dataType: 'json',
        done: function (res) {
            var data = res.data.list;
            if(data.length > 0){
                var str = '<input  type="checkbox"  lay-skin="primary" title="全选" lay-filter="ban_allChoose" id="ban_allChoose">';
                $.each(data,function (i,items) {
                    if(items.value == 1 || items.name == '禁言') return true;
                    var dict_id = items.dict_id
                        ,name = items.name;
                    str += "<input  type=\"checkbox\" name=\"ban_type[]\" lay-skin=\"primary\" title=\""+name+"\" value=\""+dict_id+"\" lay-filter=\"ban_single\" class=\"ban_single\">";
                })
                $(".ban_type").empty();
                $(".ban_type").append(str);
                layui.form.render();
            }
        }
    });
};

//读取字典配置封禁类型 下拉框的
function loadBanTypeDrop(){
    layui.admin.req({
        url:layui.admin.getUrl('/api/dict'),
        method: 'post',
        data: {type:'BanType'},
        dataType: 'json',
        done: function (res) {
            var data = res.data.list;
            if(data.length > 0){
                var str = '<option value="">请选择</option>';
                $.each(data,function (i,items) {
                    var dict_id = items.dict_id
                        ,name = items.name;
                    str += "<option value="+dict_id+">"+name+"</option>";
                })
                $("select[name=ban_type]").append(str);
                layui.form.render();
            }
        }
    });
};

//读取字典配置封禁理由
 function loadBanReason(reason = 'BanReason'){
    layui.admin.req({
        url:layui.admin.getUrl('/api/dict'),
        method: 'post',
        data: {type: reason},
        dataType: 'json',
        done: function (res) {
            var data = res.data.list;
            if(data.length > 0){
                var str = '<option value="">请选择</option>';
                $.each(data,function (i,items) {
                    var dict_id = items.dict_id
                        ,name = items.name;
                    str += "<option value="+dict_id+">"+name+"</option>";
                })
                $("select[name=ban_reason]").empty();
                $("select[name=ban_reason]").append(str);
                layui.form.render();
            }
        }
    });
};

//读取字典配置解禁理由
function loadRelieveReason(){
    layui.admin.req({
        url:layui.admin.getUrl('/api/dict'),
        method: 'post',
        data: {type:'RelieveReason'},
        dataType: 'json',
        done: function (res) {
            var data = res.data.list;
            if(data.length > 0){
                var str = '<option value="">请选择</option>';
                $.each(data,function (i,items) {
                    var dict_id = items.dict_id
                        ,name = items.name;
                    str += "<option value="+dict_id+">"+name+"</option>";
                })
                $("select[name=relieve_reason]").empty();
                $("select[name=relieve_reason]").append(str);
                layui.form.render();
            }
        }
    });
};

//后台操作人 下拉框
function loadUser(user = 'user'){
    var select = "select[name="+user+"]";
    layui.admin.req({
        url:layui.admin.getUrl('/api/get/user'),
        method: 'get',
        data: {},
        dataType: 'json',
        done: function (res) {
            var data = res.data.list;
            if(data.length > 0){
                var str = '<option value="">请选择</option>';
                $.each(data,function (i,items) {
                    var id = items.id
                        ,name = items.nick_name;
                    str += "<option value="+id+">"+name+"</option>";
                })
                $(select).append(str);
                layui.form.render();
            }
        }
    });
};
// loadBanType();
// loadBanReason();
