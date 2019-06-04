const view = (function iife() {
    const props = {};
    function renderInputs(inputs) {
        const elements = props.form.elements;
        Object.entries(inputs).forEach(function ([key]) {
            if (!elements[key]) {
                throw new ReferenceError(key + " field not found");
            }
            elements[key].value = inputs[key];
        });
    }
    function getValues() {
        return Array.from(props.form.elements).reduce(function (obj, field) {
            obj[field.name] = field.value;
            return obj;
        }, {});
    }
    function renderOutputs(outputs, precision) {
        Object.entries(outputs).forEach(function ([key, value]) {
            const el = props.doc.querySelector("#" + key);
            el.innerHTML = Number(value).toFixed(precision[key]);
        });
    }
    function clearResults() {
        const resultSection = props.doc.querySelector("#results");
        const table = resultSection.querySelector("table");
        table.tBodies[0].innerHTML = "";
    }
    function insertCell(row, value) {
        const content = props.doc.createTextNode(value);
        const cell = row.insertCell().appendChild(content);
        return cell;
    }
    function showResult(result) {
        const resultSection = props.doc.querySelector("#results");
        const table = resultSection.querySelector("table");
        const row = table.tBodies[0].insertRow(-1);
        result.forEach(function (value) {
            insertCell(row, value);
        });
    }
    function tooManyResults() {
        const resultSection = props.doc.querySelector("#results");
        const table = resultSection.querySelector("table");
        const row = table.tBodies[0].insertRow(-1);
        insertCell(row, "Stopping to avoid possible infinite loop.");
        row.children[0].colSpan = 5;
    }
    function renderResults(results, precision) {
        const data = results.data;
        const otherResults = results;
        delete otherResults.data;
        clearResults();
        data.forEach(function (result) {
            showResult([
                Number(result.v).toFixed(precision.v),
                Number(result.rc).toFixed(precision.rc),
                Number(result.eta).toFixed(precision.eta),
                Number(result.rs).toFixed(precision.rs),
                Number(result.rec).toFixed(precision.rec)
            ]);
        });
        if (otherResults.runaway) {
            return tooManyResults();
        }
        Object.entries(otherResults).forEach(function ([prop, value]) {
            const num = Number(value).toFixed(precision[prop]);
            props.doc.querySelector("#" + prop).innerHTML = num;
        });
    }
    function render({inputs, outputs, results}, precision) {
        renderInputs(inputs);
        renderOutputs(outputs, precision);
        renderResults(results, precision);
    }
    function init(formToUse, doc) {
        props.doc = doc;
        props.form = formToUse;
    }
    return {
        getValues,
        renderInputs,
        renderOutputs,
        renderResults,
        render,
        init
    };
}());
export default Object.freeze(view);