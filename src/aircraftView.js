const view = (function iife() {
    const props = {};
    function renderInputs(stats) {
        const allInputs = props.form.querySelectorAll("input");
        allInputs.forEach(function (input) {
            input.value = "";
        });
        const elements = props.form.elements;
        Object.entries(stats).forEach(function ([key]) {
            if (!elements[key]) {
                return;
            }
            elements[key].value = stats[key];
        });
    }
    function getFormElements() {
        return props.form.elements;
    }
    function getFormValues() {
        return Array.from(props.form.elements).reduce(function (obj, field) {
            obj[field.name] = field.value;
            return obj;
        }, {});
    }
    function getOutputFields() {
        const results = props.doc.querySelector("#summary");
        if (!results) {
            throw new ReferenceError("Summary id not found");
        }
        const tds = results.querySelectorAll("td");
        return Array.from(tds).reduce(function (outputs, field) {
            outputs[field.id] = field.textContent;
            return outputs;
        }, {});
    }
    function getResultFields() {
        const results = props.doc.querySelector("#results");
        if (!results) {
            throw new ReferenceError("Result id not found");
        }
        const items = results.querySelectorAll("li span");
        const idItems = Array.from(items).filter(function (item) {
            return item.id;
        });
        return Array.from(idItems).reduce(function (results, item) {
            results[item.id] = item.textContent;
            return results;
        }, {});
    }
    function renderOutputs(stats) {
        Object.entries(stats).forEach(function ([key, value]) {
            const summary = props.doc.querySelector("#summary");
            const el = summary.querySelector("#" + key);
            if (!el) {
                return;
            }
            el.innerHTML = Number(value).toPrecision(4);
        });
    }
    function clearResults() {
        const resultFields = getResultFields();
        Object.keys(resultFields).forEach(function (id) {
            props.doc.getElementById(id).innerHTML = "";
        });
        const results = props.doc.querySelector("#results");
        const table = results.querySelector("table");
        if (!table) {
            throw new ReferenceError("Results table not found");
        }
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
    function renderResults({results, table}) {
        clearResults();
        table.forEach(function (result) {
            showResult([
                Number(result.v).toPrecision(4),
                Number(result.rc).toPrecision(4),
                Number(result.eta).toPrecision(4),
                Number(result.rs).toPrecision(4),
                Number.parseInt(result.rec)
            ]);
        });
        if (table.length >= 2000) {
            return tooManyResults();
        }
        Object.entries(results).forEach(function ([prop, value]) {
            const num = Number(value).toPrecision(4);
            props.doc.querySelector("#" + prop).innerHTML = num;
        });
    }
    function render(stats) {
        renderInputs(stats);
        renderOutputs(stats);
        renderResults(stats);
    }
    function init(formToUse, doc) {
        if (!formToUse || formToUse.nodeName !== "FORM") {
            throw new ReferenceError("Form not found");
        }
        props.doc = doc;
        props.form = formToUse;
    }
    return {
        getFormElements,
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