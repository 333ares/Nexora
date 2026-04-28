import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisForos } from './mis-foros';

describe('MisForos', () => {
  let component: MisForos;
  let fixture: ComponentFixture<MisForos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisForos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisForos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
