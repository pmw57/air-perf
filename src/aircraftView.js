/*jslint browser */
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
            const el = document.getElementById(key);
            el.innerHTML = value.toFixed(precision[key]);
        });
    }
    function clearResults() {
        const resultSection = document.getElementById("results");
        const table = resultSection.querySelector("table");
        table.tBodies[0].innerHTML = "";
    }
    function insertCell(row, value) {
        const content = document.createTextNode(value);
        const cell = row.insertCell().appendChild(content);
        return cell;
    }
    function showResult(result) {
        const resultSection = document.getElementById("results");
        const table = resultSection.querySelector("table");
        const row = table.tBodies[0].insertRow(-1);
        result.forEach(function (value) {
            insertCell(row, value);
        });
    }
    function tooManyResults() {
        const resultSection = document.getElementById("results");
        const table = resultSection.querySelector("table");
        const row = table.tBodies[0].insertRow(-1);
        insertCell(row, "Stopping to avoid possible infinite loop.");
        row.children[0].colSpan = 5;
    }
    function renderResults(results, precision) {
        clearResults();
        results.data.forEach(function (result) {
            showResult([
                result.v.toFixed(precision.v),
                result.rc.toFixed(precision.rc),
                result.eta.toFixed(precision.eta),
                result.rs.toFixed(precision.rs),
                result.rec.toFixed(precision.rec)
            ]);
        });
        if (results.runaway) {
            return tooManyResults();
        }
        const performance = ["fp", "wv2", "rcmax", "vy", "vmax", "useful_load"];
        performance.forEach(function (prop) {
            const num = results[prop].toFixed(precision[prop]);
            document.getElementById(prop).innerHTML = num;
        });
    }
    function render({inputs, outputs, results}, precision) {
        renderInputs(inputs);
        renderOutputs(outputs, precision);
        renderResults(results, precision);
    }
    function init(formToUse) {
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