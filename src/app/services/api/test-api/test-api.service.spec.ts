import { ExternalExpr } from '@angular/compiler';
import { TestBed } from '@angular/core/testing';

import { TestApiService } from './test-api.service';

import 'jasmine-expect';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';

describe('TestApiService', () => {
  let service: TestApiService;

  beforeEach(() => {
    // TestBed.configureTestingModule({
    //   providers:[TestApiService]
    // });
    // service = TestBed.inject(TestApiService);
    service = new TestApiService();
    service.setApiPeruDataUser('hz', '123456');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  // it('saludo', () => {
  //   expect(service.saludo()).toEqual('hola');
  // });
  it('Test de obtener medida', () => {
    expect(service.ObtenerCodigoMedida('botellas')).toEqual('BG');
    expect(service.ObtenerCodigoMedida('caja')).toEqual('BO');
    expect(service.ObtenerCodigoMedida('docena')).toEqual('BX');
    expect(service.ObtenerCodigoMedida('gramo')).toEqual('DZN');
    expect(service.ObtenerCodigoMedida('juego')).toEqual('GRM');
    expect(service.ObtenerCodigoMedida('kilogramo')).toEqual('SET');
    expect(service.ObtenerCodigoMedida('kit')).toEqual('KGM');
    expect(service.ObtenerCodigoMedida('libras')).toEqual('KT');
    expect(service.ObtenerCodigoMedida('litro')).toEqual('LBR');
    expect(service.ObtenerCodigoMedida('metro')).toEqual('LTR');
    expect(service.ObtenerCodigoMedida('miligramos')).toEqual('MTR');
    expect(service.ObtenerCodigoMedida('mililitro')).toEqual('MGM');
    expect(service.ObtenerCodigoMedida('milimetro')).toEqual('MLT');
    expect(service.ObtenerCodigoMedida('onzas')).toEqual('MMT');
    expect(service.ObtenerCodigoMedida('pies')).toEqual('ONZ');
    expect(service.ObtenerCodigoMedida('piezas')).toEqual('FOT');
    expect(service.ObtenerCodigoMedida('pulgadas')).toEqual('C62');
    expect(service.ObtenerCodigoMedida('unidad (bienes)')).toEqual('INH');
    expect(service.ObtenerCodigoMedida('ciento de unidades')).toEqual('NIU');
    expect(service.ObtenerCodigoMedida('bolsa')).toEqual('CEN');
    expect(service.ObtenerCodigoMedida('balde')).toEqual('BJ');
    expect(service.ObtenerCodigoMedida('barriles')).toEqual('BLL');
    expect(service.ObtenerCodigoMedida('cartones')).toEqual('CT');
    expect(service.ObtenerCodigoMedida('centimetro cuadrado')).toEqual('CMK');
    expect(service.ObtenerCodigoMedida('latas')).toEqual('CA');
    expect(service.ObtenerCodigoMedida('metro cuadrado')).toEqual('MTK');
    expect(service.ObtenerCodigoMedida('milimetro cuadrado')).toEqual('MMK');
    expect(service.ObtenerCodigoMedida('paquete')).toEqual('PK');
    expect(service.ObtenerCodigoMedida('par')).toEqual('PR');
    expect(service.ObtenerCodigoMedida('unidad servicios')).toEqual('ZZ');
    expect(service.ObtenerCodigoMedida('cilindro')).toEqual('CY');
    expect(service.ObtenerCodigoMedida('galon ingles')).toEqual('GLI');
    expect(service.ObtenerCodigoMedida('pies cuadrados')).toEqual('FTK');
    expect(service.ObtenerCodigoMedida('us galon')).toEqual('GLL');
    expect(service.ObtenerCodigoMedida('bobinas')).toEqual('4A');
    expect(service.ObtenerCodigoMedida('centimetro cubico')).toEqual('CMQ');
    expect(service.ObtenerCodigoMedida('centimetro lineal')).toEqual('CMT');
    expect(service.ObtenerCodigoMedida('conos')).toEqual('CJ');
    expect(service.ObtenerCodigoMedida('docena por 10**6')).toEqual('DZP');
    expect(service.ObtenerCodigoMedida('fardo')).toEqual('BE');
    expect(service.ObtenerCodigoMedida('gruesa')).toEqual('GRO');
    expect(service.ObtenerCodigoMedida('hectolitro')).toEqual('HLT');
    expect(service.ObtenerCodigoMedida('hoja')).toEqual('LEF');
    expect(service.ObtenerCodigoMedida('kilometro')).toEqual('KTM');
    expect(service.ObtenerCodigoMedida('kilovatio hora')).toEqual('KWH');
    expect(service.ObtenerCodigoMedida('megawatt hora')).toEqual('MWH');
    expect(service.ObtenerCodigoMedida('metro cubico')).toEqual('MTQ');
    expect(service.ObtenerCodigoMedida('milimetro cubico')).toEqual('MMQ');
    expect(service.ObtenerCodigoMedida('millares')).toEqual('MLL');
    expect(service.ObtenerCodigoMedida('millon de unidades')).toEqual('UM');
    expect(service.ObtenerCodigoMedida('paletas')).toEqual('PF');
    expect(service.ObtenerCodigoMedida('pies cubicos')).toEqual('FTQ');
    expect(service.ObtenerCodigoMedida('placas')).toEqual('PG');
    expect(service.ObtenerCodigoMedida('pliego')).toEqual('ST');
    expect(service.ObtenerCodigoMedida('resma')).toEqual('RM');
    expect(service.ObtenerCodigoMedida('tambor')).toEqual('DR');
    expect(service.ObtenerCodigoMedida('tonelada corta')).toEqual('STN');
    expect(service.ObtenerCodigoMedida('tonelada larga')).toEqual('LTN');
    expect(service.ObtenerCodigoMedida('toneladas')).toEqual('TNE');
    expect(service.ObtenerCodigoMedida('tubos')).toEqual('TU');
    expect(service.ObtenerCodigoMedida('yarda')).toEqual('YRD');
    expect(service.ObtenerCodigoMedida('yarda cuadrada')).toEqual('YDK');
    expect(service.ObtenerCodigoMedida('otra medida')).toEqual('NIU');
  });
  // it('ApisPeru login test', async () => {
  //   await expectAsync(service.login()).toBeResolved();
  // });
  // it('ApisPeru ObtenerToken', async () => {
  //   await expectAsync(service.obtenerUserApiperuToken()).toBeResolved();
  // });
  // it('ApisPeru listar empresa', async () => {
  //   console.log('_*__*__*__*__*__*__*__*__*__*__*_');
  //   await expectAsync(service.listarEmprasas()).toBeResolved();
  //   service.listarEmprasas().then(data => console.log(data));
  // });
  // it('Obtener empresa por Ruc', async () => {
  //   // TODO - Queda por demostrar
  //   // await expectAsync(service.listarEmprasas()).toBeResolved();
  //   // // expect(Object.entries(service.obtenerEmpresaByRUC('21000000055')).length).toBeGreaterThan(0);
  //   // // expect(Object.entries(service.obtenerEmpresaByRUC('20722440881')).length).toBeGreaterThan(0);
  //   // // console.log('_*__*__*__*__*__*__*__*__*__*__*_');
  //   // let value = await service.obtenerEmpresaByRUC('00000000000');
  //   // console.log('valueeeeeeeeeeee', Object.entries(value).length, value);
  //   // let long  = Object.entries(value).length;
  //   // expect(long).toEqual(0);

  //   // // car = {type:"Fiat", model:"500", color:"white"};
  //   // // car = [];
  //   // // console.log(Object.entries(car).length);
  // });
  // it('Probando expect igual a cero', async () => {
  //   expect(0).toEqual(0);
  // });



  // it('Probando Detalle de venta', () => {
  //   let itemVenta: ItemDeVentaInterface = {
  //     producto: {
  //       categoria: 'petshop',
  //       nombre: 'tomatodo tooby',
  //       cantStock: 0,
  //       descripcionProducto: 'podrás reclamar por comprar mayores de s/200',
  //       precio: 15,
  //       subCategoria: 'accesorios',
  //       codigoBarra: '720',
  //       cantidad: 1,
  //       medida: 'Unidad',
  //       sede: 'Andahuaylas',
  //       id: 'ODb7OK7xKF0EVcJJSZKa'
  //     },
  //     idProducto: 'ODb7OK7xKF0EVcJJSZKa',
  //     cantidad: 1,
  //     montoNeto: 15,
  //     descuentoProducto: 0,
  //     porcentajeDescuento: 0,
  //     totalxprod: 15
  //   };

  //   console.log(service.formatearDetalleVenta(itemVenta));

  //   itemVenta = {
  //     producto: {
  //       cantidad: 1,
  //       codigoBarra: '1093',
  //       sede: 'Andahuaylas',
  //       categoria: 'petshop',
  //       descripcionProducto: 'se aplica el impuesto como parte de la ley N° 30884',
  //       nombre: 'impuesto bolsa plastica',
  //       subCategoria: 'accesorios',
  //       cantStock: 10,
  //       medida: 'Unidad',
  //       precio: 0.2,
  //       id: 'W8Ax2qXj0pfxXec5vbqv'
  //     },
  //     idProducto: 'W8Ax2qXj0pfxXec5vbqv',
  //     cantidad: 8,
  //     montoNeto: 1.6,
  //     descuentoProducto: 0,
  //     porcentajeDescuento: 0,
  //     totalxprod: 1.6
  //   };
  //   console.log(service.formatearDetalleVenta(itemVenta));

  // });
  // it('Probando Formatear detalles de venta', () => {
  //   const listaItemsDeVenta: ItemDeVentaInterface[] = [];

  //   listaItemsDeVenta.push({
  //     producto: {
  //       cantidad: 1,
  //       codigoBarra: '1093',
  //       sede: 'Andahuaylas',
  //       categoria: 'petshop',
  //       descripcionProducto: 'se aplica el impuesto como parte de la ley N° 30884',
  //       nombre: 'impuesto bolsa plastica',
  //       subCategoria: 'accesorios',
  //       cantStock: 10,
  //       medida: 'Unidad',
  //       precio: 0.2,
  //       id: 'W8Ax2qXj0pfxXec5vbqv'
  //     },
  //     idProducto: 'W8Ax2qXj0pfxXec5vbqv',
  //     cantidad: 8,
  //     montoNeto: 1.6,
  //     descuentoProducto: 0,
  //     porcentajeDescuento: 0,
  //     totalxprod: 1.6
  //   });
  //   listaItemsDeVenta.push({
  //     producto: {
  //       categoria: 'petshop',
  //       descripcionProducto: 'CORBATA RAZA PEQUEÑA ,MEDIDA DE CUELLO 43CM Y LARGO DE CORBATA DE 13 CM',
  //       cantStock: 0,
  //       cantidad: 1,
  //       subCategoria: 'accesorios',
  //       codigoBarra: '818',
  //       sede: 'Andahuaylas',
  //       medida: 'Unidad',
  //       precio: 10,
  //       nombre: 'corbata macho',
  //       id: 'lZH6EaDTgdsQkwBLDFnP'
  //     },
  //     idProducto: 'lZH6EaDTgdsQkwBLDFnP',
  //     cantidad: 2,
  //     montoNeto: 20,
  //     descuentoProducto: 0,
  //     porcentajeDescuento: 0,
  //     totalxprod: 20
  //   });
  //   listaItemsDeVenta.push({
  //     producto: {
  //       sede: 'Andahuaylas',
  //       cantidad: 1,
  //       subCategoria: 'accesorios',
  //       medida: 'Unidad',
  //       nombre: 'dni tooby',
  //       descripcionProducto: 'TE PERMITE ACCEDER A PROMOCIONES, DESCUENTOS Y REGALOS',
  //       precio: 15,
  //       codigoBarra: '726',
  //       cantStock: 0,
  //       categoria: 'petshop',
  //       id: 'pQiWkPrrINzXgfIAWNfT'
  //     },
  //     idProducto: 'pQiWkPrrINzXgfIAWNfT',
  //     cantidad: 3,
  //     montoNeto: 45,
  //     descuentoProducto: 0,
  //     porcentajeDescuento: 0,
  //     totalxprod: 45
  //   });
  //   service.formatearDetalles(listaItemsDeVenta);
  //   // console.log(service.formatearDetalleVenta(listaItemsDeVenta));
  // });
  it('', () => {
    const venta: VentaInterface = {
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
      numeroComprobante: '11'
    };

    console.log(service.formatearVenta(venta));

  });




});
