import { TestBed } from '@angular/core/testing';

import { EditarCompraService } from './editar-compra.service';

describe('EditarCompraService', () => {
  let service: EditarCompraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditarCompraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
