const forceBalance = {
    ws(sigma, clmax, vs1) {
        return sigma * clmax * Math.pow(vs1, 2) / 391;
    },
    s(w_lb, ws_lbft) {
        return w_lb / ws_lbft;
    },
    vs0(ws_lbft, sigma, clmaxf) {
        return Math.sqrt(ws_lbft * 391 / (sigma * clmaxf));
    }
};
const inducedDrag = {
    ar(b_ft, s_ft) {
        return Math.pow(b_ft, 2) / s_ft;
    },
    c(ws_lbft, ar) {
        return ws_lbft / ar;
    }
};
const minSinkRate = {
    ce(c_ft, e) {
        return c_ft / Math.sqrt(e);
    },
    clmins(ad_ft, ce) {
        return 3.07 * Math.sqrt(ad_ft) / ce;
    },
    be(ws_lbft, e) {
        return ws_lbft * Math.sqrt(e);
    },
    wbe(w_lb, be) {
        return w_lb / be;
    },
    ad(sigma, bhp, vmax_mph) {
        return sigma * 0.8 * bhp * 146625 / Math.pow(vmax_mph, 3);
    },
    rsmin(w_lb, ad_ft, be) {
        return 1294 * Math.sqrt(w_lb) *
                Math.pow(ad_ft, 1 / 4) / Math.pow(be, 3 / 2);
    },
    vminsink(wbe, sigma, ad_ft) {
        return 11.285 * Math.sqrt(wbe) / (
            Math.sqrt(sigma) * Math.pow(ad_ft, 1 / 4)
        );
    },
    rs(sigma, ad, v, w, be) {
        return 88 * (sigma * ad * Math.pow(v, 3) / (391 * w) + (
            391 * w / (Math.PI * sigma * v * Math.pow(be, 2))
        ));
    }
};
const maxLiftDragRatio = {
    ldmax(be, ad_ft) {
        return 0.8862 * be / Math.sqrt(ad_ft);
    },
    dmin(ad_ft, w_lb, be) {
        return 2 * Math.sqrt(ad_ft / Math.PI) * w_lb / be;
    }
};
const levelFlight = {
    thpmin(sigma, ad_ft, wbe) {
        return 0.03921 * (
            Math.pow(ad_ft, 1 / 4) / Math.sqrt(sigma)
        ) * Math.pow(wbe, 3 / 2);
    }
};
const climbingFlight = {
    rcstarmax(bhp, w_lb) {
        return 33000 * bhp / w_lb;
    }
};
const propEfficiency = {
    vprop(bhp, sigma, dp_ft) {
        return 41.9 * Math.pow(bhp / (sigma * Math.pow(dp_ft, 2)), 1.0 / 3);
    }
};
const propAdvanced = {
    ts(sigma, bhp, dp_ft) {
        return 10.41 * Math.pow(sigma, 1 / 3) * Math.pow(bhp * dp_ft, 2.0 / 3);
    }
};
const propTipSpeed = {
    mp(propMax_rpm, dp_ft) {
        const speedOfSound = 1100;
        return Math.PI * dp_ft * propMax_rpm / 60 / speedOfSound;
    }
};
const createAtmosphere = function createAtmosphere() {
    function densityRatio(altitude) {
        if (altitude < 36240) {
            return Math.pow(1 - altitude / 145800, 4.265);
        }
        if (altitude < 82000) {
            return 1.688 * Math.exp(-altitude / 20808);
        }
    }
    function temperature(altitude) {
        const lapseRate = 3.56 / 1000;
        const rankineSealevel = 518.7;
        const rankine = rankineSealevel - lapseRate * altitude;
        const f = rankine - 460;
        return Math.max(f, -70);
    }
    function density(altitude) {
        const rhoSl = 0.002377;
        return densityRatio(altitude) * rhoSl;
    }
    return {
        densityRatio,
        temperature,
        density
    };
};
const atmosphere = createAtmosphere();
const reynolds = (function iife() {
    function mu(rankine) {
        // 198.6 from the book results in a too high value of 3.7385
        // Using Sutherland's constant of 198.7 we get a more appropriate
        // value of 3.737...
        return 2.270 * Math.pow(rankine, 3 / 2) / (
            rankine + 198.7
        ) * Math.pow(10, -8);
    }
    function re(vel, len, altitude) {
        const f = atmosphere.temperature(altitude);
        const rankine = f + 460;
        const rho = atmosphere.density(altitude);
        const viscosity = mu(rankine);
        return rho * vel * len / viscosity * 5280 / 3600;
    }
    return {
        mu,
        re
    };
}());

export default Object.freeze({
    forceBalance,
    inducedDrag,
    minSinkRate,
    maxLiftDragRatio,
    levelFlight,
    climbingFlight,
    propEfficiency,
    propAdvanced,
    propTipSpeed,
    reynolds,
    atmosphere
});