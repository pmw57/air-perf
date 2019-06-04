/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import view from "../src/aircraftView.js";

describe("Air performance test", function () {
    var outputs = {};
    var results = {};
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
    it.skip("updates an output", function () {
        return;
    });
    it.skip("updates a result", function () {
        return;
    });
});