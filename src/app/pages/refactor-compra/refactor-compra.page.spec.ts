import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefactorCompraPage } from './refactor-compra.page';

describe('RefactorCompraPage', () => {
  let component: RefactorCompraPage;
  let fixture: ComponentFixture<RefactorCompraPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefactorCompraPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefactorCompraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
