import { TestBed } from '@angular/core/testing';

import { BoletasFacturasService } from './boletas-facturas.service';

describe('BoletasFacturasService', () => {
  let service: BoletasFacturasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoletasFacturasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
