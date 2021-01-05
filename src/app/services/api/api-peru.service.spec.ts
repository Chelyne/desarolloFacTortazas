import { TestBed  } from '@angular/core/testing';

import { ApiPeruService } from './api-peru.service';
// import { matchersByName } from '@angular/core/jasmine-expect';
// import JasmineExpect  from 'jasmine-expect';
import 'jasmine-expect';
describe('ApiPeruService', () => {
  let service: ApiPeruService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiPeruService);
  });

  // it('should be created', () => {
  //   expect(service).toBeTruthy();
  // });
});

describe('test de venta', () => {
  it('caracteristicas de un venta', () => {
    const c = {a: 'a', b: 'b', c: 'c'};
    expect(c).toHaveMember('a');
    expect(c).toHaveMember('e');

    // const fixture = TestBed.createComponent(StartComponent);
    // const app = fixture.debugElement.componentInstance;
    // expect(app).toHaveMember('h');
    
  });
});


