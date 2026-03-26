<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reto;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class RetoController extends Controller
{
    /**
     * Comprueba si un reto debe marcarse como cumplido y lo actualiza si procede.
     * Un reto se considera cumplido cuando la fecha_final ha pasado.
     */
    private function comprobarCumplimiento(Reto $reto): Reto
    {
        if (!$reto->cumplido && Carbon::parse($reto->fecha_final)->isPast()) {
            $reto->update(['cumplido' => true]);
        }
        return $reto->fresh();
    }

    public function crearReto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo'       => 'required|string|max:255',
            'cantidad'     => 'required|numeric|min:0.01',
            'fecha_inicio' => 'required|date',
            'fecha_final'  => 'required|date|after:fecha_inicio',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors'  => $validator->errors()
            ], 400);
        }

        $reto = Reto::create([
            'titulo'       => $request->titulo,
            'cantidad'     => $request->cantidad,
            'fecha_inicio' => Carbon::parse($request->fecha_inicio),
            'fecha_final'  => Carbon::parse($request->fecha_final),
            'cumplido'     => false,
            'usuario_id'   => $request->user()->IDusuario,
        ]);

        if (!$reto) {
            return response()->json([
                'message' => 'error',
                'errors'  => 'No se ha podido crear el reto'
            ], 400);
        }

        return response()->json([
            'message' => 'Reto creado correctamente',
            'reto'    => $reto
        ], 201);
    }

    public function listarRetos(Request $request)
    {
        $retos = Reto::where('usuario_id', $request->user()->IDusuario)
            ->orderBy('fecha_inicio', 'desc')
            ->get();

        if (count($retos) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors'  => 'No tienes retos creados'
            ], 400);
        }

        // Comprobamos el cumplimiento de cada reto antes de devolverlos
        $retos = $retos->map(fn($reto) => $this->comprobarCumplimiento($reto));

        return response()->json([
            'message' => 'success',
            'retos'   => $retos
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
                'errors'  => 'Reto no encontrado'
            ], 404);
        }

        // Comprobamos el cumplimiento antes de devolver el reto
        $reto = $this->comprobarCumplimiento($reto);

        return response()->json([
            'message' => 'success',
            'reto'    => $reto
        ], 200);
    }

    public function actualizarReto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id'           => 'required|integer',
            'titulo'       => 'nullable|string|max:255',
            'cantidad'     => 'nullable|numeric|min:0.01',
            'fecha_inicio' => 'nullable|date',
            'fecha_final'  => 'nullable|date|after:fecha_inicio',
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


        $datos = $request->only([
            'titulo',
            'cantidad',
            'fecha_inicio',
            'fecha_final',
        ]);

        $reto->update($datos);

        // Recomprobamos cumplimiento por si han cambiado las fechas
        $reto = $this->comprobarCumplimiento($reto);

        return response()->json([
            'message' => 'success',
            'reto'    => $reto
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
                'errors'  => 'No existe ningún reto con ese ID'
            ], 404);
        }

        $reto->delete();

        return response()->json([
            'message' => 'success',
            'reto'    => 'El reto se ha borrado correctamente'
        ], 200);
    }
}
