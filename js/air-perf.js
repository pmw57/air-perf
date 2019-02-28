/*jslint browser */
/*global csv */
/*
   --------------------------------------------------------------------
   PROGRAM: index.html Ver: 1.0 Rev: 03/01/2010
   DESCRIPTION: www.neatinfo.com main menu
   BY: Jan Zumwalt - www.zoomaviation.com
   --------------------------------------------------------------------
   COMMENTS: Practical calculation of aircraft performance
   Compiled and ran on the free Pellec C compiler
   http://www.smorgasbordet.com/pellesc/
   --------------------------------------------------------------------
   Ver info:
   V1.0 users will note slight variations in output compared to the basic
   version of this program due to different round off error in math
   packages.
*/

/*
   --------------------------------------------------------------------
   This section is user variables that can be customized to a particular
   aircraft. See The book for descriptions.
   --------------------------------------------------------------------
*/
(function iife() {
    "use strict";

    const craft = "thorp_t18";
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
    // end of user editable custom variables

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

    function clearResults() {
        var results = document.getElementById("results");
        var table = results.querySelector("table");
        table.tBodies[0].innerHTML = "";
    }

    function insertCell(row, value) {
        var content = document.createTextNode(value);
        var cell = row.insertCell().appendChild(content);
        return cell;
    }

    function updateResults(v, rc, eta, rs, rec) {
        var results = document.getElementById("results");
        var table = results.querySelector("table");
        var row = table.tBodies[0].insertRow(-1);
        insertCell(row, v);
        insertCell(row, rc);
        insertCell(row, eta);
        insertCell(row, rs);
        insertCell(row, rec);
    }

    function main(perf) {
        var wing_load_lb_ft = wing_load(
            perf.cl_max_clean,
            perf.vel_stall_clean_mph
        );
        var vel_stall_flaps_mph = vel_stall_flaps(
            wing_load_lb_ft,
            perf.cl_max_flap
        );
        var wing_area_ft = wing_area(perf.gross_lb, wing_load_lb_ft);
        var wing_aspect = Math.pow(perf.wing_span_ft, 2) / wing_area_ft;
        var wing_chord_ft = perf.wing_span_ft / wing_aspect;
        var wing_span_effective = perf.wing_span_ft *
                Math.sqrt(perf.plane_efficiency);
        var wing_chord_effective = wing_area_ft / wing_span_effective;
        var wing_load_effective = perf.gross_lb / wing_span_effective;
        var drag_area_ft = 0.8 * perf.bhp *
                146625 / Math.pow(perf.vel_max_mph, 3);

        var cd_drag = drag_area_ft / wing_area_ft;
        var vel_sink_min_ft = 11.29 *
                Math.sqrt(wing_load_effective) /
                Math.sqrt(Math.sqrt(drag_area_ft));
        var pwr_min_req_hp = 0.03922 * Math.sqrt(Math.sqrt(drag_area_ft)) *
                wing_load_effective * Math.sqrt(wing_load_effective);
        var rate_sink_min_ft = 33000 * pwr_min_req_hp / perf.gross_lb;
        var ld_max = 0.8862 * wing_span_effective / Math.sqrt(drag_area_ft);
        var drag_min = perf.gross_lb / ld_max;
        var cl_min_sink = 3.07 * Math.sqrt(drag_area_ft) / wing_chord_effective;
        var rate_climb_ideal = 33000 * perf.bhp / perf.gross_lb;
        var prop_dia_ft = perf.prop_dia_in / 12;
        var prop_tip_mach = perf.prop_max_rpm * prop_dia_ft *
                0.05236 / 1100;
        var prop_vel_ref = 41.9 *
                Math.pow(perf.bhp / Math.pow(prop_dia_ft, 2), 1.0 / 3);
        var static_thrust_ideal = 10.41 *
                Math.pow(perf.bhp * prop_dia_ft, 2.0 / 3);

        var formValues = [
            {
                id: "wing_load_lb_ft",
                value: wing_load_lb_ft.toFixed(2)
            },
            {
                id: "vel_stall_flaps_mph",
                value: vel_stall_flaps_mph.toFixed(2)
            },
            {
                id: "wing_area_ft",
                value: wing_area_ft.toFixed(2)
            },
            {
                id: "wing_aspect",
                value: wing_aspect.toFixed(2)
            },
            {
                id: "wing_chord_ft",
                value: wing_chord_ft.toFixed(2)
            },
            {
                id: "wing_span_effective",
                value: wing_span_effective.toFixed(2)
            },
            {
                id: "wing_chord_effective",
                value: wing_chord_effective.toFixed(2)
            },
            {
                id: "wing_load_effective",
                value: wing_load_effective.toFixed(2)
            },
            {
                id: "drag_area_ft",
                value: drag_area_ft.toFixed(2)
            },
            {
                id: "cd_drag",
                value: cd_drag.toFixed(2)
            },
            {
                id: "vel_sink_min_ft",
                value: vel_sink_min_ft.toFixed(2)
            },
            {
                id: "pwr_min_req_hp",
                value: pwr_min_req_hp.toFixed(2)
            },
            {
                id: "rate_sink_min_ft",
                value: rate_sink_min_ft.toFixed(2)
            },
            {
                id: "ld_max",
                value: ld_max.toFixed(2)
            },
            {
                id: "drag_min",
                value: drag_min.toFixed(2)
            },
            {
                id: "cl_min_sink",
                value: cl_min_sink.toFixed(2)
            },
            {
                id: "rate_climb_ideal",
                value: rate_climb_ideal.toFixed(2)
            },
            {
                id: "prop_tip_mach",
                value: prop_tip_mach.toFixed(2)
            },
            {
                id: "prop_vel_ref",
                value: prop_vel_ref.toFixed(2)
            },
            {
                id: "static_thrust_ideal",
                value: static_thrust_ideal.toFixed(2)
            }
        ];
        formValues.forEach(function showValue({
            id,
            value
        }) {
            document.getElementById(id).innerHTML = value;
        });

        var eta = 1;
        var fp = 0;
        var rc = 1;
        var rc1 = 0;
        var rc2 = 0;
        var rcmax = 0;
        var rec = 0;
        var rsh = 0;
        var rmu = 1;
        var rs = 0;
        var sig = Math.pow(1 - perf.altitude_ft / 145800, 4.265);
        // var t = 518.7 - 0.00356 * perf.altitude_ft;
        var t1 = 1.0 / 3;
        var t2 = 0;
        var v = perf.vel_stall_clean_mph;
        var vh = 0;
        var vmax = 0;
        var vt = 0;
        var wv2 = 0;

        clearResults();
        var counter = 0;
        while (rc > 0 && counter < 1000) {
            vh = v / vel_sink_min_ft;
            rsh = 0.25 * (Math.pow(vh, 4) + 3) / vh;
            rs = rsh * rate_sink_min_ft;
            vt = v / prop_vel_ref;
            t2 = Math.sqrt(1 + 0.23271 * Math.pow(vt, 3));
            eta = 0.92264 * vt * (
                Math.pow(1 + t2, t1) - Math.pow(t2 - 1, t1)
            ) * 0.85;
            rc = rate_climb_ideal * eta - rs;
            rc2 = rc;
            rec = sig * v * wing_chord_ft * 9324 / rmu;
            if (rc > 0) {
                rcmax = Math.max(rc, rcmax);
                vmax = Math.max(v, vmax);
                updateResults(
                    v.toFixed(1),
                    rc.toFixed(1),
                    eta.toFixed(2),
                    rs.toFixed(1),
                    rec.toFixed(0)
                );
                v = v + vel_delta * rc2 / (rc2 - rc1);
            }
            counter += 1;
        }
        if (counter >= 1000) {
            var results = document.getElementById("results");
            var table = results.querySelector("table");
            var row = table.tBodies[0].insertRow(-1);
            insertCell(row, "Stopping to avoid possible infinite loop.");
            row.children[0].colSpan = 5;
        }
        fp = rcmax * perf.useful_load_lb / 33000 / perf.bhp *
                (1 - (vel_stall_flaps_mph / vmax));
        wv2 = perf.gross_lb * Math.pow(v, 2);

        document.getElementById("fp").innerHTML = fp.toFixed(4);
        document.getElementById("wv2").innerHTML = wv2.toFixed(2);
        document.getElementById("rcmax").innerHTML = rcmax.toFixed(2);
        document.getElementById("vmax").innerHTML = vmax.toFixed(2);
        document.getElementById("useful_load").innerHTML =
                perf.useful_load_lb.toFixed(2);
    }

    function updateInputFields(perf) {
        var form = document.getElementById("input");
        form.elements.name.value = perf.name;
        form.elements.bhp.value = perf.bhp;
        form.elements.wing_span_ft.value = perf.wing_span_ft;
        form.elements.prop_dia_in.value = perf.prop_dia_in;
        form.elements.gross_lb.value = perf.gross_lb;
        form.elements.vel_max_mph.value = perf.vel_max_mph;
        form.elements.vel_stall_clean_mph.value = perf.vel_stall_clean_mph;
        form.elements.useful_load_lb.value = perf.useful_load_lb;
        form.elements.prop_max_rpm.value = perf.prop_max_rpm;
        form.elements.cl_max_clean.value = perf.cl_max_clean;
        form.elements.cl_max_flap.value = perf.cl_max_flap;
        form.elements.plane_efficiency.value = perf.plane_efficiency;
        form.elements.altitude_ft.value = perf.altitude_ft;
    }

    function getPerformanceValues(form) {
        var perf = {};
        perf.name = Number(form.elements.name.value);
        perf.bhp = Number(form.elements.bhp.value);
        perf.wing_span_ft = Number(form.elements.wing_span_ft.value);
        perf.prop_dia_in = Number(form.elements.prop_dia_in.value);
        perf.gross_lb = Number(form.elements.gross_lb.value);
        perf.vel_max_mph = Number(form.elements.vel_max_mph.value);
        perf.vel_stall_clean_mph = Number(
            form.elements.vel_stall_clean_mph.value
        );
        perf.useful_load_lb = Number(form.elements.useful_load_lb.value);
        perf.prop_max_rpm = Number(form.elements.prop_max_rpm.value);
        perf.cl_max_clean = Number(form.elements.cl_max_clean.value);
        perf.cl_max_flap = Number(form.elements.cl_max_flap.value);
        perf.plane_efficiency = Number(form.elements.plane_efficiency.value);
        perf.altitude_ft = Number(form.elements.altitude_ft.value);
        return perf;
    }

    function recalculatePerformance(form) {
        var perf = getPerformanceValues(form);
        main(perf);
    }
    function inputFromCsv(arr) {
        var inputPerf = {};
        inputPerf.name = arr[1][1];
        inputPerf.vel_stall_clean_mph = Number(arr[2][1]);
        inputPerf.cl_max_clean = Number(arr[3][1]);
        inputPerf.cl_max_flap = Number(arr[4][1]);
        inputPerf.gross_lb = Number(arr[5][1]);
        inputPerf.useful_load_lb = Number(arr[6][1]);
        inputPerf.wing_span_ft = Number(arr[7][1]);
        inputPerf.plane_efficiency = Number(arr[8][1]);
        inputPerf.bhp = Number(arr[9][1]);
        inputPerf.vel_max_mph = Number(arr[10][1]);
        inputPerf.prop_dia_in = Number(arr[11][1]);
        inputPerf.prop_max_rpm = Number(arr[12][1]);
        inputPerf.altitude_ft = Number(arr[13][1]);
        return inputPerf;
    }

    function loadButtonHandler() {
        csv.load("saved-data/" + craft + ".csv");
        csv.parse(function (arr) {
            var inputPerf = inputFromCsv(arr);
            updateInputFields(inputPerf);
            main(inputPerf);
        });
    }

    function inputChangeHandler(evt) {
        recalculatePerformance(evt.target.form);
    }

    function submitHandler(evt) {
        evt.preventDefault();
        var target = evt.target;
        var form = (target.nodeName === "FORM")
            ? target
            : target.form;
        recalculatePerformance(form);
    }

    var loadButton = document.querySelector(".js-loadfile");
    loadButton.addEventListener("click", loadButtonHandler);

    var form = document.getElementById("input");
    var inputs = form.querySelectorAll("input");
    inputs.forEach(function (input) {
        input.addEventListener("change", inputChangeHandler);
    });

    form.onsubmit = submitHandler;

    updateInputFields(performanceData[craft]);
    main(performanceData[craft]);
}());
