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
    it("gets output values", function () {
        var data = {
            vs1: 67,
            vs0: 57,
            wing_area_ft: 86
        };
        var view = {
            getOutputFields() {
                return {
                    vs0: "",
                    wing_area_ft: "",
                    wing_aspect: ""
                };
            }
        };
        var outputs = aircraftCsv.getOutputs(data, view);
        assert.deepEqual(outputs, {
            vs0: 57,
            wing_area_ft: 86,
            wing_aspect: undefined
        });
    });
    it("gets result values", function () {
        var data = {
            results: {
                fp: 10,
                wv2: 3000,
                unused: "shouldn't be included"
            },
            table: []
        };
        var view = {
            getResultFields() {
                return {
                    fp: "",
                    wv2: ""
                };
            }
        };
        var results = aircraftCsv.getResults(data, view);
        assert.deepEqual(results, {
            fp: 10,
            wv2: 3000,
            data: []
        });
    });
});