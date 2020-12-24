import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DetallesDeCompraPage } from './detalles-de-compra.page';

describe('DetallesDeCompraPage', () => {
  let component: DetallesDeCompraPage;
  let fixture: ComponentFixture<DetallesDeCompraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetallesDeCompraPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallesDeCompraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
