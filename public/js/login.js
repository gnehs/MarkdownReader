$(document).ready(function() {
    $("#userPASS").keypress(function(event) {
        if (event.keyCode == 13) {
            check()
        }
    });
});

function check() {
    let pass = document.getElementById("userPASS").value.trim()

    let wrongPassword = window.localStorage.lang ?
        JSON.parse(window.localStorage.lang).login.wrongPassword :
        "You've entered the wrong password"
    let enterPassword = window.localStorage.lang ?
        JSON.parse(window.localStorage.lang).login.enterPassword :
        "Please enter the password"

    //判斷是否為空(全空格也算空)
    if (pass) {
        window.sessionStorage["pass"] = pass
        $.post("/login/", { userPASS: pass }, data => data ?
            document.location.href = "/" :
            swal({
                title: wrongPassword,
                icon: "error",
            })
        );
        return false;
    }
    //非法輸入提示
    else {
        swal({
            title: enterPassword,
            icon: "error",
        })
        return false;
    }
}