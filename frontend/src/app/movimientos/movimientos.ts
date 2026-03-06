import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Interfaces alineadas con BDD ──────────────────────────────────────────────

export interface Movimiento {
  id: number;
  nombre: string;
  categoria: string;
  tipo: 'gasto' | 'ingreso';
  importe: number;
  fecha: Date;
  icono: string;
  descripcion?: string;   // campo nuevo (opcional)
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
  icono: string;
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

// ── Categorías obligatorias ───────────────────────────────────────────────────
export const CATEGORIAS_INGRESO = ['Sueldo', 'Capital (Alquileres)', 'Negocios y ventas', 'Otros'];
export const CATEGORIAS_GASTO = ['Ocio y vicios', 'Supervivencia', 'Cultura', 'Extras (imprevistos)'];

const ICONOS_INGRESO: Record<string, string> = {
  'Sueldo': '💼', 'Capital (Alquileres)': '🏠',
  'Negocios y ventas': '💹', 'Otros': '💰',
};
const ICONOS_GASTO: Record<string, string> = {
  'Ocio y vicios': '🎮', 'Supervivencia': '🛒',
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

  // ── Constantes ────────────────────────────────────────────────────
  readonly LIMITE_MENSUAL = 2000;
  readonly LIMITE_MENSUAL_FMT = '2.000,00 €';
  readonly diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  readonly graficaMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  readonly graficaDatos = [320, 580, 410, 760, 490, 870, 340, 620, 510, 780, 460, 900];
  readonly iconosDisponibles = ['🛒', '💼', '🎵', '🏠', '💻', '⛽', '🍕', '🏥', '✈️', '🎓', '💳', '🎮'];
  readonly iconosReto = ['🎯', '🚗', '🏠', '✈️', '💍', '🎮', '📱', '💻', '🎓', '🏋️', '🌴', '🐶'];

  readonly CATEGORIAS_INGRESO = CATEGORIAS_INGRESO;
  readonly CATEGORIAS_GASTO = CATEGORIAS_GASTO;

  // ── Menú ──────────────────────────────────────────────────────────
  menuActivo = signal('movimientos');
  subnavActivo = signal('Resumen');

  menuItems = [
    { id: 'academia', label: 'Academia' },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'perfil', label: 'Perfil' },
  ];
  subnavItems = ['Resumen', 'Movimientos', 'Calendario', 'Estadísticas', 'Retos'];

  setMenu(id: string) { this.menuActivo.set(id); }
  setSubnav(item: string) { this.subnavActivo.set(item); }

  // ── Movimientos ───────────────────────────────────────────────────
  private _movimientos = signal<Movimiento[]>([
    { id: 1, nombre: 'Nómina Marzo', categoria: 'Sueldo', tipo: 'ingreso', importe: 1800, fecha: new Date('2024-03-20T09:00:00'), icono: '💼' },
    { id: 2, nombre: 'Mercadona', categoria: 'Supervivencia', tipo: 'gasto', importe: 87.50, fecha: new Date('2024-03-20T10:32:00'), icono: '🛒' },
    { id: 3, nombre: 'Freelance web', categoria: 'Negocios y ventas', tipo: 'ingreso', importe: 350, fecha: new Date('2024-03-15T12:00:00'), icono: '💹' },
    { id: 4, nombre: 'Alquiler piso', categoria: 'Capital (Alquileres)', tipo: 'ingreso', importe: 400, fecha: new Date('2024-03-01T08:00:00'), icono: '🏠' },
    { id: 5, nombre: 'Spotify', categoria: 'Ocio y vicios', tipo: 'gasto', importe: 9.99, fecha: new Date('2024-03-19T18:00:00'), icono: '🎮' },
    { id: 6, nombre: 'Gasolina', categoria: 'Extras (imprevistos)', tipo: 'gasto', importe: 45, fecha: new Date('2024-03-18T17:30:00'), icono: '⚡' },
    { id: 7, nombre: 'Libro Angular', categoria: 'Cultura', tipo: 'gasto', importe: 32, fecha: new Date('2024-03-10T11:00:00'), icono: '🎓' },
    { id: 8, nombre: 'Alquiler local', categoria: 'Capital (Alquileres)', tipo: 'ingreso', importe: 550, fecha: new Date('2024-03-05T09:00:00'), icono: '🏠' },
  ]);

