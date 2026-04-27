import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisPreguntas } from './mis-preguntas';

describe('MisPreguntas', () => {
  let component: MisPreguntas;
  let fixture: ComponentFixture<MisPreguntas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisPreguntas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisPreguntas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
