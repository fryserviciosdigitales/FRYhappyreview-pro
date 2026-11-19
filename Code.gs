/**
 * HAPPYREVIEW PRO - Code.gs (Definitivo y Blindado contra errores de QR)
 */

function escapeHtml(texto) {
  return String(texto === undefined || texto === null ? '' : texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || '';

  // 1. PETICIONES DE API (JSON) para votaciones y gestiones
  var accionesValidas = [
    'getEmpresa',
    'votar',
    'login',
    'getEmpresas',
    'crearEmpresa',
    'toggleActivo',
    'getMetricasEmpresa',
    'getMetricasAdmin',
    'getUsuarios',
    'getCuponesEmpresa'
  ];

  if (accionesValidas.indexOf(action) !== -1) {
    var output = { success: false, message: "Acción no válida" };
    try {
      if (action === 'getEmpresa') {
        var empApi = obtenerEmpresaPorId(params.id);
        output = empApi ? { success: true, empresa: empApi } : { success: false, message: "No encontrada" };
      } 
      else if (action === 'votar') {
        output = guardarValoracion(params.id, parseInt(params.estrellas, 10) || 0, params.comentario || '', params.email || '');
      }
      else if (action === 'login') {
        output = validarLogin(params.email, params.password);
      }
      else if (action === 'getEmpresas') {
        output = { success: true, empresas: listarEmpresas() };
      }
      else if (action === 'crearEmpresa') {
        output = crearEmpresa(params.nombre, params.email, params.telefono, params.googleUrl, params.plan, params.recompensa);
      }
      else if (action === 'toggleActivo') {
        output = toggleActivoEmpresa(params.id);
      }
      else if (action === 'getMetricasEmpresa') {
        output = {
          success: true,
          data: obtenerMetricasEmpresa(params.id)
        };
      }
      else if (action === 'getMetricasAdmin') {
        output = {
          success: true,
          data: obtenerMetricasAdmin()
        };
      }
      else if (action === 'getUsuarios') {
        output = {
          success: true,
          usuarios: obtenerUsuarios()
        };
      }
      else if (action === 'getCuponesEmpresa') {
        output = {
          success: true,
          cupones: obtenerCuponesEmpresa(params.id)
        };
      }
    } catch (err) {
      output = { success: false, error: err.toString() };
    }
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 2. CLIENTE ESCANEANDO QR (?id=...) -> Renderiza la valoración directamente de forma segura
  if (params.id) {
    var idLimpio = String(params.id).trim();
    var emp = obtenerEmpresaPorId(idLimpio);
    if (!emp || !emp.activo) {
      return HtmlService.createHtmlOutput('<html><body style="font-family:system-ui;text-align:center;padding:50px;"><h2 style="color:#ef4444;">Establecimiento no disponible</h2><p style="color:#64748b;">El enlace QR no es válido o el establecimiento no está activo.</p></body></html>')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }

    var nombreRaw = String(emp.nombre || 'Establecimiento');
    var nombreSeguro = escapeHtml(nombreRaw);
    var googleUrlRaw = String(emp.googleUrl || '');
    var googleUrlSegura = escapeHtml(googleUrlRaw);
    var gasServiceUrl = ScriptApp.getService().getUrl();

    var htmlValoracion = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${nombreSeguro} - Valoración</title>
  <style>
    :root { --primary: #4f46e5; --success: #22c55e; --danger: #ef4444; --text: #0f172a; --text-muted: #64748b; --border: #e2e8f0; --bg: #f8fafc; --radius: 12px; --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 1rem; }
    .card { background: #fff; width: 100%; max-width: 440px; padding: 2rem; border-radius: var(--radius); box-shadow: var(--shadow); text-align: center; }
    .hidden { display: none !important; }
    .btn { display: inline-block; width: 100%; padding: 0.85rem; border-radius: 8px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; text-decoration: none; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-success { background: var(--success); color: #fff; }
    .form-group { margin-bottom: 1rem; text-align: left; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text); }
    .form-group textarea, .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 0.95rem; }
    .star { font-size: 2.8rem; color: #cbd5e1; cursor: pointer; transition: color 0.15s; display: inline-block; padding: 0 4px; }
  </style>
</head>
<body>
  <div class="card" id="app-container">
    <div id="rating-view">
      <h1 style="color: var(--primary); font-size: 1.6rem; margin-bottom: 0.5rem;">${nombreSeguro}</h1>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem;">¿Cómo calificarías tu experiencia hoy con nosotros?</p>
      <div id="stars-container" style="margin-bottom: 2rem;">
        <span class="star" onclick="votarEstrellas(1)">★</span>
        <span class="star" onclick="votarEstrellas(2)">★</span>
        <span class="star" onclick="votarEstrellas(3)">★</span>
        <span class="star" onclick="votarEstrellas(4)">★</span>
        <span class="star" onclick="votarEstrellas(5)">★</span>
      </div>
      <div id="feedback-form" class="hidden" style="border-top: 1px solid var(--border); padding-top: 1.5rem; margin-top: 1.5rem;">
        <div class="form-group">
          <label style="color: var(--danger);">¿Qué podríamos haber hecho mejor?</label>
          <textarea id="comentario-input" rows="3" placeholder="Cuéntanos tu experiencia de forma privada..."></textarea>
        </div>
        <div class="form-group">
          <label>Tu email (opcional):</label>
          <input type="email" id="email-input" placeholder="tu@email.com">
        </div>
        <button id="btn-enviar-privado" class="btn btn-primary" onclick="enviarComentarioPrivado()">Enviar Opinión</button>
      </div>
    </div>
    <div id="success-view" class="hidden">
      <h2 style="color: var(--success); font-size: 1.6rem; margin-bottom: 0.5rem;">¡Muchas gracias! 🎉</h2>
      <p id="success-msg" style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;"></p>
      <div id="coupon-box" class="hidden" style="background: #f0fdf4; border: 2px dashed var(--success); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <p style="font-size: 0.75rem; color: #166534; font-weight: bold; margin-bottom: 4px;">CUPÓN DE REGALO EXCLUSIVO:</p>
        <h3 id="coupon-code" style="font-family: monospace; font-size: 1.5rem; color: var(--success); margin: 0;"></h3>
        <p id="coupon-desc" style="font-size: 0.85rem; color: #166534; font-weight: 600; margin-top: 4px;"></p>
        <p id="coupon-expiry" style="font-size: 0.8rem; color: #15803d; margin-top: 6px; font-weight: 500;"></p>
      </div>
      <a id="google-btn" href="${googleUrlSegura || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-success hidden" style="margin-bottom: 1rem; text-align: center; line-height: normal;">🌟 Dejar reseña en Google Maps</a>
    </div>
  </div>
  <script>
    var empresaId = ${JSON.stringify(idLimpio)};
    var googleUrl = ${JSON.stringify(googleUrlRaw)};
    var gasUrl = ${JSON.stringify(gasServiceUrl)};
    var estrellasGlobal = 0;
    var enviandoVoto = false;

    function votarEstrellas(n) {
      if (enviandoVoto) return;
      estrellasGlobal = n;
      document.querySelectorAll('.star').forEach(function(s, idx) {
        s.style.color = idx < n ? '#eab308' : '#cbd5e1';
      });
      if (n >= 4) {
        document.getElementById('feedback-form').classList.add('hidden');
        enviarVotoBackend(n, '', '');
      } else {
        document.getElementById('feedback-form').classList.remove('hidden');
      }
    }

    function enviarComentarioPrivado() {
      if (enviandoVoto) return;
      enviarVotoBackend(
        estrellasGlobal,
        document.getElementById('comentario-input').value,
        document.getElementById('email-input').value
      );
    }

    function enviarVotoBackend(estrellas, comentario, email) {
      enviandoVoto = true;
      var btnPriv = document.getElementById('btn-enviar-privado');
      if (btnPriv) btnPriv.disabled = true;

      var url = gasUrl + '?action=votar&id=' + encodeURIComponent(empresaId) +
        '&estrellas=' + encodeURIComponent(estrellas) +
        '&comentario=' + encodeURIComponent(comentario || '') +
        '&email=' + encodeURIComponent(email || '');

      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          enviandoVoto = false;
          document.getElementById('rating-view').classList.add('hidden');
          document.getElementById('success-view').classList.remove('hidden');
          if (estrellas >= 4) {
            var textoCaducidad = (data && data.cupon && data.cupon.caducidad)
              ? (' Válido hasta el ' + data.cupon.caducidad + '.')
              : '';
            document.getElementById('success-msg').innerText = '¡Muchas gracias por tu valoración de ' + estrellas + ' estrellas! Canjea tu regalo en el local.' + textoCaducidad;
            if (data && data.cupon) {
              document.getElementById('coupon-code').innerText = data.cupon.codigo;
              document.getElementById('coupon-desc').innerText = data.cupon.descuento;
              document.getElementById('coupon-expiry').innerText = data.cupon.caducidad ? ('📅 Válido hasta: ' + data.cupon.caducidad) : '';
              document.getElementById('coupon-box').classList.remove('hidden');
            }
            if (googleUrl) {
              document.getElementById('google-btn').classList.remove('hidden');
            }
          } else {
            document.getElementById('success-msg').innerText = 'Hemos recibido tus comentarios de forma privada. Muchas gracias por ayudarnos a mejorar.';
          }
        })
        .catch(function() {
          enviandoVoto = false;
          if (btnPriv) btnPriv.disabled = false;
          alert('Error al registrar la valoración.');
        });
    }
  <\/script>
</body>
</html>`;
    return HtmlService.createHtmlOutput(htmlValoracion)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  // 3. PANEL DE ADMINISTRACIÓN (Sin parámetros id) -> Carga tu plantilla 'Login.html'
  var template = HtmlService.createTemplateFromFile('Login');
  template.directEmpresaId = params.panel ? String(params.panel).trim() : '';
  
  return template.evaluate()
    .setTitle('HAPPYREVIEW PRO - SaaS de Reputación')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function obtenerUrlWebApp() {
  return ScriptApp.getService().getUrl();
}

function getDB() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SS_ID');
  var ss;
  if (!ssId) {
    ss = SpreadsheetApp.create('HAPPYREVIEW_PRO_DATABASE');
    PropertiesService.getScriptProperties().setProperty('SS_ID', ss.getId());
    inicializarHojasDB(ss);
  } else {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch(err) {
      ss = SpreadsheetApp.create('HAPPYREVIEW_PRO_DATABASE');
      PropertiesService.getScriptProperties().setProperty('SS_ID', ss.getId());
      inicializarHojasDB(ss);
    }
  }
  return ss;
}

function inicializarHojasDB(ss) {
  var hojas = ['EMPRESAS', 'USUARIOS', 'VALORACIONES', 'GOOGLE', 'CUPONES'];
  for (var i = 0; i < hojas.length; i++) {
    var sh = ss.getSheetByName(hojas[i]);
    if (!sh) {
      sh = ss.insertSheet(hojas[i]);
      if (hojas[i] === 'EMPRESAS') sh.appendRow(['ID', 'Nombre', 'Email', 'Teléfono', 'GoogleURL', 'Plan', 'Activo', 'FechaAlta', 'Recompensa']);
      if (hojas[i] === 'USUARIOS') sh.appendRow(['Email', 'PasswordHash', 'Nombre', 'Rol', 'EmpresaID']);
      if (hojas[i] === 'VALORACIONES') sh.appendRow(['ID', 'EmpresaID', 'Estrellas', 'Comentario', 'EmailCliente', 'Fecha']);
      if (hojas[i] === 'GOOGLE') sh.appendRow(['ID', 'EmpresaID', 'Estrellas', 'Fecha']);
      if (hojas[i] === 'CUPONES') sh.appendRow(['ID', 'EmpresaID', 'Codigo', 'Descuento', 'Caducidad', 'Usado']);
    }
  }
  var shUsr = ss.getSheetByName('USUARIOS');
  if (shUsr.getDataRange().getLastRow() <= 1) {
    var passHash = hashSHA256('123456');
    shUsr.appendRow(['fryserviciosdigitales@gmail.com', passHash, 'Administrador Master', 'ADMIN', '']);
  }
}

function hashSHA256(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteValue = rawHash[i];
    if (byteValue < 0) byteValue += 256;
    var byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = '0' + byteString;
    txtHash += byteString;
  }
  return txtHash;
}

function listarEmpresas() {
  var ss = getDB();
  var sh = ss.getSheetByName('EMPRESAS');
  var data = sh.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      var valActivo = data[i][6];
      var esActivo = (valActivo === true || String(valActivo).toLowerCase() === 'true' || String(valActivo).toLowerCase() === 'activa' || valActivo === 1);
      lista.push({
        id: String(data[i][0]).trim(),
        nombre: String(data[i][1] || ''),
        email: String(data[i][2] || ''),
        telefono: String(data[i][3] || ''),
        googleUrl: String(data[i][4] || ''),
        plan: String(data[i][5] || ''),
        activo: esActivo,
        fechaAlta: String(data[i][7] || ''),
        recompensa: String(data[i][8] || '')
      });
    }
  }

  return lista;
}

function toggleActivoEmpresa(id) {
  var ss = getDB();
  var sh = ss.getSheetByName('EMPRESAS');
  var data = sh.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id).trim()) {
      var estadoActual = data[i][6];
      var nuevoEstado = !(estadoActual === true || String(estadoActual).toLowerCase() === 'true' || estadoActual === 1);
      sh.getRange(i + 1, 7).setValue(nuevoEstado);
      return { success: true, activo: nuevoEstado };
    }
  }
  return { success: false, message: "Empresa no encontrada" };
}

function getEmpresa(id) {
  return obtenerEmpresaPorId(id);
}
