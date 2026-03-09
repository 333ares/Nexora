<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movimientos;

class EstadisticasController extends Controller
{
    public function gastoMensual(Request $request)
    {
        $usuarioId = $request->user()->IDusuario;

        // Estadística de gasto mensual agrupado por mes
        $gastosMensuales = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $usuarioId)
            ->selectRaw('YEAR(fecha) as año, MONTH(fecha) as mes, SUM(cantidad) as total, COUNT(*) as cantidad_movimientos')
            ->groupByRaw('YEAR(fecha), MONTH(fecha)')
            ->orderByRaw('YEAR(fecha) DESC, MONTH(fecha) DESC')
            ->get();

        if (count($gastosMensuales) <= 0) {
            return response()->json([
                'message' => 'info',
                'errors' => 'No hay gastos registrados'
            ], 404);
        }

        // Gasto total del mes actual
        $mesActual = now()->format('m');
        $anoActual = now()->format('Y');
        $gastoMesActual = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $usuarioId)
            ->whereYear('fecha', $anoActual)
            ->whereMonth('fecha', $mesActual)
            ->sum('cantidad');

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
        $usuarioId = $request->user()->IDusuario;

        // Estadística por categoría
        $gastosPorCategoria = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $usuarioId)
            ->selectRaw('categoria, SUM(cantidad) as total, COUNT(*) as cantidad_movimientos')
            ->groupBy('categoria')
            ->orderByRaw('total DESC')
            ->get();

        if (count($gastosPorCategoria) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No se han encontrado gastos por categoria'
            ], 404);
        }

        return response()->json([
            'message' => 'success',
            'stats' => $gastosPorCategoria
        ], 200);
    }
}
