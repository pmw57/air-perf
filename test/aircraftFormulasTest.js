/*jslint browser */
import {describe, it, xit} from "mocha";
import {assert} from "chai";
import formulas from "../src/aircraftFormulas.js";

describe("Formula tests", function () {
    describe("force balance", function () {
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
        xit("has wing area", function () {
            return;
        });
        xit("has stall speed in landing configuration", function () {
            return;
        });
        xit("has aspect ratio", function () {
            return;
        });
        xit("has chord", function () {
            return;
        });
    });
    describe("minimum sink rate", function () {
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
    });
    describe("max lift drag ratio", function () {
        xit("has max lift drag ratio", function () {
            return;
        });
        xit("has minimum drag", function () {
            return;
        });
    });
    describe("level flight", function () {
        xit("has minimum power", function () {
            return;
        });
    });
    describe("climbing flight", function () {
        xit("has rate of climb", function () {
            return;
        });
    });
    describe("propeller efficiency", function () {
        it("has a sealevel vprop", function () {
            var sigma = 1;
            var bhp = 150;
            var dp = 6;
            var vprop = formulas.propEfficiency.vprop(bhp, sigma, dp);
            assert.closeTo(vprop, 67.42, 0.01);
        });
        it("has a higher vprop at 40,000 feet", function () {
            var sigma = 0.25;
            var bhp = 150;
            var dp = 6;
            var vprop = formulas.propEfficiency.vprop(bhp, sigma, dp);
            assert.closeTo(vprop, 107, 0.1);
        });
    });
});
describe("advanced propeller", function () {
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
});
describe("prop tip speed", function () {
    xit("has propeller mach", function () {
        return;
    });
});
describe("Atmosphere", function () {
    it("has density ratio at sealevel", function () {
        assert.equal(formulas.atmosphere.densityRatio(0), 1);
    });
    it("has density ratio at 40,000 feet", function () {
        assert.closeTo(formulas.atmosphere.densityRatio(40000), 0.25, 0.01);
    });
    it("has density at sealevel", function () {
        assert.equal(formulas.atmosphere.density(0), 0.002377);
    });
    it("has density at 40000", function () {
        assert.closeTo(formulas.atmosphere.density(40000), 0.00005, 0.001);
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
describe("Reynolds number", function () {
    it("has viscosity at sealevel temperature", function () {
        var f = 58.7;
        var rankine = f + 460;
        var mu = formulas.reynolds.mu(rankine);
        assert.closeTo(mu, 3.737e-7, 0.001e-7);
    });
    it("has viscosity at lower temperature", function () {
        var f = 10;
        var rankine = f + 460;
        var mu = formulas.reynolds.mu(rankine);
        assert.closeTo(mu, 3.458e-7, 0.001e-7);
    });
    it("figures out reynolds number at sealevel", function () {
        var v = 67;
        var l = 4;
        var altitude = 0;
        var re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 2500000, 1000);
    });
    it("figures out reynolds number at 40,000 feet", function () {
        var v = 67;
        var l = 4;
        var altitude = 40000;
        var re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 776745, 1000);
    });
    it("verify reynolds T-18 cruise", function () {
        var v = 180;
        var l = 4;
        var altitude = 0;
        var re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 6700000, 100000);
    });
    it("verify reynolds T-18 stall", function () {
        var v = 67;
        var l = 4;
        var altitude = 0;
        var re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 2500000, 1000);
    });
});