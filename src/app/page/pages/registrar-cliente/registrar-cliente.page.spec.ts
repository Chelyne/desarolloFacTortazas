import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RegistrarClientePage } from './registrar-cliente.page';

describe('RegistrarClientePage', () => {
  let component: RegistrarClientePage;
  let fixture: ComponentFixture<RegistrarClientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarClientePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
