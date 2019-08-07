/*jslint browser */
import aircraftCalcs from "./aircraftCalculations.js";
import writer from "../lib/filesaver.min.js";
import csv from "./csv.js";
import view from "./aircraftView.js";
import aircraftCsv from "./aircraftCsv.js";

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
    window.numberOrValue = numberOrValue;
    return Object.entries(inputs).reduce(function (converted, [key, value]) {
        if (value !== "") {
            converted[key] = numberOrValue(value);
        } else {
            converted[key] = value;
        }
        return converted;
    }, inputs);
}
function getInputValues() {
    const inputs = view.getFormValues();
    return convertToNumbers(inputs);
}
function calculate(stats) {
    stats = aircraftCalcs.outputs(stats);
    return aircraftCalcs.results(stats);
}
function main(stats) {
    stats = calculate(stats);
    view.render(stats);
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
    const stats = inputFromCsv(csvArr);
    if (Object.entries(stats).length === 0) {
        window.alert("File format is invalid.");
        return;
    }
    main(stats);
    Object.keys(stats).forEach(function (key) {
        const field = document.querySelector("[name=" + key + "]");
        if (!field) {
            window.console(
                "Display field not found for " + key + ":" + stats[key]
            );
        }
    });
    const saveInput = document.querySelector(".js-savefile");
    saveInput.value = filename;
}

function saveToFile(filename, stats) {
    const csvContent = aircraftCsv.stringify(stats, view);
    csv.save(csvContent, filename, writer.saveAs, window);
}
function saveButtonHandler(evt) {
    evt.preventDefault();
    const filename = document.querySelector(".js-savefile").value;
    const inputs = getInputValues();
    const stats = calculate(inputs);
    saveToFile(filename, stats);
}

function clearButtonHandler(evt) {
    evt.preventDefault();
    const elements = view.getFormElements();
    Array.from(elements).forEach(function (element) {
        element.value = "";
    });
    main(getInputValues());
}

// update values
function calculatePerformance() {
    main(getInputValues());
}
function inputChangeHandler() {
    calculatePerformance();
}

function init(document) {
    const loadFile = document.querySelector(".js-loadfile");
    const reader = new FileReader();
    const loadHandler = csv.loadHandler(updateInputsFromCsv, reader);
    loadFile.addEventListener("change", loadHandler);

    const saveButton = document.querySelector(".js-savebutton");
    saveButton.addEventListener("click", saveButtonHandler);

    const clear = document.querySelector("button[name=clear]");
    clear.addEventListener("click", clearButtonHandler);

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