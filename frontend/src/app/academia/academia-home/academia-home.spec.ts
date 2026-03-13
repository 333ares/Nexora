import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademiaHome } from './academia-home';

describe('AcademiaHome', () => {
  let component: AcademiaHome;
  let fixture: ComponentFixture<AcademiaHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademiaHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademiaHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
