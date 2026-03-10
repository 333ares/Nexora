import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ═══════════════════════════════════════════════════════════════════
//  INTERFACES — alineadas con la BDD
// ═══════════════════════════════════════════════════════════════════

export interface Movimiento {
  id: number;
  nombre: string;
  categoria: string;
  tipo: 'gasto' | 'ingreso';
  importe: number;
  fecha: Date;
  icono: string;          // derivado de categoria en frontend, no en BDD
  descripcion?: string;
}

export interface Reto {
  id: number;
  activo: boolean;
  cumplido: boolean;
  cantidad: number;
  fechaInicio: Date;
  fechaFinal: Date | null;
  duracion: number;
  nombre: string;
  icono: string;          // solo frontend
  actual: number;
}

export interface DiaCal {
  numero: number;
  vacio: boolean;
  hoy: boolean;
  pasado: boolean;
  tieneMov: boolean;
  tieneGasto: boolean;
  tieneIngreso: boolean;
}

// ═══════════════════════════════════════════════════════════════════
//  CATEGORÍAS — deben coincidir con los valores en BDD
// ═══════════════════════════════════════════════════════════════════
export const CATEGORIAS_INGRESO = ['Sueldo', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
export const CATEGORIAS_GASTO   = ['Ocio', 'Supervivencia', 'Cultura', 'Extras (imprevistos)'];

// Iconos derivados de categoría — solo UI, no van a BDD
const ICONOS_INGRESO: Record<string, string> = {
  'Sueldo': '💼', 'Capital (Alquileres)': '🏠',
  'Negocios y ventas': '💹', 'Otros': '💰',
};
const ICONOS_GASTO: Record<string, string> = {
  'Ocio': '🎮', 'Supervivencia': '🛒',
  'Cultura': '🎓', 'Extras (imprevistos)': '⚡',
};

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css'
})
export class Movimientos implements OnInit {

  // ── Constantes UI ─────────────────────────────────────────────────
  readonly Math               = Math;
  readonly LIMITE_MENSUAL     = 2000;           // TODO: traer de BDD
  readonly LIMITE_MENSUAL_FMT = '2.000,00 €';
  readonly diasSemana   = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly graficaMeses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  readonly graficaDatos = [0,0,0,0,0,0,0,0,0,0,0,0]; // TODO: traer de BDD
  readonly iconosReto   = ['🎯','🚗','🏠','✈️','💍','🎮','📱','💻','🎓','🏋️','🌴','🐶'];

  readonly CATEGORIAS_INGRESO = CATEGORIAS_INGRESO;
  readonly CATEGORIAS_GASTO   = CATEGORIAS_GASTO;

