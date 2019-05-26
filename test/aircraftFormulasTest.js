/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import formulas from "../js/aircraftFormulas.js";

describe("Formula tests", function () {
    it("has a sealevel wing load", function () {
        var sigma = 1;
        var clmax = 1.53;
        var vs1 = 67;
        var ws = formulas.forceBalance.ws(sigma, clmax, vs1);
        assert.closeTo(ws, 17.57, 0.01);
    });
    it("changes wing load with altitude", function () {
        var sigma = 0.75;
        var clmax = 1.53;
        var vs1 = 67;
        var ws = formulas.forceBalance.ws(sigma, clmax, vs1);
        assert.closeTo(ws, 13.17, 0.01);
    });
    it("has same wing load at faster speed", function () {
        var sigma = 0.75;
        var clmax = 1.53;
        var vs1 = 77.5;
        var ws = formulas.forceBalance.ws(sigma, clmax, vs1);
        assert.closeTo(ws, 17.57, 0.1);
    });
});