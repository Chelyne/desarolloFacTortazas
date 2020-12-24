import { TestBed } from '@angular/core/testing';

import { ExportarPDFService } from './exportar-pdf.service';

describe('ExportarPDFService', () => {
  let service: ExportarPDFService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportarPDFService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
