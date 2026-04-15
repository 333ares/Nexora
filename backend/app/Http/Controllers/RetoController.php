<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reto;
use App\Models\Movimientos;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class RetoController extends Controller
{
    /**
     * Comprueba y actualiza el estado del reto:
     * - Si cantidad_actual >= cantidad → cumplido = true, activo = false
     * - Si fecha_final ha pasado y no cumplido → activo = false
     */
    private function comprobarEstado(Reto $reto): Reto
    {
        $actualizar = [];

        if (!$reto->cumplido && $reto->cantidad_actual >= $reto->cantidad) {
            $actualizar['cumplido'] = true;
            $actualizar['activo']   = false;
        } elseif (!$reto->cumplido && Carbon::parse($reto->fecha_final)->endOfDay()->isPast()) {
            $actualizar['activo'] = false;
        }

        if (!empty($actualizar)) {
            $reto->update($actualizar);
        }

        return $reto->fresh();
    }

    public function crearReto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'cantidad' => 'required|numeric|min:0.01',
            'fecha_inicio' => 'required|date',
            'fecha_final' => 'required|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $reto = Reto::create([
            'titulo' => $request->titulo,
            'cantidad' => $request->cantidad,
            'cantidad_actual' => 0,
            'fecha_inicio' => Carbon::parse($request->fecha_inicio),
            'fecha_final' => Carbon::parse($request->fecha_final),
            'cumplido' => false,
            'activo' => true,
            'usuario_id' => $request->user()->IDusuario,
        ]);

        return response()->json([
            'message' => 'Reto creado correctamente',
            'reto' => $reto
        ], 201);
    }

    public function listarRetos(Request $request)
    {
        $retos = Reto::where('usuario_id', $request->user()->IDusuario)
            ->orderBy('fecha_inicio', 'desc')
            ->get()
            ->map(fn($reto) => $this->comprobarEstado($reto));

        return response()->json([
            'message' => 'success',
            'retos' => $retos
        ], 200);
    }

    public function verInfoReto(Request $request)
    {
        $reto = Reto::where('IDreto', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        if (!$reto) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Reto no encontrado'
            ], 404);
        }

        return response()->json([
            'message' => 'success',
            'reto' => $this->comprobarEstado($reto)
        ], 200);
    }

    /**
     * Añade dinero a la hucha del reto y crea un movimiento de tipo gasto.
     */
    public function aportarDinero(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'cantidad' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $reto = Reto::where('IDreto', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        if (!$reto) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Reto no encontrado'
            ], 404);
        }

        if (!$reto->activo) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No puedes aportar a un reto inactivo o ya cumplido'
            ], 400);
        }

        if ($request->user()->balance_total <= $request->cantidad) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No tienes dinero suficiente para aportarlo al reto'
            ], 400);
        }

        // Creamos el movimiento de gasto
        Movimientos::create([
            'tipo' => 'gasto',
            'cantidad' => $request->cantidad,
            'categoria' => 'Reto: ' . $reto->titulo,
            'descripcion' => 'Aportación al reto: ' . $reto->titulo,
            'fecha' => now(),
            'usuario_id' => $request->user()->IDusuario,
        ]);

        // Actualizamos cantidad_actual del reto
        $nuevaCantidad = $reto->cantidad_actual + $request->cantidad;
        $reto->update(['cantidad_actual' => $nuevaCantidad]);

        // Comprobamos si se ha cumplido
        $reto = $this->comprobarEstado($reto->fresh());

        return response()->json([
            'message' => 'Aportación realizada correctamente',
            'reto' => $reto
        ], 200);
    }

    public function retirarDinero(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'cantidad' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $reto = Reto::where('IDreto', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        if (!$reto) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Reto no encontrado'
            ], 404);
        }

        if (!$reto->activo || $reto->cumplido) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No puedes retirar dinero de un reto inactivo o cumplido'
            ], 400);
        }

        if ($request->cantidad > $reto->cantidad_actual) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No puedes retirar más dinero del que tienes en la hucha'
            ], 400);
        }

        // Creamos el movimiento de ingreso
        Movimientos::create([
            'tipo' => 'ingreso',
            'cantidad' => $request->cantidad,
            'categoria'  => 'Reto: ' . $reto->titulo,
            'descripcion' => 'Retirada del reto: ' . $reto->titulo,
            'fecha' => now(),
            'usuario_id' => $request->user()->IDusuario,
        ]);

        // Actualizamos cantidad_actual
        $nuevaCantidad = $reto->cantidad_actual - $request->cantidad;
        $reto->update([
            'cantidad_actual' => $nuevaCantidad,
            'cumplido' => false,
            'activo' => true,  // si estaba cumplido, vuelve a activo
        ]);

        return response()->json([
            'message' => 'Retirada realizada correctamente',
            'reto' => $this->comprobarEstado($reto->fresh())
        ], 200);
    }

    public function actualizarReto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'titulo' => 'nullable|string|max:255',
            'cantidad' => 'nullable|numeric|min:0.01',
            'fecha_inicio' => 'nullable|date',
            'fecha_final' => 'nullable|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors'  => $validator->errors()
            ], 400);
        }

        $reto = Reto::where('IDreto', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        if (!$reto) {
            return response()->json([
                'message' => 'error',
                'errors'  => 'Reto no encontrado'
            ], 404);
        }

        $reto->update($request->only(['titulo', 'cantidad', 'fecha_inicio', 'fecha_final']));

        return response()->json([
            'message' => 'success',
            'reto' => $this->comprobarEstado($reto->fresh())
        ], 200);
    }

    public function borrarReto(Request $request)
    {
        $reto = Reto::where('IDreto', $request->id)
            ->where('usuario_id', $request->user()->IDusuario)
            ->first();

        if (!$reto) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No existe ningún reto con ese ID'
            ], 404);
        }

        $reto->delete();

        return response()->json([
            'message' => 'success',
            'reto' => 'El reto se ha borrado correctamente'
        ], 200);
    }
}
