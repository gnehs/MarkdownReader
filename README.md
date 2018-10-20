<p align="center">
  <img src="https://github.com/gnehs/MarkdownReader/blob/master/public/icon/icon.png?raw=true" width="300px">
</p>

# MarkdownReader

這是一個利用 node.js 將資料夾內的 markdown 檔案變成一個精美的網頁

## 功能

-   密碼保護
-   按照名稱或文章名稱排序
-   夜間模式
-   搜尋

## 開始使用

1. `npm install`
2. 修改 `config.json`

```
{
    "siteName": "髒髒站",         //網站名稱
    "sitePort": 3014,            //網站 port
    "dataURL": "./data/",        //資料位置
    "password": {                //密碼登入
        "status": true,          //開啟或關閉[true|false]
        "password": "1069"       //密碼
    },
    "sessionSecret": "1069",     //session secret
    "lang": "zh_TW"              //語言
}
```

3. `npm start`

## Getting Started

1.  `npm install`
2.  edit `config.json`

```
{
    "siteName": "early spring",  //site name
    "sitePort": 3014,            //site port
    "dataURL": "./data/",        //data location
    "password": {                //password login
        "status": true,          //turn on or turn off[true|false]
        "password": "1069"       //password
    },
    "sessionSecret": "Spring",   //session secret
    "lang": "us_EN"              //lang
}
```

3. `npm start`

## Docker

https://hub.docker.com/r/gnehs/markdownreader/

`/app/config.json` 設定檔位置

`/app/data/` 資料位置
