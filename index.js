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
converter.setOption('tables', true);
converter.setOption('tablesHeaderId', true);
converter.setOption('tasklists', true);
converter.setOption('emoji', true);
converter.setOption('openLinksInNewWindow', true);

function getFileList() {
    return fs.readdirSync(config.dataURL);
}

function getFileSummary(url, filename) {
    var data = fs.readFileSync(url + filename);

    post = opencc.convertSync(converter.makeHtml(data.toString()));
    title = excerpt.text(opencc.convertSync(filename.split(".")[0]), 18, '...')
    postSummary = excerpt.text(post, 128, '...').replace(new RegExp('<br />', "g"), '');
    return {
        'title': title,
        'summary': postSummary,
        'link': '/post/' + filename,
    };
}

function getFile(url, filename) {
    return opencc.convertSync(converter.makeHtml(fs.readFileSync(url + filename).toString()));
}


function getPosts() {
    posts = []
    var files = getFileList()
    for (i in files) {
        let file2read = files[i]
        let things2push = getFileSummary(config.dataURL, file2read)
        posts.push(things2push)
    }
    posts = posts.sort((a, b) => {
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
app.get('/page/:type/:id', (req, res) => {
    let page = Number(req.params.id)
    if (req.params.type == 'list') {
        var renderFile = "page_list",
            type = "list"
    } else {
        var renderFile = "page",
            type = "card"
    }
    if (req.session.pass != config.password.password && config.password.status) {
        res.redirect("/login/")
        return
    }
    if (getPage(1).pages < req.params.id || !Number.isInteger(page) || page < 1) {
        res.redirect("/page/" + type + "/1")
        return
    }
    res.render(renderFile, {
        title: config.siteName,
        data: getPage(page).postExport,
        page: renderFile,
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
app.get('/post/:id', (req, res) => {
    if (req.session.pass != config.password.password && config.password.status) {
        res.redirect("/login/")
        return
    }
    post = getFile(config.dataURL, req.params.id)
    res.render('post', {
        title: opencc.convertSync(req.params.id.split(".")[0]) + ' - ' + config.siteName,
        postTitle: opencc.convertSync(req.params.id.split(".")[0]),
        postContent: opencc.convertSync(post),
        lang: lang,
        page: 'post'
    })
});

//============
//    Login
//============
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

//============
//   Search
//============


function searchFiles(content) {
    console.log(content)
    search = []
    var files = getFileList()
    for (i in files) {
        var keywordCount = 0
        let file2read = files[i]
        let fileContent = getFile(config.dataURL, file2read)
        for (var i = 0; i < content.length; i++) {
            if (fileContent.indexOf(content[i]) != -1) {
                var keywordCount = keywordCount + 1
            }
            if (keywordCount == content.length) {
                let things2push = getFileSummary(config.dataURL, file2read)
                search.push(things2push)
            }
        }
    }
    search = search.sort((a, b) => {
        return a.title.localeCompare(b.title, "zh-TW");
    });
    return search

}
app.get('/search/:type/:id', (req, res) => {
    var search = req.params.id
    var type = req.params.type
    if (type == 'list')
        var renderFile = 'page_list',
            page = 'search_list'
    else
        var renderFile = 'page',
            page = 'search'
    if (req.session.pass != config.password.password && config.password.status) {
        res.redirect("/login/")
        return
    }
    res.render(renderFile, {
        title: config.siteName,
        data: searchFiles(search.split(" ")),
        page: page,
        totalPage: 1,
        allowRefresh: config.allowRefresh,
        lang: lang,
        nowPage: search
    })

});

//============
//   Error
//============
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

//============
//   Start
//============
app.listen(config.sitePort, () => {
    console.log('\n' + config.siteName)
    console.log(Date())
    console.log("working on http://localhost:" + config.sitePort + '\n')
        //getPosts
    getPosts();
})