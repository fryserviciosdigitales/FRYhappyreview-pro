/*
====================================
HAPPYREVIEW PRO
API.JS
====================================
*/

const API_URL =
'https://script.google.com/macros/s/AKfycbxnOp3XeFIi3xXiB-_wPwkyuFfex9MOWRFg5ClCdt4G6lMCcHe4-DY97lYyf5d4hkf5Kg/exec';

async function api(
  action,
  data = {}
) {

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
EMPRESAS
====================================
*/

async function getEmpresa(id){

  return await api(

    'getEmpresa',

    {
      id:id
    }

  );

}

async function getEmpresas(){

  return await api(
    'getEmpresas'
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
      email,
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

      id:empresaId,

      estrellas:estrellas,

      comentario:comentario,

      email:email

    }

  );

}

/*
====================================
EMPRESA
====================================
*/

async function getMetricasEmpresa(
  id
){

  return await api(

    'getMetricasEmpresa',

    {
      id:id
    }

  );

}

async function getCuponesEmpresa(
  id
){

  return await api(

    'getCuponesEmpresa',

    {
      id:id
    }

  );

}

/*
====================================
ADMIN
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
