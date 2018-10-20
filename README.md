<p align="center">
  <img src="https://github.com/gnehs/MarkdownReader/blob/master/public/icon/icon.png?raw=true" width="300px">
</p>

# MarkdownReader

這是一個利用 node.js 將資料夾內的 markdown 檔案變成一個精美的網頁

## 功能

-   密碼登入
-   自動重整
-   繁體化文章
-   自訂網站名稱
-   自訂網站 Port
-   自訂載入資料位置
-   自訂一頁顯示多少文章
-   搜尋

## 開始使用

1. `npm install`
2. 修改 `config.json`

```
{
    "siteName": "髒髒站",         //網站名稱
    "sitePort": 3014,            //網站 port
    "dataURL": "./data/",        //資料位置
    "allowRefresh": true,        //是否開啟手動重整功能[true|false]
    "autoRefresh": 60,           //自動重整間隔（分鐘）
    "password": {                //密碼登入
        "status": true,          //開啟或關閉[true|false]
        "password": "1069"       //密碼
    },
    "postPerPage": 9,            //一頁顯示多少文章
    "sessionSecret": "1069" //session secret
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
    "allowRefresh": true,        //allow manual refresh[true|false]
    "autoRefresh": 60,           //auto refresh（minute）
    "password": {                //password login
        "status": true,          //turn on or turn off[true|false]
        "password": "1069"       //password
    },
    "postPerPage": 9,            //posts per page
    "sessionSecret": "Spring"    //session secret
}
```

3. `npm start`

## Docker

https://hub.docker.com/r/gnehs/markdownreader/

`/app/config.json` 設定檔位置

`/app/data/` 資料位置
