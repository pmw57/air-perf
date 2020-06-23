import {describe, beforeEach, it} from "mocha";
import {assert} from "chai";
import csv from "../built/csv.js";

describe("CSV tests", function () {
    describe("convert", function () {
        it("converts an object into csv", function () {
            const obj = {key: "some data"};
            const converted = csv.stringify(obj);
            assert.equal(converted[0], "key,some data");
        });
        it("converts an object into csv", function () {
            const arr = [
                {v: 67, rc: 1177.3, eta: 0.63, rs: 895.5, re: 2561330},
                {v: 68, rc: 1198, eta: 0.63, rs: 890.5, re: 2599558}
            ];
            const converted = csv.stringify(arr);
            assert.equal(converted, "67,1177.3,0.63,895.5,2561330\n" +
                    "68,1198,0.63,890.5,2599558");
        });
        it("converts csv into an object", function () {
            const csvText = "key,some data";
            const arr = csv.parse(csvText);
            assert.equal(arr[0][0], "key");
            assert.equal(arr[0][1], "some data");
        });
    });
    describe("loading", function () {
        let filename;
        let evt;
        let reader;
        beforeEach(function () {
            filename = "dummy.filename";
            evt = {
                target: {
                    files: [filename]
                }
            };
            reader = (function iffe() {
                const props = {};
                return {
                    getFilename: function () {
                        return props.filename;
                    },
                    readAsText(filename, type) {
                        props.filename = filename;
                        props.type = type;
                    }
                };
            }());
        });
        it("loads a csv file", function () {
            const result = "Input parameters\n" +
                    "name,Thorp T-18\n";
            let arr;
            const success = function (csvArr) {
                arr = csvArr;
            };
            const fileLoader = reader;
            csv.load(evt, success, fileLoader);
            assert.equal(reader.getFilename(), filename);
            assert.isFunction(reader.onload);
            reader.onload({
                target: {result}
            });
            assert.equal(
                JSON.stringify(arr),
                "[[\"Input parameters\"],[\"name\"," +
                        "\"Thorp T-18\"],[\"\"]]"
            );
        });
        it("gives a load handler", function () {
            let wasCalled = false;
            function callback() {
                wasCalled = true;
            }
            const handler = csv.loadHandler(callback, reader);
            handler(evt);
            reader.onload({
                target: {
                    result: ""
                }
            });
            assert.isTrue(wasCalled);
        });
    });
    describe("saving", function () {
        let fakeWindow;
        beforeEach(function () {
            fakeWindow = (function () {
                const props = {};
                function Blob(content, options) {
                    props.content = content;
                    props.type = options.type;
                }
                Blob.prototype.getContent = function () {
                    return props.content;
                };
                Blob.prototype.getType = function () {
                    return props.type;
                };
                return {
                    Blob
                };
            }());
        });
        it("creates a csv blob for saving", function () {
            const csvText = "vs1,67";
            const blob = csv.makeBlob(csvText, fakeWindow);
            assert.equal(blob.getContent(), csvText);
            assert.equal(blob.getType(), "text/csv");
        });
        it("saves to the writer", function () {
            const writer = (function makeWriter() {
                function func(blob, filename) {
                    func.blob = blob;
                    func.filename = filename;
                }
                return func;
            }());
            const csvText = "vs1,67";
            const filename = "a filename";
            csv.save(csvText, filename, writer, fakeWindow);
            assert.equal(writer.filename, filename);
            assert.equal(writer.blob.getContent(), csvText);
        });
    });
});