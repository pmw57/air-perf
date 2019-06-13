/*jslint browser */
var csv_spike = (function makeCsv() {
    "use strict";

    function commaSeparated([key, value]) {
        return key + "," + value;
    }
    function convertToCsv(data) {
        return Object.entries(data).map(commaSeparated);
    }
    function csvInputs(inputs) {
        var inputCsv = convertToCsv(inputs);
        return ["Input parameters", ...inputCsv, ""];
    }
    function csvOutputs(outputs) {
        var outputCsv = Object.entries(outputs).map(commaSeparated);
        return ["Outputs parameters", ...outputCsv, ""];
    }
    function csvResults(results) {
        var performance = results.data.map(function (item) {
            return [item.v, item.rc, item.eta, item.rs, item.rec];
        });

        var resultsSummary = JSON.parse(JSON.stringify(results));
        delete resultsSummary.data;
        var summary = Object.entries(resultsSummary).map(commaSeparated);

        return [
            "Results",
            ...summary,
            "",
            ["v(mph)", "rc(fpm)", "eta", "rs(fpm)", "re=rho*v*c/mu"],
            ...performance,
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
        stringify: stringify
    };
}());
