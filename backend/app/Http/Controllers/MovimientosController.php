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
        // Comprobamos que los datos del usuario son correctos
        $validator = Validator::make($request->all(), [
            'tipo' => 'required|in:ingreso,gasto',
            'cantidad' => 'required|numeric|min:0.01',
            'categoria' => 'required|string',
            'descripcion' => 'nullable|string',
            'fecha' => 'nullable|date',
        ]);

        // Si el validador falla, mostramos porque
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $cantidad = $request->cantidad;
        $balanceUsuario = $request->user()->balance_total;

        // Si el tipo es gasto y el balance es menor que la cantidad, mostramos error
        if ($request->tipo === 'gasto' && $balanceUsuario < $cantidad) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Saldo insuficiente para realizar este gasto'
            ], 400);
        }

        // Creamos un nuevo movimiento
        $movimiento = Movimientos::create([
            'tipo' => $request->tipo,
            'cantidad' => $cantidad,
            'categoria' => $request->categoria,
            'descripcion' => $request->descripcion,
            'fecha' => $request->fecha ? Carbon::parse($request->fecha) : Carbon::now(),
            'usuario_id' => $request->user()->IDusuario,
        ]);

        // Si no se ha podido crear, mostramos un error
        if (!$movimiento) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No se ha podido añadir el movimiento'
            ], 400);
        }

        // Actualizamos el balance del usuario
        if ($request->tipo === 'ingreso') {
            $request->user()->update([
                'balance_total' => $balanceUsuario + $cantidad
            ]);
        } else {
            $request->user()->update([
                'balance_total' => $balanceUsuario - $cantidad
            ]);
        }

        // Devolvemos un mensaje de éxito
        return response()->json([
            'message' => 'Movimiento añadido correctamente'
        ], 201);
    }

    public function listarMovimientos(Request $request)
    {
        // Cogemos todos los movimientos del usuario que ha hecho la petición
        $movimientos = Movimientos::where('usuario_id', $request->user()->IDusuario)
            ->orderBy('fecha', 'desc')
            ->get();

        // Si no hay movimientos, mostramos error
        if (count($movimientos) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No tienes movimientos'
            ], 400);

            // Si hay movimientos, los mostramos
        } else {
            return response()->json([
                'message' => 'success',
                'movimientos' => $movimientos
            ], 201);
        }
    }

    public function verInfoMovimiento(Request $request)
    {
        // Cogemos el id del movimiento que pide el usuario autenticado
        $movimiento = Movimientos::where('id', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        // Si no se encuentra, mostramos error
        if (!$movimiento) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Movimiento no encontrado'
            ], 404);

            // Si se encuentra se devuelven sus datos
        } else {
            return response()->json([
                'message' => 'success',
                'movimiento' => $movimiento
            ], 200);
        }
    }

    public function listarGastos(Request $request)
    {
        // Cogemos la lista de gastos del usuario autenticado
        $gastos = Movimientos::where('tipo', 'gasto')
            ->where('usuario_id', $request->user()->IDusuario)
            ->get();

        // Si no se encuentran gastos, mostramos error 
        if (count($gastos) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Lista de gastos no encontrada'
            ], 404);

            // Si no, los devolvemos
        } else {
            return response()->json([
                'message' => 'success',
                'gastos' => $gastos
            ], 200);
        }
    }

    public function listarIngresos(Request $request)
    {
        // Cogemos la lista de ingresos del usuario autenticado
        $ingresos = Movimientos::where('tipo', 'ingreso')
            ->where('usuario_id', $request->user()->IDusuario)
            ->get();

        // Si no se encuentran ingresos, mostramos error 
        if (count($ingresos) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Lista de ingresos no encontrada'
            ], 404);

            // Si no, los devolvemos
        } else {
            return response()->json([
                'message' => 'success',
                'ingresos' => $ingresos
            ], 200);
        }
    }

    public function actualizarMovimiento(Request $request)
    {
        // Comprobamos que los datos enviados por el usuario son correctos
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'tipo' => 'nullable|string',
            'cantidad' => 'nullable|numeric|min:0.01',
            'categoria' => 'nullable|string',
            'descripcion' => 'nullable|string'
        ]);

        // Si el validador falla, mostramos porque
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Cogemos solo los datos modificados
        $datos = $request->only([
            'tipo',
            'cantidad',
            'categoria',
            'descripcion'
        ]);

        // Buscamos el movimiento que el usuario quiere modificar
        $movimiento = Movimientos::where('id', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        // Si no lo encuentra, mostramos error
        if (!$movimiento) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Movimiento no encontrado'
            ], 404);
        }

        // Actualizamos el movimimento
        $movimiento->update($datos);

        // Mostramos mensaje de éxito
        return response()->json([
            'message' => 'success',
            'movimiento' => $movimiento
        ], 200);

        $cantidad = $request->cantidad;
        $balanceUsuario = $request->user()->balance_total;

        if ($request->tipo === 'ingreso') {
            $request->user()->update([
                'balance_total' => $balanceUsuario + $cantidad
            ]);
        } else {
            $request->user()->update([
                'balance_total' => $balanceUsuario - $cantidad
            ]);
        }
    }

    public function borrarMovimiento(Request $request)
    {
        // Buscamos el movimiento que el usuario quiere borrar
        $movimiento = Movimientos::where('id', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        // Si no se encuentra, mostramos error
        if (!$movimiento) {
            return response()->json([
                'message' => 'error',
                'movimiento' => 'No existe ningún movimiento con ese ID'
            ], 404);
        }

        // Borramos el movimiento
        $movimiento->delete();

        // Mensaje de éxito
        return response()->json([
            'message' => 'success',
            'movimiento' => 'El movimiento se ha borrado correctamente'
        ], 200);

        $cantidad = $request->cantidad;
        $balanceUsuario = $request->user()->balance_total;

        $request->user()->update([
            'balance_total' => $balanceUsuario - $cantidad
        ]);
    }
}
