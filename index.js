//============
//    Load
//============
const fs = require('fs'); //檔案系統
const excerpt = require("html-excerpt"); // 取摘要
const config = require("./config.json"); // 設定
const package = require("./package.json"); // package.json
const lang = require("./langs/" + config.lang + '.json'); // Lang

// express
const express = require('express');
const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(require('body-parser').urlencoded({
    extended: true,
}));
app.use(require('express-session')({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
}));
app.use('/', express.static('public'));


// Markdown viewer
const converter = new(require('showdown')).Converter({
    'simplifiedAutoLink': true,
    'excludeTrailingPunctuationFromURLs': true,
    'simpleLineBreaks': true,
    'tables': true,
    'tablesHeaderId': true,
    'tasklists': true,
    'emoji': true,
    'openLinksInNewWindow': true
})

const timeout = ms => new Promise(res => setTimeout(res, ms))

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
    let fileContent;
    try {
        fileContent = converter.makeHtml(fs.readFileSync(url + filename).toString())
    } catch (e) {
        fileContent = false
    }
    return fileContent
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
                title: config.siteName,
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

app.get('/', (req, res) =>
    res.render('index', {
        title: config.siteName,
        config: config,
        lang: lang,
        page: 'home',
    })
);

app.get('/mdr/posts', (req, res) => res.json(posts));

app.get('/mdr/post/:id', (req, res) => res.json({
    title: req.params.id.replace(/\.[^.]+$/, ''),
    content: getFile(config.dataURL, req.params.id)
}));



//============
// pageSwitch
//============
function searchFiles(keywords) {
    let url = config.dataURL
    let result = []
    let files = fs.readdirSync(url);
    for (i in files) {
        let file2read = files[i]
        let stat = fs.statSync(url + file2read)
        if (stat.isFile() && !file2read.match(/^\.\_/)) {
            let keywordCount = 0
            let fileContent = getFile(url, file2read)
            if (fileContent) {
                for (var i = 0; i < keywords.length; i++) {
                    if (file2read.match(keywords[i])) keywordCount += 1
                    if (fileContent.match(keywords[i])) keywordCount += 1
                    if (keywordCount >= keywords.length) {
                        result.push(getFileSummary(url, file2read))
                    }
                }
            }
        }
    }
    return result.sort((a, b) => a.title.localeCompare(b.title, "zh-TW"));
}

//============
//   Search
//============
app.get('/mdr/search/:keyword', (req, res) => res.json(
    searchFiles(
        req.params.keyword.split(" ")
    )
));


//============
//   Error
//============
app.use((req, res, next) =>
    res.render('index', {
        title: config.siteName,
        config: config,
        lang: lang,
        page: 'home',
    })
);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('500')
}); // error

//============
//   Start
//============
app.listen(config.sitePort, () => {
    console.log(`[MarkdownReader] ${package.version}`)
    console.log(`[MarkdownReader] ${config.siteName}`)
    console.log(`[MarkdownReader] ${Date()}`)
    console.log(`[MarkdownReader] http://localhost:${config.sitePort}`)
    getDir()
})

let isUpdateing = false
fs.watch(config.dataURL, async () => {
    if (isUpdateing) {
        await timeout(10000); // wait for 10s
        isUpdateing = false
    } else {
        isUpdateing = true
        await timeout(10000); // wait for 10s
        console.log(`[MarkdownReader] ${config.dataURL} update data`)
        getDir()
    }
})