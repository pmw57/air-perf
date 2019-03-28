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
    function loadHandler(evt, callback) {
        var inputField = evt.target;
        var file = inputField.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function contentLoaded(readerEvent) {
            var content = readerEvent.target.result;
            csv.set(content);
            var csvArr = csv.toArray();
            callback(csvArr);
            const saveInput = document.querySelector(".js-savefile");
            saveInput.value = file.name;
        };
    }
    function loadWrapper(callback) {
        return function handler(evt) {
            return loadHandler(evt, callback);
        };
    }
    return {
        set: setText,
        load: loadText,
        get: getText,
        toArray: convertToArray,
        loadWrapper: loadWrapper
    };
}());
