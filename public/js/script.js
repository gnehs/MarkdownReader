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
        upadteLang()
    });
    router.updatePageLinks()
});

function upadteLang() {
    let lang = JSON.parse(window.localStorage.lang)
    if (lang) {
        $("#nav .home span").text(lang.nav.home)
        $("#nav .search span").text(lang.nav.search)
        $("#nav .dark span").text(lang.nav.nightMode)
    }
}
const router = new Navigo(null, true, '#/');
router
    .on({
        'search/:keyword': params => showSearchResult(params.keyword),
        'search': showSearch,
        'post/:filename': params => showPost(params.filename),
        'posts/:page': params => showPosts(Number(params.page) - 1),
        '*': showPosts(0)
    })
    .resolve()
router
    .hooks({
        before: (done, params) => {
            $('#menu').removeClass('show')
            $('#app').html(`<div class="ts active centered inline loader"></div>`)
            $(document).attr("title", `MarkdownReader`);
            done()
        },
        after: params => {
            void(0)
        }
    })


function headerImg() {
    var perviewImg = Trianglify({
        width: 2560,
        height: 2560,
        stroke_width: 200,
        cell_size: 100,
    });
    $('#headerImg').attr('src', perviewImg.png())
}

function searchPosts(text) {
    let lang = JSON.parse(window.localStorage.lang)
    if ($('input#search').val() == "")
        alert(lang.search.placeholder)
    else
        router.navigate(`search/${encodeURIComponent($('input#search').val())}`);
}

function showSearch() {
    let lang = JSON.parse(window.localStorage.lang)

    $("#app")
        .html('')
        .append(`<div class="ts very narrow container">
            <div class="ts action fluid input" style="margin:20px 20px;">
                <input id="search" placeholder="${lang.search.placeholder}" type="text">
                <button class="ts button" onclick="searchPosts()">${lang.search.search}</button>
            </div>
        </div>`)
    $("input#search").on("keydown", function(event) {
        if (event.which == 13)
            searchPosts()
    });
}

async function showSearchResult(keyword) {
    let lang = JSON.parse(window.localStorage.lang)
    let result = (await axios(`/mdr/search/${keyword}`)).data
    console.log(result)
    $("#app")
        .html('')
        .append(`<div class="ts very narrow container">
            <div class="ts action fluid input" style="margin:20px 20px;">
                <input id="search" placeholder="${lang.search.placeholder}" value="${keyword}" type="text">
                <button class="ts button" onclick="searchPosts()">${lang.search.search}</button>
            </div>
        </div>`)
        .append(result.length > 0 ? parsePosts(result) : `<h5 class="ts center aligned header">${lang.error.nothingHere}</h5>`)

    $("input#search").on("keydown", function(event) {
        if (event.which == 13)
            searchPosts()
    });
    router.updatePageLinks()
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

    $(document).attr("title",result.title);
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
async function showPosts(page=0) {
    let result=(await axios('/mdr/posts')).data
    console.log(result)
    let pagination = `<div class="pagination">`
    for (i=0; i < Math.floor(result.length / 24 + 1); i++) {
        pagination+=`<a class="ts circular button ${i==page?`active`:``}" 
                        href="posts/${i+1}" 
                        data-navigo>${i+1}</a>`
    }
    pagination+=`</div>`
    $("#app")
        .html('')
        .append(parsePosts(result.splice(page*24, 24)))
        .append(pagination)

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