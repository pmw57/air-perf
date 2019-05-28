/*jslint browser */
import {describe, it} from "mocha";
import {assert} from "chai";
import {updateInputs} from "../src/air-perf.js";

describe("Air performance test", function () {
    it("updates an input", function () {
        var inputs = {vs1: "67"};
        var form = {elements: {vs1: {value: ""}}};
        updateInputs(inputs, form);
        assert.equal(inputs.vs1, form.elements.vs1.value);
    });
});