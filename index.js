//============
//    Load
//============
const fs = require('fs'); //檔案系統
const excerpt = require("html-excerpt"); // 取摘要
const config = require("./config.json"); // 設定
const lang = require("./langs/" + config.lang + '.json'); // Lang
const schedule = require('node-schedule'); // 排程表


// express
const express = require('express');
const bodyParser = require('body-parser'); // 讀入 post 請求
const session = require('express-session'); // session
const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
}));
app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/icon', express.static('icon'));

//簡轉繁
const OpenCC = require('opencc');
const opencc = new OpenCC('s2twp.json');

// Markdown viewer
const showdown = require('showdown')
const converter = new showdown.Converter()
converter.setOption('simplifiedAutoLink', true);
converter.setOption('excludeTrailingPunctuationFromURLs', true);
converter.setOption('simpleLineBreaks', true);
converter.setOption('openLinksInNewWindow', true);


//getPosts
getPosts();
posts = []

function getPosts() {
    fs.readdir(config.dataURL, function(err, files) {
        for (i in files) {
            let file2read = files[i]
            fs.readFile(config.dataURL + file2read, (err, data) => {
                if (err) {
                    throw err;
                }
                post = opencc.convertSync(converter.makeHtml(data.toString()));
                title = excerpt.text(opencc.convertSync(file2read.split(".")[0]), 18, '...')
                postSummary = excerpt.text(post, 128, '...').replace(new RegExp('<br />', "g"), '');
                pushPosts({
                    'summary': postSummary,
                    'title': title,
                    'link': '/post/' + file2read,
                });
            });
        }
    });
}

function pushPosts(data) {
    posts.push(data)
    posts = posts.sort(function(a, b) {
        return a.title.localeCompare(b.title, "zh-TW");
    });
}

//============
//    Main
//============

app.get('/', (req, res) => {
    if (req.session.pass != config.password.password && config.password.status)
        res.redirect("/login/")
    else {
        res.render('index', {
            title: config.siteName,
            data: posts,
            config: config,
            lang: lang,
            page: 'home',
        })
    }
});
app.get('/page/:id', (req, res) => {
    let page = Number(req.params.id)
    if (req.session.pass != config.password.password && config.password.status) {
        res.redirect("/login/")
        return
    }
    if (getPage(1).pages < req.params.id || !Number.isInteger(page) || page < 1) {
        res.redirect("/page/1")
        return
    }
    res.render('page', {
        title: config.siteName,
        data: getPage(page).postExport,
        page: 'page',
        totalPage: getPage(page).pages,
        allowRefresh: config.allowRefresh,
        lang: lang,
        nowPage: page
    })
});
app.get('/page/list/:id', (req, res) => {
    let page = Number(req.params.id)
    if (req.session.pass != config.password.password && config.password.status) {
        res.redirect("/login/")
        return
    }
    if (getPage(1).pages < req.params.id || !Number.isInteger(page) || page < 1) {
        res.redirect("/page/list/1")
        return
    }
    res.render('page_list', {
        title: config.siteName,
        data: getPage(page).postExport,
        page: 'page_list',
        totalPage: getPage(page).pages,
        allowRefresh: config.allowRefresh,
        lang: lang,
        nowPage: page
    })
});
app.get('/refresh/', (req, res) => {
    posts = []
    getPosts()
    res.redirect("/")
});
app.get('/login/', (req, res) => {
    if (config.password.status)
        res.render('login', {
            title: config.siteName,
            lang: lang,
            page: 'login'
        })
    else
        res.redirect("/")
});
app.post('/login/', (req, res) => {
    req.session.pass = req.body['userPASS']
    if (req.body['userPASS'] != config.password.password && config.password.status)
        res.render('login', {
            title: config.siteName,
            page: 'login',
            lang: lang,
            message: lang.login.wrongPassword
        })
    else
        res.redirect("/")
});
app.get('/post/:id', (req, res) => {
    if (req.session.pass != config.password.password && config.password.status) {
        res.redirect("/login/")
        return
    }
    fs.readFile(config.dataURL + req.params.id, (err, data) => {
        if (err) {
            throw err;
        }
        post = converter.makeHtml(data.toString());
        res.render('post', {
            title: opencc.convertSync(req.params.id.split(".")[0]) + ' - ' + config.siteName,
            postTitle: opencc.convertSync(req.params.id.split(".")[0]),
            postContent: opencc.convertSync(post),
            lang: lang,
            page: 'post'
        })
    });
});
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: lang.error.error + ' 404',
        message: lang.error.error_404,
        lang: lang,
        page: 'error'
    })
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: lang.error.error + ' 500',
        message: lang.error.error_500,
        lang: lang,
        page: 'error'
    })
}); // error

app.listen(config.sitePort, () => {
    console.log('\n' + config.siteName)
    console.log(Date())
    console.log("working on http://localhost:" + config.sitePort + '\n')
})

//============
// AutoRefresh
//============
setInterval(() => {
    console.log('AutoRefresh');
    posts = [];
    getPosts();
}, parseFloat(config.autoRefresh) * 1000 * 60)

//============
// pageSwitch
//============

function getPage(num) {
    var pages = Math.ceil(posts.length / config.postPerPage); //算出所需頁數
    if (num > pages) { return } //確定真的收到數字及收到的數字是否大於總頁數
    var firstPost = (num - 1) * config.postPerPage + 1 //輸出的第一個文章
    let postExport = []
    for (var i = 0; i < config.postPerPage; i++) {
        post = i + firstPost - 1
        if (posts[post] != undefined)
            postExport.push(posts[post])
    }
    return { postExport, pages }
}