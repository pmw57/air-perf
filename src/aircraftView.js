const view = (function iife() {
    const props = {};
    function renderInputs(inputs) {
        const elements = props.form.elements;
        Object.entries(inputs).forEach(function ([key]) {
            if (!elements[key]) {
                throw new ReferenceError(key + " field not found");
            }
            elements[key].value = inputs[key];
        });
    }
    function getValues() {
        return Array.from(props.form.elements).reduce(function (obj, field) {
            obj[field.name] = field.value;
            return obj;
        }, {});
    }
    function init(formToUse) {
        props.form = formToUse;
    }
    return {
        renderInputs,
        getValues,
        init
    };
}());
export default Object.freeze(view);