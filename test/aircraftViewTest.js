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
    it("gets values of input fields", function () {
        const form = {elements: [
            {name: "vs1", value: "67"},
            {name: "cl_max_clean", value: "1.53"}
        ]};
        view.init(form);
        const values = view.getFormValues();
        assert.equal(values.vs1, "67");
        assert.equal(values.cl_max_clean, "1.53");
    });
    it("updates an input", function () {
        const inputs = {vs1: "67"};
        const form = {elements: {vs1: {value: ""}}};
        view.init(form);
        view.renderInputs(inputs);
        assert.equal(inputs.vs1, form.elements.vs1.value);
    });
    it("updates an output", function () {
        els = {
            "#vs0": newElement(),
            "#summary": doc
        };
        const vs0 = 57.19;
        const outputs = {vs0};
        const precision = {vs0: 2};
        view.init(undefined, doc);
        view.renderOutputs(outputs, precision);
        assert.equal(els["#vs0"].innerHTML, vs0);
    });
    it("updates a result", function () {
        const results = {
            key1: 3,
            key2: 4
        };
        const table = [];
        els = {
            tbody: {},
            "#key1": newElement(),
            "#key2": newElement()
        };
        const precision = {};
        view.init(undefined, doc);
        view.renderResults({results, table}, precision);
        assert.equal(els["#key1"].innerHTML, "3");
        assert.equal(els["#key2"].innerHTML, "4");
    });
});