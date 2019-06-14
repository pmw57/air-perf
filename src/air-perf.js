/*jslint browser */
import aircraftCalcs from "./aircraftCalculations.js";
import writer from "../lib/filesaver.min.js";
import csv from "./csv.js";
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

// save file
function saveToFile(filename, data) {
    const inputs = view.getFormValues();
    const outputs = {
        wing_load_lb_ft: data.wing_load_lb_ft,
        vs0: data.vs0,
        wing_area_ft: data.wing_area_ft,
        wing_aspect: data.wing_aspect,
        wing_chord_ft: data.wing_chord_ft,
        wing_span_effective: data.wing_span_effective,
        drag_area_ft: data.drag_area_ft,
        zerolift_drag_coefficient: data.zerolift_drag_coefficient,
        vel_sink_min_ft: data.vel_sink_min_ft,
        pwr_min_req_hp: data.pwr_min_req_hp,
        rate_sink_min_ft: data.rate_sink_min_ft,
        ld_max: data.ld_max,
        drag_min: data.drag_min,
        cl_min_sink: data.cl_min_sink,
        rate_climb_ideal_max: data.rate_climb_ideal_max,
        prop_tip_mach: data.prop_tip_mach,
        prop_vel_ref: data.prop_vel_ref,
        static_thrust_ideal: data.static_thrust_ideal
    };
    const results = {
        fp: data.results.fp,
        wv2: data.results.wv2,
        rcmax: data.results.rcmax,
        vy: data.results.vy,
        vmax: data.results.vmax,
        useful_load: data.results.useful_load,
        data: data.table
    };
    const csvContent = window.csv_spike.stringify({
        inputs,
        outputs,
        results
    });
    csv.save(csvContent, filename, writer.saveAs, window);
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