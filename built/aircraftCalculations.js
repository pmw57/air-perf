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
const performanceComparison = formulas.performanceComparison;
const atmosphere = formulas.atmosphere;
const reynolds = formulas.reynolds;

function calculateOutputs(inputs) {
    const sigma = atmosphere.densityRatio(inputs.altitude_ft);
    const ws_lbft = forceBalance.ws(sigma, inputs.cl_max_clean, inputs.vs1);
    const vs0 = forceBalance.vs0(ws_lbft, sigma, inputs.cl_max_flap);
    const s_ft = forceBalance.s(inputs.gross_lb, ws_lbft);
    const ar = inducedDrag.ar(inputs.wing_span_ft, s_ft);
    const c_ft = inducedDrag.c(inputs.wing_span_ft, ar);
    const ear = inducedDrag.ear(ar, inputs.plane_efficiency);
    const be = minSinkRate.be(inputs.wing_span_ft, inputs.plane_efficiency);
    const ce = minSinkRate.ce(c_ft, inputs.plane_efficiency);
    const wbe = minSinkRate.wbe(inputs.gross_lb, be);
    const ad_ft = minSinkRate.ad(sigma, inputs.bhp, inputs.vel_max_mph);
    const w = inputs.gross_lb;
    const dp = inputs.prop_dia_ft;
    return Object.assign({}, inputs, {
        wing_load_lb_ft: ws_lbft,
        vs0: vs0,
        wing_area_ft: s_ft,
        wing_aspect: ar,
        wing_chord_ft: c_ft,
        aspect_ratio_effective: ear,
        wing_span_effective: be,
        wing_chord_effective: ce,
        span_load_effective: wbe,
        drag_area_ft: ad_ft,
        zerolift_drag_coefficient: ad_ft / s_ft,
        vel_sink_min_ft: minSinkRate.vminsink(wbe, sigma, ad_ft, 1 / 4),
        pwr_min_req_hp: levelFlight.thpmin(sigma, ad_ft, wbe),
        rate_sink_min_ft: minSinkRate.rsmin(inputs.gross_lb, ad_ft, be),
        ld_max: maxLiftDragRatio.ldmax(be, ad_ft),
        drag_min: maxLiftDragRatio.dmin(ad_ft, inputs.gross_lb, be),
        cl_min_sink: minSinkRate.clmins(ad_ft, ce),
        rate_climb_ideal_max: climbingFlight.rcstarmax(inputs.bhp, w),
        prop_tip_mach: propTipSpeed.mp(inputs.prop_max_rpm, dp),
        prop_vel_ref: propEfficiency.vprop(inputs.bhp, sigma, dp),
        static_thrust_ideal: propAdvanced.ts(sigma, inputs.bhp, dp)
    });
}
function rateOfClimb(stats, v) {
    const sigma = atmosphere.densityRatio(stats.altitude_ft);
    const ad = stats.drag_area_ft;
    const be = stats.wing_span_effective;
    const rs = minSinkRate.rs(sigma, ad, v, stats.gross_lb, be);
    const eta = propEfficiency.etaFromV(v, stats.prop_vel_ref);
    return climbingFlight.rc(stats.bhp, stats.gross_lb, eta, rs);
}
function climbrateRow(stats, v) {
    return {
        v,
        rc: rateOfClimb(stats, v),
        eta: propEfficiency.etaFromV(v, stats.prop_vel_ref),
        rs: minSinkRate.rs(
            atmosphere.densityRatio(stats.altitude_ft),
            stats.drag_area_ft,
            v,
            stats.gross_lb,
            stats.wing_span_effective
        ),
        rec: reynolds.re(v, stats.wing_chord_ft, stats.altitude_ft)
    };
}
function climbrateTable(stats) {
    const table = [];
    let v = stats.vs1;
    while (table.length <= 2000 && rateOfClimb(stats, v) > 0) {
        table.push(climbrateRow(stats, v));
        v += 1;
    }
    return table;
}
function flightPerformance(stats, rcmax, v) {
    return performance.fp(
        stats.useful_load_lb,
        rcmax,
        stats.bhp,
        stats.vs0,
        v
    );
}
function getLastRow(arr) {
    return arr.slice(-1)[0];
}
function performanceResults(stats, table) {
    const results = {};
    const maxClimbrateRow = table.reduce(function (maxRow, climbrateRow) {
        if (climbrateRow.rc > maxRow.rc) {
            return climbrateRow;
        }
        return maxRow;
    }, {
        rc: 0
    });
    if (!maxClimbrateRow.rc) {
        return {};
    }
    results.rcmax = maxClimbrateRow.rc;
    results.vy = maxClimbrateRow.v;
    results.vmax = getLastRow(table).v;
    results.fp = flightPerformance(stats, results.rcmax, results.vmax);
    results.wv2 = performanceComparison.wvmax2(stats.gross_lb, results.vmax);
    results.useful_load = stats.useful_load_lb;
    return results;
}
function calculateResults(stats) {
    const table = climbrateTable(stats);
    const results = performanceResults(stats, table);
    stats.table = table;
    stats.results = results;
    return stats;
}
export default Object.freeze({
    outputs: calculateOutputs,
    results: calculateResults
});