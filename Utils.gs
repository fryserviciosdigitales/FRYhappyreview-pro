/**
 * HAPPYREVIEW PRO - Utils.gs
 * Seguridad, Email, Hash y Autenticación
 */

function hashSHA256(texto) {
  texto = String(texto === undefined || texto === null ? '' : texto);
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    texto,
    Utilities.Charset.UTF_8
  );

  var hash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var valor = rawHash[i];
    if (valor < 0) valor += 256;
    var hex = valor.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hash += hex;
  }
  return hash;
}

/**
 * Login completo
 */
function autenticarUsuario(email, password) {
  var ss = getDB();
  var sh = ss.getSheetByName('USUARIOS');
  if (!sh) {
    return {
      success: false,
      error: 'No se encontró la hoja de usuarios'
    };
  }

  var rows = sh.getDataRange().getValues();
  var passHash = hashSHA256(password);
  var emailBuscado = String(email || '').trim().toLowerCase();

  for (var i = 1; i < rows.length; i++) {
    var dbEmail = String(rows[i][0] || '').trim().toLowerCase();
    var dbPass = String(rows[i][1] || '');

    if (dbEmail && dbEmail === emailBuscado && dbPass === passHash) {
      return {
        success: true,
        usuario: {
          email: dbEmail,
          nombre: String(rows[i][2] || ''),
          rol: String(rows[i][3] || ''),
          empresaId: String(rows[i][4] || '')
        }
      };
    }
  }

  return {
    success: false,
    error: 'Credenciales incorrectas'
  };
}

/**
 * Compatibilidad con Login.html
 */
function validarLogin(email, password) {
  return autenticarUsuario(email, password);
}

/**
 * Email cupón recompensa
 */
function enviarEmailCupon(emailCliente, nombreEmpresa, codigo, descuento, caducidad) {
  var destino = String(emailCliente || '').trim();
  if (!destino || destino.indexOf('@') === -1) return;

  var asunto = '🎁 Tu regalo de ' + String(nombreEmpresa || '');
  var html =
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">' +
    '<h2 style="color:#4f46e5;">¡Gracias por tu valoración!</h2>' +
    '<p>Has recibido una recompensa especial por compartir tu experiencia.</p>' +
    '<div style="border:2px dashed #22c55e;padding:20px;text-align:center;border-radius:10px;background:#f0fdf4;">' +
    '<h3 style="margin:0;color:#22c55e;">' + String(descuento || '') + '</h3>' +
    '<p style="font-size:22px;font-weight:bold;">' + String(codigo || '') + '</p>' +
    '<p>Válido hasta: ' + String(caducidad || '') + '</p>' +
    '</div>' +
    '<p>Presenta este código en tu próxima visita.</p>' +
    '</div>';

  try {
    GmailApp.sendEmail(destino, asunto, 'Tu cliente de correo no admite HTML', { htmlBody: html });
  } catch (err) {
    Logger.log('Error email cupón: ' + err);
  }
}

/**
 * Email incidencia negativa
 */
function enviarEmailIncidencia(emailEmpresa, nombreEmpresa, estrellas, comentario, emailCliente) {
  var destino = String(emailEmpresa || '').trim();
  if (!destino || destino.indexOf('@') === -1) return;

  var asunto = '⚠️ Incidencia privada recibida - ' + String(nombreEmpresa || '');
  var cuerpo =
    'Se ha recibido una valoración negativa.\n\n' +
    'Empresa: ' + String(nombreEmpresa || '') + '\n\n' +
    'Estrellas: ' + String(estrellas || '') + '\n\n' +
    'Cliente: ' + (String(emailCliente || '').trim() || 'Anónimo') + '\n\n' +
    'Comentario:\n' + (String(comentario || '').trim() || 'Sin comentario') + '\n\n' +
    'HAPPYREVIEW PRO';

  try {
    GmailApp.sendEmail(destino, asunto, cuerpo);
  } catch (err) {
    Logger.log('Error email incidencia: ' + err);
  }
}

function generarPasswordTemporal() {
  return Math.random().toString(36).slice(-10);
}

function generarId() {
  return Utilities.getUuid();
}
