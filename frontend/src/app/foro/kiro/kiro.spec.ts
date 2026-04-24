import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kiro } from './kiro';

describe('Kiro', () => {
  let component: Kiro;
  let fixture: ComponentFixture<Kiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kiro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kiro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
