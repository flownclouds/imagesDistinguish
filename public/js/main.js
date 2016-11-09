var searchFileName = [];
var resultSearchStorage = window.localStorage;
$(function () {
    var fileInfo ;
    getData("/index");
    var fileShowType = 1;
    var imgShowType = 1;
    var imgsurl = [];
    var shiftImg = [];
    window.shiftImg = [];
    $(".right .img-btns").hide();
    // hover
    $('.content').on('mouseover', '.js-tr tr', function () {
        $('.js-tr tr').removeClass('hover');
        $(this).addClass('hover');
    });
    $('.content').on('mouseout', '.js-tr tr', function () {
        $(this).removeClass('hover');
    });
    $('.content').on('mouseover', '.content-list li', function () {
        $('.content-list li').removeClass('hover');
        $(this).addClass('hover');
    });
    $('.content').on('mouseout', '.content-list li', function () {
        $(this).removeClass('hover');
    });

    // 单击
    $('.content').on('click', '.js-tr tr', function (e) {
        e.stopPropagation();
        $('.js-tr tr').removeClass('active');
        $(this).addClass('active');
    });
    $('.local-content').on('click', '.content-list li', function (e) {
        e.stopPropagation();
        $('.content-list li').removeClass('active');
        $(this).addClass('active'); 
    });
    $('.img-content').on('click', '.content-list li', function (e) {
        e.stopPropagation();
        if ($(".img-content .content-list").children('.multiple').length <= 1 && e.ctrlKey == false){
            $('.content-list li.multiple').removeClass('multiple');
            $('.content-list li.chose').removeClass('chose');
            $(this).addClass('multiple').addClass('chose');
        }
        
    });

    $('.img-content').on('click', '.result-list li', function (e) {
        e.stopPropagation();
        $('.result-list li').removeClass('active');
        $(this).addClass('active');
    });

    // 单击别处
    $('.wrap').click(function () {
        window.shiftImg = [];
        $('.js-tr tr.active').removeClass('active').addClass('hover');
        $('.content-list li.active').removeClass('active').addClass('hover');
        $('.result-list li.active').removeClass('active');
        $('.content-list li.multiple').removeClass('multiple');
        $('.content-list li.chose').removeClass('chose');
    });

    // 双击目录
    $('.content').on('dblclick', '.js-tr .dir', function () {
        var url = $(this).find('.meta-dir').text();
        if ($('.nav-nowurl').text()) {
            url = $('.nav-nowurl').text() + $(this).find('.meta-dir').text();  
        }
        getData('/index?url=' + url + '&r=' + Math.random(), 2);
        $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:getAllImgs();');
        $('.all-imgs').css('cursor', 'pointer');
        $('.img-deliver').removeAttr('onclick').attr('onclick', 'javascript:imgSort();');
        $('.img-deliver').css('cursor', 'pointer');
    });

    $('.content').on('dblclick', '.content-list .dir', function () {
        var url = $(this).find('p').text();
        if ($('.nav-nowurl').text()) {
            url = $('.nav-nowurl').text() + $(this).find('p').text();
        }
        getData('/index?url=' + url + '&r=' + Math.random());
        $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:getAllImgs();');
        $('.all-imgs').css('cursor', 'pointer');
        $('.img-deliver').removeAttr('onclick').attr('onclick', 'javascript:imgSort();');
        $('.img-deliver').css('cursor', 'pointer');
    });

    $('.img-content').on('dblclick', '.result-dir li', function (e) {
        e.stopPropagation();
        var filename_d = $(this).children("div").children("p").text();
        // 影藏分类结果，显示搜索结果页面
        $('.showimg, .show-result').hide();
        $('.sort-result, .result-search').hide();
        $('.right .nav .nav-btns').hide();
        showSearchImg(filename_d);
    });

    // 列表与缩略图 Hover
    $('.nav-btns span').mouseover(function () {
        $('.nav-btns span').removeClass('hover');
        $(this).addClass('hover');
    });
    $('.nav-btns span').mouseout(function () {
        $('.nav-btns span').removeClass('hover');
    });
    
    // 列表与缩略图 Click
    $('.local-btns span').click(function () {
        if ($(this).hasClass('active')) {
            return;
        }
        $('.local-btns span').removeClass('active');
        $(this).addClass('active');
        if ($(this).hasClass('local-thumbnail')) {
            showHtml(window.fileInfo);
        } else if ($(this).hasClass('local-list')) {
            showHtml2(window.fileInfo);
        }
    });

    $('.img-btns span').click(function () {
        if ($(this).hasClass('active')) {
            return;
        }
        $('.img-btns span').removeClass('active');
        $(this).addClass('active');
        if ($(this).hasClass('img-thumbnail')) {
            $('.right').css('overflow', 'hidden');
            // showImgHtml(window.fileInfo.collages);
            showImgHtml(collages);
        } else if ($(this).hasClass('img-list')) {
            $('.right').css('overflow', 'auto');
            // showImgHtml2(window.fileInfo.collages);
            showImgHtml2(collages);
        }
        $(".sort-result").addClass("nav-font");
        $(".result-search").removeClass("nav-font");
    });

    // 双击图片放大
    $('.content').on('dblclick', '.js-tr .file-img, .js-tr .col-file-img, .content-list .col-enlarge, .content-list .enlarge, .result-img .col-enlarge', function () {
        var img = new Image();
        img.src = $(this).attr('url') ? $(this).attr('url') : $(this).children(".meta-img").attr("url");
        var html = "";
        if(img.complete){
            windowUp(img);
        } else {
            img.onload = function () {
                windowUp(img);
            }
        }
    });


    $('.fullbg').click(function () {
        $(".fullbg").hide();
        $(".img-enlarge").hide("slow");
    });

    $(".img-enlarge").click(function (e) {
       e.stopPropagation();
    });

    $(".cover-up").click(function (e) {
        e.stopPropagation();
    });
    $(".input-window").click(function (e) {
        e = e || window.event;
        if (e.target != $ ('.input-content')[0] && e.target == $ ('.input-window')[0]) {
            $ (this).hide ();
        }
    });
    
    // esc 退出
    $(document).keydown(function (e) {
        if (e.keyCode == 27) {
            $(".fullbg").hide();
            $(".img-enlarge").hide("slow");
        }
    });

    // 非结构型的隐藏  显示
    $(".img-content").on("click", "#nonstructImg .list-close", function () {
        if ($("#nonstructImg .content-list").css("display") == "none") {
            $(this).parent(".content-list-type").next("ul").show("slow");
            $("#structImg").css("height", "50%");
            $(this).text('隐藏');
        } else {
            $(this).parent(".content-list-type").next("ul").hide("slow");
            $("#structImg").css("height", "calc(100% - 38px)");
            $(this).text('显示');
        }
    });

    // 搜索结果的隐藏和显示
    $(".img-content").on("click", ".show-result .list-close", function () {
        if ($(".img-content .result-list").css("display") == "none") {
            $(this).parent(".content-list-type").next("ul").show("slow");
            $("#structImg").css("height", "50%");
            $(this).text('隐藏');
        } else {
            $(this).parent(".content-list-type").next("ul").hide("slow");
            $("#structImg").css("height", "calc(100% - 38px)");
            $(this).text('显示');
        }
    });

    // 图片移动 
    $('.img-content').on('mousedown', '.content-list li', function (e) {
        var imgType = $(this).parent('ul').prev('p').text();
        if (imgType == '结构型') {
            $("#m-move").html("移动到非结构型");
        } else {
            $("#m-move").html("移动到结构型");
        }
        if (e.ctrlKey) {
            if ($(this).hasClass('chose')) {
                $(this).removeClass('multiple').removeClass('chose');
            } else {
                $(this).addClass('multiple').addClass('chose');
            }
        } else if (e.shiftKey) {
            var end ;
            if ($(this).hasClass('chose')) {
                end = $(this).index();
                $(this).nextAll('li').removeClass('multiple').removeClass('chose');
            } else {
                end = $(this).index();
            }
            var imgSrcs = $(".img-content .content-list").children('.chose');
            var start = $('#'+imgSrcs[0].id).index();
            if (end >= start) {
                for (var i = start; i <= end; i++) {
                    $(this).parent('ul').children('li').eq(i).addClass('multiple').addClass('chose');
                }
            } else {
                for (var i = end; i < start; i++) {
                    $(this).parent('ul').children('li').eq(i).addClass('multiple').addClass('chose');
                }
            }
        }  else if (e.which == 1 && e.shiftKey == false && e.ctrlKey == false) {
            if (!$(this).hasClass('chose')) {
                $('.content-list li.multiple').removeClass('multiple');
                $(this).addClass('multiple');
            }
        }
        var imgSrc = $(".img-content .content-list").children('.chose');
        var imgAllSrc = []; 
        for (var i = 0; i < imgSrc.length; i++) {
            imgAllSrc.push($('#'+imgSrc[i].id).children(".li-wrap").children(".col-enlarge").attr("src"));
        }
        if (imgAllSrc.length > 0 ) {
            $(this).contextMenu('m-menu', {
                bindings: 
                {
                    'm-move': function(e) {
                        $.ajax({
                            url: '/imgSortByH?r='+Math.random(),
                            type:'GET',
                            data:{'path': imgAllSrc},
                            traditional: true,
                            dataType: 'json',
                            success: function (data) {
                                collages = data;
                                showImgHtml(data);
                            }
                        });
                    }
                }
            });
        }
    });

    $('.left').scroll(function () {
        if (!$('.left-what').hasClass('loading') && $('.left-what').offset().top <= windowH + 20 && currentIndex < fileLength - 1) {
            $('.left-what').addClass('loading');
            currentIndex = parseInt($('.left').attr('number'));
            var lastIdex = currentIndex + gap > fileLength ? fileLength : (currentIndex + gap);
            var dataHTML2 = '';
            for (var i = currentIndex; i < lastIdex; i++) {
                if (file[i].isfile) {
                    dataHTML2 += '<li class="dir">' +
                                    '<div class="li-wrap">' +
                                        '<img src="/images/thumbnail_big_dir.png">' +
                                        '<p>'+file[i].path+'</p>' +
                                    '</div>' +
                                '</li>';
                } else {
                    dataHTML2 += '<li>' +
                                    '<div class="li-wrap">' +
                                        '<img src="' + file[i].cutpath + '" url="' + file[i].changePath + '" class="enlarge">' +
                                        '<p>'+file[i].path+'</p>' +
                                    '</div>' +
                                '</li>';
                }
            }
            $('.left .content-list').append(dataHTML2);
            $('.left').attr('number', lastIdex);
            $('.left-what').removeClass('loading');
            if (!$('.dir').html()) {
                $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:void(0);');
                $('.all-imgs').css('cursor', 'default');
            }
        }
    });
});

