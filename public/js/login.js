function check() {
    let pass = document.getElementById("userPASS").value.trim()

    let wrongPassword = window.localStorage.lang ? JSON.parse(window.localStorage.lang).login.wrongPassword : "You've entered the wrong password"

    //判斷是否為空(全空格也算空)
    if (pass) {
        window.sessionStorage["pass"] = pass
        $.post("/login/", { userPASS: pass }, data => data ? document.location.href = "/" : alert(wrongPassword));
        return false;
    }
    //非法輸入提示
    else {
        alert(wrongPassword)
        return false;
    }
}