<?php

namespace App\Http\Controllers;

use App\Models\Movimientos;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;

class MovimientosController extends Controller
{
    public function apuntarMovimiento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tipo' => 'required|in:ingreso,gasto',
            'cantidad' => 'required|decimal:2',
            'categoria' => 'required|string',
            'descripcion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $movimiento = Movimientos::create([
            'tipo' => $request->tipo,
            'cantidad' => $request->cantidad,
            'categoria' => $request->categoria,
            'descripcion' => $request->descripcion,
            'fecha' => Carbon::now(),
            'usuario_id' => $request->user()->id,
        ]);

        if ($movimiento) {
            return response()->json([
                'message' => 'Movimiento añadido correctamente'
            ], 201);

            // Si no, mostramos el error
        } else {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }
    }

    public function mostrarMovimientos(Request $request)
    {
        $movimientos = Movimientos::where('usuario_id', $request->user()->id)->get();

        if (count($movimientos) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No tienes movimientos'
            ], 400);
        } else {
            return response()->json([
                'message' => 'success',
                'movimientos' => $movimientos
            ], 201);
        }
    }

    public function actualizarMovimiento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'tipo' => 'nullable|string',
            'cantidad' => 'nullable|decimal:2',
            'categoria' => 'nullable|string',
            'descripcion' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $datos = $request->only([
            'tipo',
            'cantidad',
            'categoria',
            'descripcion'
        ]);

        $movimiento = Movimientos::where('id', $request->id)
            ->where('usuario_id', $request->user()->id)
            ->first();

        if (!$movimiento) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Movimiento no encontrado'
            ], 404);
        }

        $movimiento->update($datos);

        return response()->json([
            'message' => 'success',
            'movimiento' => $movimiento
        ], 200);
    }
}
