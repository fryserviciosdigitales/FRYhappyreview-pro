async function cargarAdmin() {

  try {

    const r =

      await api(
        'getMetricasAdmin'
      );

    console.log(
      'ADMIN RESPONSE',
      r
    );

    if (
      !r ||
      !r.success
    ) {

      document
        .getElementById(
          'admin-data'
        )
        .innerHTML =

        'Error obteniendo métricas';

      return;

    }

    const data =

      r.data;

    document
      .getElementById(
        'admin-data'
      )
      .innerHTML =

      `
      <div class="metrics-grid">

        <div class="metric-card">

          <div class="metric-title">
            Empresas Activas
          </div>

          <div class="metric-value">
            ${data.empresasActivas}
          </div>

        </div>

        <div class="metric-card">

          <div class="metric-title">
            Valoraciones
          </div>

          <div class="metric-value">
            ${data.totalValoraciones}
          </div>

        </div>

        <div class="metric-card">

          <div class="metric-title">
            Media Global
          </div>

          <div class="metric-value">
            ${data.mediaGlobal}
          </div>

        </div>

        <div class="metric-card">

          <div class="metric-title">
            Cupones
          </div>

          <div class="metric-value">
            ${data.totalCuponesEmitidos}
          </div>

        </div>

      </div>
      `;

  }

  catch(error){

    console.error(error);

    document
      .getElementById(
        'admin-data'
      )
      .innerHTML =

      'Error cargando dashboard';

  }

}

cargarAdmin();
