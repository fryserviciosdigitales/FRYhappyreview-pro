/**
 * HAPPYREVIEW PRO - Data.gs
 * Operaciones CRUD optimizadas con escritura asegurada
 */

function esValorActivo(valor) {
  if (valor === true || valor === 1) return true;
  var txt = String(valor === undefined || valor === null ? '' : valor).trim().toLowerCase();
  return txt === 'true' || txt === 'activa' || txt === 'activo' || txt === 'sí' || txt === 'si' || txt === '1';
}

function esValorBooleanoTrue(valor) {
  return valor === true || valor === 1 || String(valor === undefined || valor === null ? '' : valor).trim().toLowerCase() === 'true';
}

function parsearFechaLocal(valorFecha) {
  if (!valorFecha) return null;
  if (Object.prototype.toString.call(valorFecha) === '[object Date]') {
    if (isNaN(valorFecha.getTime())) return null;
    return new Date(valorFecha.getFullYear(), valorFecha.getMonth(), valorFecha.getDate());
  }
  var str = String(valorFecha).trim();
  var matchIso = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (matchIso) {
    return new Date(Number(matchIso[1]), Number(matchIso[2]) - 1, Number(matchIso[3]));
  }
  var matchEs = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(str);
  if (matchEs) {
    return new Date(Number(matchEs[3]), Number(matchEs[2]) - 1, Number(matchEs[1]));
  }
  var d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function crearEmpresa(nombre, email, telefono, googleUrl, plan, recompensa) {
  var ss = getDB();
  var sh = ss.getSheetByName('EMPRESAS');
  var id = 'EMP_' + new Date().getTime();
  var fecha = new Date().toISOString().split('T')[0];
  
  sh.appendRow([
    id, 
    String(nombre || '').trim(), 
    String(email || '').trim(), 
    String(telefono || '').trim(), 
    String(googleUrl || '').trim(), 
    String(plan || 'Standard'), 
    true, 
    fecha, 
    String(recompensa || '10% de descuento')
  ]);
  
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

function obtenerEmpresas() {
  var ss = getDB();
  var sh = ss.getSheetByName('EMPRESAS');
  var rows = sh.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < rows.length; i++) {
    var idEmpresa = String(rows[i][0] || '').trim();
    if (idEmpresa !== '') {
      lista.push({
        id: idEmpresa,
        nombre: String(rows[i][1] || ''),
        email: String(rows[i][2] || ''),
        telefono: String(rows[i][3] || ''),
        googleUrl: String(rows[i][4] || ''),
        plan: String(rows[i][5] || ''),
        activo: esValorActivo(rows[i][6]),
        fechaAlta: String(rows[i][7] || ''),
        recompensa: String(rows[i][8] || '10% de descuento')
      });
    }
  }
  return lista;
}

function obtenerEmpresaPorId(id) {
  if (!id) return null;
  var idBuscado = String(id).trim();
  var empresas = obtenerEmpresas();
  for (var i = 0; i < empresas.length; i++) {
    if (String(empresas[i].id).trim() === idBuscado) {
      return empresas[i];
    }
  }
  return null;
}

function editarEmpresa(id, nombre, email, telefono, googleUrl, plan, activo, recompensa) {
  var ss = getDB();
  var sh = ss.getSheetByName('EMPRESAS');
  var rows = sh.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(id).trim()) {
      sh.getRange(i+1, 2).setValue(String(nombre).trim());
      sh.getRange(i+1, 3).setValue(String(email).trim());
      sh.getRange(i+1, 4).setValue(String(telefono).trim());
      sh.getRange(i+1, 5).setValue(String(googleUrl).trim());
      sh.getRange(i+1, 6).setValue(String(plan).trim());
      sh.getRange(i+1, 7).setValue(Boolean(activo));
      sh.getRange(i+1, 9).setValue(String(recompensa).trim());
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, error: 'Empresa no encontrada' };
}

function eliminarEmpresa(id) {
  var ss = getDB();
  var sh = ss.getSheetByName('EMPRESAS');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(id).trim()) {
      sh.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false };
}

function crearUsuario(email, password, nombre, rol, empresaId) {
  var ss = getDB();
  var sh = ss.getSheetByName('USUARIOS');
  var rows = sh.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase().trim() === String(email).toLowerCase().trim()) {
      return { success: false, error: 'El usuario ya existe' };
    }
  }
  
  var passHash = hashSHA256(password);
  sh.appendRow([String(email).trim(), passHash, String(nombre).trim(), String(rol).trim(), String(empresaId || '').trim()]);
  SpreadsheetApp.flush();
  return { success: true };
}

