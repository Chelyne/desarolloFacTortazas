import { TestBed } from '@angular/core/testing';

import { SpliPaneService } from './spli-pane.service';

describe('SpliPaneService', () => {
  let service: SpliPaneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpliPaneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
