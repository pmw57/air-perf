import {describe, it} from "mocha";
import {assert} from "chai";
import aircraftCsv from "../src/aircraftCsv.js";

describe("Aircraft CSV tests", function () {
    it("gets input values", function () {
        var data = {
            name: "test craft",
            vs1: 67,
            vs0: 57 // shouldn't appear from getInputs
        };
        function getFormValues() {
            return {
                name: "",
                vs1: "",
                cl_max_clean: "" // should appear from getInputs
            };
        }
        var view = {
            getFormValues
        };
        var inputs = aircraftCsv.getInputs(data, view);
        assert.deepEqual(inputs, {
            name: "test craft",
            vs1: 67,
            cl_max_clean: undefined
        });
    });
});