function editarUsuario(emailOriginal, nuevoNombre, nuevoEmail, nuevoRol, nuevaEmpresaId, nuevaPassword) {
  var ss = getDB();
  var sh = ss.getSheetByName('USUARIOS');
  var rows = sh.getDataRange().getValues();
  
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase().trim() === String(emailOriginal).toLowerCase().trim()) {
      sh.getRange(i + 1, 1).setValue(String(nuevoEmail).trim());
      sh.getRange(i + 1, 3).setValue(String(nuevoNombre).trim());
      sh.getRange(i + 1, 4).setValue(String(nuevoRol).trim());
      sh.getRange(i + 1, 5).setValue(nuevoRol === 'ADMIN' ? '' : String(nuevaEmpresaId).trim());
      
      if (nuevaPassword && String(nuevaPassword).trim() !== '') {
        var passHash = hashSHA256(nuevaPassword);
        sh.getRange(i + 1, 2).setValue(passHash);
      }
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, error: 'Usuario no encontrado' };
}

function obtenerUsuarios() {
  var ss = getDB();
  var sh = ss.getSheetByName('USUARIOS');
  var rows = sh.getDataRange().getValues();
  var lista = [];
  
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== '') {
      lista.push({
        email: String(rows[i][0]),
        nombre: String(rows[i][2]),
        rol: String(rows[i][3]),
        empresaId: String(rows[i][4])
      });
    }
  }
  return lista;
}

function eliminarUsuario(email) {
  var ss = getDB();
  var sh = ss.getSheetByName('USUARIOS');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase().trim() === String(email).toLowerCase().trim()) {
      sh.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false };
}

function guardarValoracion(empresaId, estrellas, comentario, emailCliente) {
  var empresa = obtenerEmpresaPorId(empresaId);
  if (!empresa || !empresa.activo) {
    return { success: false, error: 'Establecimiento no disponible' };
  }

  var numEstrellas = Number(estrellas);
  if (!numEstrellas || numEstrellas < 1 || numEstrellas > 5) {
    return { success: false, error: 'Valoración no válida' };
  }

  var ss = getDB();
  var shVal = ss.getSheetByName('VALORACIONES');
  var valId = 'VAL_' + new Date().getTime();
  var fecha = new Date().toISOString();
  shVal.appendRow([valId, empresa.id, numEstrellas, String(comentario || '').trim(), String(emailCliente || '').trim(), fecha]);
  SpreadsheetApp.flush();
  
  if (numEstrellas >= 4) {
    var cuponRes = generarCuponPersonalizadoConDias(empresa.id, empresa.recompensa || '10% de descuento', 5);
    if (emailCliente && String(emailCliente).includes('@')) {
      enviarEmailCupon(emailCliente, empresa.nombre, cuponRes.codigo, cuponRes.descuento, cuponRes.caducidad);
    }
    return { success: true, cupon: cuponRes };
  } else {
    if (empresa.email) {
      enviarEmailIncidencia(empresa.email, empresa.nombre, numEstrellas, comentario, emailCliente);
    }
    return { success: true };
  }
}

function registrarClickGoogle(empresaId, estrellas) {
  var empresa = obtenerEmpresaPorId(empresaId);
  if (!empresa) return { success: false };
  var ss = getDB();
  var shG = ss.getSheetByName('GOOGLE');
  var id = 'G_' + new Date().getTime();
  var fecha = new Date().toISOString();
  shG.appendRow([id, empresa.id, Number(estrellas || 5), fecha]);
  SpreadsheetApp.flush();
  return { success: true };
}

