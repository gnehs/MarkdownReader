$(document).ready(function() {
    headerImg()
    menuClick()
    var chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')
    chapter.attr("class", "ts header")
    if (chapter.length == 0) {
        $('#menu').attr('style', 'display:none')
    }
    if (localStorage.dark == "true")
        $('body').addClass("dark")
    $("input#search").on("keydown", function(event) {
        if (event.which == 13)
            searchPosts()
    });
    $('[data-dark]').click(function() {
        let isDark = $('body').hasClass("dark")
        if (isDark) {
            $('body').removeClass("dark")
            localStorage.dark = "false"
        } else {
            $('body').addClass("dark")
            localStorage.dark = "true"
        }
    });
    $.get("/lang", function(data) {
        window.localStorage.lang = JSON.stringify(data)
    });
});


function menuClick() {
    $('#menu a').click(function() {
        if ($(this).attr('data-scroll') == 'N/A') {
            return
        }
        // 讓捲軸用動畫的方式移動到 0 的位置
        // 感謝網友 sam 修正 Opera 問題
        var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html,body');
        $body.animate({
            scrollTop: $(this).attr('data-scroll') - 60
        }, 200);
    });
}
$(window).scroll(function() {
    scrollspy()
});

function scrollspy() {

    var chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')
    if ($(this).scrollTop() - 80 > $('.ts.container').offset().top && chapter.length > 0) {
        $('#menu').addClass('show')
    } else {
        $('#menu').removeClass('show');
        return;
    }

    // Get container scroll position
    var fromTop = $(this).scrollTop();

    for (var i = 0; i < chapter.length; i++) {
        if ($(chapter[i]).offset().top < fromTop + 61) {
            var previousChapter = $(chapter[i - 1])
            var nowChapter = $(chapter[i])
            var nextChapter = $(chapter[i + 1])
        }
    }
    if (nowChapter != undefined && $('#menu .nowChapter').attr('data-scroll') != nowChapter.offset().top) {
        if (previousChapter.length != 0 && $('#menu .nowChapter').attr('data-scroll') == previousChapter.offset().top) {
            $('#menu').addClass('toNext')
        }
        if (nextChapter.length != 0 && $('#menu .nowChapter').attr('data-scroll') == nextChapter.offset().top) {
            $('#menu').addClass('toPrevious')
        }
        $('#menu').addClass('changeing')
        setTimeout(function() { $('#menu').removeClass('changeing toNext toPrevious') }, 200 + 1);
    }

    if (previousChapter == undefined || previousChapter.length == 0)
        $('#menu .previousChapter').text('-').attr('data-scroll', 'N/A')
    else
        $('#menu .previousChapter').text(previousChapter.text()).attr('data-scroll', previousChapter.offset().top);

    if (nowChapter == undefined || nowChapter.length == 0)
        $('#menu .nowChapter').text('-').attr('data-scroll', 'N/A')
    else
        $('#menu .nowChapter').text(nowChapter.text()).attr('data-scroll', nowChapter.offset().top)

    if (nextChapter == undefined || nextChapter.length == 0)
        $('#menu .nextChapter').text('-').attr('data-scroll', 'N/A')
    else
        $('#menu .nextChapter').text(nextChapter.text()).attr('data-scroll', nextChapter.offset().top)
}

function headerImg() {
    if (window.sessionStorage["headerImg"]) {
        var headerImg = window.sessionStorage["headerImg"]
    } else {
        var perviewImg = Trianglify({
            width: 2560,
            height: 2560,
            stroke_width: 200,
            cell_size: 100,
        });
        var headerImg = perviewImg.png()
        window.sessionStorage["headerImg"] = headerImg
    }
    $('#headerImg').attr('src', headerImg)
        //document.write('<img src="' + headerImg + '">');
}

function searchPosts(text) {
    let lang = JSON.parse(window.localStorage.lang)
    if ($('input#search').val() == "")
        swal({
            title: lang.search.searchde,
            icon: "warning",
        });
    else
        location.href = '/search/' + $('input#search').val();
}