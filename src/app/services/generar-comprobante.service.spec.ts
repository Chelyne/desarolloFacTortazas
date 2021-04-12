import { TestBed } from '@angular/core/testing';

import { GenerarComprobanteService } from './generar-comprobante.service';

describe('GenerarComprobanteService', () => {
  let service: GenerarComprobanteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenerarComprobanteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
