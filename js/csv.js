/*jslint browser */
/*global saveAs*/
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
    function saveText(csvText, filename) {
        saveAs(new window.Blob([csvText], {
            type: "text/csv"
        }), filename);
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
    function commaSeparated([key, value]) {
        return key + "," + value;
    }
    function csvInputs(inputs) {
        var inputCsv = Object.entries(inputs).map(commaSeparated);
        return ["Input parameters", ...inputCsv, ""];
    }
    function csvOutputs(outputs) {
        var outputCsv = Object.entries(outputs).map(commaSeparated);
        return ["Outputs parameters", ...outputCsv, ""];
    }
    function csvResults(results) {
        var performance = results.data.map(function (item) {
            // eta: 0.3558142859727815
            // rc: 430.01543159205403
            // rec: 2604060
            // rs: 1448.6839983442321
            // v: 25
            return [item.v, item.rc, item.eta, item.rs, item.rec];
        });

        var resultsSummary = JSON.parse(JSON.stringify(results));
        delete resultsSummary.data;
        var summary = Object.entries(resultsSummary).map(commaSeparated);

        return [
            "Results",
            ["v(mph)", "rc(fpm)", "eta", "rs(fpm)", "re=rho*v*c/mu"],
            ...performance,
            "",
            ...summary,
            ""
        ];
    }
    function stringify({inputs, outputs, results}) {
        return [
            ...csvInputs(inputs),
            ...csvOutputs(outputs),
            ...csvResults(results)
        ].join("\n");
    }
    return {
        set: setText,
        load: loadText,
        save: saveText,
        get: getText,
        toArray: convertToArray,
        loadWrapper: loadWrapper,
        stringify: stringify
    };
}());
