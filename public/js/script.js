$(document).ready(function() {
    headerImg()
    if (localStorage.dark == "true")
        $('body').addClass("dark")
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
    router.updatePageLinks()
});

const router = new Navigo(null, true, '#/');
router
    .on({
        'search/:keyword': params => showSearchResult(params.keyword),
        'search': showSearch,
        'post/:filename': params => showPost(params.filename),
        '*': showPosts
    })
    .resolve()
router
    .hooks({
        before: (done, params) => {
            $('#menu').removeClass('show')
            done()
        },
        after: params => {
            void(0)
        }
    })


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
        alert('未輸入關鍵字')
    else
        router.navigate(`search/${encodeURIComponent($('input#search').val())}`);
}

function parsePosts(posts) {
    let r = $(`<div class="ts stackable three cards" />`)
    for (let i in posts) {
        let item = posts[i]
        r.append(`<a class="ts card" href="post/${encodeURIComponent(item.link)}" data-navigo>
                    <div class="content">
                        <div class="header">${item.title}</div>
                        <div class="description">${item.summary}</div>
                    </div>
                    ${item.icon?
                        `<div class="symbol"><i class="icon ${item.icon}"></i></div>`:
                        ``}
                </a>`)
    }
    return r
}
async function showPost(filename) {
    let result=(await axios(`/mdr/post/${filename}`)).data
    $("#app")
    .html('')
    .append(`<h3 class="ts header">${result.title}</h3><div id="content">${result.content}</div>`)
    let chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')
    chapter.attr("class", "ts header")
    if (chapter.length == 0) {
        $('#menu').removeClass('show')
    } else {
        $('#menu').addClass('show')
        menuClick()
        scrollspy()
    }
}
function showSearch() {
    $("#app")
        .html('')
        .append(`<div class="ts very narrow container">
            <div class="ts action fluid input" style="margin:70px 20px;">
                <input id="search" placeholder="輸入關鍵字來搜尋" type="text">
                <button class="ts button" onclick="searchPosts()">搜尋</button>
            </div>
        </div>`)
    $("input#search").on("keydown", function(event) {
        if (event.which == 13)
            searchPosts()
    });
}
async function showSearchResult(keyword) {
    let result=(await axios(`/mdr/search/${keyword}`)).data
    $("#app")
    .html('')
    .append(`<h1 class="ts header">SearchResult ${keyword}</h1>`)
    .append(parsePosts(result))
}
async function showPosts() {
    let result=(await axios('/mdr/posts')).data
    $("#app")
    .html('')
    .append(parsePosts(result))

    router.updatePageLinks()
}

function menuClick() {
    $('#menu .button').click(function() {
        if ($(this).attr('data-scroll') == 'N/A') return
        $('html,body').animate({
            scrollTop: $(this).attr('data-scroll') - 60
        }, 200);
    });
}
$(window).scroll(function() {
    scrollspy()
});

function scrollspy() {
    var chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')
    if ($(window).scrollTop() - 80 > $('.ts.container').offset().top && chapter.length > 0) {
        $('#menu').addClass('show')
    } else {
        $('#menu').removeClass('show');
        return;
    }

    // Get container scroll position
    var fromTop = $(window).scrollTop();

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