var leftDOM;
var imgDOM;
var windowH = $(window).height();
var gap = 20;
var currentIndex = 0;
var collages;

function loadImg() {
    imgDOM.each(function () {
        if (!$(this).attr('src') && $(this).offset().top < windowH) {
            $(this).attr('src', $(this).attr('url'));
        }
    })
}

function windowUp (img) {
   var top = $(window).height()/2;   
   var left = $(window).width()/2;  
    //  设置遮罩层 
   $(".fullbg").css({ 
        height:"calc(100%)", 
        width:"calc(100%)", 
        display:"block"
    }); 
    if (img.height > img.width) {
        var height = img.height > 500 ? 700 : img.height;
        var width = img.width > 700 ? 550 : img.width;
    } 
    if (img.height <= img.width) {
        var height = img.height > 500 ? 400 : img.height;
        var width = img.width > 700 ? 550 : img.width;
    }
    html = '<img id="onlyOne" src="' + img.src + '"  height="'+ height +'px"/>'
    $(".img-enlarge").css({"height": height + "px"});
    $(".img-enlarge").html(html);
    $(".img-enlarge").css({"top": top - height / 2 , "left": left - width/2 }).slideToggle("slow");
}

function getData (url , type ) {
    var clearTime;
    url = url ? url : '/index';
    type = type ? type : 1;
    $.ajax({
        url: url,
        type:'GET',
        dataType:'json',
        // timeout: 6000000,
        beforeSend: function (XMLHttpRequest) {
            $(".cover-up").css({ 
                "height":"calc(100%)", 
                "width":"calc(100%)", 
                "display":"block",
                "background-color": "white"
            });
            // $(".cover-up").html('<img width="128px" height="128px" src="/images/loading.gif" />');
            $('.cover-up').html('<progress id="prog" value="0"><ie id="ie"></ie></progress><div id="numValue">0%</div>');
            clearTime = setInterval(function () {
                $.get('/getProgress?r='+Math.random(), function (data) {
                    var progress = data.progress;
                    var total = (data.total == 0 ? 2 : data.total);
                    $('#prog').val(progress);
                    $('#prog').removeAttr('max').attr('max', total);
                    $('#ie').css('width', Math.round((progress / total) * 100) + '%');
                    $('#numValue').html(Math.round((progress / total) * 100) + '%');
                });
            }, 500);
        },
        success: function (data) {
            clearTimeout(clearTime);
            $(".cover-up").css("background-color", "").html(null);
            $(".cover-up").hide();
            window.fileInfo = data;
            // 文件目录缩略图
            if (type == 1) {
                showHtml(fileInfo);
            }
            // 文件目录详细信息
            else if (type == 2) {
                showHtml2(fileInfo);
            }
        }
    });
}
// 图片分类进度条
function getProgressSort () {
    $.get('/getProgresssort?r='+Math.random(), function (data) {
        var progress = data.progress;
        var total = window.fileInfo.imgs.length;
        $('#prog').val(progress);
        $('#ie').css('width', Math.round((progress / total) * 100) + '%');
        $('#numValue').html(Math.round((progress / total) * 100) + '%');
        if (progress < total) {
            setTimeout(getProgressSort(), 10000);
        } 
    });
}
// 图片分类
function imgSort () {
    var url = $('.nav-nowurl').text();
    $.ajax({
        url: '/imgSort?url='+ url +'&r='+Math.random(),
        type:'GET',
        beforeSend: function (XMLHttpRequest) {
            $(".cover-up").css({ 
                "height":"calc(100%)", 
                "width":"calc(100%)", 
                "display":"block",
                "background-color": "white",
            });
            // $(".cover-up").html('<img width="128px" height="128px" src="/images/loading.gif" />');
            $('.cover-up').html('<progress id="prog" value="0" max="'+ window.fileInfo.imgs.length +'"><ie id="ie"></ie></progress><div id="numValue">0%</div>');
            getProgressSort();
        },
        success: function (data) {
            $(".cover-up").css("background-color", "").html(null);
            $(".cover-up").hide();
            collages = data;
            showImgHtml(data);
            $('.img-deliver').removeAttr('onclick').attr('onclick', 'javascript:void(0);');
            $('.img-deliver').css('cursor', 'default');
        }
    });
    $(".right .img-btns").show();
    $(".sort-result").addClass("nav-font");
}

