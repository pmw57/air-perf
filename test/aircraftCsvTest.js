import {describe, it} from "mocha";
import {assert} from "chai";
import aircraftCsv from "../src/aircraftCsv.js";

describe("Aircraft CSV tests", function () {
    describe("inputs", function () {
        const data = {
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
        const view = {
            getFormValues
        };
        it("gets input values", function () {
            const inputs = aircraftCsv.getInputs(data, view);
            assert.deepEqual(inputs, {
                name: "test craft",
                vs1: 67,
                cl_max_clean: undefined
            });
        });
        it("creates csv input content", function () {
            const csvInputs = aircraftCsv.csvInputs(data, view);
            assert.deepEqual(csvInputs, [
                "Input parameters",
                "name,test craft",
                "vs1,67",
                "cl_max_clean,undefined",
                ""
            ]);
        });
    });
    describe("outputs", function () {
        const data = {
            vs1: 67,
            vs0: 57,
            wing_area_ft: 86
        };
        const view = {
            getOutputFields() {
                return {
                    vs0: "",
                    wing_area_ft: "",
                    wing_aspect: ""
                };
            }
        };
        it("gets output values", function () {
            const outputs = aircraftCsv.getOutputs(data, view);
            assert.deepEqual(outputs, {
                vs0: 57,
                wing_area_ft: 86,
                wing_aspect: undefined
            });
        });
        it("creates csv output content", function () {
            const csvOutputs = aircraftCsv.csvOutputs(data, view);
            assert.deepEqual(csvOutputs, [
                "Output parameters",
                "vs0,57",
                "wing_area_ft,86",
                "wing_aspect,undefined",
                ""
            ]);
        });
    });
    describe("results", function () {
        const data = {
            results: {
                fp: 10,
                wv2: 3000,
                unused: "shouldn't be included"
            },
            table: []
        };
        const view = {
            getResultFields() {
                return {
                    fp: "",
                    wv2: ""
                };
            }
        };
        it("gets result values", function () {
            const results = aircraftCsv.getResults(data, view);
            assert.deepEqual(results, {
                fp: 10,
                wv2: 3000,
                data: []
            });
        });
        it("creates csv results content", function () {
            const csvResults = aircraftCsv.csvResults(data, view);
            assert.deepEqual(csvResults, [
                "Results",
                "fp,10",
                "wv2,3000",
                "",
                [
                    "v(mph)", "rc(fpm)", "eta", "rs(fpm)", "re=rho*v*c/mu"
                ],
                ""
            ]);
        });
    });
});