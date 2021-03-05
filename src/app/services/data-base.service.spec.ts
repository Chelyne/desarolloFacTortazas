import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';

import { DataBaseService } from './data-base.service';

describe('DataBaseService', () => {
  let service: DataBaseService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule
      ],
      declarations: [ ],
      providers: [
        // BuscadorService,
        // { provide: StorageService, useClass: MockStorageService}
      ]
    });

    service = TestBed.inject(DataBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  // it('borrado', () => {
  //   expect('hola').toEqual(service.saludo());
  // });
  // it('test obtener produtos', () => {
  //   console.log('probando...');
  //   service.ObtenerListaProductos('andahuaylas').subscribe(datos => {
  //     console.log(datos);
  //   });
  // });
});
