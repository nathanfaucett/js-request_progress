var now = require("@nathanfaucett/now"),
    clamp = require("@nathanfaucett/clamp"),
    isFunction = require("@nathanfaucett/is_function"),
    EventEmitter = require("@nathanfaucett/event_emitter"),
    XMLHttpRequestPolyfill = require("@nathanfaucett/xmlhttprequest_polyfill"),
    requestAnimationFrame = require("@nathanfaucett/request_animation_frame");


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

function requestStart() {
    if (started === false) {
        started = true;
        ended = false;
        currentDelta = 0;
        requestProgress.emit("start");
        setProgressFake(0.1);
    }
    startTime = now();
    totalRequests += 1;
}

function requestDone() {
    completedRequests += 1;
    setProgress(completedRequests / totalRequests, now() - startTime);
}

function setProgressFake(value) {
    previousState = 0;
    nextState = value;

    frameDelta = 1000 + Math.random() * 2500;
    frameTime = now();
    frameCount = 0;

    requestAnimationFrame.cancel(requestId);
    requestId = requestAnimationFrame(increment, requestProgress.element);
}

function setProgress(value, delta) {
    previousState = nextState;
    nextState = value;

    previousDelta = currentDelta;
    currentDelta = delta;

    frameDelta = delta - previousDelta;
    frameTime = now();
    frameCount = 0;

    requestAnimationFrame.cancel(requestId);
    requestId = requestAnimationFrame(increment, requestProgress.element);
}

function increment(ms) {
    var last = frameTime,
        dt = ms - last;

    frameTime = ms;
    frameCount += dt;

    currentState = lerp(previousState, nextState, clamp(frameCount / frameDelta), 0, 1);
    requestProgress.emit("update", currentState);

    if (currentState < 1) {
        requestAnimationFrame.cancel(requestId);
        requestId = requestAnimationFrame(increment, requestProgress.element);
    } else {
        requestAnimationFrame.cancel(requestId);
        setTimeout(end, requestProgress.endPauseTime);
    }
}

function end() {
    if (ended === false) {
        started = false;
        ended = true;
        requestProgress.emit("end");
    }
}


requestProgress.element = null;
requestProgress.endPauseTime = 250;

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
