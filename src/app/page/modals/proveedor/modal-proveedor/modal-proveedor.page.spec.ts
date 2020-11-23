import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalProveedorPage } from './modal-proveedor.page';

describe('ModalProveedorPage', () => {
  let component: ModalProveedorPage;
  let fixture: ComponentFixture<ModalProveedorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalProveedorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalProveedorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
