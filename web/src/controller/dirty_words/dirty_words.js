/**
 * 建议优化
 * */

layui.define(['admin', 'laytpl', 'upload', 'laypage', 'element'], function (exports) {


    let admin = layui.admin,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        upload = layui.upload,
        element = layui.element;


    let header = layui.setter.header;
    let headers = {};
    if (header.tokenName) {
        headers[header.tokenName] = layui.data(layui.setter.tableName)[header.tokenName] || '';
    }



    /**
     * data-id : data-type
     * */
    const DATA_TYPE = {
      'sensitive-words': 0,
      'block-words':1,
      'sensitive-words-search': 0,
      'block-words-search':1,
    }

    let page=1,
        pageSize = 50,
        wordType = 0,
        searchWord = "",
        onlySearch = 0,
        hideBox = false;



    let showWordHtml = function(tabId){
        if (tabId === 'sensitive-words-search' || tabId === 'block-words-search'){
            $("#word-add").hide();
            $(".wordList").hide();
            $(".word-btn").hide();
            $(".totalWordList").show();
            // wordType = 0;
            onlySearch = 1;
            $(".word-search-tab").removeClass("layui-this");
            $(".word-search-tab:first").addClass("layui-this");
        }else {

            onlySearch = 0;
            $("#word-add").show();
            $(".wordList").show();
            $(".word-btn").show();
            $(".totalWordList").hide();
            hideBox = false;
        }
        if(wordType == 0){
        //   $("#word-title").html("敏感词");
          $("#word-label").html("敏感词");
          $("#searchWord").attr('placeholder','请输入敏感词');
        }else {
        //   $("#word-title").html("聊天屏蔽词");
          $("#word-label").html("屏蔽词");
          $("#searchWord").attr('placeholder','请输入屏蔽词');
        }
    }


    let initWordsPage = function(){

        admin.req({
            url: admin.getUrl('/api/dirty_words/index'),
            data: {
                type: wordType,
                word: searchWord,
                page:page,
                page_size: pageSize,
                only_search:onlySearch,
            },
            type: 'get',
            done: function (res) {

                let listWordTpl = document.getElementById("listWord").innerHTML;
                let word_list = document.getElementById("word-list");


                laytpl(listWordTpl).render({
                    data:res.data.list,
                    hideBox:hideBox,
                },function (html) {
                    word_list.innerHTML = html;
                })

                layui.laypage.render({
                    elem: 'word-page',
                    count: res.data.total, //数据总数，从服务端得到
                    limit: pageSize,
                    curr: page,
                    limits: [50, 100, 150, 200, 500, 1000],
                    layout: ['prev', 'page', 'next', 'skip', 'count', 'limit']
                    , prev: '<i class="layui-icon">&#xe603;</i>'
                    , next: '<i class="layui-icon">&#xe602;</i>'
                    , jump: function (obj, first) {
                        page = obj.curr;
                        pageSize = obj.limit;

                        wordBoxChecked = false;

                        if (!first) {
                            initWordsPage();
                        }
                    }
                });
            }
        });

    };



    let permissions = layui.sessionData(layui.setter.tableName)['permissions'];

    //  根据权限动态渲染页面
    let initPermission = function(){
        let showAddForm = false;
        let showSearchForm = false;
        let isPermission = false;

        if(permissions["sensitive-words"] != undefined){
            /*$("#top-card").find(".layui-tab-title").append('<li class="word-tab" data-type="0">敏感词库<i class="layui-icon layui-icon-help word-help"></i></li>');
            $("#top-card").find(".layui-tab-content").append('<div class="layui-tab-item">' +
                '            <h2 class="word-title-add">新增敏感词库</h2>' +
                '            </div>');*/
            showAddForm = true;
            showSearchForm = true;
            isPermission = true;
        }

        if(permissions["block-words"] != undefined){
            /*$("#top-card").find(".layui-tab-title").append('<li class="word-tab" data-type="1">聊天屏蔽词库<i class="layui-icon layui-icon-help word-help"></i></li>');
            $("#top-card").find(".layui-tab-content").append('<div class="layui-tab-item">' +
                '            <h2 class="word-title-add">新增屏蔽词库</h2>' +
                '            </div>');*/
            showAddForm = true;
            showSearchForm = true;
            isPermission = true;
        }

        if(showAddForm){
            $("#top-card").find(".layui-tab-content").append('<div id="word-add">' +
                '                <form class="layui-form layui-form-pane addSensitiveWordForm">' +
                '                <div class="layui-form-item">' +
                '                <div class="layui-inline" style="width: 80%;">' +
                '                <input type="text" name="word" class="layui-input" id="wordValue" placeholder="新增多个，以英文逗号隔开" />' +
                '                </div>' +
                '                <div class="layui-inline">' +
                '                <button type="button" class="layui-btn layui-btn-theme" id="addWordBtn">添加</button>' +
                '                </div>' +
                '                </div>' +
                '                <div class="layui-form-item">' +
                '                <button type="button" class="layui-btn layui-btn-primary" id="importWordsBtn" data-type="0"><i class="layui-icon layui-icon-right"></i>导入数据</button>' +
                '<div class="layui-upload" style="display: none;"><br>' +
                '    <button type="button" class="layui-btn layui-btn-normal" id="importList"><i class="layui-icon layui-icon-upload-drag" style="position: relative;top: 3px;"></i>选择文件</button>' +
                '    <div class="layui-upload-list">' +
                '        <table class="layui-table">' +
                '            <thead>' +
                '            <tr><th>文件名</th>' +
                '                <th>大小</th>' +
                '                <th>进度</th>' +
                '                <th>状态</th>' +
                '                <th>操作</th>' +
                '            </tr></thead>' +
                '            <tbody id="wordFileList">' +
                '            </tbody>' +
                '        </table>' +
                '    </div>' +
                '    <button type="button" class="layui-btn layui-btn-primary" id="wordUploadDelete"><i class="layui-icon layui-icon-delete"></i>清除所有</button>' +
                '</div>' +
                '            </div>' +
                '            </form>' +
                '            </div>');

            $("#sub-card").find(".layui-card-body").append('<div class="wordList">' +
                // '                <div class="layui-card-header" id="word-title">敏感词库</div>' +
                '            </div>');


        }

        if(!!permissions["sensitive-words-search"]){
            /*$("#top-card").find(".layui-tab-title").append('<li class="word-tab" data-type="-1">游戏聊天词库查询<i class="layui-icon layui-icon-help word-help"></i></li>');
            $("#top-card").find(".layui-tab-content").append('<div class="layui-tab-item"></div>');*/

            /*$("#sub-card").find(".layui-card-body").append('<div class="totalWordList" style="display: none;">' +
                '                <div class="layui-tab layui-tab-brief" lay-filter="subWord">' +
                '                    <ul class="layui-tab-title">' +
                '                        <li class="layui-this word-search-tab" data-type="0">敏感词库查询</li>' +
                '                        <li class="word-search-tab" data-type="1">聊天屏蔽词库查询</li>' +
                '                    </ul>' +
                '                    <div class="layui-tab-content">' +
                '                    </div>' +
                '                </div>' +
                '            </div>');*/
            showSearchForm = true;
            isPermission = true;
        }

        if(showSearchForm){
            $("#sub-card").find(".layui-card-body").append('<div class="word-search-form">' +
                '                <form>' +
                '                    <div class="layui-form-item">' +
                '                        <div class="layui-inline">' +
                '                            <label class="layui-form-label" id="word-label" style="width:46px;text-align:left">敏感词：</label>' +
                '                            <div class="layui-input-inline">' +
                '                                <input class="layui-input" name="word_search" id="searchWord" placeholder="请输入敏感词"/>' +
                '                            </div>' +
                '                        </div>' +
                '                        <div class="layui-inline">' +
                '                            <button class="layui-btn layui-btn-theme" id="searchWordBtn" type="button">查询</button>' +
                '                        </div>' +
                '                        <div class="layui-inline">' +
                '                            <button class="layui-btn" id="export-words" type="button">导出</button>' +
                '                        </div>' +
                '                        <div class="layui-inline word-btn fRight" style="display:block;margin:10px 0 0 16px">' +
                '                            <button type="button" class="layui-btn layui-btn-normal wordPush">同步推送</button>' +
                '                            <button type="button" class="layui-btn layui-btn-warm word-select-all">选择当前页</button>' +
                '                            <button type="button" class="layui-btn layui-btn-danger word-delete-all">删除</button>' +
                '                        </div>' +
                '                    </div>' +
                '                </form>' +
                '            </div>' +
                '            <div id="word-list" style="margin-left:16px">' +
                '            </div>' +
                '            <div style="height: 40px;">' +
                '                <div class="fRight" id="word-page"></div>' +
                '            </div>');
        }

        //  选中第一个tab
        // $("li.word-tab:first").addClass("layui-this");

        //  列表初始化
        if(isPermission){
            // wordType = $("li.word-tab:first").data("type");
            showWordHtml();
            initWordsPage();

            //   ？点击弹窗
            /*$(".word-help").on("click", function () {
                let helpTitle = '', helpContent = '', type = $(this).parent('li.word-tab').data('type');
                switch (type) {
                    case 0:
                        helpTitle = '敏感词';
                        helpContent = '提供用于运营在后台管理敏感词内容，玩家在游戏内聊天时，发表文字包含敏感词库内容时，游戏客户端则对该内容用【*】标记显示；';
                        break;
                    case 1:
                        helpTitle = '聊天屏蔽词';
                        helpContent = '提供玩家在游戏内聊天，输入被屏蔽的词库内容时，超出设定规则后，玩家继续发言则会被禁言；';
                        break;
                    case -1:
                        helpTitle = '游戏聊天词库查询';
                        helpContent = '提供查询与导出敏感词库、聊天屏蔽词库功能，用于给不同层级的专员开通该功能权限；';
                        break;
                }

                layer.open({
                    title: helpTitle
                    ,content: helpContent
                });
            });*/
        }
    };

    initPermission();

    $("#importWordsBtn").on('click', function () {
        $(this).find('i').toggleClass("layui-icon-down");
        $(".layui-upload").toggle();
    });

    let uploadIndex = '';

    //多文件列表示例
    var wordFileListView = $('#wordFileList')
        ,uploadListIns = upload.render({
        elem: '#importList'
        ,url: admin.getUrl('/api/dirty_words/import') //改成您自己的上传接口
        ,accept: 'file'
        ,exts:'xlsx|xls'
        ,multiple: true
        ,auto: false
        // ,bindAction: '#wordUpload'
        ,field:'words'
        ,choose: function(obj){
            var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
            for (var i in files){
                if(("#upload-" + i).length == 0){
                    delete this.files[i];
                }
            }
            //读取本地文件
            obj.preview(function(index, file, result){
                var tr = $(['<tr id="upload-'+ index +'">'
                    ,'<td>'+ file.name +'</td>'
                    ,'<td>'+ (file.size/1024).toFixed(1) +'kb</td>'
                    ,'<td><div class="layui-progress" lay-showPercent="yes" lay-filter="upload-process-' + index + '">' +
                    '  <div class="layui-progress-bar layui-bg-blue" lay-percent="0%"></div>' +
                    '</div></td>'
                    ,'<td>等待上传</td>'
                    ,'<td>'
                    ,'<button type="button" class="layui-btn layui-btn-normal layui-btn-xs file-upload"><i class="layui-icon layui-icon-upload"></i></button>'
                    ,'<button type="button" class="layui-btn layui-btn-xs layui-btn-danger file-delete"><i class="layui-icon layui-icon-delete"></i></button>'
                    ,'</td>'
                    ,'</tr>'].join(''));

                //单个重传
                tr.find('.file-upload').on('click', function(){
                    uploadIndex = index;
                    element.progress('upload-process-'+uploadIndex, '0%');
                    obj.upload(index, file);
                });

                //删除
                tr.find('.file-delete').on('click', function(){
                    delete files[index]; //删除对应的文件
                    tr.remove();
                    uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                });

                wordFileListView.append(tr);
            });
        }
        ,progress: function(n, elem){
            element.progress('upload-process-'+uploadIndex, n + '%');
        },
        headers: headers,
        data:{},
        before: function(obj){
            layer.load(2);
            this.data.type = wordType;
        }
        ,done: function(res, index, upload){
            layer.closeAll('loading');
            if(res.code == 0){ //上传成功
                layer.msg(res.msg, {icon:1});
                var tr = wordFileListView.find('tr#upload-'+ index)
                    ,tds = tr.children();
                tds.eq(3).html('<span style="color: #5FB878;">上传成功</span>');
                tds.eq(4).html(''); //清空操作
                initWordsPage();
                return delete this.files[index]; //删除文件队列已经上传成功的文件
            }
            layer.msg(res.msg, {icon:5});
            this.error(index, upload);

            //  页面重载
            initWordsPage();
        }
        ,error: function(index, upload){
            layer.closeAll('loading');
            var tr = wordFileListView.find('tr#upload-'+ index)
                ,tds = tr.children();
            tds.eq(3).html('<span style="color: #FF5722;">上传失败</span>');
        }
    });


    //  选择当前页
    let wordBoxChecked = false;
    $('.word-select-all').click(function(){
        wordBoxChecked = !wordBoxChecked;
        $(".word-box").prop("checked", wordBoxChecked);
    });


    //  上传删除按钮
    $('#wordUploadDelete').on('click', function () {
        wordFileListView.html('');
    });



    //  TAB事件
    element.on('tab(docDemoTabBrief)', function(data){

        page = 1;
        pageSize = 50;
        wordBoxChecked = false;
        wordType = DATA_TYPE[data.elem.context.dataset.id];
        searchWord = '';
        $("#searchWord").val('');
        if($("#importWordsBtn i").hasClass("layui-icon-down")){
            $("#importWordsBtn").trigger("click");
        }

        //  上传数据清除
        wordFileListView.html('');

        showWordHtml(data.elem.context.dataset.id);
        initWordsPage();
    });


    /*element.on('tab(subWord)', function(data){
        page = 1;
        wordBoxChecked = false;
        wordType = $(this).data("type");
        searchWord = '';
        $("#searchWord").val(searchWord);
        if(wordType == 0){
            $("#word-label").html("敏感词库：");
        }else {
            $("#word-label").html("聊天屏蔽词库：");
        }
        initWordsPage();
    });*/

    //  删除敏感词操作
    $(".word-delete-all").click(function () {
        let ids = [];
        $('.word-box:checked').each(function(index,value) {
            ids.push($(this).val());
        });
        if(ids.length == 0){
            layer.msg("请选择需要删除的内容", {icon:5});
            return
        }
        layer.load(2);
        admin.req({
            url: admin.getUrl('/api/dirty_words/delete'),
            data: {
                type: wordType,
                ids:ids.join(','),
            },
            type: 'post',
            done: function (res) {
                layer.closeAll('loading');
                if (res.code == 0){
                    freshPage();
                    layer.msg(res.msg, {icon:1});
                    return
                }
                layer.msg(res.msg, {icon:5});
            },
            error: function () {
                layer.closeAll('loading');
            },
        });
    });

    //  添加敏感词操作
    $('#addWordBtn').click(function () {
        admin.req({
            url: admin.getUrl('/api/dirty_words/add'),
            data: {
                type: wordType,
                word: $("#wordValue").val(),
            },
            type: 'post',
            done: function (res) {
                if (res.code == 0){
                    $("#wordValue").val('');
                    freshPage();
                    layer.msg(res.msg, {icon:1});
                    return;
                }
                layer.msg(res.msg, {icon:5});
            }
        });
    });

    //  刷新分页
    let freshPage = function(){
        $(".layui-laypage-btn").click();
    }

    //  导出敏感词
    $('#export-words').click(function () {
        admin.download({
            url: admin.getUrl('/api/dirty_words/export'),
            data: {
                type: wordType,
                word: searchWord,
            },
            method: 'get',
            dataType: 'json'
        });
    });

    //  查询
    $('#searchWordBtn').click(function () {
        searchWord = $("#searchWord").val();
        initWordsPage();
    });


    //  推送敏感词
    $(".wordPush").click(function () {
        layer.load(2);
        admin.req({
            url: admin.getUrl('/api/dirty_words/push'),
            data: {
                type: wordType,
            },
            type: 'post',
            done: function (res) {
                layer.closeAll('loading');
                if(res.code == 0){
                    layer.msg("推送成功", {icon:1});
                    return
                }
                layer.msg(res.msg,{icon:5});
            }
        });
    });


    exports('dirty_words/dirty_words', {});
});
