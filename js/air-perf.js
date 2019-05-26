/*jslint browser */
/*global csv */
import aircraftCalcs from "./aircraftCalculations.js";

(function iife() {
    const precision = {
        // outputs
        "wing_load_lb_ft": 2,
        "vs0": 2,
        "wing_area_ft": 2,
        "wing_aspect": 2,
        "wing_chord_ft": 2,
        "wing_span_effective": 2,
        "wing_chord_effective": 2,
        "span_load_effective": 2,
        "drag_area_ft": 2,
        "zerolift_drag_coefficient": 4,
        "vel_sink_min_ft": 1,
        "pwr_min_req_hp": 2,
        "rate_sink_min_ft": 1,
        "ld_max": 2,
        "drag_min": 2,
        "cl_min_sink": 2,
        "rate_climb_ideal": 0,
        "prop_tip_mach": 2,
        "prop_vel_ref": 2,
        "static_thrust_ideal": 2,
        // results
        "v": 1,
        "rc": 1,
        "vy": 1,
        "eta": 2,
        "rs": 1,
        "rec": 0,
        "fp": 4,
        "wv2": 0,
        "rcmax": 2,
        "vmax": 2,
        "useful_load": 2
    };

    function isValidNumber(value) {
        const num = Number(value);
        return Number.isNaN(num) === false;
    }
    function getPerformanceValues(form) {
        return Array.from(form.elements).reduce(function (obj, field) {
            obj[field.name] = (
                isValidNumber(field.value)
                ? Number(field.value)
                : field.value
            );
            return obj;
        }, {});
    }
    function insertCell(row, value) {
        var content = document.createTextNode(value);
        var cell = row.insertCell().appendChild(content);
        return cell;
    }
    function updateInputs(inputs) {
        var form = document.getElementById("input");
        var elements = form.elements;
        Object.entries(inputs).forEach(function ([key]) {
            elements[key].value = inputs[key];
        });
    }
    function updateOutputs(outputs, precision) {
        Object.entries(outputs).forEach(function ([key, value]) {
            var el = document.getElementById(key);
            el.innerHTML = value.toFixed(precision[key]);
        });
    }
    function clearResults() {
        var resultSection = document.getElementById("results");
        var table = resultSection.querySelector("table");
        table.tBodies[0].innerHTML = "";
    }
    function showResult(result) {
        var resultSection = document.getElementById("results");
        var table = resultSection.querySelector("table");
        var row = table.tBodies[0].insertRow(-1);
        result.forEach(function (value) {
            insertCell(row, value);
        });
    }
    function tooManyResults() {
        var resultSection = document.getElementById("results");
        var table = resultSection.querySelector("table");
        var row = table.tBodies[0].insertRow(-1);
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
        updateInputs(inputs);
        updateOutputs(outputs, precision);
        updateResults(results, precision);
    }
    function main(inputs, precision) {
        const outputs = aircraftCalcs.outputs(inputs);
        const results = aircraftCalcs.results(inputs, outputs);
        updateScreen({inputs, outputs, results}, precision);
    }
    function getInputsFromForm(form) {
        var fields = Array.from(form.elements);
        return fields.reduce(function (inputs, field) {
            inputs[field.name] = (
                isValidNumber(field.value)
                ? Number(field.value)
                : field.value
            );
            return inputs;
        }, {});
    }
    function calculatePerformance(form) {
        const inputs = getInputsFromForm(form);
        Object.assign(inputs, getPerformanceValues(form));
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
        var heading = arr[0][0].trim();
        if (heading !== "Input parameters") {
            return;
        }
        var lastItem = arr.findIndex(function (item, index) {
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
        updateInputs(inputs);
        main(inputs, precision);
    }
    function saveFormToFile(form, filename) {
        const inputs = getInputsFromForm(form);
        const outputs = aircraftCalcs.outputs(inputs);
        const results = aircraftCalcs.results(inputs, outputs);
        const csvContent = csv.stringify({inputs, outputs, results});
        csv.save(csvContent, filename);
    }
    function saveButtonHandler(evt) {
        evt.preventDefault();
        const formSelector = evt.target.getAttribute("ref");
        const form = document.querySelector(formSelector);
        const filename = document.querySelector(".js-savefile").value;
        saveFormToFile(form, filename);
    }
    function inputChangeHandler(evt) {
        const formField = evt.target;
        const form = formField.form;
        calculatePerformance(form);
    }

    var loadFile = document.querySelector(".js-loadfile");
    var loadHandler = csv.loadWrapper(updateInputsFromCsv);
    loadFile.addEventListener("change", loadHandler);

    var saveButton = document.querySelector(".js-savebutton");
    saveButton.addEventListener("click", saveButtonHandler);

    var form = document.getElementById("input");
    const formInputs = form.querySelectorAll("input");
    formInputs.forEach(function (input) {
        input.addEventListener("change", inputChangeHandler);
    });
}());
