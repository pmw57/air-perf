/*jslint browser */
/*global csv */
import aircraftCalcs from "./aircraftCalculations.js";
import view from "./aircraftView.js";

let precision = {};

function isValidNumber(value) {
    const num = Number(value);
    return Number.isNaN(num) === false;
}
function numberOrValue(value) {
    return (
        isValidNumber(value)
        ? Number(value)
        : value
    );
}
function convertToNumbers(values) {
    return Object.entries(values).map(function ([key, value]) {
        return [key, numberOrValue(value)];
    }).reduce(function (obj, [key, value]) {
        obj[key] = value;
        return obj;
    }, {});
}
function getInputValues() {
    const values = view.getValues();
    return convertToNumbers(values);
}
function updateOutputs(outputs, precision) {
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
function updateResults(results, precision) {
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
function updateScreen({inputs, outputs, results}, precision) {
    view.renderInputs(inputs);
    updateOutputs(outputs, precision);
    updateResults(results, precision);
}
function main(inputs, precision) {
    const outputs = aircraftCalcs.outputs(inputs);
    const results = aircraftCalcs.results(inputs, outputs);
    updateScreen({inputs, outputs, results}, precision);
}
function calculatePerformance() {
    const inputs = getInputValues();
    main(inputs, precision);
}
function keyNumberReducer(obj, item) {
    const key = item[0];
    const value = item[1];
    obj[key] = (
        isValidNumber(value)
        ? Number(value)
        : value
    );
    return obj;
}
function inputFromCsv(arr) {
    const heading = arr[0][0].trim();
    if (heading !== "Input parameters") {
        return;
    }
    let lastItem = arr.findIndex(function (item, index) {
        return index > 0 && item.length < 2;
    });
    if (lastItem === -1) {
        lastItem = arr.length;
    }
    return arr.slice(1, lastItem).reduce(keyNumberReducer, {});
}
function updateInputsFromCsv(csvArr) {
    const inputs = inputFromCsv(csvArr);
    if (Object.entries(inputs).length === 0) {
        window.alert("File format is invalid.");
        return;
    }
    main(inputs, precision);
}
function saveToFile(filename) {
    const inputs = getInputValues();
    const outputs = aircraftCalcs.outputs(inputs);
    const results = aircraftCalcs.results(inputs, outputs);
    const csvContent = csv.stringify({inputs, outputs, results});
    csv.save(csvContent, filename);
}
function saveButtonHandler(evt) {
    evt.preventDefault();
    const filename = document.querySelector(".js-savefile").value;
    saveToFile(filename);
}
function inputChangeHandler(evt) {
    calculatePerformance();
}

function init(document, precisionObj) {
    precision = Object.assign({}, precisionObj);
    const loadFile = document.querySelector(".js-loadfile");
    const loadHandler = csv.loadWrapper(updateInputsFromCsv);
    loadFile.addEventListener("change", loadHandler);

    const saveButton = document.querySelector(".js-savebutton");
    saveButton.addEventListener("click", saveButtonHandler);

    const form = document.getElementById("input");
    const formInputs = form.querySelectorAll("input");
    formInputs.forEach(function (input) {
        input.addEventListener("change", inputChangeHandler);
    });
    view.init(form);
}
const updateInputs = view.updateInputs;
export {
    init,
    updateInputs
};