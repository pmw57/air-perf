import formulas from "./aircraftFormulas.js";
const forceBalance = formulas.forceBalance;
const inducedDrag = formulas.inducedDrag;
const minSinkRate = formulas.minSinkRate;
const maxLiftDragRatio = formulas.maxLiftDragRatio;
const levelFlight = formulas.levelFlight;
const climbingFlight = formulas.climbingFlight;
const propEfficiency = formulas.propEfficiency;
const propAdvanced = formulas.propAdvanced;
const propTipSpeed = formulas.propTipSpeed;
const performance = formulas.performance;
const atmosphere = formulas.atmosphere;
const reynolds = formulas.reynolds;

function calculateOutputs(data) {
    const sigma = atmosphere.densityRatio(data.altitude_ft);
    const ws_lbft = forceBalance.ws(sigma, data.cl_max_clean, data.vs1);
    const vs0 = forceBalance.vs0(ws_lbft, sigma, data.cl_max_flap);
    const s_ft = forceBalance.s(data.gross_lb, ws_lbft);
    const ar = inducedDrag.ar(data.wing_span_ft, s_ft);
    const c_ft = inducedDrag.c(data.wing_span_ft, ar);
    const be = minSinkRate.be(data.wing_span_ft, data.plane_efficiency);
    const ce = minSinkRate.ce(c_ft, data.plane_efficiency);
    const wbe = minSinkRate.wbe(data.gross_lb, be);
    const ad_ft = minSinkRate.ad(sigma, data.bhp, data.vel_max_mph);
    return Object.assign(data, {
        wing_load_lb_ft: ws_lbft,
        vs0: vs0,
        wing_area_ft: s_ft,
        wing_aspect: ar,
        wing_chord_ft: c_ft,
        wing_span_effective: be,
        wing_chord_effective: ce,
        span_load_effective: wbe,
        drag_area_ft: ad_ft,
        zerolift_drag_coefficient: ad_ft / s_ft,
        vel_sink_min_ft: minSinkRate.vminsink(wbe, sigma, ad_ft, 1 / 4),
        pwr_min_req_hp: levelFlight.thpmin(sigma, ad_ft, wbe),
        rate_sink_min_ft: minSinkRate.rsmin(data.gross_lb, ad_ft, be),
        ld_max: maxLiftDragRatio.ldmax(be, ad_ft),
        drag_min: maxLiftDragRatio.dmin(ad_ft, data.gross_lb, be),
        cl_min_sink: minSinkRate.clmins(ad_ft, ce),
        rate_climb_ideal_max: climbingFlight.rcstarmax(data.bhp, data.gross_lb),
        prop_tip_mach: propTipSpeed.mp(data.prop_max_rpm, data.prop_dia_ft),
        prop_vel_ref: propEfficiency.vprop(data.bhp, sigma, data.prop_dia_ft),
        static_thrust_ideal: propAdvanced.ts(sigma, data.bhp, data.prop_dia_ft)
    });
}
function rateOfClimb(data, v) {
    const sigma = atmosphere.densityRatio(data.altitude_ft);
    const ad = data.drag_area_ft;
    const be = data.wing_span_effective;
    const rs = minSinkRate.rs(sigma, ad, v, data.gross_lb, be);
    const eta = propEfficiency.etaFromV(v, data.prop_vel_ref);
    return climbingFlight.rc(data.bhp, data.gross_lb, eta, rs);
}
function tableRow(data, v) {
    return {
        v,
        rc: rateOfClimb(data, v),
        eta: propEfficiency.etaFromV(v, data.prop_vel_ref),
        rs: minSinkRate.rs(
            atmosphere.densityRatio(data.altitude_ft),
            data.drag_area_ft,
            v,
            data.gross_lb,
            data.wing_span_effective
        ),
        rec: reynolds.re(v, data.wing_chord_ft, data.altitude_ft)
    };
}
function climbrateTable(data) {
    const table = [];
    let v = data.vs1;
    while (table.length <= 2000 && rateOfClimb(data, v) > 0) {
        table.push(tableRow(data, v));
        v += 1;
    }
    return table;
}
function flightPerformance(data, rcmax, v) {
    return performance.fp(
        data.useful_load_lb,
        rcmax,
        data.bhp,
        data.vs0,
        v
    );
}
function performanceResults(data) {
    const results = {};
    const maxClimbrateRow = data.table.reduce(function (maxRow, climbrateRow) {
        if (climbrateRow.rc > maxRow.rc) {
            return climbrateRow;
        }
        return maxRow;
    });
    const lastRow = data.table.slice(-1)[0];
    results.rcmax = maxClimbrateRow.rc;
    results.vy = maxClimbrateRow.v;
    results.vmax = lastRow.v;
    results.fp = flightPerformance(data, results.rcmax, results.vmax);
    results.wv2 = data.gross_lb * Math.pow(results.vmax, 2);
    results.useful_load = data.useful_load_lb;
    return results;
}
function calculateResults(data) {
    data.table = climbrateTable(data);
    data.results = performanceResults(data);
    return data;
}
export default Object.freeze({
    outputs: calculateOutputs,
    results: calculateResults
});