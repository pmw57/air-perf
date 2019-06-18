// When given a stats object containing keyed values, and
// access via view to form values, output fields, and result fields,
// returns an object similar to the stats object, that only contains
// the matching key names.

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

export default Object.freeze({
    getInputs,
    getOutputs,
    getResults
});