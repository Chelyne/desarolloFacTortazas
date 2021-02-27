import { ComponentFixture, inject, TestBed  } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { DbDataService } from '../db-data.service';
import { StorageService } from '../storage.service';

import { ApiPeruService } from './api-peru.service';
// import 'jasmine-expect';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { apiPeruConfig as apiPeruMock} from './apiPeruConfig.test';
import { apiPeruConfig as apiPeruFuncinal} from './apiPeruConfig';
import { VentaInterface } from 'src/app/models/venta/venta';
import { CDRInterface } from 'src/app/models/api-peru/cdr-interface';

class MockStorageService {
    datosAdmi = {sede: 'andahuaylas'};
    saludo() {
      return 'hola';
    }
}

describe('description', () => {
    let service: ApiPeruService;
    let ventaSinProductos: VentaInterface;
    let ventaSinProductosNV: VentaInterface;
    let VentaConProductos: VentaInterface;
    let cdrDePrueba: CDRInterface;
    let ventaSinProductosYSinCDR: VentaInterface;
    let ventaSinItemsDeLista: VentaInterface;
    let ventaConFechaInvalida: VentaInterface;

    beforeAll( () => {
      ventaSinProductos = {
        cantidadBolsa: 0,
        montoBase: 84.74576271186442,
        fechaEmision: {
          seconds: 1611254602,
          nanoseconds: 40000000
        },
        totalPagarVenta: 100,
        tipoComprobante: 'boleta',
        estadoVenta: 'anulado',
        montoNeto: 100,
        cliente: {
          id: '5FwjPZ7ClHegWoQqOQzN',
          celular: '999999999',
          tipoDoc: 'dni',
          nombre: 'cliente varios',
          email: 'cliente@gmail.com',
          numDoc: '00000000',
          direccion: 'jr. prueba'
        },
        tipoPago: 'efectivo',
        montoPagado: 100,
        idListaProductos: 'lkwl4BjQA8sntUdbhsB6',
        vendedor: {
          token: 'token laptop',
          password: 'nerio123',
          nombre: 'Nerio',
          foto: null,
          correo: 'nerio@gmail.com',
          dni: '70148737',
          apellidos: 'Cañari Huarcaya',
          celular: '910426974',
          rol: 'Administrador',
          sede: 'Andahuaylas',
          id: 'nerio@gmail.com'
        },
        igv: 15.254237288135585,
        descuentoVenta: 0,
        serieComprobante: 'B001',
        numeroComprobante: '205',
        bolsa: false,
        cdr: {
          sunatResponse: {
            success: true,
          }
        },
        idVenta: 'JDjjk7ZkRXKwtljSUtcz'
      };

      ventaSinProductosYSinCDR = {
        cantidadBolsa: 0,
        montoBase: 84.74576271186442,
        fechaEmision: {
          seconds: 1611254602,
          nanoseconds: 40000000
        },
        totalPagarVenta: 100,
        tipoComprobante: 'boleta',
        estadoVenta: 'anulado',
        montoNeto: 100,
        cliente: {
          id: '5FwjPZ7ClHegWoQqOQzN',
          celular: '999999999',
          tipoDoc: 'dni',
          nombre: 'cliente varios',
          email: 'cliente@gmail.com',
          numDoc: '00000000',
          direccion: 'jr. prueba'
        },
        tipoPago: 'efectivo',
        montoPagado: 100,
        idListaProductos: 'lkwl4BjQA8sntUdbhsB6',
        vendedor: {
          token: 'token laptop',
          password: 'nerio123',
          nombre: 'Nerio',
          foto: null,
          correo: 'nerio@gmail.com',
          dni: '70148737',
          apellidos: 'Cañari Huarcaya',
          celular: '910426974',
          rol: 'Administrador',
          sede: 'Andahuaylas',
          id: 'nerio@gmail.com'
        },
        igv: 15.254237288135585,
        descuentoVenta: 0,
        serieComprobante: 'B001',
        numeroComprobante: '205',
        bolsa: false,
        idVenta: 'JDjjk7ZkRXKwtljSUtcz'
      };

      ventaSinItemsDeLista = {
        cantidadBolsa: 0,
        montoBase: 84.74576271186442,
        fechaEmision: {
          seconds: 1611254602,
          nanoseconds: 40000000
        },
        totalPagarVenta: 100,
        tipoComprobante: 'boleta',
        estadoVenta: 'anulado',
        montoNeto: 100,
        cliente: {
          id: '5FwjPZ7ClHegWoQqOQzN',
          celular: '999999999',
          tipoDoc: 'dni',
          nombre: 'cliente varios',
          email: 'cliente@gmail.com',
          numDoc: '00000000',
          direccion: 'jr. prueba'
        },
        tipoPago: 'efectivo',
        montoPagado: 100,
        idListaProductos: 'lllllllllllllll',
        vendedor: {
          token: 'token laptop',
          password: 'nerio123',
          nombre: 'Nerio',
          foto: null,
          correo: 'nerio@gmail.com',
          dni: '70148737',
          apellidos: 'Cañari Huarcaya',
          celular: '910426974',
          rol: 'Administrador',
          sede: 'Andahuaylas',
          id: 'nerio@gmail.com'
        },
        igv: 15.254237288135585,
        descuentoVenta: 0,
        serieComprobante: 'B001',
        numeroComprobante: '205',
        bolsa: false,
        idVenta: 'JDjjk7ZkRXKwtljSUtcz'
      };

      ventaConFechaInvalida = {
        cantidadBolsa: 0,
        montoBase: 84.74576271186442,
        fechaEmision: '2000-15-16',
        totalPagarVenta: 100,
        tipoComprobante: 'boleta',
        estadoVenta: 'anulado',
        montoNeto: 100,
        cliente: {
          id: '5FwjPZ7ClHegWoQqOQzN',
          celular: '999999999',
          tipoDoc: 'dni',
          nombre: 'cliente varios',
          email: 'cliente@gmail.com',
          numDoc: '00000000',
          direccion: 'jr. prueba'
        },
        tipoPago: 'efectivo',
        montoPagado: 100,
        idListaProductos: 'lkwl4BjQA8sntUdbhsB6',
        vendedor: {
          token: 'token laptop',
          password: 'nerio123',
          nombre: 'Nerio',
          foto: null,
          correo: 'nerio@gmail.com',
          dni: '70148737',
          apellidos: 'Cañari Huarcaya',
          celular: '910426974',
          rol: 'Administrador',
          sede: 'Andahuaylas',
          id: 'nerio@gmail.com'
        },
        igv: 15.254237288135585,
        descuentoVenta: 0,
        serieComprobante: 'B001',
        numeroComprobante: '205',
        bolsa: false,
        idVenta: 'JDjjk7ZkRXKwtljSUtcz'
      };




      VentaConProductos = {
        cliente: {
          email: '',
          tipoDoc: 'ruc',
          direccion: '',
          numDoc: '20601831032',
          celular: '966666999',
          nombre: 'clinica veterinaria tooby e.i.r.l.',
          id: 'IiE3PcjE4ko8DpaWTWAj'
        },
        listaItemsDeVenta: [
          {
            producto: {
              cantidad: 1,
              codigoBarra: '1093',
              sede: 'Andahuaylas',
              categoria: 'petshop',
              descripcionProducto: 'se aplica el impuesto como parte de la ley N° 30884',
              nombre: 'impuesto bolsa plastica',
              subCategoria: 'accesorios',
              cantStock: 10,
              medida: 'Unidad',
              precio: 0.2,
              id: 'W8Ax2qXj0pfxXec5vbqv'
            },
            idProducto: 'W8Ax2qXj0pfxXec5vbqv',
            cantidad: 8,
            montoNeto: 1.6,
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            totalxprod: 1.6
          },
          {
            producto: {
              categoria: 'petshop',
              descripcionProducto: 'CORBATA RAZA PEQUEÑA ,MEDIDA DE CUELLO 43CM Y LARGO DE CORBATA DE 13 CM',
              cantStock: 0,
              cantidad: 1,
              subCategoria: 'accesorios',
              codigoBarra: '818',
              sede: 'Andahuaylas',
              medida: 'Unidad',
              precio: 10,
              nombre: 'corbata macho',
              id: 'lZH6EaDTgdsQkwBLDFnP'
            },
            idProducto: 'lZH6EaDTgdsQkwBLDFnP',
            cantidad: 2,
            montoNeto: 20,
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            totalxprod: 20
          },
          {
            producto: {
              sede: 'Andahuaylas',
              cantidad: 1,
              subCategoria: 'accesorios',
              medida: 'Unidad',
              nombre: 'dni tooby',
              descripcionProducto: 'TE PERMITE ACCEDER A PROMOCIONES, DESCUENTOS Y REGALOS',
              precio: 15,
              codigoBarra: '726',
              cantStock: 0,
              categoria: 'petshop',
              id: 'pQiWkPrrINzXgfIAWNfT'
            },
            idProducto: 'pQiWkPrrINzXgfIAWNfT',
            cantidad: 3,
            montoNeto: 45,
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            totalxprod: 45
          }
        ],
        idVenta: '17256788',
        montoNeto: 66.6,
        tipoComprobante: 'boleta',
        serieComprobante: 'B001',
        vendedor: {
          dni: '70148737',
          password: 'nerio123',
          foto: null,
          rol: 'Administrador',
          apellidos: 'Cañari Huarcaya',
          token: 'token laptop',
          sede: 'Andahuaylas',
          nombre: 'Nerio',
          correo: 'nerio@gmail.com',
          id: 'nerio@gmail.com'
        },
        bolsa: false,
        tipoPago: 'efectivo',
        descuentoVenta: 0,
        totalPagarVenta: 66.6,
        igv: 10.159322033898299,
        montoBase: 56.440677966101696,
        numeroComprobante: '11',
        fechaEmision: {
          seconds: 1610318081,
          nanoseconds: 855000000
        },
      };

      ventaSinProductosNV = {
          numeroComprobante: '12',
          bolsa: true,
          cantidadBolsa: 3,
          idListaProductos: 'h1DpNvvWlBFmiev5SkD2',
          tipoComprobante: 'n. venta',
          fechaEmision: {
            seconds: 1610318081,
            nanoseconds: 855000000
          },
          tipoPago: 'efectivo',
          vendedor: {
            celular: '910426974',
            nombre: 'nerio',
            token: 'token laptop',
            apellidos: 'cañari huarcaya',
            rol: 'Administrador',
            sede: 'Andahuaylas',
            foto: null,
            password: 'nerio123',
            id: 'nerio@gmail.com',
            correo: 'nerio@gmail.com',
            dni: '70148737'
          },
          totalPagarVenta: 46,
          cliente: {
            email: 'cliente@gmail.com',
            nombre: 'cliente varios',
            tipoDoc: 'dni',
            direccion: 'jr. prueba',
            celular: '999999999',
            numDoc: '00000000',
            id: '5FwjPZ7ClHegWoQqOQzN'
          },
          serieComprobante: 'NV01',
          idVenta: 'cwNG3OcbTLtwEn2C36EO'
      };

      cdrDePrueba =  {
        sunatResponse: {
          success: true
        }
      };

    });

    beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [
          AngularFireModule.initializeApp(environment.firebaseConfig),
          AngularFirestoreModule
        ],
        declarations: [ ],
        providers: [
          // BuscadorService,
          { provide: StorageService, useClass: MockStorageService}
        ]
      });

      service = TestBed.inject(ApiPeruService);
      service.setApiPeruConfig(apiPeruMock);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('test saludo', () => {
        expect('hola').toEqual(service.saludo());
        console.log(ventaSinProductos);
    });
    it('test getSede', () => {
        expect('andahuaylas').toEqual(service.getSede());
    });
    it('probar setApiPeruTest', () => {
      service.setApiPeruConfig(apiPeruFuncinal);
    });
    // it('Test apiPeruLogin', async () => {
    //   service.login().then( data => console.log(data));
    // });
    it('Test EnviarComprobante a Sunat General', async () => {
      console.log('-----------------------Enviar venta a sunat por pasos-----------------------');
      await service.enviarASunatAdaptador2(ventaSinProductosYSinCDR).then( exito => console.log(exito)).catch( err => console.log(err));
    });
    it('Test EnviarComprobante a Sunat, por pasos', async () => {
      // console.log('-----------------------Enviar venta a sunat por pasos-----------------------');

      // /** Error Fallo Obtencion de productos */
      // await service.enviarASunatAdaptador2(ventaSinProductosYSinCDR).
      // then( exito => console.log('EXITO_ENVIO_SUNAT', exito)).catch( err => console.log('ERROR_ENVIO_SUNAT', err));

      // /** Error se obtuvo una lista vacia de productos */
      // await service.enviarASunatAdaptador2(ventaSinItemsDeLista).
      // then( exito => console.log('EVITO_ENVIO_SUNAT', exito)).catch( err => console.log('ERROR_ENVIO_SUNAT', err));

      // /** Error fecha invalida */
      // await service.enviarASunatAdaptador2(ventaConFechaInvalida).
      // then( exito => console.log('EVITO_ENVIO_SUNAT', exito)).catch( err => console.log('ERROR_ENVIO_SUNAT', err));


      /** No se envio el comprobante a SUNAT */
      /** Error se Obtuvo el cdr pero no se guardo */

    });
    it('Test funcion enviar a Sunat, PEGS', async () => {
      console.log('Venta Formateada', service.formatearVenta(VentaConProductos));
    });
    // it('testear Buscar productos por codigo', async () => {
    //   /** Si la lista de productos esxiste devuel la litaDeproductos */
    //   await service.obtenerProductosDeVenta(ventaSinProductos.idListaProductos)
    //   .then( data => console.log('BuscarProductosByIdList', data));

    //   /** Si el producto no existe devuelve una lista vacia */
    //   service.obtenerProductosDeVenta('').then( data => console.log('BuscarProductosByIdList', data));

    //   await service.obtenerProductosDeVenta('sdfsdf').then( data => console.log('BuscarProductosByIdList', data))
    //   .catch( err => console.log(err));
    // });
    // it('Formatear venta sin productos', async () => {
    //   // const productos = await service.obtenerProductosDeVenta(ventaSinProductos.idListaProductos).catch(err => err);
    //   const productos = await service.obtenerProductosDeVenta('').catch(err => err);
    //   if (productos === 'fail'){
    //     console.log('No se pudo obtener productos');
    //   } else {
    //     ventaSinProductos.listaItemsDeVenta = productos;
    //     console.log('venta formateada venta sin productos', service.formatearVenta(ventaSinProductos));
    //   }
    // });
    // it('Testear guardar Cdr de prueba', async () => {
    //   /** Envia cdr a venta que existe */
    //   await service.guardarCDR(ventaSinProductos.idVenta, ventaSinProductos.fechaEmision, cdrDePrueba)
    //   .then( data => console.log(data)).catch( err => console.log(err));

    //   /** Envia cdr a venta que no existe */
    //   await service.guardarCDR('betobetobeto', ventaSinProductos.fechaEmision, cdrDePrueba)
    //   .then( data => console.log('Usted a tenido exito', data)).catch( err => console.log('fail', err));
    // });
});
