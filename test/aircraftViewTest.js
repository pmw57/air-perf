import {describe, beforeEach, it} from "mocha";
import {assert} from "chai";
import view from "../src/aircraftView.js";
import {JSDOM} from "jsdom";

describe("Aircraft view tests", function () {
    let dom;
    let document;

    let form;
    beforeEach(function () {
        dom = new JSDOM("<form>" +
        "    <input name=vs1 value=67>" +
        "    <input name=cl_max_clean value=1.53>" +
        "</form>" +
        "<table id=summary><tr>" +
        "    <td id=vs0>57.19</td>" +
        "    <td id=wing_area_ft>85.39</td>" +
        "    <td id=wing_aspect>5.08</td>" +
        "</tr></table>" +
        "<div id=results>" +
        "  <ul>" +
        "    <li><span id=fp>0.1207</span></li>" +
        "    <li><span id=wv2>45414000</span></li>" +
        "  </ul>" +
        "  <div id=summary>" +
        "    <table>" +
        "      <tbody>" +
        "      </tbody>" +
        "    </table>" +
        "  </div>" +
        "</div>");
        document = dom.window.document;
        form = document.querySelector("form");
    });
    it("gets elements from the form", function () {
        view.init(form, document);
        const elements = view.getFormElements();
        assert.equal(elements[0].name, "vs1");
        assert.equal(elements[0].value, "67");
        assert.equal(elements[1].name, "cl_max_clean");
        assert.equal(elements[1].value, "1.53");
    });
    it("gets values of input fields", function () {
        view.init(form, document);
        const values = view.getFormValues();
        assert.equal(values.vs1, "67");
        assert.equal(values.cl_max_clean, "1.53");
    });
    it.skip("throws an error when no summary exists", function () {
        return;
    });
    it("gets output fields", function () {
        view.init(form, document);
        const outputFields = view.getOutputFields();
        assert.equal(outputFields.vs0, "57.19");
        assert.equal(outputFields.wing_area_ft, "85.39");
        assert.equal(outputFields.wing_aspect, "5.08");
    });
    it.skip("throws an error when no results exist", function () {
        return;
    });
    it("gets results fields", function () {
        view.init(form, document);
        const resultFields = view.getResultFields();
        assert.equal(resultFields.fp, "0.1207");
        assert.equal(resultFields.wv2, "45414000");
    });
    it.skip("throws an error when no form exists", function () {
        return;
    });
    it("updates an input", function () {
        const vs1 = form.elements[0];
        const oldValue = vs1.value;
        view.init(form, document);
        vs1.value = "";
        assert.equal(vs1.value, "");
        view.renderInputs({vs1: "67"});
        assert.equal(vs1.value, "67");
        vs1.value = oldValue;
    });
    it("updates an output", function () {
        const vs0 = document.querySelector("#vs0");
        view.init(form, document);
        const outputs = {vs0: 57};
        const precision = {vs0: 2};
        view.renderOutputs(outputs, precision);
        assert.equal(vs0.innerHTML, 57.00);
    });
    it.skip("Throws and error when result section not found", function () {
        return;
    });
    it.skip("Throws and error when table section not found", function () {
        return;
    });
    it("updates a result", function () {
        const results = {
            fp: 0.1207,
            wv2: 45414000
        };
        const table = [
            {v: 67, rc: 1177, eta: 0.63, rs: 895, rec: 2560000}
        ];
        const precision = {
            fp: 4,
            wv2: 0,
            v: 0,
            rc: 1,
            eta: 2,
            rs: 1,
            rec: 0
        };
        view.init(form, document);
        view.renderResults({results, table}, precision);
        assert.equal(document.querySelector("#fp").innerHTML, "0.1207");
        assert.equal(document.querySelector("#wv2").innerHTML, "45414000");
        assert.equal(
            document.querySelector("#results tr").innerHTML,
            "<td>67</td><td>1177.0</td><td>0.63</td>" +
                    "<td>895.0</td><td>2560000</td>"
        );
    });
});