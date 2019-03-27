/*jslint browser */
/*global csv */
(function iife() {
    "use strict";

    const craft = "henry_x-1";
    const inputs = {};
    const outputs = {};
    const results = {};
    var vel_delta = 1.00; // airspeed increment for each iteration

    var performanceData = {
        thorp_t18: {
            name: "Thorp T-18",
            vel_stall_clean_mph: 67.00, // VS1
            cl_max_clean: 1.53,
            cl_max_flap: 2.10,
            gross_lb: 1500.00,
            useful_load_lb: 600.00,
            plane_efficiency: 0.744,
            bhp: 150.00,
            vel_max_mph: 180.00,
            prop_dia_in: 6 * 12,
            wing_span_ft: 20 + 10 / 12,
            prop_max_rpm: 2700.00,
            altitude_ft: 0
        },
        aerocar_imp: {
            name: "Aerocar Imp",
            vel_stall_clean_mph: 67.00, // VS1
            cl_max_clean: 1.53,
            cl_max_flap: 2.10,
            gross_lb: 1500.00,
            useful_load_lb: 600.00,
            plane_efficiency: 0.744,
            bhp: 0.00,
            vel_max_mph: 180.00,
            prop_dia_in: 72.00,
            wing_span_ft: 20.83,
            prop_max_rpm: 2700.00,
            altitude_ft: 0
        },
        thorp_t18_tiger: {
            name: "Thorp T-18 Tiger",
            vel_stall_clean_mph: 65.00, // VS1
            cl_max_clean: 1.53,
            cl_max_flap: 2.10,
            gross_lb: 1506.00,
            useful_load_lb: 600.00,
            plane_efficiency: 0.744,
            bhp: 180.00,
            vel_max_mph: 200.00,
            prop_dia_in: 5 * 12 + 3,
            wing_span_ft: 20 + 10 / 12,
            prop_max_rpm: 2700.00,
            altitude_ft: 0
        }
    };
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

    function getPerformanceValues(form) {
        inputs.name = Number(form.elements.name.value);
        inputs.bhp = Number(form.elements.bhp.value);
        inputs.wing_span_ft = Number(form.elements.wing_span_ft.value);
        inputs.prop_dia_in = Number(form.elements.prop_dia_in.value);
        inputs.gross_lb = Number(form.elements.gross_lb.value);
        inputs.vel_max_mph = Number(form.elements.vel_max_mph.value);
        inputs.vel_stall_clean_mph = Number(
            form.elements.vel_stall_clean_mph.value
        );
        inputs.useful_load_lb = Number(form.elements.useful_load_lb.value);
        inputs.prop_max_rpm = Number(form.elements.prop_max_rpm.value);
        inputs.cl_max_clean = Number(form.elements.cl_max_clean.value);
        inputs.cl_max_flap = Number(form.elements.cl_max_flap.value);
        inputs.plane_efficiency = Number(form.elements.plane_efficiency.value);
        inputs.altitude_ft = Number(form.elements.altitude_ft.value);
        return inputs;
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
            "wing_load_lb_ft": wing_load_lb_ft,
            "vel_stall_flaps_mph": vel_stall_flaps_mph,
            "wing_area_ft": wing_area_ft,
            "wing_aspect": wing_aspect,
            "wing_chord_ft": wing_chord_ft,
            "wing_span_effective": wing_span_effective,
            "wing_chord_effective": wing_chord_effective,
            "wing_load_effective": wing_load_effective,
            "drag_area_ft": drag_area_ft,
            "cd_drag": cd_drag,
            "vel_sink_min_ft": vel_sink_min_ft,
            "pwr_min_req_hp": pwr_min_req_hp,
            "rate_sink_min_ft": rate_sink_min_ft,
            "ld_max": ld_max,
            "drag_min": drag_min,
            "cl_min_sink": cl_min_sink,
            "rate_climb_ideal": rate_climb_ideal,
            "prop_tip_mach": prop_tip_mach,
            "prop_vel_ref": prop_vel_ref,
            "static_thrust_ideal": static_thrust_ideal
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
    function inputFromCsv(arr) {
        return {
            name: arr[1][1],
            vel_stall_clean_mph: Number(arr[2][1]),
            cl_max_clean: Number(arr[3][1]),
            cl_max_flap: Number(arr[4][1]),
            gross_lb: Number(arr[5][1]),
            useful_load_lb: Number(arr[6][1]),
            wing_span_ft: Number(arr[7][1]),
            plane_efficiency: Number(arr[8][1]),
            bhp: Number(arr[9][1]),
            vel_max_mph: Number(arr[10][1]),
            prop_dia_in: Number(arr[11][1]),
            prop_max_rpm: Number(arr[12][1]),
            altitude_ft: Number(arr[13][1])
        };
    }
    function loadFromCsv() {
        csv.parse(function (arr) {
            Object.assign(inputs, inputFromCsv(arr));
            updateInputs(inputs);
            main(inputs, precision);
        });
    }
    function loadFileHandler(evt) {
        var inputField = evt.target;
        var file = inputField.files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function contentLoaded(readerEvent) {
            var content = readerEvent.target.result;
            csv.set(content);
            loadFromCsv();
        };
    }

    function inputChangeHandler(evt) {
        calculatePerformance(evt.target.form);
    }

    var loadFile = document.querySelector(".js-loadfile");
    loadFile.addEventListener("change", loadFileHandler);

    var form = document.getElementById("input");
    const formInputs = form.querySelectorAll("input");
    formInputs.forEach(function (input) {
        input.addEventListener("change", inputChangeHandler);
    });

    const loadFromCSV = true;
    if (loadFromCSV) {
        csv.load("saved-data/" + craft + ".csv");
        loadFromCsv();
    } else {
        main(performanceData[craft], precision);
    }
}());
