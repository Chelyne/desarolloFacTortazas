import { TestBed } from '@angular/core/testing';

import { BuscadorService } from './buscador.service';

/** Librerias para Fifestor */
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';

import { StorageService } from './storage.service';
import { isSyntheticPropertyOrListener } from '@angular/compiler/src/render3/util';
import { ExpectedConditions } from 'protractor';


class MockStorageService {
  datosAdmi = {sede: 'andahuaylas'};
  saludo() {
    return 'hola';
  }
}

describe('BuscadorService', () => {
  let service: BuscadorService;

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

    service = TestBed.inject(BuscadorService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('test Saludo', () => {
    expect(service.saludo()).toEqual('hola');
  });
  it('test Sede', () => {
    expect(service.getSede()).toEqual('andahuaylas');
  });
  // it('test Buscar productos', () => {
  //   // service.buscar('18');
  //   // service.buscar('pan');
  //   // service.busquedaPorNombrePromesa('atrayente');
  //   // service.busquedaPorNombre('alpiste');
  //   // service.busquedaPorCodigoProducto('39');
  //   service.probarBusquedas();
  // });
  it('Test is full string or number', () => {
    expect('allString').toEqual(service.isFullStringoOrNamber('asdfvsgsdf'));
    expect('allNumber').toEqual(service.isFullStringoOrNamber('1234534534'));
    expect('both').toEqual(service.isFullStringoOrNamber('sdfusdl234234'));
    expect('both').toEqual(service.isFullStringoOrNamber('sdfusdl234234'));
    expect('both').toEqual(service.isFullStringoOrNamber('1ddl234234sdf'));
  });
  it('Test pegs of search', async () => {
    // service.busqudaPorCodigoProductoExacto('168');
    // service.busqudaPorCodigoProductoExacto('39');

    // service.busquedaPorCodigoProductoP('39');
    // service.busquedaPorNombreP('alpiste');
    // service.busquedaPorCodigoBarraP("dsp'120");

    /** Busqueda de nombres por piezas */
    // service.buscarcuerpoP('cadena de oro'.split(' ')).then( data => console.log('Buscar cuerpo', data));
    // service.buscarcuerpoP('pechera chaleco'.split(' ')).then( data => console.log('pechera chaleco', data));
    // service.buscarcuerpoP('alpiste'.split(' ')).then( data => console.log('alpiste', data));
    // service.buscarcuerpoP('cadena de oro'.split(' ')); //.then( data => console.log('Buscar cuerpo',data));

    // service.busquedaPorNombreP('pechera chaleco').then( data => console.log('pechera chaleco', data));
    // service.busquedaPorNombreP('alpiste').then( data => console.log('alpiste', data));

  });
  it('Test Search', async () => {
    // service.search('alimento H');
    // service.search('alpiste');
    // service.search('39');

    // service.search('69');
    // service.search('6914131911347');
    // service.search("dsp'120");

    const a = [
      {id: '1'},
      {id: '2'},
      {id: '3'},
      {id: '4'},
      {id: '5'},
      {id: '6'},
      {id: '7'},
    ];
    const b = [
      {id: '1'},
      {id: '2'},
      {id: '3'},
      {id: '4'},
      {id: '5'},
      {id: '6'},
      {id: '8'},
      {id: '10'},
    ];

    console.log(service.unirArrayProductos(a, b));

  });
  it('Test Search Final', async () => {
    service.Buscar('alimento H').then((searchResult) => console.log('searchR', 'alimento H', searchResult));
    service.Buscar('alpiste').then((searchResult) => console.log('searchR', 'alpiste', searchResult));
    service.Buscar('39').then((searchResult) => console.log('searchR', '39', searchResult));
    service.Buscar('69').then((searchResult) => console.log('searchR', '69', searchResult));
    service.Buscar('3').then((searchResult) => console.log('searchR', '3', searchResult));
    service.Buscar('6914131911347').then((searchResult) => console.log('searchR', '6914131911347', searchResult));
    service.Buscar('dsp\'120').then((searchResult) => console.log('searchR', 'dsp\'120', searchResult));
    service.Buscar('').then((searchResult) => console.log('searchR', 'vacio', searchResult));
  });
});
