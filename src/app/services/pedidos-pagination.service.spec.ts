import { TestBed } from '@angular/core/testing';

import { PedidosPaginationService } from './pedidos-pagination.service';

describe('PedidosPaginationService', () => {
  let service: PedidosPaginationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidosPaginationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
