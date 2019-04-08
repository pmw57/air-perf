/*jslint browser */
/*global csv */
(function iife() {
    "use strict";

    const inputs = {};
    const outputs = {};
    const results = {};
    var vel_delta = 1.00; // airspeed increment for each iteration

    const precision = {
        // outputs
        "wing_load_lb_ft": 2,
        "vel_stall_flaps_mph": 2,
        "wing_area_ft": 2,
        "wing_aspect": 2,
        "wing_chord_ft": 2,
        "wing_span_effective": 2,
        "wing_chord_effective": 2,
        "wing_load_effective": 2,
        "drag_area_ft": 2,
        "cd_drag": 4,
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
            obj[field.name] = isValidNumber(field.value)
                ? Number(field.value)
                : field.value;
            return obj;
        }, {});
    }
    function wing_load(cl_max_clean, vel_stall_clean_mph) {
        var load = cl_max_clean * Math.pow(vel_stall_clean_mph, 2) / 391;
        return load; // lb per ft
    }
    function vel_stall_flaps(wing_load_lb_ft, cl_max_flap) {
        var stall_speed = Math.sqrt(wing_load_lb_ft * 391 / cl_max_flap); // VS0
        return stall_speed; // mph
    }
    function wing_area(gross_lb, wing_load_lb_ft) {
        return gross_lb / wing_load_lb_ft;
    }
    function calculateOutputs(inputs) {
        var wing_load_lb_ft = wing_load(
            inputs.cl_max_clean,
            inputs.vel_stall_clean_mph
        );
        var vel_stall_flaps_mph = vel_stall_flaps(
            wing_load_lb_ft,
            inputs.cl_max_flap
        );
        var wing_area_ft = wing_area(inputs.gross_lb, wing_load_lb_ft);
        var wing_aspect = Math.pow(inputs.wing_span_ft, 2) / wing_area_ft;
        var wing_chord_ft = inputs.wing_span_ft / wing_aspect;
        var wing_span_effective = inputs.wing_span_ft *
                Math.sqrt(inputs.plane_efficiency);
        var wing_chord_effective = wing_area_ft / wing_span_effective;
        var wing_load_effective = inputs.gross_lb / wing_span_effective;
        var drag_area_ft = 0.8 * inputs.bhp *
                146625 / Math.pow(inputs.vel_max_mph, 3);

        var cd_drag = drag_area_ft / wing_area_ft;
        var vel_sink_min_ft = 11.29 *
                Math.sqrt(wing_load_effective) /
                Math.sqrt(Math.sqrt(drag_area_ft));
        var pwr_min_req_hp = 0.03922 * Math.sqrt(Math.sqrt(drag_area_ft)) *
                wing_load_effective * Math.sqrt(wing_load_effective);
        var rate_sink_min_ft = 33000 * pwr_min_req_hp / inputs.gross_lb;
        var ld_max = 0.8862 * wing_span_effective / Math.sqrt(drag_area_ft);
        var drag_min = inputs.gross_lb / ld_max;
        var cl_min_sink = 3.07 * Math.sqrt(drag_area_ft) / wing_chord_effective;
        var rate_climb_ideal = 33000 * inputs.bhp / inputs.gross_lb;
        var prop_dia_ft = inputs.prop_dia_in / 12;
        var prop_tip_mach = inputs.prop_max_rpm * prop_dia_ft *
                0.05236 / 1100;
        var prop_vel_ref = 41.9 *
                Math.pow(inputs.bhp / Math.pow(prop_dia_ft, 2), 1.0 / 3);
        var static_thrust_ideal = 10.41 *
                Math.pow(inputs.bhp * prop_dia_ft, 2.0 / 3);

        return {
            wing_load_lb_ft,
            vel_stall_flaps_mph,
            wing_area_ft,
            wing_aspect,
            wing_chord_ft,
            wing_span_effective,
            wing_chord_effective,
            wing_load_effective,
            drag_area_ft,
            cd_drag,
            vel_sink_min_ft,
            pwr_min_req_hp,
            rate_sink_min_ft,
            ld_max,
            drag_min,
            cl_min_sink,
            rate_climb_ideal,
            prop_tip_mach,
            prop_vel_ref,
            static_thrust_ideal
        };
    }
    function calculateResults(inputs, outputs) {
        results.data = [];
        var eta = 1;
        var rc = 1;
        var rc1 = 0;
        var rc2 = 0;
        var rcmax = 0;
        var rec = 0;
        var rsh = 0;
        var rmu = 1;
        var rs = 0;
        var sig = Math.pow(1 - inputs.altitude_ft / 145800, 4.265);
        // var t = 518.7 - 0.00356 * inputs.altitude_ft;
        var t1 = 1.0 / 3;
        var t2 = 0;
        var v = inputs.vel_stall_clean_mph;
        var vh = 0;
        var vmax = 0;
        var vt = 0;
        var counter = 0;
        while (rc > 0 && counter < 1000) {
            vh = v / outputs.vel_sink_min_ft;
            rsh = 0.25 * (Math.pow(vh, 4) + 3) / vh;
            rs = rsh * outputs.rate_sink_min_ft;
            vt = v / outputs.prop_vel_ref;
            t2 = Math.sqrt(1 + 0.23271 * Math.pow(vt, 3));
            eta = 0.92264 * vt * (
                Math.pow(1 + t2, t1) - Math.pow(t2 - 1, t1)
            ) * 0.85;
            rc = outputs.rate_climb_ideal * eta - rs;
            rc2 = rc;
            rec = sig * v * outputs.wing_chord_ft * 9324 / rmu;
            if (rc > 0) {
                rcmax = Math.max(rc, rcmax);
                vmax = Math.max(v, vmax);
                results.data.push({v, rc, eta, rs, rec});
                v = v + vel_delta * rc2 / (rc2 - rc1);
            }
            counter += 1;
        }
        if (counter >= 1000) {
            results.runaway = true;
            return;
        }
        return Object.assign(results, {
            rcmax,
            vmax,
            fp: rcmax * inputs.useful_load_lb / 33000 / inputs.bhp *
                    (1 - (outputs.vel_stall_flaps_mph / vmax)),
            wv2: inputs.gross_lb * Math.pow(v, 2),
            useful_load: inputs.useful_load_lb
        });
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
        ["fp", "wv2", "rcmax", "vmax", "useful_load"].forEach(function (prop) {
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
        Object.assign(outputs, calculateOutputs(inputs));
        Object.assign(results, calculateResults(inputs, outputs));
        updateScreen({inputs, outputs, results}, precision);
    }
    function calculatePerformance(form) {
        Object.assign(inputs, getPerformanceValues(form));
        main(inputs, precision);
    }
    function keyNumberReducer(obj, item) {
        const key = item[0];
        const value = item[1];
        obj[key] = isValidNumber(value)
            ? Number(value)
            : value;
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
        Object.assign(inputs, inputFromCsv(csvArr));
        if (Object.entries(inputs).length === 0) {
            window.alert("File format is invalid.");
            return;
        }
        updateInputs(inputs);
        main(inputs, precision);
    }

    function saveButtonHandler() {
        const csvContent = csv.stringify({inputs, outputs, results});
        const filename = document.querySelector(".js-savefile").value;
        csv.save(csvContent, filename);
    }

    function inputChangeHandler(evt) {
        calculatePerformance(evt.target.form);
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
