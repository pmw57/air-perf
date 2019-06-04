/*jslint browser */
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
function main(inputs, precision) {
    const outputs = aircraftCalcs.outputs(inputs);
    const results = aircraftCalcs.results(inputs, outputs);
    view.render({inputs, outputs, results}, precision);
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
    const csvContent = window.csv.stringify({inputs, outputs, results});
    window.csv.save(csvContent, filename);
}
function saveButtonHandler(evt) {
    evt.preventDefault();
    const filename = document.querySelector(".js-savefile").value;
    saveToFile(filename);
}
function inputChangeHandler() {
    calculatePerformance();
}

function init(document, precisionObj) {
    precision = Object.assign({}, precisionObj);
    const loadFile = document.querySelector(".js-loadfile");
    const loadHandler = window.csv.loadWrapper(updateInputsFromCsv);
    loadFile.addEventListener("change", loadHandler);

    const saveButton = document.querySelector(".js-savebutton");
    saveButton.addEventListener("click", saveButtonHandler);

    const form = document.getElementById("input");
    const formInputs = form.querySelectorAll("input");
    formInputs.forEach(function (input) {
        input.addEventListener("change", inputChangeHandler);
    });
    view.init(form, document);
}
const updateInputs = view.updateInputs;
export {
    init,
    updateInputs
};