var tempSearch ;
// 图片搜索
function imgSearch () {
    var imgUrl;
    var imgValue = $('.select-value').val();
    var allSelect = $(".img-content .content-list").children('.multiple');
    if (allSelect.length > 0) {
        imgUrl = $('#' + allSelect[0].id).children('.li-wrap').children('img').attr("url");
    } else {
        alert('请选择一张目标图片！');
        return false;
    }

    $(".input-window #filename").val($('#' + allSelect[0].id).children('.li-wrap').children('p').text() + '-' + imgValue);
    $.ajax({
        url: '/imgSearch?r=' + Math.random() + '&url=' + imgUrl + '&value=' + imgValue,
        type: 'GET',
        beforeSend: function (XMLHttpRequest) {
            $(".cover-up").css({ 
                "height":"calc(100%)", 
                "width":"calc(100%)", 
                "display":"block",
                "background-color": "white",
            });
            $(".cover-up").html('<img width="128px" height="128px" src="/images/loading.gif" />');
        },
        success: function (data) {
            $(".sort-result").css("cursor", "pointer");
            $(".cover-up").css("background-color", "").html(null);
            $(".cover-up").hide();
            // 显示一个输入框
            $('.input-window').show();
            // 存储搜索结果并将文件名与数据一一对应
            tempSearch = data;
        }
    });
}

