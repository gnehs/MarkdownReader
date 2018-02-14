# MarkdownReader
MarkdownReader
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
    "sessionSecret": "ㄐㄐ讚1069" //session secret
}
```
3. `npm start`
## Getting Started
1.  `npm install`
2.  Modify the `config.json`
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
