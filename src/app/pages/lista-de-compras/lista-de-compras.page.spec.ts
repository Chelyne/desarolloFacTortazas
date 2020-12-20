import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListaDeComprasPage } from './lista-de-compras.page';

describe('ListaDeComprasPage', () => {
  let component: ListaDeComprasPage;
  let fixture: ComponentFixture<ListaDeComprasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaDeComprasPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaDeComprasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