function sortResult (type) {
    if (type == 2) {
        $(".result-list, .show-result, #structImg").show();
        $("#nonstructImg, #nonstructImg .content-list").hide();
        $("#structImg").css("height", "50%");
        $("#nonstructImg .list-close").text("隐藏");
        $(".sort-result").removeClass("nav-font");
        $(".result-search").addClass("nav-font");
    } else {
        $(".result-list, .show-result").hide();
        $(".showimg, #nonstructImg .content-list").show();
        $("#structImg").css("height", "50%");
        $(".show-result .list-close").text("隐藏");
        $(".result-search").removeClass("nav-font");
        $(".sort-result").addClass("nav-font");
    }
}

// 输入框的信息确认
function inputSure () {
    var fileName = $(".input-content #filename").val();
    if (fileName) {
        searchFileName.push(fileName);
        resultSearchStorage.setItem(fileName, JSON.stringify(tempSearch));
        $(".input-window").hide();
        $(".input-content #filename").val(null);
        // 显示视图
        $("#nonstructImg").hide();
        searchResult();
        tempSearch = null;
    }
    if (!$(".nav").children("span").hasClass("result-search")) {
        $(".sort-result").after(
            '<span class="result-search" onclick="javascript: sortResult(2)" >搜索结果</span>'
            );
    }

    $(".sort-result").removeClass("nav-font");
    $(".result-search").addClass("nav-font");
}


