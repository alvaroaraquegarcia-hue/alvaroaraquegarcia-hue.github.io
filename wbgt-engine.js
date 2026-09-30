/* ==========================================================================
 * Motor de cálculo WBGT — SCHO
 * Modelo de Liljegren et al. (2008), J Occup Environ Hyg 5(10):645-655.
 * Traducción a JavaScript del código de referencia en C (Argonne National Laboratory, WBGT v1.1).
 * Criterios ACGIH: TLV = 56,7 − 11,5·log10(M) ; AL = 59,9 − 14,1·log10(M)  (M en W)
 * ========================================================================== */
(function (root) {
  'use strict';
  var PI = Math.PI, DEG = PI / 180;
  var SOLAR_CONST = 1367, STEFANB = 5.6696e-8, Cp = 1003.5, M_AIR = 28.97, M_H2O = 18.015;
  var RATIO = Cp * M_AIR / M_H2O, R_GAS = 8314.34, R_AIR = R_GAS / M_AIR, Pr = Cp / (Cp + 1.25 * R_AIR);
  var EMIS_WICK = 0.95, ALB_WICK = 0.4, D_WICK = 0.007, L_WICK = 0.0254;
  var EMIS_GLOBE = 0.95, ALB_GLOBE = 0.05, D_GLOBE = 0.0508;
  var EMIS_SFC = 0.999, ALB_SFC = 0.45;
  var CZA_MIN = 0.00873, NORMSOLAR_MAX = 0.85, REF_HEIGHT = 2.0, MIN_SPEED = 0.13;
  var CONVERGENCE = 0.02, MAX_ITER = 50;

  function esat(tk) { var y = (tk - 273.15) / (tk - 32.18); return 1.004 * 6.1121 * Math.exp(17.502 * y); }
  function dewPoint(e) { var z = Math.log(e / (6.1121 * 1.004)); return 273.15 + 240.97 * z / (17.502 - z); }
  function emisAtm(tk, rh) { return 0.575 * Math.pow(rh * esat(tk), 0.143); }
  function evap(tk) { return (313.15 - tk) / 30 * (-71100) + 2.4073e6; }
  function viscosity(tk) { var omega = (tk / 97 - 2.9) / 0.4 * (-0.034) + 1.048; return 2.6693e-6 * Math.sqrt(M_AIR * tk) / (3.617 * 3.617 * omega); }
  function thermalCond(tk) { return (Cp + 1.25 * R_AIR) * viscosity(tk); }
  function diffusivity(tk, p) {
    var Pcrit13 = Math.pow(36.4 * 218, 1 / 3), Tcrit512 = Math.pow(132 * 647.3, 5 / 12), Tcrit12 = Math.sqrt(132 * 647.3);
    var Mmix = Math.sqrt(1 / M_AIR + 1 / M_H2O);
    return 3.64e-4 * Math.pow(tk / Tcrit12, 2.334) * Pcrit13 * Tcrit512 * Mmix / (p / 1013.25) * 1e-4;
  }
  function hSphere(tk, p, v) { var rho = p * 100 / (R_AIR * tk); var Re = v * rho * D_GLOBE / viscosity(tk); var Nu = 2 + 0.6 * Math.sqrt(Re) * Math.pow(Pr, 0.3333); return Nu * thermalCond(tk) / D_GLOBE; }
  function hCylinder(tk, p, v) { var rho = p * 100 / (R_AIR * tk); var Re = v * rho * D_WICK / viscosity(tk); var Nu = 0.281 * Math.pow(Re, 0.6) * Math.pow(Pr, 0.44); return Nu * thermalCond(tk) / D_WICK; }

  /* Temperatura de globo (°C). ta en °C, rh fracción, p hPa, v m/s a 2 m */
  function tGlobe(ta, rh, p, v, solar, fdir, cza) {
    var tk = ta + 273.15, tsfc = tk, prev = tk, next, it = 0;
    do {
      it++;
      var tref = 0.5 * (prev + tk), h = hSphere(tref, p, v);
      next = Math.pow(0.5 * (emisAtm(tk, rh) * Math.pow(tk, 4) + EMIS_SFC * Math.pow(tsfc, 4))
        - h / (STEFANB * EMIS_GLOBE) * (prev - tk)
        + solar / (2 * STEFANB * EMIS_GLOBE) * (1 - ALB_GLOBE) * (fdir * (1 / (2 * cza) - 1) + 1 + ALB_SFC), 0.25);
      if (Math.abs(next - prev) < CONVERGENCE) return next - 273.15;
      prev = 0.9 * prev + 0.1 * next;
    } while (it < MAX_ITER);
    return NaN;
  }

  /* Bulbo húmedo natural (rad=1) o psicrométrico (rad=0), °C */
  function tWetBulb(ta, rh, p, v, solar, fdir, cza, rad) {
    var tk = ta + 273.15, tsfc = tk, sza = Math.acos(Math.max(-1, Math.min(1, cza)));
    var eair = rh * esat(tk), prev = dewPoint(eair), next, it = 0, heat = 0;
    do {
      it++;
      var tref = 0.5 * (prev + tk);
      if (rad) {
        var Fatm = STEFANB * EMIS_WICK * (0.5 * (emisAtm(tk, rh) * Math.pow(tk, 4) + EMIS_SFC * Math.pow(tsfc, 4)) - Math.pow(prev, 4))
          + (1 - ALB_WICK) * solar * ((1 - fdir) * (1 + 0.25 * D_WICK / L_WICK) + fdir * ((Math.tan(sza) / PI) + 0.25 * D_WICK / L_WICK) + ALB_SFC);
        heat = Fatm / hCylinder(tref, p, v);
      }
      var ewick = esat(prev), rho = p * 100 / (R_AIR * tref);
      var Sc = viscosity(tref) / (rho * diffusivity(tref, p));
      next = tk - evap(tref) / RATIO * (ewick - eair) / (p - ewick) * Math.pow(Pr / Sc, 0.56) + heat;
      if (Math.abs(next - prev) < CONVERGENCE) return next - 273.15;
      prev = 0.9 * prev + 0.1 * next;
    } while (it < MAX_ITER);
    return NaN;
  }

  /* Posición solar (algoritmo NOAA). date: objeto Date (instante UTC). Devuelve cos(zenit) y distancia Tierra-Sol (UA) */
  function solarPosition(date, lat, lon) {
    var jd = date.getTime() / 86400000 + 2440587.5, T = (jd - 2451545) / 36525;
    var L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
    var M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = Math.sin(M * DEG) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * DEG) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * DEG) * 0.000289;
    var trueLong = L0 + C, trueAnom = M + C;
    var R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(trueAnom * DEG));
    var omega = 125.04 - 1934.136 * T, lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG);
    var eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
    var eps = eps0 + 0.00256 * Math.cos(omega * DEG);
    var decl = Math.asin(Math.sin(eps * DEG) * Math.sin(lambda * DEG));
    var y = Math.pow(Math.tan(eps * DEG / 2), 2);
    var eqTime = 4 / DEG * (y * Math.sin(2 * L0 * DEG) - 2 * e * Math.sin(M * DEG) + 4 * e * y * Math.sin(M * DEG) * Math.cos(2 * L0 * DEG)
      - 0.5 * y * y * Math.sin(4 * L0 * DEG) - 1.25 * e * e * Math.sin(2 * M * DEG));
    var minutesUTC = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
    var tst = (minutesUTC + eqTime + 4 * lon) % 1440; if (tst < 0) tst += 1440;
    var ha = tst / 4 - 180;
    var cza = Math.sin(lat * DEG) * Math.sin(decl) + Math.cos(lat * DEG) * Math.cos(decl) * Math.cos(ha * DEG);
    return { cza: cza, dist: R };
  }

  /* Ajuste de radiación y fracción directa (igual que calc_solar_parameters de Liljegren) */
  function solarParams(solar, cza, dist) {
    var toa = SOLAR_CONST * Math.max(0, cza) / (dist * dist);
    if (cza < CZA_MIN) toa = 0;
    if (toa > 0) {
      var norm = Math.min(solar / toa, NORMSOLAR_MAX);
      var s = norm * toa, fdir = 0;
      if (norm > 0) { fdir = Math.exp(3 - 1.34 * norm - 1.65 / norm); fdir = Math.max(Math.min(fdir, 0.9), 0); }
      return { solar: s, fdir: fdir };
    }
    return { solar: 0, fdir: 0 };
  }

  /* Clase de estabilidad y viento a 2 m (EPA-454/5-99-005), entorno urbano */
  function windAt2m(speed, zspeed, solar, daytime, urban) {
    if (zspeed === REF_HEIGHT) return Math.max(speed, MIN_SPEED);
    var t = [[1, 1, 2, 4, 0, 5, 6, 0], [1, 2, 3, 4, 0, 5, 6, 0], [2, 2, 3, 4, 0, 4, 4, 0], [3, 3, 4, 4, 0, 0, 0, 0], [3, 4, 4, 4, 0, 0, 0, 0]];
    var i, j;
    if (daytime) {
      j = solar >= 925 ? 0 : solar >= 675 ? 1 : solar >= 175 ? 2 : 3;
      i = speed >= 6 ? 4 : speed >= 5 ? 3 : speed >= 3 ? 2 : speed >= 2 ? 1 : 0;
    } else { j = 5; i = speed >= 2.5 ? 2 : speed >= 2 ? 1 : 0; } /* noche: dT < 0 supuesto */
    var cls = t[i][j];
    var ue = [0.15, 0.15, 0.20, 0.25, 0.30, 0.30], re = [0.07, 0.07, 0.10, 0.15, 0.35, 0.55];
    var ex = (urban === false ? re : ue)[cls - 1];
    return Math.max(speed * Math.pow(REF_HEIGHT / zspeed, ex), MIN_SPEED);
  }

  function pressureFromAltitude(h) { return 1013.25 * Math.pow(1 - 2.25577e-5 * h, 5.25588); }

  /* WBGT exterior por Liljegren.
     o = {ta, rh(%), wind, windHeight(m), solar(W/m2, global horizontal), pressure(hPa) | altitude(m), lat, lon, date(Date), urban} */
  function outdoor(o) {
    var p = o.pressure || pressureFromAltitude(o.altitude || 0);
    var sp = solarPosition(o.date, o.lat, o.lon);
    var sol = solarParams(Math.max(0, o.solar || 0), sp.cza, sp.dist);
    var cza = sp.cza;
    var v = windAt2m(Math.max(0, o.wind || 0), o.windHeight || 10, sol.solar, cza > 0, o.urban !== false);
    var rh = Math.max(0.01, Math.min(1, o.rh / 100));
    var tg = tGlobe(o.ta, rh, p, v, sol.solar, sol.fdir, cza);
    var tnwb = tWetBulb(o.ta, rh, p, v, sol.solar, sol.fdir, cza, 1);
    var tpsy = tWetBulb(o.ta, rh, p, v, 0, 0, cza, 0);
    return { wbgt: 0.7 * tnwb + 0.2 * tg + 0.1 * o.ta, tg: tg, tnwb: tnwb, tpsy: tpsy, wind2m: v, solarAdj: sol.solar, fdir: sol.fdir, cza: cza, pressure: p };
  }

  /* ISO 7243 con mediciones directas */
  function measured(tnw, tg, ta, sun) { return sun ? 0.7 * tnw + 0.2 * tg + 0.1 * ta : 0.7 * tnw + 0.3 * tg; }

  /* Criterios ACGIH */
  function tlv(M) { return 56.7 - 11.5 * Math.log10(M); }
  function al(M) { return 59.9 - 14.1 * Math.log10(M); }

  function classify(wbgtEff, M, acclimatized) {
    var TLV = tlv(M), AL = al(M), limit = acclimatized ? TLV : AL;
    var level;
    if (wbgtEff < AL) level = 'ok';
    else if (wbgtEff < TLV) level = acclimatized ? 'caution' : 'exceeds';
    else level = 'exceeds';
    return { level: level, TLV: TLV, AL: AL, limit: limit, margin: wbgtEff - limit };
  }

  var api = { outdoor: outdoor, measured: measured, tGlobe: tGlobe, tWetBulb: tWetBulb, solarPosition: solarPosition,
    solarParams: solarParams, windAt2m: windAt2m, pressureFromAltitude: pressureFromAltitude, tlv: tlv, al: al, classify: classify };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WBGT = api;
})(this);
