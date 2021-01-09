import { ComponentFixture, inject, TestBed  } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { DbDataService } from '../db-data.service';
import { StorageService } from '../storage.service';

import { ApiPeruService } from './api-peru.service';
// import 'jasmine-expect';



// describe('Service: My: TestBed', () => {
//   let service = ApiPeruService;
//   let component = DbDataService;
//   let storage = StorageService;
//   let fixture: ComponentFixture<DbDataService>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [ApiPeruService],
//       declarations: [DbDataService, StorageService]
//     });

//     // service = TestBed.get(ApiPeruService);
//     // fixture = TestBed.createComponent(ApiPeruService);
//     // // service = fixture.componentInstance;
//     // service = TestBed.get(ApiPeruService);
//     fixture = TestBed.createComponent(DbDataService);

//     // get test component from the fixture
//     // component = fixture.componentInstance;

//     // UserService provided to the TestBed
//     service = TestBed.get(ApiPeruService);
//   });

//   it('should create an instance', () => {
//     console.log('aaaaaaaaaaaaaaaaaaa');
//     expect(service).toBeDefined();
//   });
// });

// describe('ApiPeruService', () => {
//   let afs = AngularFirestore;
//   let dataApi = DbDataService;
//   let storage = StorageService;

//   let service: ApiPeruService;

//   beforeEach(() => {
//     // TestBed.configureTestingModule({});
//     // service = TestBed.inject(ApiPeruService);
//     let afs = new AngularFirestore();
//     let dataApi = new DbDataService();
//     let storage = new StorageService();
//     service = new ApiPeruService(dataApi(afs), storage);
//   });

//   it('should be created', () => {
//     // service = TestBed.inject(ApiPeruService);

//     expect(service).toBeTruthy();
//   });

//   // beforeEach(inject([ApiPeruService], (service: ApiPeruService) => {
//   //   apiPeru = service; 
//   // }));

//   // it('should be defined', () => {
//   //   expect(apiPeru).toBeTruthy();
//   // });

//   it('codigo de comprobante', () => {
//     console.log('ssssssssssss');
//     console.log(service.obtenerCodigoComprobante('factura'));
//     console.log('ssssssssssss');
//     // expect(service.obtenerCodigoComprobante('facturass')).toEqual('01');
//     expect('hola').toEqual('hola');
//   });
// });