// 显示搜索的图片
function showSearchImg(filename_d) {
    $('.right .nav ').children('span:last').after('<a href="javascript:searchBack()" style="padding-left: 10px;"> 返回</a>');
    if (!$('.img-content').hasClass('oneSearchResult')) {
        $('.img-content').append('<div class="oneSearchResult" style="position: relative;"></div');
    }
    var html = '';
    var data = resultSearchStorage.getItem(filename_d);
    data = JSON.parse(data);
    html += '<p class="content-list-type">'+ filename_d +'</p>'+
	            '<ul class="result-list result-img cf" style="padding-top: 20px;">';
    for (var i = 0; i < data.length; i++) {
        html += '<li>'+
                    '<div class="li-wrap">'+
                        '<img class="col-enlarge" url="'+ data[i].changePath +'" src="'+ data[i].cutpath +'">'+
                        '<p>'+ data[i].path +'</p>'+
                    '</div>'+
                '</li>';
    }
    html += '</ul>';
    $('.oneSearchResult').html(html);
    $(".img-search").hide();
    $(".select-value").hide();
}

// 结果返回
function searchBack() {
    $(".oneSearchResult").remove();
    $('.right .nav').children('a').remove();
    $("#structImg").show();
    $(".show-result").show();
    $(".img-search").show();
    $(".select-value").show();
    $('.sort-result, .result-search').show();
    $('.right .nav .nav-btns').show();
}


// 显示搜索结果
function searchResult () {
    if (!$('.img-content').children('div').hasClass('show-result')) {
        var html = '<div class="show-result" style="height: calc(50%)"></div>';
         $('.img-content').append(html);
        // $("#structImg").after(html);
    }

    var html2 = '<p class="content-list-type">搜索结果 <span class="list-close">隐藏</span></p>' +
                        '<ul class="result-list result-dir cf" >';
    for (var i in searchFileName) {
        html2 += '<li class="search-dir">'+
                    '<div class="li-wrap">'+
                        '<img src="/images/thumbnail_big_dir.png">'+
                        '<p>'+ searchFileName[i] +'</p>'+
                    '</div></li>';
    }
    html2 += '</ul>';
    $('.show-result').html(html2);
}

function getAllImgs () {
    $('.thumbnail .local-thumbnail').addClass('active');
    if ($('.nav-nowurl').text()) {
        var url = $('.nav-nowurl').text();
        getData('/index?url='+ url +'&type=all&r='+Math.random());
        $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:void(0);');
        $('.all-imgs').css('cursor', 'default');
    }
}
var file;
var fileLength;

