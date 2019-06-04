import {describe, beforeEach, it} from "mocha";
import {assert} from "chai";
import view from "../src/aircraftView.js";

describe("Aircraft view tests", function () {
    let els;
    let doc;
    function newElement() {
        return {value: ""};
    }
    beforeEach(function () {
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
            els = {
                "#vs0": newElement()
            };
            const vs0 = 57.19;
            const outputs = {vs0};
            const precision = {vs0: 2};
            view.init(undefined, doc);
            view.renderOutputs(outputs, precision);
            assert.equal(els["#vs0"].innerHTML, vs0);
        });
    });
    describe("results", function () {
        it("updates a result", function () {
            const results = {
                key1: 3,
                key2: 4,
                data: []
            };
            els = {
                tbody: {},
                "#key1": newElement(),
                "#key2": newElement()
            };
            const precision = {};
            view.init(undefined, doc);
            view.renderResults(results, precision);
            assert.equal(els["#key1"].innerHTML, "3");
            assert.equal(els["#key2"].innerHTML, "4");
        });
    });
});