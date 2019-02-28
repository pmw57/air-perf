/*jslint browser */
var csv = (function makeCsv() {
    "use strict";

    var fetchCsv = {};
    var csvText = "";

    function loadText(filename) {
        function textHandler(text) {
            csvText = text;
        }
        function responseHandler(response) {
            return response.text().then(textHandler);
        }
        fetchCsv = window.fetch(filename).then(responseHandler);
        return fetchCsv;
    }
    function getText(filename, callback) {
        if (typeof filename === "string") {
            loadText(filename).then(function () {
                callback(csvText);
            });
        }
        if (typeof filename === "function") {
            callback = filename;
            fetchCsv.then(function () {
                callback(csvText);
            });
        }
    }
    function parseText(callback) {
        fetchCsv.then(function () {
            var arr = csvText.split("\n").map(function (line) {
                return line.split(",");
            });
            callback(arr);
        });
    }
    return {
        load: loadText,
        get: getText,
        parse: parseText
    };
}());
