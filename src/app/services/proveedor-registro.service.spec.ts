import { TestBed } from '@angular/core/testing';

import { ProveedorRegistroService } from './proveedor-registro.service';

describe('ProveedorRegistroService', () => {
  let service: ProveedorRegistroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProveedorRegistroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
