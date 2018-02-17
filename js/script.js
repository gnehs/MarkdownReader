$(document).ready(function() {
    var chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')
    $.ripple(".items a.item,.button,a.card,.menu a.item", {
        debug: false, // Turn Ripple.js logging on/off
        on: 'mousedown', // The event to trigger a ripple effect

        opacity: 0.3, // The opacity of the ripple
        color: "auto", // Set the background color. If set to "auto", it will use the text color
        multi: true, // Allow multiple ripples per element

        duration: 0.4, // The duration of the ripple

        // Filter function for modifying the speed of the ripple
        rate: function(pxPerSecond) {
            return pxPerSecond;
        },

        easing: 'linear' // The CSS3 easing function of the ripple
    });
    chapter.attr("class", "ts header")
    headerImg()
    if (chapter.length == 0) {
        $('#menu').attr('style', 'display:none')
    }
});
$(window).scroll(function() {
    if ($(this).scrollTop() - 80 > $('.ts.container').offset().top) {
        $('#menu').addClass('show')
    } else {
        $('#menu').removeClass('show')
        return
    }

    var chapter = $('#content h1,#content h2,#content h3,#content h4,#content h5,#content h6')

    // Get container scroll position
    var fromTop = $(this).scrollTop();

    for (var i = 0; i < chapter.length; i++) {
        if ($(chapter[i]).offset().top < fromTop + 20) {
            var previousChapter = $(chapter[i - 1])
            var nowChapter = $(chapter[i])
            var nextChapter = $(chapter[i + 1])
        }
    }
    if ($('#menu .nowChapter').attr('href') != "#" + nowChapter.attr('id')) {
        /*if ($('#menu .nowChapter').attr('href') == "#" + previousChapter.attr('id')) {
            $('#menu').addClass('toNext')
        }
        if ($('#menu .nowChapter').attr('href') == "#" + nextChapter.attr('id')) {
            $('#menu').addClass('toPrevious')
        }*/
        $('#menu').addClass('changeing')
        setTimeout(function() { $('#menu').removeClass('changeing toNext toPrevious') }, 400);
    }

    if (previousChapter == undefined || previousChapter.length == 0)
        $('#menu .previousChapter').text('-').attr('href', '#!')
    else
        $('#menu .previousChapter').text(previousChapter.text()).attr('href', '#' + previousChapter.attr('id'));

    if (nowChapter == undefined || nowChapter.length == 0)
        $('#menu .nowChapter').text('-').attr('href', '#!')
    else
        $('#menu .nowChapter').text(nowChapter.text()).attr('href', '#' + nowChapter.attr('id'))

    if (nextChapter == undefined || nextChapter.length == 0)
        $('#menu .nextChapter').text('-').attr('href', '#!')
    else
        $('#menu .nextChapter').text(nextChapter.text()).attr('href', '#' + nextChapter.attr('id'))
});

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