function generarCuponPersonalizadoConDias(empresaId, recompensaTexto, diasValidez) {
  var empresa = obtenerEmpresaPorId(empresaId);
  if (!empresa) {
    return { success: false, error: 'Empresa no encontrada' };
  }

  var ss = getDB();
  var shC = ss.getSheetByName('CUPONES');
  var ahoraMs = new Date().getTime();
  var sufijo = String(ahoraMs).slice(-3) + Math.floor(Math.random() * 10);
  var codigo = 'HAPPY-' + Math.floor(1000 + Math.random() * 9000) + sufijo;
  var id = 'CUP_' + ahoraMs;
  var dias = Number(diasValidez) || 5;
  var fechaCad = new Date();
  fechaCad.setDate(fechaCad.getDate() + dias);

  var caducidad = Utilities.formatDate(fechaCad, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  shC.appendRow([id, empresa.id, codigo, String(recompensaTexto), caducidad, false]);
  SpreadsheetApp.flush();

  return {
    success: true,
    codigo: codigo,
    descuento: recompensaTexto,
    caducidad: Utilities.formatDate(fechaCad, Session.getScriptTimeZone(), 'dd/MM/yyyy')
  };
}

function obtenerCuponesEmpresa(empresaId) {
  if (!empresaId) return [];
  var ss = getDB();
  var sh = ss.getSheetByName('CUPONES');
  var rows = sh.getDataRange().getValues();
  var lista = [];
  var ahora = new Date();
  var hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1] || '').trim() === String(empresaId).trim()) {
      var fechaCad = parsearFechaLocal(rows[i][4]);
      var caducado = fechaCad ? (fechaCad < hoy) : false;
      var fechaFormateada = fechaCad
        ? Utilities.formatDate(fechaCad, Session.getScriptTimeZone(), 'dd/MM/yyyy')
        : String(rows[i][4] || '');

      lista.push({
        id: String(rows[i][0]),
        empresaId: String(rows[i][1]),
        codigo: String(rows[i][2]),
        descuento: String(rows[i][3]),
        caducidad: fechaFormateada,
        usado: esValorBooleanoTrue(rows[i][5]),
        caducado: caducado
      });
    }
  }
  return lista.reverse();
}

function obtenerTodosLosCuponesAdmin() {
  var ss = getDB();
  var shC = ss.getSheetByName('CUPONES');
  var rowsC = shC.getDataRange().getValues();
  var empresas = obtenerEmpresas();
  var mapaEmpresas = {};

  for (var e = 0; e < empresas.length; e++) {
    mapaEmpresas[empresas[e].id] = empresas[e].nombre;
  }

  var lista = [];
  var ahora = new Date();
  var hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  for (var i = 1; i < rowsC.length; i++) {
    if (String(rowsC[i][0] || '').trim() !== '') {
      var fechaCad = parsearFechaLocal(rowsC[i][4]);
      var caducado = fechaCad ? (fechaCad < hoy) : false;
      var fechaFormateada = fechaCad
        ? Utilities.formatDate(fechaCad, Session.getScriptTimeZone(), 'dd/MM/yyyy')
        : String(rowsC[i][4] || '');
      var eId = String(rowsC[i][1] || '').trim();

      lista.push({
        id: String(rowsC[i][0]),
        empresaId: eId,
        nombreEmpresa: mapaEmpresas[eId] || 'Empresa',
        codigo: String(rowsC[i][2]),
        descuento: String(rowsC[i][3]),
        caducidad: fechaFormateada,
        usado: esValorBooleanoTrue(rowsC[i][5]),
        caducado: caducado
      });
    }
  }
  return lista.reverse();
}

function marcarCuponUsado(codigo, empresaIdSolicitante) {
  var ss = getDB();
  var sh = ss.getSheetByName('CUPONES');
  var rows = sh.getDataRange().getValues();
  var ahora = new Date();
  var hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][2] || '').trim() === String(codigo).trim()) {
      if (empresaIdSolicitante && String(rows[i][1] || '').trim() !== String(empresaIdSolicitante).trim()) {
        return { success: false, error: 'No autorizado para este cupón' };
      }
      if (esValorBooleanoTrue(rows[i][5])) {
        return { success: false, error: 'El cupón ya fue canjeado' };
      }
      var fechaCad = parsearFechaLocal(rows[i][4]);
      if (fechaCad && fechaCad < hoy) {
        return { success: false, error: 'Cupón caducado' };
      }
      sh.getRange(i + 1, 6).setValue(true);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, error: 'Cupón no encontrado' };
}

function eliminarCupon(cuponId) {
  var ss = getDB();
  var sh = ss.getSheetByName('CUPONES');
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(cuponId).trim()) {
      sh.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { success: true };
    }
  }
  return { success: false, error: 'Cupón no encontrado' };
}

