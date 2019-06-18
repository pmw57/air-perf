/*jslint browser */
import aircraftCalcs from "./aircraftCalculations.js";
import writer from "../lib/filesaver.min.js";
import csv from "./csv.js";
import view from "./aircraftView.js";
import aircraftCsv from "./aircraftCsv.js";
let precision = {};

function isValidNumber(value) {
    const num = Number(value);
    return Number.isNaN(num) === false;
}
function numberOrValue(value) {
    if (isValidNumber(value)) {
        return Number(value);
    }
    return value;
}
function convertToNumbers(inputs) {
    return Object.entries(inputs).reduce(function (converted, [key, value]) {
        converted[key] = numberOrValue(value);
        return converted;
    }, inputs);
}
function getInputValues() {
    const inputs = view.getFormValues();
    return convertToNumbers(inputs);
}
function calculate(data) {
    data = aircraftCalcs.outputs(data);
    return aircraftCalcs.results(data);
}
function main(data, precision) {
    data = calculate(data);
    view.render(data, precision);
}

// load file
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
function updateInputsFromCsv(csvArr, filename) {
    const data = inputFromCsv(csvArr);
    if (Object.entries(data).length === 0) {
        window.alert("File format is invalid.");
        return;
    }
    main(data, precision);
    const saveInput = document.querySelector(".js-savefile");
    saveInput.value = filename;
}

function saveToFile(filename, data) {
    const csvSpikeContent = window.csv_spike.stringify({
        inputs: aircraftCsv.getInputs(data, view),
        outputs: aircraftCsv.getOutputs(data, view),
        results: aircraftCsv.getResults(data, view)
    });
    csv.save(csvSpikeContent, filename, writer.saveAs, window);
}
function saveButtonHandler(evt) {
    evt.preventDefault();
    const filename = document.querySelector(".js-savefile").value;
    const inputs = getInputValues();
    const data = calculate(inputs);
    saveToFile(filename, data);
}

// update values
function calculatePerformance() {
    main(getInputValues(), precision);
}
function inputChangeHandler() {
    calculatePerformance();
}

function init(document, precisionObj) {
    precision = Object.assign({}, precisionObj);
    const loadFile = document.querySelector(".js-loadfile");
    const reader = new FileReader();
    const loadHandler = csv.loadHandler(updateInputsFromCsv, reader);
    loadFile.addEventListener("change", loadHandler);

    const saveButton = document.querySelector(".js-savebutton");
    saveButton.addEventListener("click", saveButtonHandler);

    const form = document.getElementById("input");
    const formInputs = form.querySelectorAll("input");
    formInputs.forEach(function (input) {
        input.setAttribute("autocomplete", "off");
        input.addEventListener("change", inputChangeHandler);
    });
    view.init(form, document);
}
const updateInputs = view.updateInputs;
export {
    init,
    updateInputs
};