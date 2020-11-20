import { TestBed } from '@angular/core/testing';

import { RegistrarClienteService } from './registrar-cliente.service';

describe('RegistrarClienteService', () => {
  let service: RegistrarClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrarClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
