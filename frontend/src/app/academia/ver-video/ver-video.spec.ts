import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerVideo } from './ver-video';

describe('VerVideo', () => {
  let component: VerVideo;
  let fixture: ComponentFixture<VerVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerVideo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
