<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movimientos;

class EstadisticasController extends Controller
{
    public function gastoMensual(Request $request)
    {
        // Cogemos el id del usuario
        $usuarioId = $request->user()->IDusuario;

        /**
         * 1. Buscamos movimientos que sean de tipo "gasto" del usuario que ha hehcho la petición 
         * 2. Cogemos los datos del año, mes, suma total de gastos y cantidad de movimientos
         * 3. Agrupamos por año y mes
         * 4. Ordenamos por año y mes de forma descendente (del más reciente al más antiguo)
         */
        $gastosMensuales = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $usuarioId)
            ->selectRaw('YEAR(fecha) as año, MONTH(fecha) as mes, SUM(cantidad) as total, COUNT(*) as cantidad_movimientos')
            ->groupByRaw('YEAR(fecha), MONTH(fecha)')
            ->orderByRaw('YEAR(fecha) DESC, MONTH(fecha) DESC')
            ->get();

        // Si no se encuntran gastos, mostramos error
        if (count($gastosMensuales) <= 0) {
            return response()->json([
                'message' => 'info',
                'errors' => 'No hay gastos registrados'
            ], 404);
        }

        // Gasto total del mes actual
        $mesActual = now()->format('m'); // Formato de mes con ceros (01, 02, ..., 12)
        $anoActual = now()->format('Y'); // Formato de año con cuatro dígitos (2024, 2025, etc.)
        /**
         * 1. Buscamos movimientos que sean de tipo "gasto" del usuario que ha hehcho la petición
         * 2. Filtramos por año y mes actual
         * 3. Sumamos la cantidad total de gastos del mes actual
         */
        $gastoMesActual = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $usuarioId)
            ->whereYear('fecha', $anoActual)
            ->whereMonth('fecha', $mesActual)
            ->sum('cantidad');

        // Devolvemos los gastos mensuales y el gasto total del mes actual
        return response()->json([
            'message' => 'success',
            'data' => [
                'gasto_mes_actual' => $gastoMesActual,
                'gastos_mensuales' => $gastosMensuales
            ]
        ], 200);
    }

    public function gastoMensualPorCategoria(Request $request)
    {
        // Cogemos el id del usuario
        $usuarioId = $request->user()->IDusuario;

        /**
         * 1. Buscamos movimientos que sean de tipo "gasto" del usuario que ha hehcho la petición
         * 2. Cogemos los datos de la categoria, suma total de gastos y cantidad de movimientos
         * 3. Agrupamos por categoria
         * 4. Ordenamos por total de gastos de forma descendente (de mayor a menor)
         */
        $gastosPorCategoria = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $usuarioId)
            ->selectRaw('categoria, SUM(cantidad) as total, COUNT(*) as cantidad_movimientos')
            ->groupBy('categoria')
            ->orderByRaw('total DESC')
            ->get();

        // Si no se encuntran gastos por categoria, mostramos error
        if (count($gastosPorCategoria) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No se han encontrado gastos por categoria'
            ], 404);
        }

        // Devolvemos los gastos por categoria
        return response()->json([
            'message' => 'success',
            'stats' => $gastosPorCategoria
        ], 200);
    }

    public function ingresoMensual(Request $request)
    {
        // Cogemos el id del usuario
        $usuarioId = $request->user()->IDusuario;

        /**
         * 1. Buscamos movimientos que sean de tipo "ingreso" del usuario que ha hehcho la petición 
         * 2. Cogemos los datos del año, mes, suma total de ingresos y cantidad de movimientos
         * 3. Agrupamos por año y mes
         * 4. Ordenamos por año y mes de forma descendente (del más reciente al más antiguo)
         */
        $ingresosMensuales = Movimientos::where('tipo', 'ingreso')
            ->where('usuario_id', $usuarioId)
            ->selectRaw('YEAR(fecha) as año, MONTH(fecha) as mes, SUM(cantidad) as total, COUNT(*) as cantidad_movimientos')
            ->groupByRaw('YEAR(fecha), MONTH(fecha)')
            ->orderByRaw('YEAR(fecha) DESC, MONTH(fecha) DESC')
            ->get();

        // Si no se encuntran ingresos, mostramos error
        if (count($ingresosMensuales) <= 0) {
            return response()->json([
                'message' => 'info',
                'errors' => 'No hay ingresos registrados'
            ], 404);
        }

        // Gasto total del mes actual
        $mesActual = now()->format('m'); // Formato de mes con ceros (01, 02, ..., 12)
        $anoActual = now()->format('Y'); // Formato de año con cuatro dígitos (2024, 2025, etc.)
        /**
         * 1. Buscamos movimientos que sean de tipo "ingreso" del usuario que ha hehcho la petición
         * 2. Filtramos por año y mes actual
         * 3. Sumamos la cantidad total de ingresos del mes actual
         */
        $ingresoMesActual = Movimientos::where('tipo', 'ingreso')
            ->where('usuario_id', $usuarioId)
            ->whereYear('fecha', $anoActual)
            ->whereMonth('fecha', $mesActual)
            ->sum('cantidad');

        // Devolvemos los ingresos mensuales y el ingreso total del mes actual
        return response()->json([
            'message' => 'success',
            'data' => [
                'ingreso_mes_actual' => $ingresoMesActual,
                'ingresos_mensuales' => $ingresosMensuales
            ]
        ], 200);
    }

    public function ingresoMensualPorCategoria(Request $request)
    {
        // Cogemos el id del usuario
        $usuarioId = $request->user()->IDusuario;

        /**
         * 1. Buscamos movimientos que sean de tipo "ingreso" del usuario que ha hehcho la petición
         * 2. Cogemos los datos de la categoria, suma total de ingresos y cantidad de movimientos
         * 3. Agrupamos por categoria
         * 4. Ordenamos por total de ingresos de forma descendente (de mayor a menor)
         */
        $ingresosPorCategoria = Movimientos::where('tipo', 'ingreso')
            ->where('usuario_id', $usuarioId)
            ->selectRaw('categoria, SUM(cantidad) as total, COUNT(*) as cantidad_movimientos')
            ->groupBy('categoria')
            ->orderByRaw('total DESC')
            ->get();

        // Si no se encuntran ingresos por categoria, mostramos error
        if (count($ingresosPorCategoria) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No se han encontrado ingresos por categoria'
            ], 404);
        }
        
        // Devolvemos los ingresos por categoria
        return response()->json([
            'message' => 'success',
            'stats' => $ingresosPorCategoria
        ], 200);
    }
}
