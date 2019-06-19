// When given a stats object containing keyed values, and
// access via view to form values, output fields, and result fields,
// returns an object similar to the stats object, that only contains
import csv from "./csv.js";

function valuesFromObj(stats, keys) {
    return keys.reduce(function (result, key) {
        result[key] = stats[key];
        return result;
    }, {});
}
function getInputs(stats, view) {
    const formValues = view.getFormValues();
    return valuesFromObj(stats, Object.keys(formValues));
}
function getOutputs(data, view) {
    const outputFields = view.getOutputFields();
    return valuesFromObj(data, Object.keys(outputFields));
}
function getResults(data, view) {
    const resultFields = view.getResultFields();
    const results = valuesFromObj(data.results, Object.keys(resultFields));
    results.data = data.table;
    return results;
}
function csvInputs(stats, view) {
    const inputs = getInputs(stats, view);
    const inputCsv = csv.stringify(inputs);
    const blankLine = "";
    return ["Input parameters", ...inputCsv, blankLine];
}
function csvOutputs(stats, view) {
    const outputs = getOutputs(stats, view);
    const outputCsv = csv.stringify(outputs);
    const blankLine = "";
    return ["Output parameters", ...outputCsv, blankLine];
}
function csvResults(stats, view) {
    const results = getResults(stats, view);
    const performance = csv.stringify(results.data);
    delete results.data;
    const summary = csv.stringify(results);
    return [
        "Results",
        ...summary,
        "",
        ["v(mph)", "rc(fpm)", "eta", "rs(fpm)", "re=rho*v*c/mu"],
        ...performance,
        ""
    ];
}

export default Object.freeze({
    getInputs,
    csvInputs,
    getOutputs,
    csvOutputs,
    getResults,
    csvResults
});