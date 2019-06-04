import {describe, beforeEach, it} from "mocha";
import {assert} from "chai";
import view from "../src/aircraftView.js";

describe("Air performance test", function () {
    let els;
    let doc;
    function newElement() {
        return {value: ""};
    }
    beforeEach(function () {
        els = {
            "#vs0": newElement()
        };
        doc = {
            querySelector: function querySelector(selector) {
                if (selector === "#vs0") {
                    return els[selector];
                }
                if (selector === "#results") {
                    return {querySelector};
                }
                if (selector === "table") {
                    return {tBodies: [els.tbody]};
                }
                return els[selector];
            }
        };
    });
    describe("inputs", function () {
        it("updates an input", function () {
            const inputs = {vs1: "67"};
            const form = {elements: {vs1: {value: ""}}};
            view.init(form);
            view.renderInputs(inputs);
            assert.equal(inputs.vs1, form.elements.vs1.value);
        });
        it("throws an error with a non-matching input", function () {
            const inputs = {shouldntmatch: "67"};
            const form = {elements: {vs1: {value: ""}}};
            view.init(form);
            assert.throws(function () {
                view.renderInputs(inputs);
            }, ReferenceError);
        });
    });
    describe("outputs", function () {
        it("updates an output", function () {
            const vs0 = 57.19;
            const outputs = {vs0};
            const precision = {vs0: 2};
            view.init(undefined, doc);
            view.renderOutputs(outputs, precision);
            assert.equal(els["#vs0"].innerHTML, vs0);
        });
    });
    it("updates a result", function () {
        const results = {
            data: []
        };
        Object.assign(els, {
            tbody: {},
            "#fp": newElement(),
            "#wv2": newElement(),
            "#rcmax": newElement(),
            "#vy": newElement(),
            "#vmax": newElement(),
            "#useful_load": newElement()
        });
        const precision = {};
        view.init(undefined, doc);
        view.renderResults(results, precision);
    });
});