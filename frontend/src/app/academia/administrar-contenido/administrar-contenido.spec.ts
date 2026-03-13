import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrarContenido } from './administrar-contenido';

describe('AdministrarContenido', () => {
  let component: AdministrarContenido;
  let fixture: ComponentFixture<AdministrarContenido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrarContenido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministrarContenido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
