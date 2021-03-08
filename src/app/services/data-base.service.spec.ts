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
  it('obtener ingresos y egresos', () => {
    service.obtenerIngresoEgresoDia('andahuaylas', '05-03-2021').then(resp => {
      console.log(resp);
    });
  });
  it('obtener productos  sede', () => {
    service.obtenerListaProductosSinLIMITE('talavera').subscribe(resp => {
      console.log(resp);
    });
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

  it('Probar Incrementar stock', async () => {
    // service.incrementarStockProducto('01xo7jxVqGvd0AuLxGGL', 'andahuaylas', 3);
    service.incrementarStockProducto('algo', 'andahuaylas', 3).then( exito => {
      console.log('EXITO DE INCREMENTAR', exito);
    }).catch( err => {
      console.log('ERROR DE INCREMENTAR', err);
    });

    // service.incrementarStockProducto('01xo7jxVqGvd0AuLxGGL', 'andahuaylas', 3).then( exito => {
    //   console.log('EXITO DE INCREMENTAR', exito);
    // }).catch( err => {
    //   console.log('ERROR DE INCREMENTAR', err);
    // });
    service.decrementarStockProducto('01xo7jxVqGvd0AuLxGGL', 'andahuaylas', 10).then( exito => {
      console.log('EXITO DE INCREMENTAR', exito);
    }).catch( err => {
      console.log('ERROR DE INCREMENTAR', err);
    });

  });
});
