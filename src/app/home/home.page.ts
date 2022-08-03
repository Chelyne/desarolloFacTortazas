import { Component, Input, OnInit } from '@angular/core';
import { MenuController} from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { map } from 'rxjs/operators';
import { ExportarPDFService } from '../services/exportar-pdf.service';
import { GENERAL_CONFIG } from '../../config/generalConfig';
import { DataBaseService } from '../services/data-base.service';
import { CategoriasService } from '../services/categorias.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  logo = GENERAL_CONFIG.datosEmpresa.logo;
  sede = this.storage.datosAdmi ? this.storage.datosAdmi.sede : '';
  Datos = [
    {titulo: 'Dashboard', icono: 'https://i.pinimg.com/originals/0b/92/c1/0b92c1ba5ae239c314ba2ec1dab936ec.png', categoria: 'dashboard'},
    {titulo: 'POS ', icono: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Card_Terminal_POS_Flat_Icon_Vector.svg/1024px-Card_Terminal_POS_Flat_Icon_Vector.svg.png', categoria: 'punto-venta'},
    {titulo: 'Usuarios', icono: 'https://img.icons8.com/color/452/group.png', categoria: 'usuarios'},
    {titulo: 'Reportes', icono: 'https://www.freeiconspng.com/thumbs/report-icon/call-report-icon-3.png', categoria: 'reporte-ventas'},
  ];

  todosProductos = [];
  listaFallos = [];
  constructor(private menuCtrl: MenuController,
              private router: Router,
              public storage: StorageService,
              private dataApi: DataBaseService,
              private afs: AngularFirestore,
              private firebaseStorage: AngularFireStorage,
              private exportar: ExportarPDFService,
              private categorias: CategoriasService) {
    this.menuCtrl.enable(true);
    this.sede = this.storage.datosAdmi.sede;
  }
  ngOnInit(){
    // if (isNullOrUndefined(this.storage.datosAdmi)) {
    //   this.authSrvc.logOut();

    // }
  }
  categoriaPage(categoria: string) {
    switch (categoria) {
      case 'dashboard':
        this.router.navigate(['/dashboard']); break;
      case 'punto-venta':
        this.router.navigate(['/punto-venta']); break;
      case 'usuarios':
        this.router.navigate(['/usuarios']); break;
      case 'resporte-ventas':
        this.router.navigate(['/resporte-ventas']); break;
    }
  }

  // FUNCIONES PARA USAR RARAS VECES

  // getAll() {
  //   this.dataApi.obtenerListaProductosTodos('abancay').subscribe(todos => {
  //     console.log(todos);
  //     this.todosProductos = todos;
  //   });
  // }

  // SUBIRARRAY() {
  //   let contador = 0;
  //   this.todosProductos.forEach(element => {
  //     const arrayNombre = element.nombre.toLowerCase().split(' ');
  //     element.arrayNombre = arrayNombre;
  //     // console.log('datos array' + contador + arrayLetras);
  //     this.dataApi.actualizarArrayNombre('abancay', element.id, element.arrayNombre).then(() => {
  //       console.log(contador, 'Actualizado array de ', element.nombre);
  //       console.log(element.arrayNombre);
  //       contador++;
  //     });
  //   });
  // }

  // ActualizarUrlProductos() {
  //   let contador = 0;
  //   this.todosProductos.forEach(element => {
  //     console.log(element);
  //     // tslint:disable-next-line:prefer-const
  //     let storageRef = this.firebaseStorage.storage.ref();
  //     // tslint:disable-next-line:prefer-const
  //     let imageRef = storageRef.child('productos/' + element.id + '.jpg');
  //     console.log('REF: ', imageRef);
  //     imageRef.getDownloadURL().then((url) => {
  //       console.log(url);
  //       this.dataApi.actualizarUrlFoto('abancay', element.id, url).then(() => {
  //         console.log(contador, 'Actualizado foto de ', element.nombre);
  //         contador++;
  //       });
  //     }).catch(err => {
  //       console.log('error: ', err);
  //     });
  //   });
  // }

  // consultar(nombre) {
  //   const consulta = this.afs.collection('sedes').doc('talavera').collection('productos', ref => ref.where('nombre', '==', nombre)
  //   .limit(1));
  //   return consulta.snapshotChanges()
  //           .pipe(map(changes => {
  //             return changes.map(action => {
  //             // tslint:disable-next-line:no-shadowed-variable
  //             const data = action.payload.doc.data();
  //             data.id = action.payload.doc.id;
  //             // console.log(data);
  //             return data;
  //           });
  //         }));
  // }

  // getProductos() {
  //   const sus = this.dataApi.obtenerListaProductosTodos(this.sede).subscribe(datos => {
  //     sus.unsubscribe();
  //     console.log(datos);
  //     this.todosProductos = datos;
  //   });
  // }

  // pasarBarraCodigo() {
  //   let contador = 0;
  //   this.todosProductos.forEach(element => {
  //     if (element.codigoBarra) {
  //       this.afs.collection('sedes').doc('abancay').collection('productos')
  //       .doc(element.id).update({codigoBarra: null, codigo: element.codigoBarra.toString()}).then(() => {
  //         contador++;
  //         console.log('Actualizado ' + contador + ' ' + element.codigoBarra.toString());
  //       });
  //     }
  //   });
  // }

  // consultFallos() {
  //   this.exportar.exportAsExcelFile(this.listaFallos, 'faltantes');
  // }

  // exelDatosGenerales() {
  //   this.exportar.exportAsExcelFile(this.todosProductos, 'datosAbancay');
  // }

  async subirDatosV2() {
    const data = await this.categorias.getData();
    let contador = 0;
    await data.forEach(async (datos: any) => {
      datos.forEach(async element => {
        element.nombre = element.nombre.toLocaleLowerCase();
        const arrayNombre = element.nombre.toLowerCase().split(' ');
        element.arrayNombre = arrayNombre;
        element.subCategoria = element.categoria.toLocaleLowerCase();
        element.precio = parseFloat(element.precio);
        element.cantStock = 0;
        element.cantidad = 1;
        element.medida = 'unidad';
        element.fechaRegistro = new Date();
        element.sede = 'lampa';
        element.categoria = 'minimarket';
        if (element.marca) {
          element.marca = element.marca.toLocaleLowerCase();
        }
        if (element.codigo) {
          element.codigo = element.codigo.toString();
        }
        if (element.codigoBarra) {
          element.codigoBarra = element.codigoBarra.toString();
        }
        if (element.precioCompra) {
          element.precioCompra = parseFloat(element.precioCompra);
        }
        // contador ++ ;
        // console.log(contador, element);
        // nuevos
        await this.afs.collection('sedes').doc('lampa').collection('productos').add(element).then( resp => {
          console.log(contador, 'Ingresado', resp);
          contador++;
        }).catch(error => {console.error('No se  pudo ingresar los datos', error); });

        // actualizar
        // tslint:disable-next-line:no-shadowed-variable
        // const sus = await this.consultar(element.nombre).subscribe(async (data: any) => {
        //   sus.unsubscribe();
        //   console.log(data[0]);
        //   this.afs.collection('sedes').doc('talavera').collection('productos')
        //   .doc(data[0].id).update({fechaRegistro: element.fechaRegistro}).then(() => {
        //     contador++;
        //     console.log(contador, ' Actualizado ' + ' : ' + element.fechaRegistro);
        //   });        // });
      });
    });
  }
  async subirCategorias() {
    let contador = 0;
    const  cat = [
      {
          "id": "yptH2v9UlY2O34dJz5WJ",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A03%3A15?alt=media&token=1d5ecd7e-9c45-429b-8795-9ceec00350d6",
          "categoria": "aceites",
          "fechaTimeRegistro": {
              "seconds": 1659477798,
              "nanoseconds": 88000000
          }
      },
      {
          "id": "Ps2FVKjihZEx6sUNkqsm",
          "fechaTimeRegistro": {
              "seconds": 1659477810,
              "nanoseconds": 624000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A03%3A28?alt=media&token=145e2942-89be-4385-899e-ecce11a99949",
          "categoria": "aceitunas"
      },
      {
          "id": "WQkHCKPEleH2LKkxpvXR",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A03%3A40?alt=media&token=881bc34f-059e-47c5-a8ba-4f49a23b5a35",
          "fechaTimeRegistro": {
              "seconds": 1659477822,
              "nanoseconds": 842000000
          },
          "categoria": "aseo bebe"
      },
      {
          "id": "KPzow6kfm8FhVw9YJJXj",
          "fechaTimeRegistro": {
              "seconds": 1659477834,
              "nanoseconds": 773000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A03%3A52?alt=media&token=0b613c5e-5d2e-42fd-90f4-6f3ecfed67bb",
          "categoria": "aseo personal"
      },
      {
          "id": "8wkCrrScyRuMvnK0ypFL",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A04%3A04?alt=media&token=5fbdd079-10db-4b9d-b724-fd5c00bbd7bd",
          "fechaTimeRegistro": {
              "seconds": 1659477846,
              "nanoseconds": 389000000
          },
          "categoria": "aseo y limpieza"
      },
      {
          "id": "VLcjR8xeI6PRV6gaGkRp",
          "categoria": "bebidas refrescantes",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A04%3A22?alt=media&token=ec8db644-5306-44ef-a9e8-043a5e96f188",
          "fechaTimeRegistro": {
              "seconds": 1659477864,
              "nanoseconds": 702000000
          }
      },
      {
          "id": "KRLVVpqpieGaK04kPB2b",
          "fechaTimeRegistro": {
              "seconds": 1659477883,
              "nanoseconds": 527000000
          },
          "categoria": "cafes, chocolates, e instantaneos",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A04%3A41?alt=media&token=eb33d021-1174-4d41-aa08-45cdcfb1f50f"
      },
      {
          "id": "4O5dRi4bfuqeAU3NFhx9",
          "categoria": "canastas y festividades",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A05%3A18?alt=media&token=0711231a-290a-4d07-8894-91ba4c27b900",
          "fechaTimeRegistro": {
              "seconds": 1659477920,
              "nanoseconds": 688000000
          }
      },
      {
          "id": "JlMz0F7kZletwlWvGM3r",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A05%3A30?alt=media&token=8a677059-5c66-4178-97dd-1878d61ae48b",
          "categoria": "cervezas y cigarros",
          "fechaTimeRegistro": {
              "seconds": 1659477931,
              "nanoseconds": 825000000
          }
      },
      {
          "id": "wV6JDArFH2McoFwAs2dg",
          "fechaTimeRegistro": {
              "seconds": 1659477945,
              "nanoseconds": 123000000
          },
          "categoria": "condimentos, especias y sazonadores",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A05%3A43?alt=media&token=9ea41b71-6318-4758-9102-150fa7bcf0ae"
      },
      {
          "id": "X5LNVAi7ooG5SNlUl0Y8",
          "categoria": "conservas",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A07%3A38?alt=media&token=cea5a902-4f7d-4f79-a124-2d0ba7906d52",
          "fechaTimeRegistro": {
              "seconds": 1659478060,
              "nanoseconds": 810000000
          }
      },
      {
          "id": "91hVMoK0UAIAaONmQeEb",
          "categoria": "cremas, salsas y aderezos",
          "fechaTimeRegistro": {
              "seconds": 1659478077,
              "nanoseconds": 410000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A07%3A55?alt=media&token=2f1497bb-2b2e-483d-9baa-48b12bff69dc"
      },
      {
          "id": "t6soJLA33goj2HaYWPkv",
          "categoria": "embutidos y alimentos congelados",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A08%3A17?alt=media&token=ff60a6dc-7613-44b4-8c6d-66d1d2dfb0aa",
          "fechaTimeRegistro": {
              "seconds": 1659478099,
              "nanoseconds": 145000000
          }
      },
      {
          "id": "G7c7ZZX3DuOG1GJuFor7",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A29%3A57?alt=media&token=0dab9e56-945a-45e0-b91f-054442bd2758",
          "fechaTimeRegistro": {
              "seconds": 1659479399,
              "nanoseconds": 922000000
          },
          "categoria": "galletas, wafer y turrones"
      },
      {
          "id": "TYwoNU4DBewzEqUJeAaJ",
          "fechaTimeRegistro": {
              "seconds": 1659479434,
              "nanoseconds": 617000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A30%3A33?alt=media&token=1a526b08-0282-40e6-9083-793a64596db6",
          "categoria": "golosinas, bombones y chocolates"
      },
      {
          "id": "i8rbBvr8pkwoxmkvYrAx",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A30%3A59?alt=media&token=a165ab2b-1fb7-4027-a7f5-20d4a4e97993",
          "fechaTimeRegistro": {
              "seconds": 1659479461,
              "nanoseconds": 148000000
          },
          "categoria": "granos y menestras"
      },
      {
          "id": "6AODyc2srEsOQICPY0lq",
          "fechaTimeRegistro": {
              "seconds": 1659478120,
              "nanoseconds": 360000000
          },
          "categoria": "harinas y reposteria",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A08%3A38?alt=media&token=d8d323d0-e37e-41e1-b82b-f9ac095a2de9"
      },
      {
          "id": "lbxtode9cDASBHfb7kT9",
          "categoria": "helados y hielo",
          "fechaTimeRegistro": {
              "seconds": 1659479483,
              "nanoseconds": 789000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A31%3A21?alt=media&token=89fd8dd0-9f6c-44c5-a9d7-d74389d64169"
      },
      {
          "id": "99OUCjI3GtfTQlj3MPZW",
          "categoria": "infusiones y hierbas",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A31%3A48?alt=media&token=0b5e509f-a3ee-4c20-a137-1db2bf7dd79a",
          "fechaTimeRegistro": {
              "seconds": 1659479509,
              "nanoseconds": 958000000
          }
      },
      {
          "id": "ZVd0B7oKfJ6Qafso7MF1",
          "categoria": "lacteos, manjares y huevos",
          "fechaTimeRegistro": {
              "seconds": 1659478147,
              "nanoseconds": 25000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A09%3A06?alt=media&token=93c991df-72ff-47e6-9cd1-9452b0a55e1b"
      },
      {
          "id": "ibRifKvWCTtiPNGdqYFn",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A32%3A19?alt=media&token=6b1a43e4-d784-4cf9-a210-f509cad6993b",
          "categoria": "licores y rtd",
          "fechaTimeRegistro": {
              "seconds": 1659479541,
              "nanoseconds": 566000000
          }
      },
      {
          "id": "GwPwxSb9KkfH4DeBOMYG",
          "fechaTimeRegistro": {
              "seconds": 1659479552,
              "nanoseconds": 256000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A32%3A30?alt=media&token=c79f3b9c-2ba4-4eb8-98b1-e1b9981b196c",
          "categoria": "mascotas"
      },
      {
          "id": "7c5R9CgE6I3Xl3QQ6r0a",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A32%3A39?alt=media&token=a3334890-ba26-4040-bfc6-1a29b781efc3",
          "categoria": "mermeladas",
          "fechaTimeRegistro": {
              "seconds": 1659479561,
              "nanoseconds": 229000000
          }
      },
      {
          "id": "ROVSTSqAwArDgVK2SrNP",
          "categoria": "mermeladas",
          "fechaTimeRegistro": {
              "seconds": 1659478159,
              "nanoseconds": 502000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A09%3A17?alt=media&token=74e0a90e-07f4-4f48-a54d-eecbc16af5d8"
      },
      {
          "id": "1B79DwMmbGkwmyrPeAmY",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A32%3A48?alt=media&token=de1030f4-fe93-4af2-a5cb-5ede0135d405",
          "categoria": "mundo asia",
          "fechaTimeRegistro": {
              "seconds": 1659479570,
              "nanoseconds": 953000000
          }
      },
      {
          "id": "UfsMUL6j1WJkh4GSPI4Z",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A09%3A28?alt=media&token=4b82796c-da9c-453b-83d9-3806a0151ec9",
          "categoria": "mundo saludable",
          "fechaTimeRegistro": {
              "seconds": 1659478169,
              "nanoseconds": 987000000
          }
      },
      {
          "id": "U2dkxPFEL1tREgDNfUw0",
          "categoria": "panes, kekes y bolleria",
          "fechaTimeRegistro": {
              "seconds": 1659479593,
              "nanoseconds": 88000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A33%3A11?alt=media&token=b5cf24f1-92ad-432a-b3da-0104285e5076"
      },
      {
          "id": "2rAzlAZ98CJckMhEMX7h",
          "categoria": "papel higienico y servilletas",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A33%3A26?alt=media&token=eaeb0f71-ab62-497e-b885-834a7cccaa86",
          "fechaTimeRegistro": {
              "seconds": 1659479608,
              "nanoseconds": 437000000
          }
      },
      {
          "id": "mP8hdSW9SlVLqpZttC9w",
          "categoria": "pastas y fideos",
          "fechaTimeRegistro": {
              "seconds": 1659479622,
              "nanoseconds": 217000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A33%3A40?alt=media&token=8a9fadc0-8371-41d3-9ebb-044aee8ebc34"
      },
      {
          "id": "g97Wf7WZevcX1WqrIyzi",
          "fechaTimeRegistro": {
              "seconds": 1659479636,
              "nanoseconds": 335000000
          },
          "categoria": "postres y refrescos",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A33%3A54?alt=media&token=e5009561-c571-4ecb-ac08-84f7958af167"
      },
      {
          "id": "6RiFwUCw37FJ2wNYn7sh",
          "fechaTimeRegistro": {
              "seconds": 1659479662,
              "nanoseconds": 628000000
          },
          "categoria": "snacks, piqueos y granolas",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A34%3A20?alt=media&token=364333bc-0624-437a-ad34-53c67f7852d9"
      },
      {
          "id": "FyQZ4CBaMSnIsSosplfk",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A34%3A34?alt=media&token=fce07360-6d69-4cd7-a27c-486795789fdd",
          "categoria": "sopas y cremas instantaneas",
          "fechaTimeRegistro": {
              "seconds": 1659479676,
              "nanoseconds": 437000000
          }
      },
      {
          "id": "7kQRt8kkbJ77wKg3irGs",
          "categoria": "utileria, plasticos y adicionales",
          "fechaTimeRegistro": {
              "seconds": 1659479692,
              "nanoseconds": 326000000
          },
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A34%3A50?alt=media&token=fa1de3e4-b14d-499e-ab90-bcb45d511d0c"
      },
      {
          "id": "QuNVZ65bHxlYWBpeIPVt",
          "fechaTimeRegistro": {
              "seconds": 1659478183,
              "nanoseconds": 927000000
          },
          "categoria": "yogurts, quesos y mantequilllas",
          "img": "https://firebasestorage.googleapis.com/v0/b/facturacionmimarket.appspot.com/o/categorias%2Fandahuaylas2%20ago.%202022%2017%3A09%3A41?alt=media&token=e4c6ceed-c891-4362-98b7-7b18701c674f"
      }
  ];
  // tslint:disable-next-line:align
  console.log( cat);
    await cat.forEach(async (el: any) => {
      await this.afs.collection('sedes').doc('lampa').collection('categorias').doc(el.id).set(el).then( resp => {
        console.log(contador, 'Ingresado', resp);
        contador++;
      }).catch(error => {console.error('No se  pudo ingresar los datos', error); });
      console.log(el);
    });
  }

  // subirDatos() {
  //     // tslint:disable-next-line:prefer-const
  //     let data = this.categorias.getData();
  //     // console.log(this.datos);
  //     data.forEach( (obj: []) => {
  //       console.log(obj);
  //       obj.forEach( (res: any[]) => {
  //         let contador = 0;
  //         let contadorFallos = 0;
  //         this.listaFallos = [];
  //         res.forEach(element => {
  //           // element.producto = element.producto.toLocaleLowerCase();
  //           // element.subCategoria = element.subCategoria.toLocaleLowerCase();
  //           // element.codigo = element.codigo.toLocaleLowerCase();
  //           // element.precioCompra = parseFloat(element.precioCompra);
  //           // element.cantStock = parseInt(element.cantStock, 10);
  //           // element.cantidad = parseInt(element.cantidad, 10);
  //           // if (element.codigo) {
  //           // element.codigo = element.codigo.toString();
  //           // }
  //           // if (element.codigoBarra) {
  //           //   element.codigoBarra = element.codigoBarra.toString();
  //           //   }
  //           console.log(element);
  //             // tslint:disable-next-line:no-shadowed-variable
  //           // const sus = this.consultar(element.producto).subscribe(async (data: any) => {
  //           // sus.unsubscribe();
  //           if (element.cantStock) {
  //           element.cantStock = parseInt(element.cantStock, 10);
  //           contador++;
  //           console.log(contador, element.uid, element.cantStock);
  //           this.afs.collection('sedes').doc('andahuaylas').collection('productos')
  //           .doc(element.uid).update({cantStock: element.cantStock}).then(() => {
  //             contador++;
  //             console.log(contador, ' Actualizado ' + element.uid + ' : ' + element.precioCompra);
  //           });
  //           } else {
  //           contadorFallos++;
  //           console.log('FALLOOOOOOOOOOOOOOOOOOOOOOO', contadorFallos, element);
  //           // this.presentToast('FALLOS' + element.nombre + 'Cant:' + contadorFallos);
  //           this.listaFallos.push(element);
  //           console.log('LISTA FALLOS', this.listaFallos);
  //           }
  //           // });
  //           // nuevos
  //           // this.afs.collection('sedes').doc('albrook').collection('productos').add(element).then( resp => {
  //           //   console.log(contador, 'Ingresado', resp);
  //           //   contador++;
  //           //   }).catch(error => {console.error('No se  pudo ingresar los datos', error); });
  //         });
  //         // contador++;
  //         // console.log(contador, ' ', res.dni);
  //         // const dni = res.dni.toString();
  //         // const dato = {
  //         //   dni: res.dni.toString(),
  //         //   codigo: res.codigo.toString(),
  //         //   nombres: res.nombres.toString(),
  //         //   apellidos: res.apellidos.toString(),
  //         //   carrera : res.carrera.toString(),
  //         //   facultad : res.facultad.toString(),
  //         //   tipo : res.tipo.toString()
  //         // };
  //         console.log('LISTA FALLOS', this.listaFallos);
  //         console.log(res);
  //       });
  //     } );
  //   }
}
