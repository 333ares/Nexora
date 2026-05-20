import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitarForo } from './visitar-foro';

describe('VisitarForo', () => {
  let component: VisitarForo;
  let fixture: ComponentFixture<VisitarForo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitarForo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitarForo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
