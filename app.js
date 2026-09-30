(function () {
  'use strict';
  var C = window.CONTENIDO || { novedades: [], videos: [], documentos: [] };
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  function fecha(s) { var p = s.split('-'); return +p[2] + ' de ' + MESES[+p[1] - 1] + ' de ' + p[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* Novedades */
  $('news').innerHTML = C.novedades.map(function (n) {
    return '<li><time datetime="' + n.fecha + '">' + fecha(n.fecha) + '</time><h3>' + esc(n.titulo) + '</h3><p>' + esc(n.texto) + '</p>' +
      (n.enlace ? '<a href="' + esc(n.enlace) + '">' + esc(n.textoEnlace || 'Ver más') + '</a>' : '') + '</li>';
  }).join('');

  /* Documentos */
  $('docs').innerHTML = C.documentos.map(function (d) {
    return '<li><a href="' + esc(d.enlace) + '" target="_blank" rel="noopener"><span>' + esc(d.titulo) + '</span><span class="kind">' + esc(d.tipo) + '</span></a></li>';
  }).join('');

  /* Videos */
  if (C.videos.length) {
    $('videos').innerHTML = C.videos.map(function (v) {
      return '<article class="video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.youtube) + '" title="' + esc(v.titulo) +
        '" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe><h3>' + esc(v.titulo) + '</h3><p>' +
        (v.fecha ? fecha(v.fecha) + '. ' : '') + esc(v.descripcion || '') + '</p></article>';
    }).join('');
  } else {
    $('videos').innerHTML = '<div class="empty"><strong>Las primeras presentaciones se publicarán muy pronto.</strong> Mientras tanto, cada herramienta incluye un instructivo con un ejemplo resuelto paso a paso.</div>';
  }

  /* Panel de estrés térmico en vivo */
  var W = window.WBGT, list = $('readings');
  var CIUDADES = [
    { n: 'Barranquilla', lat: 10.9639, lon: -74.7964, alt: 18 },
    { n: 'Cúcuta', lat: 7.8939, lon: -72.5078, alt: 320 },
    { n: 'Cali', lat: 3.4516, lon: -76.5320, alt: 1000 }
  ];
  if (!W || !window.fetch) { list.innerHTML = '<li class="off">Abra la calculadora para ver el WBGT de su ciudad.</li>'; return; }
  var M = 300, TLV = W.tlv(M), AL = W.al(M);
  function pos(v) { var lo = 18, hi = 38; return Math.max(0, Math.min(100, (v - lo) / (hi - lo) * 100)); }
  Promise.all(CIUDADES.map(function (c) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon + '&elevation=' + c.alt +
      '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation,surface_pressure&wind_speed_unit=ms&timezone=GMT';
    return fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var cu = d.current, t = new Date(new Date(cu.time + 'Z').getTime() - 7.5 * 60000);
      var r = W.outdoor({ ta: cu.temperature_2m, rh: cu.relative_humidity_2m, wind: cu.wind_speed_10m, windHeight: 10,
        solar: cu.shortwave_radiation, pressure: cu.surface_pressure, lat: c.lat, lon: c.lon, date: t, urban: true });
      return { c: c, w: r.wbgt, ta: cu.temperature_2m };
    }).catch(function () { return { c: c, err: true }; });
  })).then(function (rows) {
    var ok = rows.filter(function (r) { return !r.err && isFinite(r.w); });
    if (!ok.length) { list.innerHTML = '<li class="off">No fue posible consultar los datos en este momento. Abra la calculadora para intentarlo de nuevo.</li>'; return; }
    var pa = pos(AL), pt = pos(TLV);
    var grad = 'linear-gradient(90deg,#2F7D4A 0 ' + pa + '%,#B7791F ' + pa + '% ' + pt + '%,#B42318 ' + pt + '% 100%)';
    list.innerHTML = ok.map(function (r) {
      var s = r.w >= TLV ? 'Supera el TLV' : (r.w >= AL ? 'Entre el Límite de Acción y el TLV' : 'Por debajo del Límite de Acción');
      return '<li><span class="city">' + r.c.n + ' · ' + r.ta.toFixed(0) + ' °C en el aire</span>' +
        '<span class="val">' + r.w.toFixed(1).replace('.', ',') + '<small>°C</small></span>' +
        '<span class="scale" aria-hidden="true" style="background:' + grad + '"><span class="needle" style="left:' + pos(r.w) + '%"></span></span>' +
        '<span class="state">' + s + '</span></li>';
    }).join('');
  });
})();
