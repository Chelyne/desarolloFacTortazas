import { TestBed  } from '@angular/core/testing';
import { StorageService } from '../storage.service';

import { ApiPeruService } from './api-peru.service';
// import 'jasmine-expect';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { apiPeruConfig as apiPeruMock} from './apiPeruConfig.test';
import { GENERAL_CONFIG as apiPeruFuncinal} from '../../../config/generalConfig';
import { CDRAnuladoInteface, VentaInterface } from 'src/app/models/venta/venta';
import { CDRInterface } from 'src/app/models/api-peru/cdr-interface';
import * as source from './source.test';

import { validarElementos, isObjsEqual, isObjsEqual2 } from 'src/app/global/custom-matchers';

import { DataBaseService } from '../data-base.service';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { formatearDateTime } from 'src/app/global/funciones-globales';
import { ContadorDeSerieInterface } from 'src/app/models/serie';
import { ChangeInterface } from 'src/app/models/comprobante/comprobante';


class MockStorageService {
    datosAdmi = {sede: 'andahuaylas'};
    saludo() {
      return 'hola';
    }
}

let TOKEN_APIS_PERU_USER = '';
let ENVIROMENT_ACTUAL = '';

describe('description', () => {

  let service: ApiPeruService;
  let dataApi: DataBaseService;

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
    dataApi = TestBed.inject(DataBaseService);
    service.setApiPeruConfig(apiPeruMock);
  });


  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
  xit('test saludo', () => {
    expect('hola').toEqual(service.saludo());
  });
  xit('test getSede', () => {
    expect('andahuaylas').toEqual(service.getSede());
  });
  xit('probar setApiPeruTest', () => {
    service.setApiPeruConfig(apiPeruFuncinal);
  });
  /** NOTE - Todos los test se realizan en estado beta con el usuario HZ */
  xit('Test apiPeruLogin', async () => {
    TOKEN_APIS_PERU_USER = await service.login();
    expect(validarElementos(TOKEN_APIS_PERU_USER, ['token'])).toBeTrue();
  });
  xit('Test cambiarEnviroment', async () => {
    let enviromentA = await service.obtenerEnviroment();
    let enviromentB = await service.toggleEnviromentEmpresa();
    let esperado = enviromentA === 'beta' ? 'produccion' : 'beta';
    ENVIROMENT_ACTUAL = enviromentB;
    expect(esperado).toBe(enviromentB);

    if (ENVIROMENT_ACTUAL === 'produccion'){
      enviromentA = await service.obtenerEnviroment();
      enviromentB = await service.toggleEnviromentEmpresa();
      esperado = enviromentA === 'beta' ? 'produccion' : 'beta';
      ENVIROMENT_ACTUAL = enviromentB;
      expect(esperado).toBe(enviromentB);
    }

    console.log('ENVOMENTE ACTUAL ', ENVIROMENT_ACTUAL);
  });
  xit('verificar que ventas default existan', async () => {
    /** NOTE - DRY */
    const sede = 'andahuaylas';
    const fecha = '27-01-2021';

    /** VENTA MODELO POR DEFECTO */
    let idVenta = source.ventaPorDefecto.idVenta;
    let idListaVenta = source.ventaPorDefecto.idListaProductos;
    let ventaDefaul = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
    let listProducDefaul: ItemDeVentaInterface[] = await dataApi.obtenerProductosDeVenta(idListaVenta, sede);

    console.log('VENTA SIN BOLSA', ventaDefaul, listProducDefaul);
    if (!Object.entries(ventaDefaul).length){
      await dataApi.guardarVentaPorId(sede, '27-01-2021', source.ventaPorDefecto);
    }
    if (!listProducDefaul.length){
      await dataApi.guardarProductosDeVentaPorId(sede, source.listaProductosDefecto);
    }

    /** VENTA MODELO POR DEFECTO CON BOLSA */
    idVenta = source.ventaPorDefectoConBolsa.idVenta;
    idListaVenta = source.ventaPorDefecto.idListaProductos;
    ventaDefaul = await dataApi.obtenerVentasPorId(sede, '27-01-2021', idVenta);
    listProducDefaul = await dataApi.obtenerProductosDeVenta(idListaVenta, sede);
    console.log('VENTA CON BOLSA', ventaDefaul, listProducDefaul);

    if (!Object.entries(ventaDefaul).length){
      await dataApi.guardarVentaPorId(sede, '27-01-2021', source.ventaPorDefectoConBolsa);
    }
    if (!listProducDefaul.length){
      await dataApi.guardarProductosDeVentaPorId(sede, source.listaProductosDefectoConBolsa);
    }
  });

  // it('Test EnviarComprobante a Sunat General', async () => {
  //   console.log('-----------------------Enviar venta a sunat por pasos-----------------------');
  //   await service.enviarASunatAdaptador(source.ventaSinProductosYSinCDR)
  // .then( exito => console.log(exito)).catch( err => console.log(err));
  // });
  // it('Test EnviarNotaDeCredito', async () => {
  //   console.log('-----------------------Enviar venta a sunat por pasos-----------------------');
  //   await service.enviarNotaDeCreditoAdaptador(source.ventaSinProductosConCDR).
  //   then( exito => console.log(exito)).catch( err => console.log(err));
  // });

  describe('TEST FORMATEAR VENTA', () => {
    let ventaMock: VentaInterface;
    let ventaMockConBolsa: VentaInterface;

    beforeAll( () => {
      ventaMock = JSON.parse(JSON.stringify(source.ventaPorDefecto));
      ventaMock.listaItemsDeVenta = source.listaProductosDefecto.productos;

      ventaMockConBolsa = JSON.parse(JSON.stringify(source.ventaPorDefectoConBolsa));
      ventaMockConBolsa.listaItemsDeVenta = source.listaProductosDefectoConBolsa.productos;
    });

    it('test formatear detalle de venta', async () => {
      const detalle = source.listaProductosDefecto.productos[0];

      let target = JSON.parse(JSON.stringify(detalle));
      delete target.cantidad;
      expect(() => service.formatearDetalleVenta(target)).toThrow('ITEM DE VENTA INCONSISTENTE, CANTIDA O PU_VENTA NO DEFINIDO');

      target = JSON.parse(JSON.stringify(detalle));
      delete target.producto.precio;
      expect(() => service.formatearDetalleVenta(target)).toThrow('ITEM DE VENTA INCONSISTENTE, CANTIDA O PU_VENTA NO DEFINIDO');

      target = JSON.parse(JSON.stringify(detalle));
      target.medida = 'unidad';
      target.precio = 5;
      target.factor = 1;
      const atributtes = [
        'cantidad', 'descripcion', 'igv', 'mtoBaseIgv',
        'mtoPrecioUnitario', 'mtoValorUnitario', 'mtoValorVenta',
         'porcentajeIgv', 'tipAfeIgv', 'totalImpuestos', 'unidad'
      ];
      expect(validarElementos(service.formatearDetalleVenta(target), atributtes)).toBeTrue();
    });
    it('Test obtener codigo de comprobante', async () => {
      expect(service.obtenerCodigoComprobante('boleta')).toEqual('03');
      expect(service.obtenerCodigoComprobante('factura')).toEqual('01');
      expect(() => service.obtenerCodigoComprobante('')).toThrow('TYPO COMPROBANTE INVALID');
    });
    it('Test formatearFecha', () => {
      let fecha = ventaMock.fechaEmision;
      expect(formatearDateTime('DD-MM-YYYY HH:mm:ss', fecha)).toBe('27-01-2021 14:04:53');

      fecha = ventaMockConBolsa.fechaEmision;
      expect(formatearDateTime('DD-MM-YYYY HH:mm:ss', fecha)).toBe('27-01-2021 13:20:35');
    });
    it('test obtener codigoTipoDocumento', () => {
      expect(service.ObtenerCodigoTipoDoc('dni')).toEqual('1');
      expect(service.ObtenerCodigoTipoDoc('ruc')).toEqual('6');
      expect(() => service.ObtenerCodigoTipoDoc('')).toThrow('TYPO DE DOCUMENTO DEL CLIENTE INVALIDO');
    });
    it('test formatear cliente', () => {
      const cliente = ventaMock.cliente;
      const atributtes = ['tipoDoc', 'numDoc', 'rznSocial', 'address', 'email', 'telephone' ];

      let targetClient = JSON.parse(JSON.stringify(cliente));
      delete targetClient.numDoc;
      expect(() => service.formatearCliente(targetClient)).toThrow('NO EXISTE EL NUMERO DE DOCUMENTO DEL CLIENTE');
      expect(validarElementos(service.formatearCliente(cliente), atributtes)).toBeTrue();

      /** cliente con atributos incompletos */
      targetClient = JSON.parse(JSON.stringify(cliente));
      delete targetClient.email;
      delete targetClient.celular;
      expect(validarElementos(service.formatearCliente(targetClient), atributtes)).toBeTrue();
    });
    it('test formatear empresa', async () => {
      const atributos = ['ruc', 'razonSocial', 'nombreComercial', 'address', 'email', 'telephone'];
      const datosEmpresa = {
        ruc: '20722440881',
        razon_social: 'EMPRESA DE EJEMPLO E.I.R.L',
        nombreComercial: 'EMPRESA DE EJEMPLO',
        telefono: '955555555',
        email: 'emailEmpresa@gmail.com'
      };
      const direccion = {
        ubigueo: '030201',
        direccion : 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS',
        codigoPais: 'PE',
        departamento: 'APURIMAC',
        provincia: 'ANDAHUAYLAS',
        distrito: 'ANDAHUAYLAS'
      };

      expect(validarElementos(service.formatearEmpresa(datosEmpresa, direccion), atributos)).toBeTrue();

      const targetEmpresa = JSON.parse(JSON.stringify(datosEmpresa));
      delete targetEmpresa.ruc;
      expect(() => service.formatearEmpresa(targetEmpresa, direccion)).toThrow('NO EXISTE RUC DE LA EMPRESA');
    });
    it('Test DetalleDeBolsaGratuita', async () => {
      const expectDetail = {
        // codProducto: 'P002',
        unidad: 'NIU',
        descripcion: 'BOLSA DE PLASTICO',
        cantidad: 2,
        mtoValorUnitario: 0,
        mtoValorGratuito: 0.05,
        mtoValorVenta: 0.1,
        mtoBaseIgv: 0.1,
        porcentajeIgv: 18,
        igv: 0.02,
        tipAfeIgv: '13',
        factorIcbper: 0.3,
        icbper: 0.6,
        totalImpuestos: 0.62
      };

      expect(isObjsEqual(service.obtenerDetalleBolsaGratuita(2), expectDetail)).toBeTrue();
    });
    it('formatear venta', async () => {
      ventaMock.listaItemsDeVenta = service.agregarVariantesAItemVenta(ventaMock.listaItemsDeVenta);
      ventaMockConBolsa.listaItemsDeVenta = service.agregarVariantesAItemVenta(ventaMockConBolsa.listaItemsDeVenta);
      let targetVenta: VentaInterface;
      const atributos = [
        'ublVersion', 'tipoOperacion', 'tipoDoc', 'serie', 'correlativo',
        'fechaEmision', 'tipoMoneda', 'client', 'company', 'mtoOperGravadas',
        'mtoIGV', 'totalImpuestos', 'valorVenta', 'mtoImpVenta',
        'subTotal', 'formaPago', 'details', 'legends'
      ];

      /** si la venta no tiene itemsDeVenta */
      expect(() => service.intentarFormatearVenta(source.ventaPorDefecto)).toThrow('VENTA INCONSISTE, NO EXISTE ITEMS DE VENTA');

      /** la venta debe tener total pagarVenta */
      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.totalPagarVenta;
      expect(() => service.intentarFormatearVenta(targetVenta)).toThrow('VENTA INCONSISTENTE, TOTAL PAGAR VENTA NO DEFINIDO');

      /** la serie y el numero de comprobante deben existir */
      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.serieComprobante;
      expect(() => service.intentarFormatearVenta(targetVenta)).toThrow('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.numeroComprobante;
      expect(() => service.intentarFormatearVenta(targetVenta)).toThrow('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');

      /** test ventaSinBolsa */
      console.log('VENTA FORMATEADA SIN BOLSA', service.intentarFormatearVenta(ventaMock));
      expect(validarElementos(service.intentarFormatearVenta(ventaMock), atributos)).toBeTrue();

      expect(isObjsEqual2(service.intentarFormatearVenta(ventaMock), source.ventaDefaultFormateada)).toBeTrue();

      /** Test ventaConBolsa */
      atributos.push('mtoOperGratuitas', 'mtoIGVGratuitas', 'icbper');
      console.log('VENTA FORMATEADA CON BOLSA', service.intentarFormatearVenta(ventaMockConBolsa));
      expect(validarElementos(service.intentarFormatearVenta(ventaMockConBolsa), atributos)).toBeTrue();

      expect(isObjsEqual2(service.intentarFormatearVenta(ventaMockConBolsa), source.ventaDefaultFormateadaBolsa)).toBeTrue();

    });
  });

  describe('TEST FORMATEAR NOTA DE CREDITO', () => {
    /** NOTE - DRY */
    let ventaMock: VentaInterface;
    let ventaMockConBolsa: VentaInterface;

    beforeAll( () => {
      ventaMock = JSON.parse(JSON.stringify(source.ventaPorDefecto));
      ventaMock.listaItemsDeVenta = source.listaProductosDefecto.productos;

      ventaMockConBolsa = JSON.parse(JSON.stringify(source.ventaPorDefectoConBolsa));
      ventaMockConBolsa.listaItemsDeVenta = source.listaProductosDefectoConBolsa.productos;
    });


    it('formatear nota de credito', async () => {
      let targetVenta: VentaInterface;
      let ventaEsperada: VentaInterface;
      const serieMock = {serie: 'BC01', correlacion: 4};
      const atributos = [
        'ublVersion', 'tipoDoc', 'serie', 'correlativo', 'fechaEmision',
        'tipDocAfectado', 'numDocfectado', 'codMotivo', 'desMotivo', 'tipoMoneda',
        'client', 'company', 'mtoOperGravadas', 'mtoIGV', 'totalImpuestos',
        'mtoImpVenta', 'subTotal', 'details', 'legends'
      ];

      /** si la venta no tiene itemsDeVenta */
      expect(() => service.intentarFormatearNotaDeCredito(source.ventaPorDefecto, serieMock)).toThrow('VENTA INCONSISTE, NO EXISTE ITEMS DE VENTA');

      /** la venta debe tener total pagarVenta */
      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.totalPagarVenta;
      expect(() => service.intentarFormatearNotaDeCredito(targetVenta, serieMock)).toThrow('VENTA INCONSISTENTE, TOTAL PAGAR VENTA NO DEFINIDO');

      /** la serie y el numero de comprobante deben existir */
      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.serieComprobante;
      expect(() => service.intentarFormatearNotaDeCredito(targetVenta, serieMock)).toThrow('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.numeroComprobante;
      expect(() => service.intentarFormatearNotaDeCredito(targetVenta, serieMock)).toThrow('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');

      /** test ventaSinBolsa */
      console.log('NOTA DE CREDITO FORMATEADA SIN BOLSA', service.intentarFormatearNotaDeCredito(ventaMock, serieMock));

      let ventaFormat = service.intentarFormatearNotaDeCredito(ventaMock, serieMock);
      ventaEsperada = JSON.parse(JSON.stringify(source.notaCreditoDftlFormateada));
      ventaEsperada.fechaEmision = ventaFormat.fechaEmision;
      expect(validarElementos(ventaFormat, atributos)).toBeTrue();

      expect(isObjsEqual2(ventaFormat, ventaEsperada)).toBeTrue();

      /** Test ventaConBolsa */
      console.log('NOTA DE CREDITO FORMATEADA CON BOLSA', service.intentarFormatearNotaDeCredito(ventaMockConBolsa, serieMock));
      ventaFormat = service.intentarFormatearNotaDeCredito(ventaMockConBolsa, serieMock);
      ventaEsperada = JSON.parse(JSON.stringify(source.notaCreditoDftlBolssaFormateada));
      ventaEsperada.fechaEmision = ventaFormat.fechaEmision;
      atributos.push('mtoOperGratuitas', 'icbper');
      expect(validarElementos(ventaFormat, atributos)).toBeTrue();

      expect(isObjsEqual2(ventaFormat, ventaEsperada)).toBeTrue();

    });
  });

  describe('ENVIAR COMPROBANTE A SUNAT', () => {
    /** NOTE - DRY */
    let ventaMock: VentaInterface;
    let ventaMockConBolsa: VentaInterface;
    let serieInicial: any|ContadorDeSerieInterface;

    beforeAll( () => {
      ventaMock = JSON.parse(JSON.stringify(source.ventaPorDefecto));
      ventaMock.listaItemsDeVenta = source.listaProductosDefecto.productos;

      ventaMockConBolsa = JSON.parse(JSON.stringify(source.ventaPorDefectoConBolsa));
      ventaMockConBolsa.listaItemsDeVenta = source.listaProductosDefectoConBolsa.productos;
    });

    it('Test Obtener ProductosDeVenta', async () => {
      /** se obtiene como resultado: [] */
      expect((await service.obtenerProductosDeVenta('')).length).toEqual(0);
      expect((await service.obtenerProductosDeVenta('sdfsdf')).length).toEqual(0);

      /** se obtiene como resultado: ItemDeVentaInterface[] */
      expect((await service.obtenerProductosDeVenta('UYnfoQbRBiV6O7UbRrN5')).length).toEqual(4);
      expect((await service.obtenerProductosDeVenta('YR1evM6WAiIgNs6EzgUa')).length).toEqual(6);
    });

    it('ENVIAR COMPROBANTE: BOLETA O FACTURA', async () => {

      let targetVenta: VentaInterface;

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.idVenta;
      await expectAsync(service.enviarASunatAdaptador(targetVenta)).toBeRejectedWith('Venta sin ID o IDlistaProductos');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      delete targetVenta.idListaProductos;
      await expectAsync(service.enviarASunatAdaptador(targetVenta)).toBeRejectedWith('Venta sin ID o IDlistaProductos');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      targetVenta.idListaProductos = 'id_invalid';
      await expectAsync(service.enviarASunatAdaptador(targetVenta)).toBeRejectedWith(`no se encontro productos por idListaProductos: id_invalid`);

      /** Enviar venta a sunat sin bolsa */
      console.log('%cENVIAR VENTA A SUNAT: %cSIN BOLSA', 'color:white; background-color:green', 'color:white; background-color:blue');
      await expectAsync(service.enviarASunatAdaptador(ventaMock)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});

      /** Enviar venta a sunat con bolsa */
      console.log('%cENVIAR VENTA A SUNAT: %cCON BOLSA', 'color:white; background-color:green', 'color:white; background-color:blue');
      await expectAsync(service.enviarASunatAdaptador(ventaMockConBolsa))
      .toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});

    });

    it('ENVIAR NOTA DE CREDITO', async () => {

      let targetVenta: VentaInterface;
      const cdrMock: CDRInterface = {sunatResponse: {success: true}};
      let serieMock: CDRAnuladoInteface;
      serieMock = {serie: 'BC01', correlacion: 8};

      await expectAsync(service.enviarNotaDeCreditoAdaptador(ventaMock)).toBeRejectedWith('El comprobante: B001-73, aun no ha sido enviado a SUNAT');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      targetVenta.cdr = cdrMock;
      delete targetVenta.idVenta;
      await expectAsync(service.enviarNotaDeCreditoAdaptador(targetVenta)).toBeRejectedWith('Venta sin ID o IDlistaProductos');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      targetVenta.cdr = cdrMock;
      delete targetVenta.idListaProductos;
      await expectAsync(service.enviarNotaDeCreditoAdaptador(targetVenta)).toBeRejectedWith('Venta sin ID o IDlistaProductos');

      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      targetVenta.cdr = cdrMock;
      targetVenta.idListaProductos = 'id_invalid';
      await expectAsync(service.enviarNotaDeCreditoAdaptador(targetVenta)).toBeRejectedWith(`no se encontro productos por idListaProductos: id_invalid`);

      /** Enviar venta a sunat sin bolsa */
      console.log('%cENVIAR NOTA DE CREDITO A SUNAT: %cSIN BOLSA', 'color:white; background-color:green', 'color:white; background-color:blue');
      targetVenta = JSON.parse(JSON.stringify(ventaMock));
      targetVenta.cdr = cdrMock;
      targetVenta.cdrAnulado = serieMock;
      // await service.enviarNotaDeCreditoAdaptador(targetVenta).
      // then( exito => console.log('EXITO_ENVIO_SUNAT', exito)).catch( err => console.log('ERROR_ENVIO_SUNAT', err));

      await expectAsync(service.enviarNotaDeCreditoAdaptador(targetVenta)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});

      /** Enviar venta a sunat con bolsa */
      console.log('%cENVIAR NOTA DE CREDITO A SUNAT: %cCON BOLSA', 'color:white; background-color:green', 'color:white; background-color:blue');
      targetVenta = JSON.parse(JSON.stringify(ventaMockConBolsa));
      targetVenta.cdr = cdrMock;
      targetVenta.cdrAnulado = {serie: 'BC01', correlacion: 9};
      // await service.enviarNotaDeCreditoAdaptador(targetVenta).
      // then( exito => console.log('EXITO_ENVIO_SUNAT', exito)).catch( err => console.log('ERROR_ENVIO_SUNAT', err));

      await expectAsync(service.enviarNotaDeCreditoAdaptador(targetVenta)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});

    });

    it('TEST REAL > ENVIAR COMPROBANTE Y NOTA DE CREDITO', async () => {
      const sede = 'andahuaylas';
      const fecha = '27-01-2021';
      let ventaTarget: VentaInterface;

      /** ANTES DE ENVIAR LAS NOTAS DE CREDITO SE GUARDA LA SERIE INICIAL */
      serieInicial = await service.obtenerSerie('n.credito.boleta').catch(() => 'fail');
      console.log('%cSerieInicial', 'color:white; background-color: #ff00f2', serieInicial);

      /** VENTA MODELO CON BOLSA */
      let idVenta = ventaMock.idVenta;
      ventaTarget = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
      delete ventaTarget.cdr;
      delete ventaTarget.cdrAnulado;
      await dataApi.guardarVentaPorId(sede, fecha, ventaTarget);
      // ? ENVIAR LA VENTA A SUANAT
      ventaTarget = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
      await expectAsync(service.enviarASunatAdaptador(ventaTarget)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});
      // ? ENVIAR NOTA DE CREDITO A SUNAT
      ventaTarget = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
      await expectAsync(service.enviarNotaDeCreditoAdaptador(ventaTarget)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});


      /** VENTA MODELO sin BOLSA */
      idVenta = ventaMockConBolsa.idVenta;
      ventaTarget = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
      delete ventaTarget.cdr;
      delete ventaTarget.cdrAnulado;
      await dataApi.guardarVentaPorId(sede, fecha, ventaTarget);
      // ? ENVIAR LA VENTA A SUANAT
      ventaTarget = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
      await expectAsync(service.enviarASunatAdaptador(ventaTarget)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});
      // ? ENVIAR NOTA DE CREDITO A SUNAT
      ventaTarget = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
      await expectAsync(service.enviarNotaDeCreditoAdaptador(ventaTarget)).toBeResolvedTo({success: true, observaciones: [], typoObs: 'notes'});
    });
    it('TEST obtenerserie', async () => {
      await expectAsync(service.obtenerSerie('n.crediiito.boleta')).toBeRejectedWith(`NO SE ENCONTRO SERIE EN BASEDATOS`);
    });
    it('RESETEAR EL ESTADO DE LA SERIE AL ESTADO INICIAL: ', async () => {
      const serieFinal: any| ContadorDeSerieInterface = await service.obtenerSerie('n.credito.boleta').catch(() => 'fail');
      console.log('%cSerieInicial', 'color:white;background-color: #ff00f2', serieInicial);
      console.log('%cSerieInicial', 'color:white;background-color: #ff00f2', serieFinal);



      await dataApi.actualizarCorrelacion(serieInicial.id, 'andahuaylas', serieFinal.correlacion - 2);
      // const serieInicialFinal = await service.obtenerSerie('n.credito.boleta').catch(() => 'fail');
      console.log('%cSerieActual', 'color:white;background-color: #ff00f2',  await service.obtenerSerie('n.credito.boleta').catch(() => 'fail'));


      await expectAsync(service.obtenerSerie('n.credito.boleta')).toBeResolvedTo(serieInicial);


      // console.log('SERIE, ', serieActual);
      // serieActual =


      /** obtener serieActual */
    });
  });

  it('venta prueba a obtener', async () => {
    let idVenta = 'p2HAkpSESAsE6JJBAyAv';
    let idListaVenta = 'KXkoDwL0bYuyxxRhPBiZ';
    let sede = 'andahuaylas';
    let fecha = '10-04-2021';

    /** VENTA MODELO POR DEFECTO */
    let ventaDefaul = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
    let listProducDefaul: ItemDeVentaInterface[] = await dataApi.obtenerProductosDeVenta(idListaVenta, sede);

    console.log('%-------------------------------------', 'color:white;background-color:black');
    console.log('VENTA ORIGINAL', ventaDefaul, 'ITEMS DE VENTA', listProducDefaul);

    /** ----------------------------------------------------------------------------------------------- */
    /** ----------------------------------------------------------------------------------------------- */

    idVenta = 'tOyFdXj9Q4nY96vvtHaj';
    idListaVenta = 'INg4agDYfsKkB6bqYlwj';
    sede = 'andahuaylas';
    fecha = '13-04-2021';

    /** VENTA MODELO POR DEFECTO */
    ventaDefaul = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
    listProducDefaul = await dataApi.obtenerProductosDeVenta(idListaVenta, sede);

    console.log('%-------------------------------------', 'color:white;background-color:black');
    console.log('VENTA ORIGINAL', ventaDefaul, 'ITEMS DE VENTA', listProducDefaul);

    /** ----------------------------------------------------------------------------------------------- */
    /** ----------------------------------------------------------------------------------------------- */

    idVenta = 'fzmwhA5vzd4n9KjlT8x2';
    idListaVenta = 'OctOk0J9LJb42QcMIkm9';
    sede = 'andahuaylas';
    fecha = '13-04-2021';

    /** VENTA MODELO POR DEFECTO */
    ventaDefaul = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
    listProducDefaul = await dataApi.obtenerProductosDeVenta(idListaVenta, sede);

    console.log('%-------------------------------------', 'color:white;background-color:black');
    console.log('VENTA ORIGINAL', ventaDefaul, 'ITEMS DE VENTA', listProducDefaul);

    /** ----------------------------------------------------------------------------------------------- */
    /** ----------------------------------------------------------------------------------------------- */

    idVenta = 'mOJKcf5Pe0a8NTX9Gaad';
    idListaVenta = 'uHWzkTqBoQGfVaW0Dl3u';
    sede = 'andahuaylas';
    fecha = '13-04-2021';

    /** VENTA MODELO POR DEFECTO */
    ventaDefaul = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
    listProducDefaul = await dataApi.obtenerProductosDeVenta(idListaVenta, sede);

    console.log('%-------------------------------------', 'color:white;background-color:black');
    console.log('VENTA ORIGINAL', ventaDefaul, 'ITEMS DE VENTA', listProducDefaul);

  });

  it('venta con descuento global', async () => {
    const ventaConDescuento: VentaInterface = {
      idVenta: 'tOyFdXj9Q4nY96vvtHaj',
      estadoVenta: 'anulado',
      vendedor: {
        token: 'token laptop',
        celular: '910426974',
        id: 'nerio@gmail.com',
        rol: 'administrador',
        sede: 'Andahuaylas',
        nombre: 'Nerio',
        dni: '70148737',
        foto: null,
        password: 'nerio123',
        correo: 'nerio@gmail.com',
        apellidos: 'Cañari Huarcaya'
      },
      montoBase: 10.16949152542373,
      idListaProductos: 'INg4agDYfsKkB6bqYlwj',
      bolsa: false,
      cantidadBolsa: 0,
      totalPagarVenta: 12,
      numeroComprobante: '2728',
      fechaEmision: {
        seconds: 1618337323,
        nanoseconds: 510000000
      },
      cliente: {
        celular: '999999999',
        numDoc: '00000000',
        tipoDoc: 'dni',
        nombre: 'cliente varios',
        direccion: 'jr. prueba',
        id: '5FwjPZ7ClHegWoQqOQzN',
        email: 'cliente@gmail.com'
      },
      igv: 1.8305084745762699,
      montoNeto: 15,
      descuentoVenta: 3,
      tipoComprobante: 'boleta',
      tipoPago: 'efectivo',
      montoPagado: 12,
      serieComprobante: 'B001'
    };

    const listaItemsDeVenta: ItemDeVentaInterface[] = [
      {
        porcentajeDescuento: 0,
        descuentoProducto: 0,
        idProducto: 'ebXferOtr0qmMbjhRcTv',
        montoNeto: 15,
        cantidad: 1,
        factor: 1,
        medida: 'unidad',
        precio: 34,
        producto: {
          id: 'ebXferOtr0qmMbjhRcTv',
          medida: 'Unidad',
          cantStock: 8,
          codigo: '344',
          categoria: 'petshop',
          codigoBarra: null,
          precio: 15,
          nombre: 'pechera nacional t2',
          sede: 'Andahuaylas',
          cantidad: 1,
          subCategoria: 'pecheras',
          arrayNombre: [
            'pechera',
            'nacional',
            't2'
          ]
        },
        totalxprod: 15
      }
    ];

    ventaConDescuento.listaItemsDeVenta = listaItemsDeVenta;

    const ventaFormateada = service.intentarFormatearVenta(ventaConDescuento);
    console.log('venta Formateada', ventaFormateada);

    const descuentos: ChangeInterface[] = [
      {
        codTipo: '02',
        montoBase: 3,
        factor: 1,
        monto: 3
      }
      ];
    ventaFormateada.descuentos = descuentos;

    const cdr = await service.enviarComprobanteASunat(ventaFormateada);
    console.log('CDR DE VENTA CON DESCUENTO', cdr);

    const notaDeCreditoFormateada = await service.intentarFormatearNotaDeCredito(ventaConDescuento, {serie: 'BC01', correlacion: 4});
    console.log('nota de credito formateada', notaDeCreditoFormateada);

    notaDeCreditoFormateada.descuentos = descuentos;
    const cdrAnulado = await service.enviarNotaCreditoASunat(notaDeCreditoFormateada);
    console.log('CDR DE NOTA DE CREDITO', cdrAnulado);
  });
  xit('OBTENER UNA VENTA Y SUS PRODUCTOS ', async () => {
    const sede = 'andahuaylas';
    const fecha = '25-04-2021';
    const idVenta = 'xn4yLrPNTToqJRTFnuUp';
    const idListaProductos = 'OFR6dx3nvhwFtAwRYgpW';


    /** obtener venta */
    let ventaDefaul: VentaInterface = await dataApi.obtenerVentasPorId(sede, fecha, idVenta);
    let listProducDefaul: ItemDeVentaInterface[] = await dataApi.obtenerProductosDeVenta(idListaProductos, sede);
    console.log(ventaDefaul, listProducDefaul);
    /** obtener producotos */

    ventaDefaul.listaItemsDeVenta = listProducDefaul;

    const ventaFormateada = await service.intentarFormatearVenta(ventaDefaul);
    console.log('%cVenta FORMATEADA', 'color:white;background-color:purple', ventaFormateada);

    const cdr = await service.enviarComprobanteASunat(ventaFormateada);
    console.log('CDR DE VENTA CON DESCUENTO', cdr);

  });


  it('Test de obtener medida', () => {
    expect(service.ObtenerCodigoMedida('botellas')).toEqual('BO');
    expect(service.ObtenerCodigoMedida('cajas')).toEqual('BX');
    expect(service.ObtenerCodigoMedida('docena')).toEqual('DZN');
    expect(service.ObtenerCodigoMedida('gramos')).toEqual('GRM');
    expect(service.ObtenerCodigoMedida('juego')).toEqual('SET');
    expect(service.ObtenerCodigoMedida('kilogramos')).toEqual('KGM');
    expect(service.ObtenerCodigoMedida('kit')).toEqual('KT');
    expect(service.ObtenerCodigoMedida('libras')).toEqual('LBR');
    expect(service.ObtenerCodigoMedida('litros')).toEqual('LTR');
    expect(service.ObtenerCodigoMedida('metros')).toEqual('MTR');
    expect(service.ObtenerCodigoMedida('miligramos')).toEqual('MGM');
    expect(service.ObtenerCodigoMedida('mililitros')).toEqual('MLT');
    expect(service.ObtenerCodigoMedida('milimetros')).toEqual('MMT');
    expect(service.ObtenerCodigoMedida('onzas')).toEqual('ONZ');
    expect(service.ObtenerCodigoMedida('pies')).toEqual('FOT');
    expect(service.ObtenerCodigoMedida('piezas')).toEqual('C62');
    expect(service.ObtenerCodigoMedida('pulgadas')).toEqual('INH');
    expect(service.ObtenerCodigoMedida('unidad')).toEqual('NIU');
    expect(service.ObtenerCodigoMedida('ciento de unidades')).toEqual('CEN');
    expect(service.ObtenerCodigoMedida('balde')).toEqual('BJ');
    expect(service.ObtenerCodigoMedida('barriles')).toEqual('BLL');
    expect(service.ObtenerCodigoMedida('bolsas')).toEqual('BG');
    expect(service.ObtenerCodigoMedida('cartones')).toEqual('CT');
    expect(service.ObtenerCodigoMedida('centimetro cuadrado')).toEqual('CMK');
    expect(service.ObtenerCodigoMedida('latas')).toEqual('CA');
    expect(service.ObtenerCodigoMedida('metro cuadrado')).toEqual('MTK');
    expect(service.ObtenerCodigoMedida('milimetro cuadrado')).toEqual('MMK');
    expect(service.ObtenerCodigoMedida('paquetes')).toEqual('PK');
    expect(service.ObtenerCodigoMedida('par')).toEqual('PR');
    expect(service.ObtenerCodigoMedida('servicios')).toEqual('ZZ');
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
});
