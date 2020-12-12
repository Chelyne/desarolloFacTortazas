import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AbrirCerrarCajaPage } from './abrir-cerrar-caja.page';

describe('AbrirCerrarCajaPage', () => {
  let component: AbrirCerrarCajaPage;
  let fixture: ComponentFixture<AbrirCerrarCajaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbrirCerrarCajaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AbrirCerrarCajaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