  // ── Navegación UI ────────────────────────────────────────────────
  menuActivo   = signal('movimientos');
  subnavActivo = signal('Resumen');
  menuItems    = [
    { id: 'academia',    label: 'Academia'    },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'perfil',      label: 'Perfil'      },
  ];
  subnavItems = ['Resumen', 'Movimientos', 'Calendario', 'Estadísticas', 'Retos'];

  setMenu(id: string)     { this.menuActivo.set(id); }
  setSubnav(item: string) { this.subnavActivo.set(item); }

  // ── Datos — se cargan desde BDD en ngOnInit ──────────────────────
  _movimientos = signal<Movimiento[]>([]);
  retos        = signal<Reto[]>([]);

  // ── Filtro y ordenación (UI) ──────────────────────────────────────
  filtroActivo = signal<'todos' | 'gasto' | 'ingreso'>('todos');
  ordenCol     = signal<'nombre' | 'fecha' | 'importe'>('fecha');
  ordenAsc     = signal(false);

  setFiltro(f: 'todos' | 'gasto' | 'ingreso') { this.filtroActivo.set(f); }
  ordenarPor(col: 'nombre' | 'fecha' | 'importe') {
    if (this.ordenCol() === col) this.ordenAsc.update(v => !v);
    else { this.ordenCol.set(col); this.ordenAsc.set(true); }
  }

  movimientosFiltrados = computed(() => {
    let lista = [...this._movimientos()];
    if (this.filtroActivo() !== 'todos') lista = lista.filter(m => m.tipo === this.filtroActivo());
    const col = this.ordenCol(); const asc = this.ordenAsc();
    lista.sort((a, b) => {
      let va: any = a[col]; let vb: any = b[col];
      if (col === 'fecha') { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return lista;
  });

  ultimosMovimientos = computed(() =>
    [...this._movimientos()]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 4)
  );

  // ── Estadísticas calculadas en frontend ───────────────────────────
  totalGasto = computed(() =>
    this._movimientos().filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.importe, 0)
  );
  totalIngreso = computed(() =>
    this._movimientos().filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.importe, 0)
  );
  saldoBanco  = computed(() => this.totalIngreso() - this.totalGasto());
  limitePct   = computed(() => Math.min((this.totalGasto() / this.LIMITE_MENSUAL) * 100, 100));
  limiteColor = computed(() => {
    const p = this.limitePct();
    if (p > 80) return 'linear-gradient(to right,#ff8a8a,#e74c3c)';
    if (p > 60) return 'linear-gradient(to right,#ffe28a,#f39c12)';
    return 'linear-gradient(to right,#B3E29A,#78C550)';
  });
  tasaAhorro = computed(() => {
    const ing = this.totalIngreso();
    return ing === 0 ? 0 : ((ing - this.totalGasto()) / ing) * 100;
  });
  gastosPorCategoria = computed(() => {
    const map = new Map<string, { nombre: string; icono: string; total: number }>();
    this._movimientos().filter(m => m.tipo === 'gasto').forEach(m => {
      if (map.has(m.categoria)) map.get(m.categoria)!.total += m.importe;
      else map.set(m.categoria, { nombre: m.categoria, icono: m.icono, total: m.importe });
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  });
  ingresosPorCategoria = computed(() => {
    const map = new Map<string, { nombre: string; icono: string; total: number }>();
    this._movimientos().filter(m => m.tipo === 'ingreso').forEach(m => {
      if (map.has(m.categoria)) map.get(m.categoria)!.total += m.importe;
      else map.set(m.categoria, { nombre: m.categoria, icono: m.icono, total: m.importe });
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  });

  // ── Modal nuevo movimiento ────────────────────────────────────────
  modalAbierto = signal(false);
  nuevoMov = signal({
    nombre: '', categoria: CATEGORIAS_GASTO[0],
    tipo: 'gasto' as 'gasto' | 'ingreso',
    importe: null as number | null,
    icono: '🛒', descripcion: '',
  });

  get categoriasActualesMov(): string[] {
    return this.nuevoMov().tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO;
  }

  abrirModal() { this.modalAbierto.set(true); }
  cerrarModal() {
    this.modalAbierto.set(false);
    this.nuevoMov.set({ nombre: '', categoria: CATEGORIAS_GASTO[0], tipo: 'gasto', importe: null, icono: '🛒', descripcion: '' });
  }
  actualizarNuevoMov(campo: string, valor: any) {
    this.nuevoMov.update(v => {
      const u = { ...v, [campo]: valor };
      if (campo === 'tipo') {
        u.categoria = valor === 'gasto' ? CATEGORIAS_GASTO[0] : CATEGORIAS_INGRESO[0];
        u.icono     = valor === 'gasto' ? '🛒' : '💼';
      }
      return u;
    });
  }
  guardarMovimiento() {
    const m = this.nuevoMov();
    if (!m.nombre.trim() || !m.importe || m.importe <= 0) {
      this.showToast('⚠️ Completa todos los campos correctamente'); return;
    }
    // TODO: movimientoService.create({ nombre, categoria, tipo, importe, fecha: new Date(), descripcion })
    //         .subscribe(nuevo => { this._movimientos.update(l => [nuevo, ...l]); this.cerrarModal(); });
    this.cerrarModal();
  }

  // ── Modal editar movimiento ───────────────────────────────────────
  modalEditarAbierto = signal(false);
  movEditar = signal<{
    id: number; nombre: string; categoria: string;
    tipo: 'gasto' | 'ingreso'; importe: number | null; descripcion: string;
  }>({ id: 0, nombre: '', categoria: CATEGORIAS_GASTO[0], tipo: 'gasto', importe: null, descripcion: '' });

  get categoriasEditarMov(): string[] {
    return this.movEditar().tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO;
  }

  abrirModalEditar(m: Movimiento) {
    this.movEditar.set({ id: m.id, nombre: m.nombre, categoria: m.categoria,
      tipo: m.tipo, importe: m.importe, descripcion: m.descripcion ?? '' });
    this.modalEditarAbierto.set(true);
  }
  cerrarModalEditar() { this.modalEditarAbierto.set(false); }
  actualizarMovEditar(campo: string, valor: any) {
    this.movEditar.update(v => {
      const u = { ...v, [campo]: valor };
      if (campo === 'tipo') u.categoria = valor === 'gasto' ? CATEGORIAS_GASTO[0] : CATEGORIAS_INGRESO[0];
      return u;
    });
  }
  guardarEdicion() {
    const e = this.movEditar();
    if (!e.nombre.trim() || !e.importe || e.importe <= 0) {
      this.showToast('⚠️ Completa todos los campos correctamente'); return;
    }
    // TODO: movimientoService.update(e.id, { nombre, categoria, tipo, importe, descripcion })
    //         .subscribe(actualizado => { this._movimientos.update(l => l.map(m => m.id === e.id ? actualizado : m)); this.cerrarModalEditar(); });
    this.cerrarModalEditar();
  }

  // ── Eliminar movimiento ───────────────────────────────────────────
  eliminarMovimiento(id: number) {
    // TODO: movimientoService.delete(id)
    //         .subscribe(() => this._movimientos.update(l => l.filter(m => m.id !== id)));
  }

  // ── Retos ────────────────────────────────────────────────────────
  retoPct(reto: Reto): number { return Math.min((reto.actual / reto.cantidad) * 100, 100); }
  retoActivo      = computed(() => this.retos().find(r => r.activo) ?? null);
  tieneRetoActivo = computed(() => this.retos().some(r => r.activo));
  retosHistorial  = computed(() =>
    [...this.retos().filter(r => !r.activo)]
      .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
  );
  retosCumplidos     = computed(() => this.retos().filter(r => r.cumplido));
  totalAhorradoRetos = computed(() => this.retos().reduce((s, r) => s + r.actual, 0));

  // Filtros historial (UI)
  historialFiltroEstado = signal<'todos' | 'cumplido' | 'nocumplido'>('todos');
  historialOrdenCol     = signal<'fechaInicio' | 'cantidad' | 'nombre'>('fechaInicio');
  historialOrdenAsc     = signal(false);
  retosVista            = signal<'activo' | 'historial'>('activo');

  historialFiltrado = computed(() => {
    let lista = [...this.retosHistorial()];
    if (this.historialFiltroEstado() === 'cumplido')   lista = lista.filter(r => r.cumplido);
    if (this.historialFiltroEstado() === 'nocumplido') lista = lista.filter(r => !r.cumplido);
    const col = this.historialOrdenCol(); const asc = this.historialOrdenAsc();
    lista.sort((a, b) => {
      const va: any = col === 'fechaInicio' ? new Date(a.fechaInicio).getTime() : col === 'cantidad' ? a.cantidad : a.nombre.toLowerCase();
      const vb: any = col === 'fechaInicio' ? new Date(b.fechaInicio).getTime() : col === 'cantidad' ? b.cantidad : b.nombre.toLowerCase();
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return lista;
  });

  ordenarHistorialPor(col: 'fechaInicio' | 'cantidad' | 'nombre') {
    if (this.historialOrdenCol() === col) this.historialOrdenAsc.update(v => !v);
    else { this.historialOrdenCol.set(col); this.historialOrdenAsc.set(true); }
  }

  // ── Modal nuevo reto ──────────────────────────────────────────────
  modalRetoAbierto = signal(false);
  nuevoReto = signal({ nombre: '', icono: '🎯', cantidad: null as number | null, duracion: null as number | null });

  abrirModalReto() {
    if (this.tieneRetoActivo()) {
      this.showToast('⚠️ Ya tienes un reto activo. Complétalo o abandónalo primero.'); return;
    }
    this.modalRetoAbierto.set(true);
  }
  cerrarModalReto() {
    this.modalRetoAbierto.set(false);
    this.nuevoReto.set({ nombre: '', icono: '🎯', cantidad: null, duracion: null });
  }
  actualizarNuevoReto(campo: string, valor: any) {
    this.nuevoReto.update(v => ({ ...v, [campo]: valor }));
  }
  guardarReto() {
    const r = this.nuevoReto();
    if (!r.nombre.trim() || !r.cantidad || r.cantidad <= 0 || !r.duracion || r.duracion <= 0) {
      this.showToast('⚠️ Completa todos los campos'); return;
    }
    // TODO: retosService.create({ nombre, icono, cantidad, duracion: Math.floor(r.duracion) })
    //         .subscribe(nuevo => { this.retos.update(l => [...l, nuevo]); this.cerrarModalReto(); });
    this.cerrarModalReto();
  }

  abandonarReto() {
    // TODO: retosService.abandonar(this.retoActivo()!.id)
    //         .subscribe(() => this.retos.update(l => l.map(r => r.activo ? { ...r, activo: false } : r)));
  }

  // ════════════════════════════════════════════════════════════════════
  //  CALENDARIO — lógica UI completa (se mantiene)
  //  Los movimientos del día se obtienen de _movimientos (cargado desde BDD)
  // ════════════════════════════════════════════════════════════════════
  mesCalendario = signal(new Date());

  nombreMesCalendario = computed(() => {
    const n = this.mesCalendario().toLocaleString('es-ES', { month: 'long' });
    return n.charAt(0).toUpperCase() + n.slice(1);
  });
  anioCalendario = computed(() => this.mesCalendario().getFullYear());

  diasDelMes = computed((): DiaCal[] => {
    const hoy   = new Date();
    const fecha = this.mesCalendario();
    const año   = fecha.getFullYear();
    const mes   = fecha.getMonth();
    const total  = new Date(año, mes + 1, 0).getDate();
    const offset = (new Date(año, mes, 1).getDay() + 6) % 7;

    const movsMes = this._movimientos().filter(m => {
      const d = new Date(m.fecha);
      return d.getFullYear() === año && d.getMonth() === mes;
    });
    const diasConGasto   = new Set(movsMes.filter(m => m.tipo === 'gasto').map(m => new Date(m.fecha).getDate()));
    const diasConIngreso = new Set(movsMes.filter(m => m.tipo === 'ingreso').map(m => new Date(m.fecha).getDate()));

    const dias: DiaCal[] = [];
    for (let i = 0; i < offset; i++)
      dias.push({ numero: 0, vacio: true, hoy: false, pasado: false, tieneMov: false, tieneGasto: false, tieneIngreso: false });
    for (let d = 1; d <= total; d++) {
      const esHoy    = d === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
      const esPasado = new Date(año, mes, d) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      dias.push({
        numero: d, vacio: false, hoy: esHoy, pasado: esPasado && !esHoy,
        tieneMov:    diasConGasto.has(d) || diasConIngreso.has(d),
        tieneGasto:  diasConGasto.has(d),
        tieneIngreso: diasConIngreso.has(d),
      });
    }
    return dias;
  });

  cambiarMes(dir: number) {
    const d = new Date(this.mesCalendario());
    d.setMonth(d.getMonth() + dir);
    this.mesCalendario.set(d);
  }

  diaSeleccionado = signal<number | null>(null);
  seleccionarDia(dia: number) { this.diaSeleccionado.set(dia); }

  movimientosDia = computed(() => {
    const dia = this.diaSeleccionado();
    if (!dia) return [];
    const año = this.mesCalendario().getFullYear();
    const mes = this.mesCalendario().getMonth();
    return this._movimientos().filter(m => {
      const d = new Date(m.fecha);
      return d.getDate() === dia && d.getMonth() === mes && d.getFullYear() === año;
    });
  });

  // ── Modal calendario ──────────────────────────────────────────────
  modalCalAbierto = signal(false);
  nuevoMovCal = signal({
    nombre: '', categoria: CATEGORIAS_GASTO[0],
    tipo: 'gasto' as 'gasto' | 'ingreso',
    importe: null as number | null,
    descripcion: '',
  });

  get categoriasActualesCal(): string[] {
    return this.nuevoMovCal().tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO;
  }

  abrirModalCal() {
    this.nuevoMovCal.set({ nombre: '', categoria: CATEGORIAS_GASTO[0], tipo: 'gasto', importe: null, descripcion: '' });
    this.modalCalAbierto.set(true);
  }
  cerrarModalCal() { this.modalCalAbierto.set(false); }
  actualizarMovCal(campo: string, valor: any) {
    this.nuevoMovCal.update(v => {
      const u = { ...v, [campo]: valor };
      if (campo === 'tipo') u.categoria = valor === 'gasto' ? CATEGORIAS_GASTO[0] : CATEGORIAS_INGRESO[0];
      return u;
    });
  }
  guardarMovimientoCal() {
    const m   = this.nuevoMovCal();
    const dia = this.diaSeleccionado();
    if (!m.nombre.trim() || !m.importe || m.importe <= 0 || !dia) {
      this.showToast('⚠️ Completa todos los campos correctamente'); return;
    }
    const fecha = new Date(this.mesCalendario().getFullYear(), this.mesCalendario().getMonth(), dia, 12, 0, 0);
    // TODO: movimientoService.create({ nombre, categoria, tipo, importe, fecha, descripcion })
    //         .subscribe(nuevo => { this._movimientos.update(l => [nuevo, ...l]); this.cerrarModalCal(); });
    this.cerrarModalCal();
  }

  // ── Gráfica (UI) ──────────────────────────────────────────────────
  mesGraficaIdx   = signal(new Date().getMonth());
  mesGraficaLabel = computed(() => this.graficaMeses[this.mesGraficaIdx()] + ' ' + new Date().getFullYear());
  maxGrafica      = Math.max(...this.graficaDatos, 1);
  alturaBarraPct(v: number): number { return Math.round((v / this.maxGrafica) * 100); }
  cambiarMesGrafica(dir: number) { this.mesGraficaIdx.update(i => (i + dir + 12) % 12); }

  // ── Toast (UI) ────────────────────────────────────────────────────
  toastVisible = signal(false);
  toastMsg     = signal('');
  showToast(msg: string) {
    this.toastMsg.set(msg);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }

  // ── Donut chart (calculado desde _movimientos) ────────────────────
  readonly DONUT_COLORS_GASTO   = ['#e74c3c','#f39c12','#e67e22','#c0392b'];
  readonly DONUT_COLORS_INGRESO = ['#27ae60','#2ecc71','#16a085','#1abc9c'];

  donutSegments = computed(() => {
    const cats = this.gastosPorCategoria(); const total = this.totalGasto();
    return total === 0 ? [] : this.buildDonutSegments(cats, total, this.DONUT_COLORS_GASTO);
  });
  donutSegmentsIngreso = computed(() => {
    const cats = this.ingresosPorCategoria(); const total = this.totalIngreso();
    return total === 0 ? [] : this.buildDonutSegments(cats, total, this.DONUT_COLORS_INGRESO);
  });
  private buildDonutSegments(cats: { nombre: string; total: number }[], total: number, colors: string[]) {
    const cx = 80, cy = 80, r = 60, innerR = 38; let angle = -Math.PI / 2;
    return cats.map((cat, i) => {
      const pct = cat.total / total; const sweep = pct * 2 * Math.PI;
      const x1 = cx+r*Math.cos(angle),       y1 = cy+r*Math.sin(angle);
      const x2 = cx+r*Math.cos(angle+sweep), y2 = cy+r*Math.sin(angle+sweep);
      const ix1 = cx+innerR*Math.cos(angle),       iy1 = cy+innerR*Math.sin(angle);
      const ix2 = cx+innerR*Math.cos(angle+sweep), iy2 = cy+innerR*Math.sin(angle+sweep);
      const large = sweep > Math.PI ? 1 : 0;
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
      angle += sweep;
      return { path, color: colors[i % colors.length], nombre: cat.nombre, pct: Math.round(pct * 100) };
    });
  }

  ngOnInit() {
    // TODO: cargar datos desde los servicios:
    // this.movimientoService.getAll().subscribe(data => this._movimientos.set(data));
    // this.retosService.getAll().subscribe(data => this.retos.set(data));
  }
}