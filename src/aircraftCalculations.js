import formulas from "./aircraftFormulas.js";

function calculateOutputs(inputs) {
    const forceBalance = formulas.forceBalance;
    const inducedDrag = formulas.inducedDrag;
    const minSinkRate = formulas.minSinkRate;
    const maxLiftDragRatio = formulas.maxLiftDragRatio;
    const levelFlight = formulas.levelFlight;
    const climbingFlight = formulas.climbingFlight;
    const propEfficiency = formulas.propEfficiency;
    const propAdvanced = formulas.propAdvanced;
    const propTipSpeed = formulas.propTipSpeed;
    const atmosphere = formulas.atmosphere;
    const sigma = atmosphere.densityRatio(inputs.altitude_ft);
    const ws_lbft = forceBalance.ws(sigma, inputs.cl_max_clean, inputs.vs1);
    const vs0 = forceBalance.vs0(ws_lbft, sigma, inputs.cl_max_flap);
    const s_ft = forceBalance.s(inputs.gross_lb, ws_lbft);
    const ar = inducedDrag.ar(inputs.wing_span_ft, s_ft);
    const c_ft = inducedDrag.c(inputs.wing_span_ft, ar);
    const be = minSinkRate.be(inputs.wing_span_ft, inputs.plane_efficiency);
    const ce = minSinkRate.ce(c_ft, inputs.plane_efficiency);
    const wbe = minSinkRate.wbe(inputs.gross_lb, be);
    const ad_ft = minSinkRate.ad(sigma, inputs.bhp, inputs.vel_max_mph);
    const prop_dia_ft = inputs.prop_dia_in / 12;
    return {
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
        rate_sink_min_ft: minSinkRate.rsmin(inputs.gross_lb, ad_ft, be),
        ld_max: maxLiftDragRatio.ldmax(be, ad_ft),
        drag_min: maxLiftDragRatio.dmin(ad_ft, inputs.gross_lb, be),
        cl_min_sink: minSinkRate.clmins(ad_ft, ce),
        rate_climb_ideal: climbingFlight.rc(inputs.bhp, inputs.gross_lb),
        prop_tip_mach: propTipSpeed.mp(inputs.prop_max_rpm, prop_dia_ft),
        prop_vel_ref: propEfficiency.vprop(inputs.bhp, sigma, prop_dia_ft),
        static_thrust_ideal: propAdvanced.ts(sigma, inputs.bhp, prop_dia_ft)
    };
}
function calculateResults(inputs, outputs) {
    const atmosphere = formulas.atmosphere;
    const minSinkRate = formulas.minSinkRate;
    const reynolds = formulas.reynolds;
    const results = {
        rcmax: 0,
        vmax: 0,
        data: []
    };

    let rc = 1;
    let v = inputs.vs1;
    while (rc > 0 && results.data.length < 1000) {
        const sigma = atmosphere.densityRatio(inputs.altitude_ft);
        const ad = outputs.drag_area_ft;
        const be = outputs.wing_span_effective;
        const rs = minSinkRate.rs(sigma, ad, v, inputs.gross_lb, be);
        const vt = v / outputs.prop_vel_ref;
        const t2 = Math.sqrt(1 + 0.23271 * Math.pow(vt, 3));
        const eta = 0.92264 * vt * (
            Math.pow(1 + t2, 1 / 3) - Math.pow(t2 - 1, 1 / 3)
        ) * 0.85;
        rc = outputs.rate_climb_ideal * eta - rs;
        const rec = reynolds.re(v, outputs.wing_chord_ft, inputs.altitude_ft);
        if (rc > 0) {
            if (rc > results.rcmax) {
                results.rcmax = Math.max(rc, results.rcmax);
                results.vy = v;
            }
            results.vmax = Math.max(v, results.vmax);
            results.data.push({v, rc, eta, rs: rs, rec});
            v += 1;
        }
    }
    return Object.assign(results, {
        fp: results.rcmax * inputs.useful_load_lb / 33000 / inputs.bhp * (
            1 - ((outputs.vs0) / results.vmax)
        ),
        wv2: inputs.gross_lb * Math.pow(v, 2),
        useful_load: inputs.useful_load_lb
    });
}
export default Object.freeze({
    outputs: calculateOutputs,
    results: calculateResults
});