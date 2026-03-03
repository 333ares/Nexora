import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Movimiento {
  id: number;
  nombre: string;
  categoria: string;
  tipo: 'gasto' | 'ingreso';
  importe: number;
  fecha: Date;
  icono: string;
  estado: 'completado' | 'pendiente';
}

export interface Reto {
  id: number;
  nombre: string;
  icono: string;
  ahorroMensual: number;
  actual: number;
  meta: number;
}

export interface DiaCal {
  numero: number;
  vacio: boolean;
  hoy: boolean;
  pasado: boolean;
  tieneMov: boolean;
}

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
  readonly graficaMeses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  readonly graficaDatos = [320, 580, 410, 760, 490, 870, 340, 620, 510, 780, 460, 900];
  readonly iconosDisponibles = ['🛒','💼','🎵','🏠','💻','⛽','🍕','🏥','✈️','🎓','💳','🎮'];

  // ── Menú ──────────────────────────────────────────────────────────
  menuActivo = signal('movimientos');
  subnavActivo = signal('Resumen');

  menuItems = [
    { id: 'academia',    label: 'Academia'    },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'perfil',      label: 'Perfil'       },
  ];

  subnavItems = ['Resumen', 'Movimientos', 'Calendario', 'Estadísticas'];

  setMenu(id: string)    { this.menuActivo.set(id); }
  setSubnav(item: string){ this.subnavActivo.set(item); }

  // ── Movimientos ───────────────────────────────────────────────────
  private _movimientos = signal<Movimiento[]>([
    { id:1, nombre:'Nómina Marzo',   categoria:'Trabajo',       tipo:'ingreso', importe:1800,  fecha:new Date('2024-03-20T09:00:00'), icono:'💼', estado:'completado' },
    { id:2, nombre:'Mercadona',      categoria:'Supermercado',  tipo:'gasto',   importe:87.50, fecha:new Date('2024-03-20T10:32:00'), icono:'🛒', estado:'completado' },
    { id:3, nombre:'Freelance web',  categoria:'Trabajo',       tipo:'ingreso', importe:350,   fecha:new Date('2024-03-15T12:00:00'), icono:'💻', estado:'completado' },
    { id:4, nombre:'Alquiler',       categoria:'Vivienda',      tipo:'gasto',   importe:650,   fecha:new Date('2024-03-01T08:00:00'), icono:'🏠', estado:'completado' },
    { id:5, nombre:'Spotify',        categoria:'Suscripciones', tipo:'gasto',   importe:9.99,  fecha:new Date('2024-03-19T18:00:00'), icono:'🎵', estado:'completado' },
    { id:6, nombre:'Gasolina',       categoria:'Transporte',    tipo:'gasto',   importe:45,    fecha:new Date('2024-03-18T17:30:00'), icono:'⛽', estado:'pendiente'  },
  ]);

  private nextId = 10;

  // ── Filtro y orden ────────────────────────────────────────────────
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

  limitePct = computed(() =>
    Math.min((this.totalGasto() / this.LIMITE_MENSUAL) * 100, 100)
  );

  limiteColor = computed(() => {
    const p = this.limitePct();
    if (p > 80) return 'linear-gradient(to right,#ff8a8a,#e74c3c)';
    if (p > 60) return 'linear-gradient(to right,#ffe28a,#f39c12)';
    return 'linear-gradient(to right,#B3E29A,#78C550)';
  });

  // ── Retos ─────────────────────────────────────────────────────────
  retos = signal<Reto[]>([
    { id:1, nombre:'Comprar coche', icono:'🚗', ahorroMensual:100, actual:5000, meta:25000 },
    { id:2, nombre:'Fondo de boda', icono:'💍', ahorroMensual:100, actual:351,  meta:25000 },
    { id:3, nombre:'PS5',           icono:'🎮', ahorroMensual:50,  actual:320,  meta:549   },
  ]);

  retoPct(reto: Reto): number {
    return Math.min((reto.actual / reto.meta) * 100, 100);
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
    const hoy    = new Date();
    const fecha  = this.mesCalendario();
    const año    = fecha.getFullYear();
    const mes    = fecha.getMonth();
    const total  = new Date(año, mes + 1, 0).getDate();
    const offset = (new Date(año, mes, 1).getDay() + 6) % 7;

    // Días que tienen movimientos en este mes
    const diasConMov = new Set(
      this._movimientos()
        .map(m => { const d = new Date(m.fecha); return d.getFullYear()===año && d.getMonth()===mes ? d.getDate() : null; })
        .filter((d): d is number => d !== null)
    );

    const dias: DiaCal[] = [];
    for (let i = 0; i < offset; i++)
      dias.push({ numero:0, vacio:true, hoy:false, pasado:false, tieneMov:false });

    for (let d = 1; d <= total; d++) {
      const esHoy    = d===hoy.getDate() && mes===hoy.getMonth() && año===hoy.getFullYear();
      const esPasado = new Date(año,mes,d) < new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate());
      dias.push({ numero:d, vacio:false, hoy:esHoy, pasado:esPasado&&!esHoy, tieneMov:diasConMov.has(d) });
    }
    return dias;
  });

  cambiarMes(dir: number) {
    const d = new Date(this.mesCalendario());
    d.setMonth(d.getMonth() + dir);
    this.mesCalendario.set(d);
  }

  // ── Gráfica ───────────────────────────────────────────────────────
  mesGraficaIdx = signal(new Date().getMonth());

  mesGraficaLabel = computed(() =>
    this.graficaMeses[this.mesGraficaIdx()] + ' 2024'
  );

  maxGrafica = Math.max(...this.graficaDatos);

  alturaBarraPct(v: number): number {
    return Math.round((v / this.maxGrafica) * 100);
  }

  cambiarMesGrafica(dir: number) {
    this.mesGraficaIdx.update(i => (i + dir + 12) % 12);
  }

  // ── Modal nuevo movimiento ────────────────────────────────────────
  modalAbierto = signal(false);
  toastVisible = signal(false);
  toastMsg     = signal('');

  nuevoMov = signal({
    nombre:    '',
    categoria: '',
    tipo:      'gasto' as 'gasto' | 'ingreso',
    importe:   null as number | null,
    icono:     '🛒',
    estado:    'completado' as 'completado' | 'pendiente',
  });

  abrirModal()  { this.modalAbierto.set(true); }
  cerrarModal() {
    this.modalAbierto.set(false);
    this.nuevoMov.set({ nombre:'', categoria:'', tipo:'gasto', importe:null, icono:'🛒', estado:'completado' });
  }

  actualizarNuevoMov(campo: string, valor: any) {
    this.nuevoMov.update(v => ({ ...v, [campo]: valor }));
  }

  guardarMovimiento() {
    const m = this.nuevoMov();
    if (!m.nombre.trim() || !m.categoria.trim() || !m.importe || m.importe <= 0) {
      this.showToast('⚠️ Completa todos los campos correctamente');
      return;
    }
    this._movimientos.update(lista => [{
      id:        this.nextId++,
      nombre:    m.nombre.trim(),
      categoria: m.categoria.trim(),
      tipo:      m.tipo,
      importe:   m.importe!,
      fecha:     new Date(),
      icono:     m.icono,
      estado:    m.estado,
    }, ...lista]);

    this.cerrarModal();
    this.showToast('✅ Movimiento añadido correctamente');
  }

  showToast(msg: string) {
    this.toastMsg.set(msg);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }

  ngOnInit() {}

  // ── Últimos movimientos (para Resumen) ────────────────────────────
  ultimosMovimientos = computed(() =>
    [...this._movimientos()]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 4)
  );

  // ── Calendario: día seleccionado ──────────────────────────────────
  diaSeleccionado = signal<number | null>(null);

  seleccionarDia(dia: number) {
    this.diaSeleccionado.set(dia);
  }

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

  // ── Estadísticas: gastos por categoría ───────────────────────────
  gastosPorCategoria = computed(() => {
    const map = new Map<string, { nombre: string; icono: string; total: number }>();
    this._movimientos()
      .filter(m => m.tipo === 'gasto')
      .forEach(m => {
        const key = m.categoria;
        if (map.has(key)) {
          map.get(key)!.total += m.importe;
        } else {
          map.set(key, { nombre: m.categoria, icono: m.icono, total: m.importe });
        }
      });
    return [...map.values()].sort((a, b) => b.total - a.total);
  });

  // ── Tasa de ahorro ────────────────────────────────────────────────
  tasaAhorro = computed(() => {
    const ing = this.totalIngreso();
    if (ing === 0) return 0;
    return ((ing - this.totalGasto()) / ing) * 100;
  });
}