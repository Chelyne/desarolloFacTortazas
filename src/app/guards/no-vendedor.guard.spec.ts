import { TestBed } from '@angular/core/testing';

import { NoVendedorGuard } from './no-vendedor.guard';

describe('NoVendedorGuard', () => {
  let guard: NoVendedorGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NoVendedorGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
