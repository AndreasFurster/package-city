"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const ChangesStream = require('changes-stream');
const Normalize = require(`normalize-registry-metadata`);
const db = 'https://replicate.npmjs.com';
var changes = new ChangesStream({
    db: db,
    include_docs: true,
    since: 'now',
    filter: (doc) => !!doc.name
});
const app = express();
app.set("port", process.env.PORT || 3000);
let http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
let io = require("socket.io")(http);
app.get("/", (req, res) => {
    res.sendFile(path.resolve("./client/index.html"));
});
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", function (socket) {
    changes.on('data', function (change) {
        var doc = Normalize(change.doc);
        if (!doc.versions)
            return;
        var versions = Object.keys(doc.versions);
        if (versions.length == 1) {
            console.log(`New package! ${doc.name} - ${versions[versions.length - 1]}`);
            socket.emit("update", `New package! ${doc.name} - ${versions[versions.length - 1]}`);
        }
        else {
            console.log(`Packge updated! ${doc.name} - ${versions[versions.length - 1]}`);
            socket.emit("update", `Packge updated! ${doc.name} - ${versions[versions.length - 1]}`);
        }
    });
    console.log("a user connected");
    // whenever we receive a 'message' we log it out
    socket.on("message", function (message) {
        console.log(message);
        socket.emit("update", message);
    });
});
const server = http.listen(3000, function () {
    console.log("listening on *:3000");
});
//# sourceMappingURL=server.js.map