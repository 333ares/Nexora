import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleForo } from './detalle-foro';

describe('DetalleForo', () => {
  let component: DetalleForo;
  let fixture: ComponentFixture<DetalleForo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleForo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleForo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
