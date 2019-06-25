/*jslint browser */
import {beforeEach, describe, it} from "mocha";
import {assert} from "chai";
import aircraftCalcs from "../src/aircraftCalculations.js";

describe("calculation tests", function () {
    describe("Output test", function () {
        let inputs;
        let outputs;
        beforeEach(function () {
            inputs = {
                vs1: 77.95,
                cl_max_clean: 1.53,
                cl_max_flap: 2.1,
                gross_lb: 1500,
                useful_load_lb: 600,
                wing_span_ft: 20.833,
                plane_efficiency: 0.744,
                bhp: 150,
                vel_max_mph: 180,
                prop_dia_ft: 6,
                prop_max_rpm: 2700,
                altitude_ft: 10000
            };
            outputs = aircraftCalcs.outputs(inputs);
        });
        it("has a wing load value", function () {
            assert.isFinite(outputs.wing_load_lb_ft);
        });
        it("has a landing configuration stall velocity", function () {
            assert.isFinite(outputs.vs0);
        });
        it("has a wing area", function () {
            assert.isFinite(outputs.wing_area_ft);
        });
        it("has a wing aspect", function () {
            assert.isFinite(outputs.wing_aspect);
        });
        it("has a wing chord", function () {
            assert.isFinite(outputs.wing_chord_ft);
        });
        it("has an effective aspect ratio", function () {
            assert.isFinite(outputs.aspect_ratio_effective);
        });
        it("has an effective wing span", function () {
            assert.isFinite(outputs.wing_span_effective);
        });
        it("has an effective wing chord", function () {
            assert.isFinite(outputs.wing_chord_effective);
        });
        it("has an effective span load", function () {
            assert.isFinite(outputs.span_load_effective);
        });
        it("has a drag area", function () {
            assert.isFinite(outputs.drag_area_ft);
        });
        it("has a zerolift drag coefficient", function () {
            assert.isFinite(outputs.zerolift_drag_coefficient);
        });
        it("has a min sink velocity", function () {
            assert.isFinite(outputs.vel_sink_min_ft);
        });
        it("has a min required power", function () {
            assert.isFinite(outputs.pwr_min_req_hp);
        });
        it("has a min sink rate", function () {
            assert.isFinite(outputs.rate_sink_min_ft);
        });
        it("has a max lift/drag ratio", function () {
            assert.isFinite(outputs.ld_max);
        });
        it("has a minimum drag", function () {
            assert.isFinite(outputs.drag_min);
        });
        it("has a min coefficient of lift", function () {
            assert.isFinite(outputs.cl_min_sink);
        });
        it("has a max ideal rate of climb", function () {
            assert.isFinite(outputs.rate_climb_ideal_max);
        });
        it("has a prop tip mach", function () {
            assert.isFinite(outputs.prop_tip_mach);
        });
        it("has a prop velocity", function () {
            assert.isFinite(outputs.prop_vel_ref);
        });
        it("has an ideal static thrust", function () {
            assert.isFinite(outputs.static_thrust_ideal);
        });
    });
    describe("Results test", function () {
        let inputs;
        let outputs;
        let stats;
        beforeEach(function () {
            inputs = {
                vs1: 77.95,
                cl_max_clean: 1.53,
                cl_max_flap: 2.1,
                gross_lb: 1500,
                useful_load_lb: 600,
                wing_span_ft: 20.833,
                plane_efficiency: 0.744,
                bhp: 150,
                vel_max_mph: 180,
                prop_dia_ft: 6,
                prop_max_rpm: 2700,
                altitude_ft: 10000
            };
        });
        it("doesn't change inputs when calculating outputs", function () {
            inputs = {
                vs1: 77.95,
                cl_max_clean: 1.53,
                cl_max_flap: 2.1,
                gross_lb: 1500,
                useful_load_lb: 600,
                wing_span_ft: 20.833,
                plane_efficiency: 0.744,
                bhp: 150,
                vel_max_mph: 180,
                prop_dia_ft: 6,
                prop_max_rpm: 2700,
                altitude_ft: 10000
            };
            assert.equal(Object.entries(inputs).length, 12);
            outputs = aircraftCalcs.outputs(inputs);
            assert.equal(Object.entries(inputs).length, 12);
        });
        it("has performance parameter", function () {
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
            assert.closeTo(stats.results.fp, 0.12, 0.01);
        });
        it("has max rate of climb", function () {
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
            assert.closeTo(stats.results.rcmax, 1501, 1);
        });
        it("has useful load", function () {
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
            assert.equal(stats.results.useful_load, 600);
        });
        it("has max velocity", function () {
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
            assert.closeTo(stats.results.vmax, 213, 0.1);
        });
        it("has kinetic energy", function () {
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
            assert.closeTo(stats.results.wv2, 68000000, 100000);
        });
        it("has a results table", function () {
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
            assert.isAbove(stats.table.length, 10);
        });
        it("copes with no table values", function () {
            inputs.vs1 = 0;
            outputs = aircraftCalcs.outputs(inputs);
            stats = aircraftCalcs.results(outputs);
        });
    });
});