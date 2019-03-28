/*jslint browser */
var csv = (function makeCsv() {
    "use strict";

    var promise = undefined;
    var csvText = "";

    function setText(content) {
        promise = undefined;
        csvText = content;
    }
    function loadText(filename, callback) {
        function textHandler(text) {
            csvText = text;
        }
        function responseHandler(response) {
            return response.text().then(textHandler);
        }
        promise = window.fetch(filename).then(responseHandler);
        if (typeof callback === "function") {
            promise.then(function callWithArray() {
                var csvArr = csv.toArray();
                callback(csvArr);
            });
        }
        return promise;
    }
    function getText(filename, callback) {
        if (typeof filename === "string") {
            loadText(filename).then(function () {
                callback(csvText);
            });
        }
        if (typeof filename === "function") {
            callback = filename;
            promise.then(function () {
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
    return {
        set: setText,
        load: loadText,
        get: getText,
        toArray: convertToArray,
    };
}());
