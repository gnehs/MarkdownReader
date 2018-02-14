function check() {
    var pass = document.getElementById("userPASS").value.trim()

    //判斷是否為空(全空格也算空)
    if (pass) {
        window.sessionStorage["pass"] = pass
        return true;
    }
    //非法輸入提示
    else {
        alert('請正確填寫內容')
        return false;
    }
}