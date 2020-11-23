import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IngresoEgresoModalPage } from './ingreso-egreso-modal.page';

describe('IngresoEgresoModalPage', () => {
  let component: IngresoEgresoModalPage;
  let fixture: ComponentFixture<IngresoEgresoModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoEgresoModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IngresoEgresoModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
