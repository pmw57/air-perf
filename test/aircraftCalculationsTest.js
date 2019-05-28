/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import aircraftCalcs from "../src/aircraftCalculations.js";

describe("Output test", function () {
    it("has a sealevel wing load", function () {
        var output = aircraftCalcs.outputs({
            altitude_ft: 0,
            cl_max_clean: 1.53,
            vs1: 67
        });
        assert.closeTo(output.wing_load_lb_ft, 17.57, 0.01);
    });
    it("changes wing load with sealevel", function () {
        var output = aircraftCalcs.outputs({
            altitude_ft: 10000,
            cl_max_clean: 1.53,
            vs1: 67
        });
        assert.closeTo(output.wing_load_lb_ft, 12.97, 0.01);
    });
    it("has same wing load at faster speed", function () {
        var output = aircraftCalcs.outputs({
            altitude_ft: 10000,
            cl_max_clean: 1.53,
            vs1: 77.95
        });
        assert.closeTo(output.wing_load_lb_ft, 17.57, 0.01);
    });
});