import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Retos } from './retos';

describe('Retos', () => {
  let component: Retos;
  let fixture: ComponentFixture<Retos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Retos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Retos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
