import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IngresoEgresoPage } from './ingreso-egreso.page';

describe('IngresoEgresoPage', () => {
  let component: IngresoEgresoPage;
  let fixture: ComponentFixture<IngresoEgresoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoEgresoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoEgresoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
