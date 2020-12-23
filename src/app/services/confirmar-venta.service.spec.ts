import { TestBed } from '@angular/core/testing';

import { ConfirmarVentaService } from './confirmar-venta.service';

describe('ConfirmarVentaService', () => {
  let service: ConfirmarVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmarVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
