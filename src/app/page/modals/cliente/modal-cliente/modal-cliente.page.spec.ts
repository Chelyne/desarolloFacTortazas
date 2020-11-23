import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalClientePage } from './modal-cliente.page';

describe('ModalClientePage', () => {
  let component: ModalClientePage;
  let fixture: ComponentFixture<ModalClientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalClientePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
