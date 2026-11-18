/*
====================================
HAPPYREVIEW PRO
API.JS
====================================
*/

const API_URL =
'https://script.google.com/macros/s/AKfycbxnOp3XeFIi3xXiB-_wPwkyuFfex9MOWRFg5ClCdt4G6lMCcHe4-DY97lYyf5d4hkf5Kg/exec';

/*
====================================
LLAMADA GENÉRICA
====================================
*/

async function api(
  action,
  data = {}
){

  const params =
    new URLSearchParams();

  params.append(
    'action',
    action
  );

  Object.keys(data)
    .forEach(function(key){

      params.append(
        key,
        data[key]
      );

    });

  const response =
    await fetch(

      API_URL +

      '?' +

      params.toString()

    );

  return await response.json();

}

/*
====================================
EMPRESA
====================================
*/

async function getEmpresa(
  empresaId
){

  return await api(

    'getEmpresa',

    {
      id:
        empresaId
    }

  );

}

async function getEmpresas(){

  return await api(
    'getEmpresas'
  );

}

async function crearEmpresa(
  datos
){

  return await api(

    'crearEmpresa',

    datos

  );

}

/*
====================================
LOGIN
====================================
*/

async function login(
  email,
  password
){

  return await api(

    'login',

    {

      email:
        email,

      password:
        password

    }

  );

}

/*
====================================
VALORACIONES
====================================
*/

async function enviarValoracion(

  empresaId,

  estrellas,

  comentario,

  email

){

  return await api(

    'votar',

    {

      id:
        empresaId,

      estrellas:
        estrellas,

      comentario:
        comentario,

      email:
        email

    }

  );

}

/*
====================================
EMPRESA DASHBOARD
====================================
*/

async function getMetricasEmpresa(
  empresaId
){

  return await api(

    'getMetricasEmpresa',

    {

      id:
        empresaId

    }

  );

}

async function getCuponesEmpresa(
  empresaId
){

  return await api(

    'getCuponesEmpresa',

    {

      id:
        empresaId

    }

  );

}

/*
====================================
ADMIN DASHBOARD
====================================
*/

async function getMetricasAdmin(){

  return await api(
    'getMetricasAdmin'
  );

}

async function getUsuarios(){

  return await api(
    'getUsuarios'
  );

}

/*
====================================
EMPRESAS
====================================
*/

async function toggleEmpresa(
  empresaId
){

  return await api(

    'toggleActivo',

    {

      id:
        empresaId

    }

  );

}

/*
====================================
UTILS
====================================
*/

function getParam(
  nombre
){

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(
    nombre
  );

}