var time = require("time"),
    isFunction = require("is_function"),
    EventEmitter = require("event_emitter"),
    XMLHttpRequestPolyfill = require("xmlhttprequest_polyfill"),
    requestAnimationFrame = require("request_animation_frame");


var requestProgress = module.exports = new EventEmitter(),

    currentState = 0,
    previousState = 0,
    nextState = 0,

    startTime = 0,
    frameTime = 0,
    frameCount = 0,
    frameDelta = 0,

    currentDelta = 0,
    previousDelta = 0,

    started = false,
    ended = true,

    totalRequests = 0,
    completedRequests = 0,

    requestId = null;


function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp01(x) {
    return x > 1 ? 1 : (x < 0 ? 0 : x);
}

function requestStart() {
    if (started === false) {
        started = true;
        ended = false;
        currentDelta = 0;
        requestProgress.emit("start");
    }
    startTime = time.now();
    totalRequests += 1;
}

function requestDone() {
    completedRequests += 1;
    setProgress(completedRequests / totalRequests, time.now() - startTime);
}

function setProgress(value, delta) {
    previousState = nextState;
    nextState = value;

    previousDelta = currentDelta;
    currentDelta = delta;

    frameDelta = delta - previousDelta;
    frameTime = time.now();
    frameCount = 0;

    requestAnimationFrame.cancel(requestId);
    requestId = requestAnimationFrame(increment);
}

function increment(ms) {
    var last = frameTime,
        dt = ms - last;

    frameTime = ms;
    frameCount += dt;

    currentState = lerp(previousState, nextState, clamp01(frameCount / frameDelta));
    requestProgress.emit("update", currentState);

    if (currentState < 1) {
        requestAnimationFrame.cancel(requestId);
        requestId = requestAnimationFrame(increment);
    } else {
        requestAnimationFrame.cancel(requestId);
        setTimeout(end, 100);
    }
}

function end() {
    if (ended === false) {
        started = false;
        ended = true;
        requestProgress.emit("end");
    }
}


requestProgress.startRequest = function() {
    requestStart();
};

requestProgress.finishRequest = function() {
    requestDone();
};

requestProgress.attachToGlobal = function() {
    function XMLHttpRequest() {
        var xhr = new XMLHttpRequestPolyfill();

        function onReadyStateChange() {
            var state = +xhr.readyState;

            if (state === 1) {
                requestStart();
            } else if (state === 4) {
                requestDone();
            }
        }

        if (isFunction(xhr.addEventListener)) {
            xhr.addEventListener("readystatechange", onReadyStateChange, false);
        } else if (isFunction(xhr.attachEvent)) {
            xhr.attachEvent("onreadystatechange", onReadyStateChange);
        } else {
            xhr.onreadystatechange = onReadyStateChange;
        }

        return xhr;
    }

    XMLHttpRequest.prototype = XMLHttpRequestPolyfill.prototype;
    global.XMLHttpRequest = XMLHttpRequest;
};
