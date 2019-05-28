/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import aircraftCalcs from "../src/aircraftCalculations.js";

describe("Output test", function () {
    it("has same wing load at faster speed", function () {
        var output = aircraftCalcs.outputs({
            vs1: 77.95,
            cl_max_clean: 1.53,
            cl_max_flap: 2.1,
            altitude_ft: 10000
        });
        assert.isNumber(output.wing_load_lb_ft);
        assert.isNumber(output.vs0);
    });
});