/*jslint browser */
import aircraftCalcs from "./aircraftCalculations.js";
import view from "./aircraftView.js";

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
    const inputs = view.getValues();
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
function calculatePerformance() {
    main(getInputValues(), precision);
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
    const data = inputFromCsv(csvArr);
    if (Object.entries(data).length === 0) {
        window.alert("File format is invalid.");
        return;
    }
    main(data, precision);
}
function saveToFile(filename, data) {
    const csvContent = window.csv.stringify(data);
    window.csv_spike.save(csvContent, filename);
}
function saveButtonHandler(evt) {
    evt.preventDefault();
    const filename = document.querySelector(".js-savefile").value;
    const inputs = getInputValues();
    const data = calculate(inputs);
    saveToFile(filename, data);
}
function inputChangeHandler() {
    calculatePerformance();
}

function init(document, precisionObj) {
    precision = Object.assign({}, precisionObj);
    const loadFile = document.querySelector(".js-loadfile");
    const loadHandler = window.csv_spike.loadWrapper(updateInputsFromCsv);
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