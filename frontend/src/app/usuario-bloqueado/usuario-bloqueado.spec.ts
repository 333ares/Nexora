import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioBloqueado } from './usuario-bloqueado';

describe('UsuarioBloqueado', () => {
  let component: UsuarioBloqueado;
  let fixture: ComponentFixture<UsuarioBloqueado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioBloqueado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioBloqueado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
