import { TestBed } from '@angular/core/testing';

import { PaginationProductosService } from './pagination-productos.service';

describe('PaginationProductosService', () => {
  let service: PaginationProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