function exportarValoracionesCSV(empresaId) {
  if (!empresaId) return '';
  var ss = getDB();
  var vals = ss.getSheetByName('VALORACIONES').getDataRange().getValues();
  var csv = 'ID,EmpresaID,Estrellas,Comentario,Email,Fecha\n';
  
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][1] || '').trim() === String(empresaId).trim()) {
      csv += '"' + vals[i][0] + '","' + vals[i][1] + '","' + vals[i][2] + '","' + String(vals[i][3]).replace(/"/g, '""') + '","' + vals[i][4] + '","' + vals[i][5] + '"\n';
    }
  }
  return csv;
}

function obtenerMetricasAdmin() {
  var empresas = obtenerEmpresas();
  var ss = getDB();
  var vals = ss.getSheetByName('VALORACIONES').getDataRange().getValues();
  var ggls = ss.getSheetByName('GOOGLE').getDataRange().getValues();
  var cups = ss.getSheetByName('CUPONES').getDataRange().getValues();

  var activas = 0;
  var premium = 0;

  for (var i = 0; i < empresas.length; i++) {
    if (empresas[i].activo) activas++;
    if (String(empresas[i].plan).toUpperCase() === 'PREMIUM') premium++;
  }

  var totalVal = vals.length > 1 ? vals.length - 1 : 0;
  var sumaEstrellas = 0;
  var incidencias = 0;
  var valoracionesMes = 0;
  var hoy = new Date();
  var mesActual = hoy.getMonth();
  var anioActual = hoy.getFullYear();

  for (var i = 1; i < vals.length; i++) {
    var est = Number(vals[i][2]);
    sumaEstrellas += est;
    if (est < 4) incidencias++;

    try {
      var fechaVal = new Date(vals[i][5]);
      if (!isNaN(fechaVal.getTime()) && fechaVal.getMonth() === mesActual && fechaVal.getFullYear() === anioActual) {
        valoracionesMes++;
      }
    } catch(err){}
  }

  var mediaGlobal = totalVal > 0 ? (sumaEstrellas / totalVal).toFixed(1) : 0;
  var totalGoogle = ggls.length > 1 ? ggls.length - 1 : 0;
  var totalCupones = cups.length > 1 ? cups.length - 1 : 0;
  var cuponesUsados = 0;
  var recompensas = {};

  for (var i = 1; i < cups.length; i++) {
    var usado = esValorBooleanoTrue(cups[i][5]);
    var recompensa = String(cups[i][3]);
    if (usado) {
      cuponesUsados++;
      recompensas[recompensa] = (recompensas[recompensa] || 0) + 1;
    }
  }

  var tasaCanje = totalCupones > 0 ? Math.round((cuponesUsados / totalCupones) * 100) : 0;
  var topRecompensa = 'Sin datos';
  var maxUso = 0;

  for (var key in recompensas) {
    if (recompensas[key] > maxUso) {
      maxUso = recompensas[key];
      topRecompensa = key;
    }
  }

  var ranking = {};
  for (var i = 0; i < empresas.length; i++) {
    ranking[empresas[i].id] = {
      nombre: empresas[i].nombre,
      total: 0,
      suma: 0,
      google: 0
    };
  }

  for (var i = 1; i < vals.length; i++) {
    var eId = String(vals[i][1] || '').trim();
    if (ranking[eId]) {
      ranking[eId].total++;
      ranking[eId].suma += Number(vals[i][2]);
    }
  }

  for (var i = 1; i < ggls.length; i++) {
    var eId = String(ggls[i][1] || '').trim();
    if (ranking[eId]) {
      ranking[eId].google++;
    }
  }

  var arrRanking = [];
  for (var id in ranking) {
    var item = ranking[id];
    var avg = item.total > 0 ? (item.suma / item.total).toFixed(1) : 0;
    arrRanking.push({
      nombre: item.nombre,
      totalVal: item.total,
      media: avg,
      googleClicks: item.google
    });
  }

  arrRanking.sort(function(a, b) {
    return Number(b.media) - Number(a.media);
  });

  return {
    empresasActivas: activas,
    empresasPremium: premium,
    totalValoraciones: totalVal,
    mediaGlobal: mediaGlobal,
    totalGoogleReseñas: totalGoogle,
    totalCuponesEmitidos: totalCupones,
    cuponesUsados: cuponesUsados,
    tasaCanje: tasaCanje,
    incidencias: incidencias,
    valoracionesMes: valoracionesMes,
    topRecompensa: topRecompensa,
    ranking: arrRanking
  };
}

