import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerForo } from './ver-foro';

describe('VerForo', () => {
  let component: VerForo;
  let fixture: ComponentFixture<VerForo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerForo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerForo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
