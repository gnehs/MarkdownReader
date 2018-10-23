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
app.use('/', express.static('public'));


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
    post = converter.makeHtml(data.toString())
    title = excerpt.text(filename.replace(/\.[^.]+$/, ''), 18, '...')
    postSummary = excerpt.text(post, 180, '...').replace(/<br \/>/g, ' / ');
    return {
        title: title,
        summary: postSummary,
        link: filename,
        time: time
    };
}

function getFile(url, filename) {
    return converter.makeHtml(fs.readFileSync(url + filename).toString())
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
        if (stat.isFile() && !file2read.match(/^\.\_/))
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
//    lang
//============
app.get('/lang', (req, res) => res.json(lang));
//============
//    Login
//============
app
    .get('/login/', (req, res) => {
        if (config.password.enabled && req.body.userPASS != config.password.password)
            res.render('login', {
                title: lang.login.header + ' - ' + config.siteName,
                lang: lang,
                page: 'login'
            })
        else
            res.redirect("/")
    })
    .post('/login/', (req, res) => {
        req.session.pass = req.body.userPASS
        res.send(config.password.enabled && req.body.userPASS == config.password.password)
    });

app.use((req, res, next) => {
    if (!config.password.enabled || config.password.enabled && req.session.pass == config.password.password) {
        res.header("Cache-Control", "max-age=7200") //快取 2hr
        next()
    } else
        res.redirect("/login/")
});
//============
//    Main
//============

app.get('/', (req, res) => {
    res.render('index', {
        title: config.siteName,
        config: config,
        lang: lang,
        page: 'home',
    })
});

app.get('/mdr/posts', (req, res) => res.json(posts));

app.get('/mdr/post/:id', (req, res) => res.json({
    title: req.params.id.replace(/\.[^.]+$/, ''),
    content: getFile(config.dataURL, req.params.id)
}));



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
app.get('/mdr/search/:keyword', (req, res) => res.json(
    searchFiles(
        req.params.keyword.split(" ")
    )
));

function searchFiles(content) {
    let url = config.dataURL
    let result = []
    let files = fs.readdirSync(url);
    for (i in files) {
        let file2read = files[i]
        let stat = fs.statSync(url + file2read)
        if (stat.isFile() && !file2read.match(/^\.\_/)) {
            let keywordCount = 0
            let fileContent = getFile(url, file2read)
            for (var i = 0; i < content.length; i++) {
                if (file2read.match(content[i])) keywordCount += 1
                if (fileContent.match(content[i])) keywordCount += 1

                if (keywordCount >= content.length) {
                    result.push(getFileSummary(url, file2read))
                }
            }
        }
    }
    return result.sort((a, b) => a.title.localeCompare(b.title, "zh-TW"));
}

//============
//   Error
//============
app.use((req, res, next) => {
    res.redirect("/")
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('500')
}); // error

//============
//   Start
//============
app.listen(config.sitePort, () => {
    console.log(`MarkdownReader`)
    console.log(Date())
    console.log(`http://localhost:${config.sitePort}`)
    getDir()
})
fs.watch(config.dataURL, (eventType, filename) => { getDir() })