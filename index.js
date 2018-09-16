//============
//    Load
//============
const fs = require('fs'); //檔案系統
const excerpt = require("html-excerpt"); // 取摘要
const config = require("./config.json"); // 設定
const lang = require("./langs/" + config.lang + '.json'); // Lang

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
const opencc = new(require('opencc'))('s2twp.json');

// Markdown viewer
const converter = new(require('showdown')).Converter()
converter.setOption('simplifiedAutoLink', true);
converter.setOption('excludeTrailingPunctuationFromURLs', true);
converter.setOption('simpleLineBreaks', true);
converter.setOption('tables', true);
converter.setOption('tablesHeaderId', true);
converter.setOption('tasklists', true);
converter.setOption('emoji', true);
converter.setOption('openLinksInNewWindow', true);


function getFileSummary(url, filename) {
    var data = fs.readFileSync(url + filename);
    let time = fs.statSync(url + filename).mtime
    post = opencc.convertSync(converter.makeHtml(data.toString()));
    title = excerpt.text(opencc.convertSync(filename.replace(/\.[^.]+$/, '')), 18, '...')
    postSummary = excerpt.text(post, 128, '...').replace(new RegExp('<br />', "g"), '');
    return {
        title: title,
        summary: postSummary,
        link: '/post/' + filename,
        time: time
    };
}

function getFile(url, filename) {
    return opencc.convertSync(converter.makeHtml(fs.readFileSync(url + filename).toString()));
}


function getDir(url = config.dataURL) {
    posts = []
    dirs = [{
        "url": config.dataURL
    }]
    var files = fs.readdirSync(url);
    for (i in files) {
        let file2read = files[i]
        let stat = fs.statSync(url + files[i])
        if (stat.isDirectory())
            posts.push(getDirSummary(file2read))
        else if (stat.isFile())
            posts.push(getFileSummary(url, file2read))
    }
    posts = posts.sort((a, b) => {
        return a.title.localeCompare(b.title, "zh-TW");
    });
    return posts
}

function getDirSummary(url) {
    var dir = fs.readdirSync(config.dataURL + url + '/');
    var summary = lang.page.folder + " / " + dir.toString()
    dirs.push({
        "url": config.dataURL + url + '/'
    })
    return {
        'title': url,
        'summary': excerpt.text(summary, 128, '...'),
        'link': '#',
        'icon': 'folder icon'
    };
}
//============
//    Login
//============
app
    .get('/login/', (req, res) => {
        if (config.password.enabled)
            res.render('login', {
                title: lang.login.header + ' - ' + config.siteName,
                lang: lang,
                page: 'login'
            })
        else
            res.redirect("/")
    })
    .post('/login/', (req, res) => {
        req.session.pass = req.body['userPASS']
        if (req.body['userPASS'] != config.password.password && config.password.enabled)
            res.render('login', {
                title: config.siteName,
                page: 'login',
                lang: lang,
                message: lang.login.wrongPassword
            })
        else
            res.redirect("/")
    });

app.use((req, res, next) => {
    if (req.session.pass != config.password.password && config.password.enabled)
        res.redirect("/login/")
    else
        next()
});
//============
//    Main
//============

app.get('/', (req, res) => {
    res.render('index', {
        title: config.siteName,
        recently: posts.sort((a, b) => b.time - a.time).slice(0, 6),
        data: posts,
        config: config,
        lang: lang,
        page: 'home',
    })

});
app.get('/page/:id', (req, res) => {

    let page = Number(req.params.id)
    if (getPage(1).pages < req.params.id || !Number.isInteger(page) || page < 1) {
        res.redirect("/page/1")
        return
    }
    res.render("page", {
        title: config.siteName,
        data: getPage(page).postExport,
        totalPage: getPage(page).pages,
        lang: lang,
        nowPage: page
    })
});
app.get('/post/:id', (req, res) => {
    post = getFile(config.dataURL, req.params.id)
    title = opencc.convertSync(req.params.id).replace(/\.[^.]+$/, '')
    res.render('post', {
        title: title,
        postTitle: title,
        postContent: opencc.convertSync(post),
        lang: lang,
        page: 'post'
    })
});



//============
// pageSwitch
//============

function getPage(num, postData = posts) {
    var pages = Math.ceil(postData.length / config.postPerPage); //算出所需頁數
    if (num > pages) { return } //確定真的收到數字及收到的數字是否大於總頁數
    var firstPost = (num - 1) * config.postPerPage //輸出的第一個文章
    let postExport = postData.slice(firstPost, firstPost + config.postPerPage)
    return { postExport, pages }
}

//============
//   Search
//============

app.get('/search/', (req, res) => {

    res.render('search', {
        title: lang.search.search + ' - ' + config.siteName,
        lang: lang,
        page: 'search'
    })
});

function searchFiles(content) {
    search = []
    var files = fs.readdirSync(config.dataURL);
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
app.get('/search/:id', (req, res) => {

    var search = req.params.id
    res.render('page', {
        title: config.siteName,
        data: searchFiles(search.split(" ")),
        page: 'search',
        totalPage: 1,
        lang: lang,
        nowPage: search
    })

});

//============
//   Error
//============
app.use((req, res, next) => {
    res.status(404).render('error', {
        title: lang.error["404"].title,
        message: lang.error["404"].message,
        lang: lang,
        page: 'error'
    })
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: lang.error["500"].title,
        message: lang.error["500"].message,
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
    getDir()
})
fs.watch(config.dataURL, (eventType, filename) => { getDir() })