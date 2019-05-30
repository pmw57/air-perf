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
describe("Atmosphere", function () {
    it("has sigma at sealevel", function () {
        assert.equal(formulas.atmosphere.sigma(0), 1);
    });
    it("has sigma at 40,000 feet", function () {
        assert.closeTo(formulas.atmosphere.sigma(40000), 0.25, 0.01);
    });
    it("has rho at sealevel", function () {
        assert.equal(formulas.atmosphere.rho(0), 0.002377);
    });
    it("has rho at 40000", function () {
        assert.closeTo(formulas.atmosphere.rho(40000), 0.00005, 0.001);
    });
    it("has average temperature at sealevel", function () {
        assert.closeTo(formulas.atmosphere.temperature(0), 58.7, 0.01);
    });
    it("has lower temperature at 10,000 feet", function () {
        assert.closeTo(formulas.atmosphere.temperature(10000), 23.1, 0.01);
    });
    it("has lowest temperature at beyond 36,240 feet", function () {
        assert.closeTo(formulas.atmosphere.temperature(40000), -70, 0.01);
    });
});