// 文件目录显示
function showHtml (files) {
    if (files.nowUrl) {
        var goback = '<a href="javascript:goback(1)">返回上一级</a>'+
                '<span class="separator">|</span>'+
                '<a href="javascript:getSys(1)">全部文件</a>'+
                '<span class="separator">&gt;</span>'+
                '<span class="show-nowurl">'+files.nowUrl+'</span>'+
                '<span style="display:none" class="nav-nowurl">'+files.nowUrl+'</span>';
        $('.nav-goback').html(goback);
    } else {
        $('.nav-goback').html('<a href="javascript:showHtml()">全部文件</a>');
    }

    if (files.imgs.length > 0) {
        $('.img-deliver').remove();
        var sort = '<span class="img-deliver" onclick="javascript:imgSort();" >分类</span>';
        $('.local-btns').append(sort);
    } else {
        $('.img-deliver').remove();
    }

    var dataHTML1 = '<ul class="content-list cf">';
    if (files.allFiles.length <= 0) {
        
    } else {
        file = files.allFiles;
        fileLength = file.length;
        var showFirst = fileLength < 50 ? fileLength : 50;
        for (var i = 0; i < showFirst; i++) {
            if (file[i].isfile) {
                dataHTML1 += '<li class="dir">' +
                                '<div class="li-wrap">' +
                                    '<img src="/images/thumbnail_big_dir.png">' +
                                    '<p>'+file[i].path+'</p>' +
                                '</div>' +
                            '</li>';
            } else {
                dataHTML1 += '<li>' +
                                '<div class="li-wrap">' +
                                    '<img src="' + file[i].cutpath + '" url="' + file[i].changePath + '" class="enlarge">' +
                                    '<p>'+file[i].path+'</p>' +
                                '</div>' +
                            '</li>';
            }
        }
    }
    dataHTML1 += '</ul>';
    $('.local-content').html(dataHTML1);
    $('.left').attr('number', showFirst);
    leftDOM = $('.left');

    if (!$('.dir').html()) {
        $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:void(0);');
        $('.all-imgs').css('cursor', 'default');
    }
    // 截取字符串
    if (files.nowUrl.length > 45) {
        var nowUrl = files.nowUrl;
        nowUrl = nowUrl.split('\\');
        nowUrl.pop();
        var nlength = nowUrl.length;
        var url =  nowUrl[nlength -3] +'\\'+ nowUrl[nlength -1]; 
        $(".show-nowurl").text(url);
    }
}


function showHtml2 (files) {
    if (files.nowUrl) {
        var goback = '<a href="javascript:goback(2)">返回上一级</a>'+
                '<span class="separator">|</span>'+
                '<a href="javascript:getSys(2)">全部文件</a>'+
                '<span class="separator">&gt;</span>'+
                '<span class="show-nowurl">'+files.nowUrl+'</span>'+
                '<span style="display:none" class="nav-nowurl">'+files.nowUrl+'</span>';
        $('.nav-goback').html(goback);
    } else {
        $('.nav-goback').html('<a href="javascript:showHtml2()">全部文件</a>');
    }

    if (files.imgs.length != 0) {
        $('.img-deliver').remove();
        var sort = '<span class="img-deliver" onclick="javascript:imgSort();">分类</span>';
        $('.local-btns').append(sort);
    } else {
        $('.img-deliver').remove();
    }

    var dataHTML2 = '<table class="local">' +
                        '<thead>' +
                            '<tr>' +
                                '<th>名称</th>' +
                                '<th>修改日期</th>' +
                                '<th class="last">大小</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody class="js-tr">' ;
    if (files.allFiles.length <= 0) {
        
    } else {
        var file = files.allFiles;
        for (var i = 0; i < file.length; i++) {
            if (file[i].isfile) {
                dataHTML2 += '<tr class="dir">' +
                                '<td class="meta-dir">'+file[i].path+'</td>' +
                                '<td class="meta">'+file[i].utime+'</td>' +
                                '<td class="meta">-</td>' +
                            '</tr>' ;
            } else {
                dataHTML2 += '<tr class="file-img">' +
                                '<td class="meta-img" url="'+ file[i].changePath +'">'+file[i].path +'</td>' +
                                '<td class="meta">'+file[i].utime+'</td>'+
                                '<td class="meta">'+ file[i].size +'KB</td>' +
                            '</tr>';
            }
        }
    }
    dataHTML2 +=  '</tbody></table>';
    $('.local-content').html(dataHTML2);
    if (!$('.dir').html()) {
        $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:void(0);');
        $('.all-imgs').css('cursor', 'default');
    }
    if (files.nowUrl.length > 45) {
        var nowUrl = files.nowUrl;
        nowUrl = nowUrl.split('\\');
        nowUrl.pop();
        var nlength = nowUrl.length;
        var url =  nowUrl[nlength -3] +'\\'+ nowUrl[nlength -1]; 
        $(".show-nowurl").text(url);
    }
}


