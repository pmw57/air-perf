function densityRatio(altitude) {
    if (altitude < 36240) {
        return Math.pow(1 - altitude / 145800, 4.265);
    }
    if (altitude < 82000) {
        return 1.688 * Math.exp(-altitude / 20808);
    }
}
function calculateOutputs(inputs) {
    var density_ratio = densityRatio(inputs.altitude_ft);
    var wing_load_lb_ft = density_ratio * inputs.cl_max_clean *
            Math.pow(inputs.vel_stall_clean_mph, 2) / 391;
    var vel_stall_flaps_mph = Math.sqrt(wing_load_lb_ft * 391 /
            (density_ratio * inputs.cl_max_flap));
    var wing_area_ft = inputs.gross_lb / wing_load_lb_ft;
    var wing_aspect = Math.pow(inputs.wing_span_ft, 2) / wing_area_ft;
    var wing_chord_ft = inputs.wing_span_ft / wing_aspect;
    var wing_span_effective = inputs.wing_span_ft *
            Math.sqrt(inputs.plane_efficiency);
    var wing_chord_effective = wing_chord_ft /
            Math.sqrt(inputs.plane_efficiency);
    var span_load_effective = inputs.gross_lb / wing_span_effective;
    var drag_area_ft = 0.8 * inputs.bhp *
            146625 / Math.pow(inputs.vel_max_mph, 3);

    var zerolift_drag_coefficient = drag_area_ft / wing_area_ft;
    var vel_sink_min_ft = 11.285 *
            Math.sqrt(span_load_effective) /
            (Math.sqrt(density_ratio) * Math.pow(drag_area_ft, 1 / 4));
    var pwr_min_req_hp = 0.03921 *
            Math.sqrt(density_ratio) * Math.pow(drag_area_ft, 1 / 4) *
            Math.pow(span_load_effective, 3 / 2);
    var rate_sink_min_ft = 1294 * Math.sqrt(inputs.gross_lb) *
            Math.pow(drag_area_ft, 1 / 4) /
            Math.pow(wing_span_effective, 3 / 2);
    var ld_max = 0.8862 * wing_span_effective / Math.sqrt(drag_area_ft);
    var drag_min = 2 * Math.sqrt(drag_area_ft / Math.PI) *
            inputs.gross_lb / wing_span_effective;
    var cl_min_sink = 3.07 * Math.sqrt(drag_area_ft) / wing_chord_effective;
    var rate_climb_ideal = 33000 * inputs.bhp / inputs.gross_lb;
    var prop_dia_ft = inputs.prop_dia_in / 12;
    var prop_tip_mach = inputs.prop_max_rpm * prop_dia_ft *
            0.05236 / 1100;
    var prop_vel_ref = 41.9 *
            Math.pow(inputs.bhp / Math.pow(prop_dia_ft, 2), 1.0 / 3);
    var static_thrust_ideal = 10.41 *
            Math.pow(inputs.bhp * prop_dia_ft, 2.0 / 3);
    var outputs = {
        wing_load_lb_ft,
        vel_stall_flaps_mph,
        wing_area_ft,
        wing_aspect,
        wing_chord_ft,
        wing_span_effective,
        wing_chord_effective,
        span_load_effective,
        drag_area_ft,
        zerolift_drag_coefficient,
        vel_sink_min_ft,
        pwr_min_req_hp,
        rate_sink_min_ft,
        ld_max,
        drag_min,
        cl_min_sink,
        rate_climb_ideal,
        prop_tip_mach,
        prop_vel_ref,
        static_thrust_ideal
    };
    return outputs;
}
function calculateResults(inputs, outputs) {
    var results = {};
    results.data = [];
    var vel_delta = 1.00; // airspeed increment for each iteration
    var eta = 1;
    var rc = 1;
    var rc1 = 0;
    var rc2 = 0;
    var rcmax = 0;
    var vy = 0;
    var rec = 0;
    var rsh = 0;
    var rmu = 1;
    var rs = 0;
    var sig = Math.pow(1 - inputs.altitude_ft / 145800, 4.265);
    // var t = 518.7 - 0.00356 * inputs.altitude_ft;
    var t1 = 1.0 / 3;
    var t2 = 0;
    var v = inputs.vel_stall_clean_mph;
    var vh = 0;
    var vmax = 0;
    var vt = 0;
    var counter = 0;
    while (rc > 0 && counter < 1000) {
        vh = v / outputs.vel_sink_min_ft;
        rsh = 0.25 * (Math.pow(vh, 4) + 3) / vh;
        rs = rsh * outputs.rate_sink_min_ft;
        vt = v / outputs.prop_vel_ref;
        t2 = Math.sqrt(1 + 0.23271 * Math.pow(vt, 3));
        eta = 0.92264 * vt * (
            Math.pow(1 + t2, t1) - Math.pow(t2 - 1, t1)
        ) * 0.85;
        rc = outputs.rate_climb_ideal * eta - rs;
        rc2 = rc;
        rec = sig * v * outputs.wing_chord_ft * 9324 / rmu;
        if (rc > 0) {
            if (rc > rcmax) {
                rcmax = Math.max(rc, rcmax);
                vy = v;
            }
            vmax = Math.max(v, vmax);
            results.data.push({v, rc, eta, rs, rec});
            v = v + vel_delta * rc2 / (rc2 - rc1);
        }
        counter += 1;
    }
    if (counter >= 1000) {
        results.runaway = true;
        return;
    }
    return Object.assign(results, {
        rcmax,
        vy,
        vmax,
        fp: rcmax * inputs.useful_load_lb / 33000 / inputs.bhp *
                (1 - (outputs.vel_stall_flaps_mph / vmax)),
        wv2: inputs.gross_lb * Math.pow(v, 2),
        useful_load: inputs.useful_load_lb
    });
}
export default Object.freeze({
    outputs: calculateOutputs,
    results: calculateResults
});