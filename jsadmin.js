async function cargarAdmin(){

  const r =

    await api(
      'getMetricasAdmin'
    );

  const data =
    r.data;

  document
    .getElementById(
      'admin-data'
    )
    .innerHTML =

    `
      Empresas: ${data.empresasActivas}
      <br>
      Valoraciones: ${data.totalValoraciones}
      <br>
      Media: ${data.mediaGlobal}
    `;

}

cargarAdmin();