// 冒泡排序
function jsonSort(obj) {
    for (var i = 0; i < obj.length; i++) {
        for (var j = 0; j < obj.length; j++) {
            if (obj[i].prob > obj[j].prob) {
                 var temp = obj[i];
                 obj[i] = obj[j];
                 obj[j] = temp;
            }
        }
    }
    return obj;
}


// 显示右边的图片分类
function showImgHtml (imgInfo) {
    $(".local").remove();
    var html = '';
    var structImg;
    var nonstructImg;
    var exceptionImg;
    if (!imgInfo) {
        html = '';
    } else {
        if (!$(".img-content").children("div").hasClass("sstructImg")) {
            $(".img-content").prepend('<div id="structImg" class="showimg sstructImg" ondrop="drop(event, 0)" ondragover="allowDrop(event)"></div');
        } 
        if (!$(".img-content").children("div").hasClass("snonstructImg")) {
            $(".sstructImg").after('<div id="nonstructImg"  class="showimg snonstructImg" ondrop="drop(event, 1)" ondragover="allowDrop(event)"></div>');
        }

        // 排序
        structImg = jsonSort(imgInfo.structImg);
        nonstructImg = jsonSort(imgInfo.nonStructImg);
        html += '<p class="content-list-type">结构型</p>' +
                        '<ul class="content-list cf" id="ustructImg" >' ;
        if (structImg.length > 0) {
            // 添加图片搜索按钮
            $('.select-value').show();
            $('.img-search').show();
            // 结构型图片
            for (var i = 0; i < structImg.length; i++) {
                html += '<li id="showSImg'+ i +'s" draggable="true" ondragstart="drag(event)" count='+ i +'>' +
                            '<div class="li-wrap">' +
                                '<img id="SImg'+ i +'s" class="col-enlarge" title="'+ new Number(structImg[i].prob).toFixed(2) +'" url="' + structImg[i].changePath + '" src="' + structImg[i].cutpath + '">' +
                                '<p>' + structImg[i].path + '</p>' +
                            '</div>' +
                        '</li>' ;
            }
        }
        html += '</ul>';
        $(".sstructImg").html(html);
        html = '';

        html += '<p class="content-list-type">非结构型&异常型<span class="list-close">隐藏</span></p>' +
                        '<ul class="content-list cf" >' ;
        if (nonstructImg.length > 0) {
            // 非结构型图片
            for (var i = 0; i < nonstructImg.length; i++) {
                html += '<li id="showNImg'+ i +'s" draggable="true" ondragstart="drag(event)" count='+ i +'>' +
                            '<div class="li-wrap">' +
                                '<img id="NImg'+ i +'s" class="col-enlarge" title="'+ new Number(nonstructImg[i].prob).toFixed(2) +'" url="' + nonstructImg[i].changePath + '" src="' + nonstructImg[i].cutpath + '">' +
                                '<p>' + nonstructImg[i].path + '</p>' +
                            '</div>' +
                        '</li>';
            }
        }
        html  += '</ul>';
        $(".snonstructImg").html(html);
        $(".show-result").hide();
    }
}



