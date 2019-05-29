/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import formulas from "../src/aircraftFormulas.js";

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
    it("has a sealevel vprop", function () {
        var sigma = 1;
        var bhp = 150;
        var dp = 6;
        var vprop = formulas.propEfficiency.vprop(bhp, sigma, dp);
        assert.closeTo(vprop, 67.42, 0.01);
    });
    it("has a sealevel drag area", function () {
        var sigma = 1;
        var bhp = 150;
        var vmax = 180;
        var ad = formulas.minSinkRate.ad(sigma, bhp, vmax);
        assert.closeTo(ad, 3.02, 0.01);
    });
    it("has a different drag area at 40,000 feet", function () {
        var sigma = 0.25;
        var bhp = 150;
        var vmax = 180;
        var ad = formulas.minSinkRate.ad(sigma, bhp, vmax);
        assert.closeTo(ad, 0.75, 0.1);
    });
    it("has a sealevel ideal static thrust", function () {
        var sigma = 1;
        var bhp = 150;
        var dp = 6;
        var ts = formulas.propAdvanced.ts(sigma, bhp, dp);
        assert.closeTo(ts, 970.39, 0.01);
    });
    it("has a sealevel ideal static thrust", function () {
        var sigma = 0.25;
        var bhp = 150;
        var dp = 6;
        var ts = formulas.propAdvanced.ts(sigma, bhp, dp);
        assert.closeTo(ts, 611.3, 0.1);
    });
    it("has a higher vprop at 40,000 feet", function () {
        var sigma = 0.25;
        var bhp = 150;
        var dp = 6;
        var vprop = formulas.propEfficiency.vprop(bhp, sigma, dp);
        assert.closeTo(vprop, 107, 0.1);
    });
});