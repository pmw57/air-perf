const view = (function iife() {
    const props = {};
    function renderInputs(data) {
        const elements = props.form.elements;
        Object.entries(data).forEach(function ([key]) {
            if (!elements[key]) {
                return;
            }
            elements[key].value = data[key];
        });
    }
    function getFormValues() {
        return Array.from(props.form.elements).reduce(function (obj, field) {
            obj[field.name] = field.value;
            return obj;
        }, {});
    }
    function getOutputFields() {
        const results = props.doc.querySelector("#summary");
        const tds = results.querySelectorAll("td");
        return Array.from(tds).reduce(function (outputs, field) {
            outputs[field.id] = field.textContent;
            return outputs;
        }, {});
    }
    function getResultFields() {
        const results = props.doc.querySelector("#results");
        const items = results.querySelectorAll("li span");
        const idItems = Array.from(items).filter(function (item) {
            return item.id;
        });
        return Array.from(idItems).reduce(function (results, item) {
            results[item.id] = item.textContent;
            return results;
        }, {});
    }
    function renderOutputs(data, precision) {
        Object.entries(data).forEach(function ([key, value]) {
            const summary = props.doc.querySelector("#summary");
            const el = summary.querySelector("#" + key);
            if (!el) {
                return;
            }
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
    function renderResults({results, table}, precision) {
        clearResults();
        table.forEach(function (result) {
            showResult([
                Number(result.v).toFixed(precision.v),
                Number(result.rc).toFixed(precision.rc),
                Number(result.eta).toFixed(precision.eta),
                Number(result.rs).toFixed(precision.rs),
                Number(result.rec).toFixed(precision.rec)
            ]);
        });
        if (table.length >= 2000) {
            return tooManyResults();
        }
        Object.entries(results).forEach(function ([prop, value]) {
            const num = Number(value).toFixed(precision[prop]);
            props.doc.querySelector("#" + prop).innerHTML = num;
        });
    }
    function render(data, precision) {
        renderInputs(data);
        renderOutputs(data, precision);
        renderResults(data, precision);
    }
    function init(formToUse, doc) {
        props.doc = doc;
        props.form = formToUse;
    }
    return {
        getFormValues,
        getOutputFields,
        getResultFields,
        renderInputs,
        renderOutputs,
        renderResults,
        render,
        init
    };
}());
export default Object.freeze(view);