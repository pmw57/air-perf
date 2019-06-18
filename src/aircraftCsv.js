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

export default Object.freeze({
    getInputs
});