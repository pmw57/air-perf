/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import formulas from "../src/aircraftFormulas.js";

describe("Formula tests", function () {
    describe("force balance", function () {
        const forceBalance = formulas.forceBalance;
        it("has a sealevel wing load", function () {
            const sigma = 1;
            const clmax = 1.53;
            const vs1 = 67;
            const ws = forceBalance.ws(sigma, clmax, vs1);
            assert.closeTo(ws, 17.57, 0.01);
        });
        it("changes wing load with altitude", function () {
            const sigma = 0.75;
            const clmax = 1.53;
            const vs1 = 67;
            const ws = forceBalance.ws(sigma, clmax, vs1);
            assert.closeTo(ws, 13.17, 0.01);
        });
        it("has same wing load at faster speed", function () {
            const sigma = 0.75;
            const clmax = 1.53;
            const vs1 = 77.5;
            const ws = forceBalance.ws(sigma, clmax, vs1);
            assert.closeTo(ws, 17.57, 0.1);
        });
        it("has wing area", function () {
            assert.closeTo(forceBalance.s(1500, 17.57), 85.4, 0.1);
        });
        it("has stall speed in landing configuration", function () {
            const ws = 17.57;
            const sigma = 1;
            const clmaxf = 2.1;
            assert.closeTo(forceBalance.vs0(ws, sigma, clmaxf), 57.2, 0.1);
        });
    });
    describe("induced drag", function () {
        const inducedDrag = formulas.inducedDrag;
        it("has aspect ratio", function () {
            const b = 20.833;
            const s = 85.39;
            assert.closeTo(inducedDrag.ar(b, s), 5.08, 0.1);
        });
        it("has chord", function () {
            const ws = 17.57;
            const ar = 5.08;
            assert.closeTo(inducedDrag.c(ws, ar), 3.45, 0.1);
        });
    });
    describe("minimum sink rate", function () {
        it("has a sealevel drag area", function () {
            const sigma = 1;
            const bhp = 150;
            const vmax = 180;
            const ad = formulas.minSinkRate.ad(sigma, bhp, vmax);
            assert.closeTo(ad, 3.02, 0.01);
        });
        it("has a different drag area at 40,000 feet", function () {
            const sigma = 0.25;
            const bhp = 150;
            const vmax = 180;
            const ad = formulas.minSinkRate.ad(sigma, bhp, vmax);
            assert.closeTo(ad, 0.75, 0.1);
        });
        it("has rate of sink", function () {
            const sigma = 1;
            const ad = 3.02;
            const v = 67;
            const w = 1500;
            const be = 17.97;
            const rs = formulas.minSinkRate.rs(sigma, ad, v, w, be);
            assert.closeTo(rs, 895.61, 0.01);
        });
    });
    describe("max lift drag ratio", function () {
        const maxLiftDragRatio = formulas.maxLiftDragRatio;
        it("has max lift drag ratio", function () {
            const be = 17.97;
            const ad = 3.02;
            assert.closeTo(maxLiftDragRatio.ldmax(be, ad), 9.16, 0.1);
        });
        it("has minimum drag", function () {
            const ad = 3.02;
            const w = 1500;
            const be = 17.97;
            assert.closeTo(maxLiftDragRatio.dmin(ad, w, be), 163.68, 0.1);
        });
    });
    describe("level flight", function () {
        const levelFlight = formulas.levelFlight;
        it("has minimum power", function () {
            const sigma = 1;
            const ad = 3.02;
            const wbe = 83.47;
            assert.closeTo(levelFlight.thpmin(sigma, ad, wbe), 39.41, 0.1);
        });
    });
    describe("climbing flight", function () {
        const climbingFlight = formulas.climbingFlight;
        it("has max ideal rate of climb", function () {
            const bhp = 150;
            const w = 1500;
            assert.equal(climbingFlight.rcstarmax(bhp, w), 3300);
        });
    });
    describe("propeller efficiency", function () {
        it("has a sealevel vprop", function () {
            const sigma = 1;
            const bhp = 150;
            const dp = 6;
            const vprop = formulas.propEfficiency.vprop(bhp, sigma, dp);
            assert.closeTo(vprop, 67.42, 0.01);
        });
        it("has a higher vprop at 40,000 feet", function () {
            const sigma = 0.25;
            const bhp = 150;
            const dp = 6;
            const vprop = formulas.propEfficiency.vprop(bhp, sigma, dp);
            assert.closeTo(vprop, 107, 0.1);
        });
    });
});
describe("advanced propeller", function () {
    it("has a sealevel ideal static thrust", function () {
        const sigma = 1;
        const bhp = 150;
        const dp = 6;
        const ts = formulas.propAdvanced.ts(sigma, bhp, dp);
        assert.closeTo(ts, 970.39, 0.01);
    });
    it("has a sealevel ideal static thrust", function () {
        const sigma = 0.25;
        const bhp = 150;
        const dp = 6;
        const ts = formulas.propAdvanced.ts(sigma, bhp, dp);
        assert.closeTo(ts, 611.3, 0.1);
    });
});
describe("prop tip speed", function () {
    const propTipSpeed = formulas.propTipSpeed;
    it("has propeller mach", function () {
        const propMax = 2700;
        const dp = 6;
        assert.closeTo(propTipSpeed.mp(propMax, dp), 0.77, 0.01);
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
        const f = 58.7;
        const rankine = f + 460;
        const mu = formulas.reynolds.mu(rankine);
        assert.closeTo(mu, 3.737e-7, 0.001e-7);
    });
    it("has viscosity at lower temperature", function () {
        const f = 10;
        const rankine = f + 460;
        const mu = formulas.reynolds.mu(rankine);
        assert.closeTo(mu, 3.458e-7, 0.001e-7);
    });
    it("figures out reynolds number at sealevel", function () {
        const v = 67;
        const l = 4;
        const altitude = 0;
        const re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 2500000, 1000);
    });
    it("figures out reynolds number at 40,000 feet", function () {
        const v = 67;
        const l = 4;
        const altitude = 40000;
        const re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 776745, 1000);
    });
    it("verify reynolds T-18 cruise", function () {
        const v = 180;
        const l = 4;
        const altitude = 0;
        const re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 6700000, 100000);
    });
    it("verify reynolds T-18 stall", function () {
        const v = 67;
        const l = 4;
        const altitude = 0;
        const re = formulas.reynolds.re(v, l, altitude);
        assert.closeTo(re, 2500000, 1000);
    });
});