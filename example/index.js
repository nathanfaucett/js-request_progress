var requestProgress = require("../src/index");


requestProgress.attachToGlobal();


var div = document.getElementById("progress");


requestProgress.element = div;

requestProgress.on("start", function() {
    console.log("start");
    console.time("progress");
});
requestProgress.on("end", function() {
    div.style.width = "0%";
    console.log("end");
    console.timeEnd("progress");
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

        if (++count !== 5) {
            doit();
        }
    }());
}

request();

global.request = request;
