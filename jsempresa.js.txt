async function iniciarEmpresa(){

  const empresaId =
    localStorage.getItem(
      'empresaId'
    );

  if(!empresaId){

    alert(
      'Empresa no identificada'
    );

    return;

  }

  const response =

    await api(

      'getMetricasEmpresa',

      {

        id:
          empresaId

      }

    );

  const data =
    response.data;

  document
    .getElementById(
      'empresa-nombre'
    )
    .innerText =
    data.nombreEmpresa;

  document
    .getElementById(
      'm-total'
    )
    .innerText =
    data.totalValoraciones;

  document
    .getElementById(
      'm-media'
    )
    .innerText =
    data.media;

  document
    .getElementById(
      'm-sat'
    )
    .innerText =
    data.satisfaccion +
    '%';

  pintarComentarios(
    data.comentarios
  );

  pintarGrafica(
    data
  );

}

function pintarComentarios(
  comentarios
){

  const cont =

    document
      .getElementById(
        'ultimas'
      );

  cont.innerHTML = '';

  comentarios
    .slice(0,5)
    .forEach(function(c){

      cont.innerHTML +=

      `
      <div class="card">

      <strong>

      ${c.estrellas} ⭐

      </strong>

      <br>

      ${c.comentario || 'Sin comentario'}

      </div>
      `;

    });

}

function pintarGrafica(
  data
){

  const ctx =

    document
      .getElementById(
        'graficaEvolucion'
      );

  new Chart(

    ctx,

    {

      type:'bar',

      data:{

        labels:[
          '1⭐',
          '2⭐',
          '3⭐',
          '4⭐',
          '5⭐'
        ],

        datasets:[{

          label:
            'Valoraciones',

          data:[

            data.c1,
            data.c2,
            data.c3,
            data.c4,
            data.c5

          ]

        }]

      }

    }

  );

}

iniciarEmpresa();