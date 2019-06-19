import {describe, it} from "mocha";
import {assert} from "chai";
import aircraftCsv from "../src/aircraftCsv.js";
import {JSDOM} from "jsdom";

describe("Aircraft CSV tests", function () {
    const dom = new JSDOM("<form>" +
            "    <input name=name><input name=vs1><input name=cl_max_clean>" +
            "</form>" +
            "<div id=outputs>" +
            "    <span id=vs0></span>" +
            "    <span id=wing_area_ft></span>" +
            "    <span id=wing_aspect></span>" +
            "</div>" +
            "<div id=results>" +
            "    <span id=fp></span>" +
            "    <span id=wv2></span>" +
            "</div>");
    const document = dom.window.document;

    const inputSpecs = {
        name: "test craft",
        vs1: 67,
        vs0: 57 // shouldn't appear from getInputs
    };
    const outputSpecs = {
        vs1: 67,
        vs0: 57,
        wing_area_ft: 86
    };
    const resultsSpecs = {
        results: {
            fp: 10,
            wv2: 3000,
            unused: "shouldn't be included"
        },
        table: [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10]
        ]
    };
    function getFormEntries(form) {
        return Array.from(form.elements).reduce(function (obj, el) {
            obj[el.name] = el.value;
            return obj;
        }, {});
    }
    function getIdEntries(selector) {
        var els = document.querySelectorAll(selector);
        return Array.from(els).reduce(function (obj, el) {
            if (el.id) {
                obj[el.id] = el.textContent;
            }
            return obj;
        }, {});
    }
    const inputsView = {
        getFormValues() {
            return getFormEntries(document.querySelector("form"));
        }
    };
    const outputsView = {
        getOutputFields() {
            return getIdEntries("#outputs span");
        }
    };
    const resultsView = {
        getResultFields() {
            return getIdEntries("#results span");
        }
    };
    describe("inputs", function () {
        it("gets input values", function () {
            const inputs = aircraftCsv.getInputs(inputSpecs, inputsView);
            assert.deepEqual(inputs, {
                name: "test craft",
                vs1: 67,
                cl_max_clean: undefined
            });
        });
        it("creates csv input content", function () {
            const csvInputs = aircraftCsv.csvInputs(inputSpecs, inputsView);
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
        it("gets output values", function () {
            const outputs = aircraftCsv.getOutputs(outputSpecs, outputsView);
            assert.deepEqual(outputs, {
                vs0: 57,
                wing_area_ft: 86,
                wing_aspect: undefined
            });
        });
        it("creates csv output content", function () {
            const csvOutputs = aircraftCsv.csvOutputs(outputSpecs, outputsView);
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
        it("gets result values", function () {
            const results = aircraftCsv.getResults(resultsSpecs, resultsView);
            assert.deepEqual(results, {
                fp: 10,
                wv2: 3000,
                data: [
                    [1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10]
                ]
            });
        });
        it("creates csv results content", function () {
            const csvResults = aircraftCsv.csvResults(
                resultsSpecs,
                resultsView
            );
            assert.deepEqual(csvResults, [
                "Results",
                "fp,10",
                "wv2,3000",
                "",
                "v(mph),rc(fpm),eta,rs(fpm),re=rho*v*c/mu",
                "1,2,3,4,5\n6,7,8,9,10",
                ""
            ]);
        });
    });
    it("stringifies stats into csv", function () {
        const specs = Object.assign(inputSpecs, outputSpecs, resultsSpecs);
        const view = Object.assign(inputsView, outputsView, resultsView);
        const csv = aircraftCsv.stringify(specs, view);
        assert.isNotArray(csv);
        assert.include(csv, "Input parameters");
        assert.include(csv, "Output parameters");
        assert.include(csv, "Results");
    });
});