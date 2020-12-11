import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IngresoEgresoGestorPage } from './ingreso-egreso-gestor.page';

describe('IngresoEgresoGestorPage', () => {
  let component: IngresoEgresoGestorPage;
  let fixture: ComponentFixture<IngresoEgresoGestorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoEgresoGestorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoEgresoGestorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
