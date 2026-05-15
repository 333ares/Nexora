import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarForos } from './listar-foros';

describe('ListarForos', () => {
  let component: ListarForos;
  let fixture: ComponentFixture<ListarForos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarForos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarForos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
