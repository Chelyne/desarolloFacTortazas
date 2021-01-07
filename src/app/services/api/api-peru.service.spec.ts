import { inject, TestBed  } from '@angular/core/testing';

import { ApiPeruService } from './api-peru.service';

// import 'jasmine-expect';
describe('ApiPeruService', () => {
  let service: ApiPeruService;

  beforeEach(() => {
    // TestBed.configureTestingModule({});
    // service = TestBed.inject(ApiPeruService);
    service = new ApiPeruService();
  });

  it('should be created', () => {
    // service = TestBed.inject(ApiPeruService);
    expect(service).toBeTruthy();
  });

  // beforeEach(inject([ApiPeruService], (service: ApiPeruService) => {
  //   apiPeru = service;
  // }));

  // it('should be defined', () => {
  //   expect(apiPeru).toBeTruthy();
  // });

  it('codigo de comprobante', () => {
    console.log('ssssssssssss');
    console.log(service.obtenerCodigoComprobante('factura'));
    console.log('ssssssssssss');
    // expect(service.obtenerCodigoComprobante('facturass')).toEqual('01');
    expect('hola').toEqual('hola');
  });
});