function obtenerMetricasEmpresa(empresaId) {
  if (!empresaId) {
    return {
      nombreEmpresa: 'Empresa no encontrada',
      totalValoraciones: 0,
      media: 0,
      positivas: 0,
      negativas: 0,
      satisfaccion: 0,
      c5: 0, c4: 0, c3: 0, c2: 0, c1: 0,
      cuponesEmitidos: 0,
      cuponesUsados: 0,
      incidencias: [],
      comentarios: [],
      cuponesLista: []
    };
  }

  var ss = getDB();
  var empresa = obtenerEmpresaPorId(empresaId);

  if (!empresa) {
    return {
      nombreEmpresa: 'Empresa no encontrada',
      totalValoraciones: 0,
      media: 0,
      positivas: 0,
      negativas: 0,
      satisfaccion: 0,
      c5: 0, c4: 0, c3: 0, c2: 0, c1: 0,
      cuponesEmitidos: 0,
      cuponesUsados: 0,
      incidencias: [],
      comentarios: [],
      cuponesLista: []
    };
  }

  var vals = ss.getSheetByName('VALORACIONES').getDataRange().getValues();
  var cups = obtenerCuponesEmpresa(empresa.id);

  var totalVal = 0;
  var suma = 0;
  var positivas = 0;
  var negativas = 0;
  var c5 = 0, c4 = 0, c3 = 0, c2 = 0, c1 = 0;
  var incidencias = [];
  var comentarios = [];

  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][1] || '').trim() === String(empresa.id || '').trim()) {
      totalVal++;
      var est = Number(vals[i][2] || 0);
      suma += est;

      if (est === 5) c5++;
      else if (est === 4) c4++;
      else if (est === 3) c3++;
      else if (est === 2) c2++;
      else if (est === 1) c1++;

      if (est >= 4) {
        positivas++;
      } else {
        negativas++;
        incidencias.push({
          estrellas: est,
          comentario: String(vals[i][3] || ''),
          email: String(vals[i][4] || ''),
          fecha: String(vals[i][5] || '')
        });
      }

      comentarios.push({
        estrellas: est,
        comentario: String(vals[i][3] || ''),
        email: String(vals[i][4] || ''),
        fecha: String(vals[i][5] || '')
      });
    }
  }

  var media = totalVal > 0 ? (suma / totalVal).toFixed(1) : 0;
  var satisfaccion = totalVal > 0 ? Math.round((positivas / totalVal) * 100) : 0;
  var cuponesEmitidos = cups.length;
  var cuponesUsados = 0;

  for (var j = 0; j < cups.length; j++) {
    if (cups[j].usado) {
      cuponesUsados++;
    }
  }

  return {
    nombreEmpresa: empresa.nombre,
    totalValoraciones: totalVal,
    media: media,
    positivas: positivas,
    negativas: negativas,
    satisfaccion: satisfaccion,
    c5: c5, c4: c4, c3: c3, c2: c2, c1: c1,
    cuponesEmitidos: cuponesEmitidos,
    cuponesUsados: cuponesUsados,
    incidencias: incidencias.reverse().slice(0, 10),
    comentarios: comentarios.reverse().slice(0, 20),
    cuponesLista: cups
  };
}

function obtenerRespuestaSugerida(estrellas, comentario) {
  if (Number(estrellas) >= 4) {
    return "¡Muchas gracias por tu excelente valoración! Nos alegra enorme saber que tuviste una gran experiencia con nosotros. ¡Esperamos verte muy pronto de nuevo!";
  } else {
    return "Lamentamos profundamente que tu experiencia no haya sido la ideal. Nos tomamos muy en serio tus comentarios (" + (comentario ? comentario.substring(0, 30) + "..." : "comentario privado") + "). Por favor, escríbenos directamente a nuestro email de contacto para solucionar tu caso de inmediato.";
  }
}

function obtenerEvolucionEmpresa(empresaId) {
  if (!empresaId) return { labels: [], values: [] };
  var ss = getDB();
  var vals = ss.getSheetByName('VALORACIONES').getDataRange().getValues();
  var meses = {};

  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][1] || '').trim() === String(empresaId).trim()) {
      var fecha = new Date(vals[i][5]);
      if (!isNaN(fecha.getTime())) {
        var clave = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'MM/yyyy');
        meses[clave] = (meses[clave] || 0) + 1;
      }
    }
  }

  var etiquetas = [];
  var valores = [];

  for (var key in meses) {
    etiquetas.push(key);
    valores.push(meses[key]);
  }

  return {
    labels: etiquetas,
    values: valores
  };
}
