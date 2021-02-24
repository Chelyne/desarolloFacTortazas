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
    expect(-1).toEqual(service.isFullStringoOrNamber('asdfvsgsdf'));
    expect(1).toEqual(service.isFullStringoOrNamber('1234534534'));
    expect(0).toEqual(service.isFullStringoOrNamber('sdfusdl234234'));
    expect(0).toEqual(service.isFullStringoOrNamber('sdfusdl234234'));
    expect(0).toEqual(service.isFullStringoOrNamber('1ddl234234sdf'));
  });
  // it('TestSearch final', () => {
  //   // service.search('alcohol pads');
  //   // service.search('alimento H');
  //   // service.busqudaPorCodigoProductoExacto('168');
  //   // service.busqudaPorCodigoProductoExacto('39');

  //   service.busquedaPorCodigoProductoP('39');
  //   service.busquedaPorNombreP('alpiste');
  //   service.busquedaPorCodigoBarraP("dsp'120");
  // });
  it('Test Search', async () => {
    // service.search('alimento H');
    // service.search('alpiste');
    // service.search('39');

    // service.search('69');
    // service.search('6914131911347');
    // service.search("dsp'120");
  });
  it('Test Search Final', async () => {
    // service.search('alimento H').then((searchResult) => console.log('searchR', searchResult));
    // service.search('alpiste').then((searchResult) => console.log('searchR', searchResult));
    // service.search('39').then((searchResult) => console.log('searchR', searchResult));

    // service.search('69').then((searchResult) => console.log('searchR', searchResult));
    service.search('6914131911347').then((searchResult) => console.log('searchR', searchResult));
    service.search("dsp'120").then((searchResult) => console.log('searchR', searchResult));

  });
});
