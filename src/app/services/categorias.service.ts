import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private negocioCategoria = {
    petShop: [
      {
        categoria: 'accesorios',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Faccesorios.jpg?alt=media&token=dec37019-197a-4499-9aaa-c2025ae76922'
      },
      {
        categoria: 'alimentos',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Falimentos.jpg?alt=media&token=54d8d2da-8390-45d2-b59f-d470c6ab0061'
      },
      {
        categoria: 'aseo e higiene',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Faseo%20e%20higiene.jpg?alt=media&token=05b84e3a-607d-4e6d-a80c-dda8228f0732'
      },
      {
        categoria: 'bozales',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fbozales.jpg?alt=media&token=dae36875-3a1e-467c-a696-71be1c0a4046'
      },
      {
        categoria: 'cachorro bebé',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fcachorros.jpg?alt=media&token=f92e0508-eb8e-4b4a-8599-a315baff2120'
      },
      {
        categoria: 'cadenas - tiros',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fcadenas%20-%20tiros.jpg?alt=media&token=ede34b63-677d-406e-bbc4-dfcf12754a48'
      },
      {
        categoria: 'camas',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fcamas.jpg?alt=media&token=e9c5a5ab-4d97-4f9f-a382-d0ec4df3a82f'
      },
      {
        categoria: 'carnazas',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fcarnazas.jpg?alt=media&token=c8fca3aa-7938-415d-ba5b-e21ec112891e'
      },
      {
        categoria: 'collares',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fcollares.jpg?alt=media&token=49c25403-deae-4c47-8007-937b92d6aec6'
      },
      {
        categoria: 'hamster',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fhamster.jpg?alt=media&token=8d00a0cd-e8b4-4e51-a8c0-7504bdb1fec0'
      },
      {
        categoria: 'gatos',
        img: 'https://t1.ea.ltmcdn.com/es/images/3/8/6/por_que_los_gatos_lloran_23683_600.jpg'
      },
      {
        categoria: 'juguetes',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fjuguetes.jpg?alt=media&token=6daf599c-4ff9-4065-989c-b870204306d6'
      },
      {
        categoria: 'mascotas',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fmascotas.jpg?alt=media&token=397a9a96-e494-47d5-92aa-5a6400ef0d90'
      },
      {
        categoria: 'navideño',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fnavide%C3%B1o.jpg?alt=media&token=c401cf10-2634-4708-a5e6-187321624ec2'
      },
      {
        categoria: 'pecheras',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fpecheras.jpg?alt=media&token=3ca2b6d2-c3dc-4f8b-9c04-9778455665f9'
      },
      {
        categoria: 'pericos',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fpericos.jpg?alt=media&token=00258b74-3c1b-4978-8020-583d3516e6f4'
      },
      {
        categoria: 'platos',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fplatos.jpg?alt=media&token=59f836b7-9a9f-46ed-b80b-53ad199d4b23'
      },
      {
        categoria: 'ropa',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fropa.jpg?alt=media&token=3a4d60c7-c6f5-43f4-87df-db2ff8ebd357'
      },
      {
        categoria: 'disfraz',
        img: 'https://www.coppel.com/images/catalog/pr/6002422-1.jpg'
      },
      {
        categoria: 'shampoo',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fshampoo.jpg?alt=media&token=8d1bee49-960a-4e6b-833c-21871074d398'
      },
      {
        categoria: 'test rápido',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Ftest%20rapido.jpg?alt=media&token=94d334c7-5be2-4912-a240-5092c1c101f6'
      },
      {
        categoria: 'transportadores',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Ftranportaderes.jpg?alt=media&token=2165894a-c160-4d9f-9785-68de7aea0ba2'
      },
      {
        categoria: 'zapatillas',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasadmin%20%2Fzapatillas.jpg?alt=media&token=4fdedd5e-0c31-423c-b7ec-8fd56de50d20'
      },
    ],
    farmacia: [
      {
        categoria: 'oftalmico',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Foftalmico.jpg?alt=media&token=14dc7a4c-9293-43f8-ba3e-6cab1abc76f8',
      },
      {
        categoria: 'inyectables',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Finyectables.jpg?alt=media&token=144e9f8f-9018-42ea-a62e-873dcd1b50db',
      },
      {
        categoria: 'comprimidos',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fcomprimidos.jpg?alt=media&token=6b68279a-21bb-411b-aa9d-bf0dcc1c1666',
      },
      {
        categoria: 'antiparasitarios',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fantiparasitarios.png?alt=media&token=1825c485-5b74-4949-867e-74f877920bf9',
      },
      {
        categoria: 'retroviral',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fretroviral.jpg?alt=media&token=ad053410-939d-447d-8f75-121e3d1a09af',
      },
      {
        categoria: 'jarabes',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fjarabes.jpg?alt=media&token=0e833e03-4a29-47fb-9d7d-9f300d6279bc',
      },
      {
        categoria: 'cremas',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fcremas.jpg?alt=media&token=68ab259a-4763-40a3-bc22-b2fa35585f4e',
      },
      {
        categoria: 'test rapidos',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Ftest%20rapidos.jpg?alt=media&token=58bde4cf-9538-4b05-8457-bad696685e63',
      },
      {
        categoria: 'dermatologico',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fdermatologicos.jpg?alt=media&token=0f9cfb91-fc2a-4aa5-90eb-c3be9485505a',
      },
      {
        categoria: 'cachorro bebe',
        img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/categoriasfarmacia%2Fcachorro%20bb.jpg?alt=media&token=7cb81ba9-a2cb-49ba-a48e-7ff1d339072e',
      }
    ],
    estetica: [
      {
        categoria: 'baños',
      },
      {
        categoria: 'cortes',
      }
    ]
  };
  constructor(private http: HttpClient) { }

  getcategoriasNegocio(tipo: string) {
    switch (tipo) {
      case 'petshop':
        return this.negocioCategoria.petShop;
      case 'farmacia':
        return this.negocioCategoria.farmacia;
      case 'estetica':
        return this.negocioCategoria.estetica;
    }
    return;
  }

  getData() {
    return this.http.get('../../assets/data/tooby.json');
  }
}