  private nextId = 20;

  // ── Filtro y orden movimientos ────────────────────────────────────
  filtroActivo = signal<'todos' | 'gasto' | 'ingreso'>('todos');
  ordenCol = signal<'nombre' | 'fecha' | 'importe'>('fecha');
  ordenAsc = signal(false);

  setFiltro(f: 'todos' | 'gasto' | 'ingreso') { this.filtroActivo.set(f); }

  ordenarPor(col: 'nombre' | 'fecha' | 'importe') {
    if (this.ordenCol() === col) this.ordenAsc.update(v => !v);
    else { this.ordenCol.set(col); this.ordenAsc.set(true); }
  }

  movimientosFiltrados = computed(() => {
    let lista = [...this._movimientos()];
    if (this.filtroActivo() !== 'todos')
      lista = lista.filter(m => m.tipo === this.filtroActivo());
    const col = this.ordenCol();
    const asc = this.ordenAsc();
    lista.sort((a, b) => {
      let va: any = a[col];
      let vb: any = b[col];
      if (col === 'fecha') { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return lista;
  });

  // ── Estadísticas ──────────────────────────────────────────────────
  totalGasto = computed(() =>
    this._movimientos().filter(m => m.tipo === 'gasto').reduce((a, m) => a + m.importe, 0)
  );
  totalIngreso = computed(() =>
    this._movimientos().filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.importe, 0)
  );
  saldoBanco = computed(() => this.totalIngreso() - this.totalGasto());
  limitePct = computed(() => Math.min((this.totalGasto() / this.LIMITE_MENSUAL) * 100, 100));
  limiteColor = computed(() => {
    const p = this.limitePct();
    if (p > 80) return 'linear-gradient(to right,#ff8a8a,#e74c3c)';
    if (p > 60) return 'linear-gradient(to right,#ffe28a,#f39c12)';
    return 'linear-gradient(to right,#B3E29A,#78C550)';
  });

  // ── Retos ─────────────────────────────────────────────────────────
  retos = signal<Reto[]>([
    {
      id: 1, activo: true, cumplido: false,
      cantidad: 25000, actual: 5000, duracion: 36,
      fechaInicio: new Date('2023-01-01'), fechaFinal: new Date('2026-01-01'),
      nombre: 'Comprar coche', icono: '🚗',
    },
    {
      id: 2, activo: false, cumplido: false,
      cantidad: 25000, actual: 351, duracion: 30,
      fechaInicio: new Date('2024-01-01'), fechaFinal: new Date('2026-06-01'),
      nombre: 'Fondo de boda', icono: '💍',
    },
    {
      id: 3, activo: false, cumplido: true,
      cantidad: 549, actual: 549, duracion: 11,
      fechaInicio: new Date('2024-01-15'), fechaFinal: new Date('2024-12-15'),
      nombre: 'PS5', icono: '🎮',
    },
    {
      id: 4, activo: false, cumplido: false,
      cantidad: 3000, actual: 1200, duracion: 13,
      fechaInicio: new Date('2024-06-01'), fechaFinal: new Date('2025-07-01'),
      nombre: 'Viaje a Japón', icono: '✈️',
    },
  ]);

  retoPct(reto: Reto): number { return Math.min((reto.actual / reto.cantidad) * 100, 100); }

  retoActivo = computed(() => this.retos().find(r => r.activo) ?? null);
  tieneRetoActivo = computed(() => this.retos().some(r => r.activo));

  retosHistorial = computed(() =>
    [...this.retos().filter(r => !r.activo)]
      .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
  );
  retosCumplidos = computed(() => this.retos().filter(r => r.cumplido));
  totalAhorradoRetos = computed(() => this.retos().reduce((sum, r) => sum + r.actual, 0));

  historialFiltroEstado = signal<'todos' | 'cumplido' | 'nocumplido'>('todos');
  historialOrdenCol = signal<'fechaInicio' | 'cantidad' | 'nombre'>('fechaInicio');
  historialOrdenAsc = signal(false);

  historialFiltrado = computed(() => {
    let lista = [...this.retosHistorial()];
    if (this.historialFiltroEstado() === 'cumplido')
      lista = lista.filter(r => r.cumplido);
    else if (this.historialFiltroEstado() === 'nocumplido')
      lista = lista.filter(r => !r.cumplido);
    const col = this.historialOrdenCol();
    const asc = this.historialOrdenAsc();
    lista.sort((a, b) => {
      let va: any = col === 'fechaInicio' ? new Date(a.fechaInicio).getTime()
        : col === 'cantidad' ? a.cantidad
          : a.nombre.toLowerCase();
      let vb: any = col === 'fechaInicio' ? new Date(b.fechaInicio).getTime()
        : col === 'cantidad' ? b.cantidad
          : b.nombre.toLowerCase();
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

  retosVista = signal<'activo' | 'historial'>('activo');

  // ── Modal nuevo reto ──────────────────────────────────────────────
  modalRetoAbierto = signal(false);
  nuevoReto = signal({
    nombre: '',
    icono: '🎯',
    cantidad: null as number | null,
    duracion: null as number | null,
  });

  abrirModalReto() {
    if (this.tieneRetoActivo()) {
      this.showToast('⚠️ Ya tienes un reto activo. Complétalo o abandónalo primero.');
      return;
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
      this.showToast('⚠️ Completa todos los campos');
      return;
    }
    const hoy = new Date();
    const fin = new Date(hoy);
    fin.setMonth(fin.getMonth() + r.duracion);
    this.retos.update(lista => [...lista, {
      id: this.nextId++,
      activo: true,
      cumplido: false,
      cantidad: r.cantidad!,
      actual: 0,
      duracion: r.duracion!,
      fechaInicio: hoy,
      fechaFinal: fin,
      nombre: r.nombre.trim(),
      icono: r.icono,
    }]);
    this.cerrarModalReto();
    this.showToast('✅ Reto creado. ¡Mucho ánimo!');
  }

  abandonarReto() {
    this.retos.update(lista => lista.map(r =>
      r.activo ? { ...r, activo: false } : r
    ));
    this.showToast('Reto abandonado y movido al historial');
  }

  // ── Calendario ────────────────────────────────────────────────────
  mesCalendario = signal(new Date());

  nombreMesCalendario = computed(() => {
    const d = this.mesCalendario();
    const n = d.toLocaleString('es-ES', { month: 'long' });
    return n.charAt(0).toUpperCase() + n.slice(1);
  });
  anioCalendario = computed(() => this.mesCalendario().getFullYear());

  diasDelMes = computed((): DiaCal[] => {
    const hoy = new Date();
    const fecha = this.mesCalendario();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const total = new Date(año, mes + 1, 0).getDate();
    const offset = (new Date(año, mes, 1).getDay() + 6) % 7;

    const movsMes = this._movimientos().filter(m => {
      const d = new Date(m.fecha);
      return d.getFullYear() === año && d.getMonth() === mes;
    });
    const diasConGasto = new Set(movsMes.filter(m => m.tipo === 'gasto').map(m => new Date(m.fecha).getDate()));
    const diasConIngreso = new Set(movsMes.filter(m => m.tipo === 'ingreso').map(m => new Date(m.fecha).getDate()));

    const dias: DiaCal[] = [];
    for (let i = 0; i < offset; i++)
      dias.push({ numero: 0, vacio: true, hoy: false, pasado: false, tieneMov: false, tieneGasto: false, tieneIngreso: false });
    for (let d = 1; d <= total; d++) {
      const esHoy = d === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();
      const esPasado = new Date(año, mes, d) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      dias.push({
        numero: d, vacio: false, hoy: esHoy, pasado: esPasado && !esHoy,
        tieneMov: diasConGasto.has(d) || diasConIngreso.has(d),
        tieneGasto: diasConGasto.has(d),
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

  // ── Modal calendario — con descripcion ───────────────────────────
  modalCalAbierto = signal(false);
  nuevoMovCal = signal({
    nombre: '',
    categoria: CATEGORIAS_GASTO[0],
    tipo: 'gasto' as 'gasto' | 'ingreso',
    importe: null as number | null,
    descripcion: '' as string,
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
    const m = this.nuevoMovCal();
    const dia = this.diaSeleccionado();
    if (!m.nombre.trim() || !m.importe || m.importe <= 0 || !dia) {
      this.showToast('⚠️ Completa todos los campos correctamente');
      return;
    }
    const iconMap = m.tipo === 'gasto' ? ICONOS_GASTO : ICONOS_INGRESO;
    const fecha = new Date(this.mesCalendario().getFullYear(), this.mesCalendario().getMonth(), dia, 12, 0, 0);
    this._movimientos.update(lista => [{
      id: this.nextId++, nombre: m.nombre.trim(), categoria: m.categoria,
      tipo: m.tipo, importe: m.importe!, fecha, icono: iconMap[m.categoria] ?? '💰',
      descripcion: m.descripcion ?? '',
    }, ...lista]);
    this.cerrarModalCal();
    this.showToast('✅ Movimiento añadido al calendario');
  }

  // ── Gráfica ───────────────────────────────────────────────────────
  mesGraficaIdx = signal(new Date().getMonth());
  mesGraficaLabel = computed(() => this.graficaMeses[this.mesGraficaIdx()] + ' 2024');
  maxGrafica = Math.max(...this.graficaDatos);
  alturaBarraPct(v: number): number { return Math.round((v / this.maxGrafica) * 100); }
  cambiarMesGrafica(dir: number) { this.mesGraficaIdx.update(i => (i + dir + 12) % 12); }

  // ── Modal nuevo movimiento — con descripcion ──────────────────────
  modalAbierto = signal(false);
  toastVisible = signal(false);
  toastMsg = signal('');

  nuevoMov = signal({
    nombre: '',
    categoria: CATEGORIAS_GASTO[0],
    tipo: 'gasto' as 'gasto' | 'ingreso',
    importe: null as number | null,
    icono: '🛒',
    descripcion: '' as string,
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
        u.icono = valor === 'gasto' ? '🛒' : '💼';
      }
      return u;
    });
  }
  guardarMovimiento() {
    const m = this.nuevoMov();
    if (!m.nombre.trim() || !m.importe || m.importe <= 0) {
      this.showToast('⚠️ Completa todos los campos correctamente');
      return;
    }
    this._movimientos.update(lista => [{
      id: this.nextId++, nombre: m.nombre.trim(), categoria: m.categoria,
      tipo: m.tipo, importe: m.importe!, fecha: new Date(), icono: m.icono,
      descripcion: m.descripcion ?? '',
    }, ...lista]);
    this.cerrarModal();
    this.showToast('✅ Movimiento añadido correctamente');
  }

  showToast(msg: string) {
    this.toastMsg.set(msg);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }

  ngOnInit() { }

  ultimosMovimientos = computed(() =>
    [...this._movimientos()]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 4)
  );

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

  tasaAhorro = computed(() => {
    const ing = this.totalIngreso();
    if (ing === 0) return 0;
    return ((ing - this.totalGasto()) / ing) * 100;
  });

  // ── Donut chart ───────────────────────────────────────────────────
  readonly DONUT_COLORS_GASTO = ['#e74c3c', '#f39c12', '#e67e22', '#c0392b'];
  readonly DONUT_COLORS_INGRESO = ['#27ae60', '#2ecc71', '#16a085', '#1abc9c'];

  donutSegments = computed(() => {
    const cats = this.gastosPorCategoria();
    const total = this.totalGasto();
    if (total === 0) return [];
    return this.buildDonutSegments(cats, total, this.DONUT_COLORS_GASTO);
  });

  donutSegmentsIngreso = computed(() => {
    const cats = this.ingresosPorCategoria();
    const total = this.totalIngreso();
    if (total === 0) return [];
    return this.buildDonutSegments(cats, total, this.DONUT_COLORS_INGRESO);
  });

  private buildDonutSegments(cats: { nombre: string; total: number }[], total: number, colors: string[]) {
    const cx = 80, cy = 80, r = 60, innerR = 38;
    let angle = -Math.PI / 2;
    return cats.map((cat, i) => {
      const pct = cat.total / total;
      const sweep = pct * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle + sweep), y2 = cy + r * Math.sin(angle + sweep);
      const ix1 = cx + innerR * Math.cos(angle), iy1 = cy + innerR * Math.sin(angle);
      const ix2 = cx + innerR * Math.cos(angle + sweep), iy2 = cy + innerR * Math.sin(angle + sweep);
      const large = sweep > Math.PI ? 1 : 0;
      const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
      angle += sweep;
      return { path, color: colors[i % colors.length], nombre: cat.nombre, pct: Math.round(pct * 100) };
    });
  }
}