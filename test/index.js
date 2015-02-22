var requestProgress = require("../src/index");


var XMLHttpRequest = global.XMLHttpRequest;


var div = document.getElementById("progress");


requestProgress.on("start", function() {
    console.log("start");
});
requestProgress.on("end", function() {
    div.style.width = "0%";
    console.log("end");
});
requestProgress.on("update", function(percent) {
    div.style.width = (percent * 100) + "%";
});


function makeRequest() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:3000", true);
    xhr.send();
}


function request() {
    var count = 0;

    (function doit() {
        makeRequest();

        count++;
        if (count !== 5) {
            doit();
        }
    }());
}

request();

global.request = request;
