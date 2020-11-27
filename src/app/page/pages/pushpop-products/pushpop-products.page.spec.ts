import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PushpopProductsPage } from './pushpop-products.page';

describe('PushpopProductsPage', () => {
  let component: PushpopProductsPage;
  let fixture: ComponentFixture<PushpopProductsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PushpopProductsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PushpopProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
