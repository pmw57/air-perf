/*jslint browser */
var csv = (function makeCsv() {
    "use strict";

    var fetchCsv = undefined;
    var csvText = "";

    function setText(content) {
        fetchCsv = undefined;
        csvText = content;
    }
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
    function splitByComma(line) {
        return line.split(",");
    }
    function convertToArray() {
        return csvText.split("\n").map(splitByComma);
    }
    function parseText(callback) {
        var arr = convertToArray();
        callback(arr);
    }
    function parseWrapper(callback) {
        return function wrapper() {
            parseText(callback);
        };
    }
    function parseHandler(callback) {
        if (typeof fetchCsv === "object") {
            return fetchCsv.then(parseWrapper(callback));
        }
        parseText(callback);
    }
    return {
        set: setText,
        load: loadText,
        get: getText,
        parse: parseHandler
    };
}());
