import { TestBed } from '@angular/core/testing';

import { UserRegistroService } from './user-registro.service';

describe('UserRegistroService', () => {
  let service: UserRegistroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRegistroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


