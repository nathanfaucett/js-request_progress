var Cors = require("cors"),
    BodyParser = require("body_parser"),
    layers = require("layers"),
    context = require("context"),

    router = new layers.Router(),
    server = new require("http").Server(function(req, res) {

        context.init(req, res);
        router.handler(req, res);
    });

router.use(
    new Cors(),
    new BodyParser()
);

function createSpaceBuffer(length) {
    var str = "",
        i = length;

    while (i--) {
        str += " ";
    }

    return new Buffer(str);
}

router.route()
    .get(function(req, res, next) {
        var buffer = createSpaceBuffer(4096);

        res.writeHead(200, {
            "Content-Type": "application/javascript",
            "Content-Length": Buffer.byteLength(buffer)
        });

        setTimeout(function() {
            res.end(buffer);
            next();
        }, Math.random() * 300);
    })
    .post(function(req, res, next) {
        res.json(req.body);
        next();
    })
    .patch(function(req, res, next) {
        res.json(req.body);
        next();
    })
    .all(function(err, req, res, next) {
        if (!res.sent) {
            res.statusCode = (res.statusCode < 301 || res.statusCode === 304) ? 404 : res.statusCode;

            res.json({
                statusCode: res.statusCode,
                message: (err || "Not Found") + ""
            });
        }
        next();
    });

server.listen(3000);