function showImgHtml2(imgInfo) {
    $(".snonstructImg, .sstructImg").remove();
    var html = '';
    var imgC = [];
    if (!$(".img-content").children("table").hasClass("local")) {
        $(".img-content").prepend('<table class="local"></table>');
    }
     html += 
                    '<thead>' +
                        '<tr>' +
                            '<th>名称</th>' +
                            '<th>类型</th>' +
                            '<th class="last">概率</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody class="js-tr">';
    if (!imgInfo) {
    
    } else {
        // imgInfo = jsonSort(imgInfo);
        imgC = imgInfo.structImg.concat(imgInfo.nonStructImg);
        imgC = jsonSort(imgC);
        for (var i = 0; i < imgC.length; i++) {
            html += '<tr class="col-file-img">' +
                        '<td class="meta-img" url="'+ imgC[i].changePath +'">' + imgC[i].path  + '</td>'+
                        '<td class="meta">' + (imgC[i].type == 1 ? '非结构型' : (imgC[i].type == 2 ? '异常' : '结构型')) + '</td>' +
                        '<td class="meta">' + new Number(imgC[i].prob).toFixed(2) + '</td>' +
                    '</tr>';
        }
    }

    $('.img-content .local').html(html);
    $(".show-result").hide();
}


// 返回上一目录
function goback (type) {
    var url = '';
    if ($('.nav-nowurl').text()) {
        url = $('.nav-nowurl').text();
    } 

    var urlObj = url.split('\\');
    if (urlObj.length == 1) {
        url = '';
    } else {
        urlObj.pop();
        urlObj.splice(urlObj.length-1, 1);
        url = urlObj.join("\\");
    }
    getData('/index?url='+url+'&r='+Math.random(), type);
    window.fileInfo.collages = [];
    showImgHtml(null);
    $('.all-imgs').removeAttr('onclick').attr('onclick', 'javascript:getAllImgs();');
    $('.all-imgs').css('cursor', 'pointer');
    $('.img-deliver').removeAttr('onclick').attr('onclick', 'javascript:imgSort();');
    $('.img-deliver').css('cursor', 'pointer');
    $(".right .img-btns").hide();
    $(".result-search").remove();
    $(".img-content").html(null);
    searchFileName = [];
}


// 全部文件 
function getSys(type) {
    getData('/index?r='+ Math.random(), type);
    window.fileInfo.collages = [];
    showImgHtml(null);
    // showImgHtml2(null);
    $('.img-deliver').removeAttr('onclick').attr('onclick', 'javascript:imgSort();');
    $('.img-deliver').css('cursor', 'pointer');
    $(".img-content").html(null);
    $(".result-search").remove();
    $(".right .img-btns").hide();
    searchFileName = [];
}

// 图片拖动
function allowDrop (ev) {
    ev.preventDefault();
}
function drag (ev) {
    ev.dataTransfer.setData("Text",ev.target.id);
}
function drop (ev, id) {
    var data = ev.dataTransfer.getData("Text");
    //拖动多张图片
    var allImg = $(".img-content .content-list").children('.chose');
    var imgSrc = [];
    for (var i = 0; i < allImg.length; i++) {
        imgSrc.push($('#'+allImg[i].id).children(".li-wrap").children(".col-enlarge").attr("src"));
    }
    if (allImg.length > 0) {
        if (id == 0) {
            $("#structImg .content-list").append(allImg);
        } else {
            $("#nonstructImg .content-list").append(allImg);
        }

        $.ajax({
            url: '/imgSortByH?r='+Math.random(),
            type:'GET',
            data:{'path': imgSrc},
            traditional: true,
            dataType: 'json',
            success: function (data) {
                collages = data;
                showImgHtml(data);
            }
        });
    }
    
    if (allImg.length == 0 ) {
        var imgChage = $("#" + data).attr("src");
        if (id == 0) {
            $("#structImg .content-list").append(document.getElementById('show' + data));
        } else {
            $("#nonstructImg .content-list").append(document.getElementById('show' + data));
        }

        $.ajax({
            url: '/imgSortByH?r='+Math.random(),
            type:'GET',
            data:{'path': imgChage},
            traditional: true,
            dataType: 'json',
            success: function (data) {
                collages = data;
                showImgHtml(data);
            }
        });
    }
    ev.preventDefault();
}