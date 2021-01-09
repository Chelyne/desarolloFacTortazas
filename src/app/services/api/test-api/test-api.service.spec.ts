import { ExternalExpr } from '@angular/compiler';
import { TestBed } from '@angular/core/testing';

import { TestApiService } from './test-api.service';

describe('TestApiService', () => {
  let service: TestApiService;

  beforeEach(() => {
    // TestBed.configureTestingModule({
    //   providers:[TestApiService]
    // });
    // service = TestBed.inject(TestApiService);
    service = new TestApiService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('saludo', () => {
    expect(service.saludo()).toEqual('hola');
  });
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

  });



});
