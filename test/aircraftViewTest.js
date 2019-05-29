/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import view from "../src/aircraftView.js";

describe("Air performance test", function () {
    it("updates an input", function () {
        var inputs = {vs1: "67"};
        var form = {elements: {vs1: {value: ""}}};
        view.init(form);
        view.renderInputs(inputs);
        assert.equal(inputs.vs1, form.elements.vs1.value);
    });
    it("throws an error with a non-matching input", function () {
        var inputs = {shouldntmatch: "67"};
        var form = {elements: {vs1: {value: ""}}};
        view.init(form);
        assert.throws(function () {
            view.renderInputs(inputs);
        }, ReferenceError);
    });
});