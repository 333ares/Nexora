<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reto;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;

class RetoController extends Controller
{
    public function crearReto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo'       => 'required|string|max:255',
            'cantidad'     => 'required|numeric|min:0.01',
            'fecha_inicio' => 'nullable|date',
            'fecha_final'  => 'nullable|date|after_or_equal:fecha_inicio',
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
            'fecha_inicio' => $request->fecha_inicio
                ? Carbon::parse($request->fecha_inicio)
                : Carbon::now(),
            'fecha_final'  => $request->fecha_final
                ? Carbon::parse($request->fecha_final)
                : null,
            'activo'       => true,
            'cumplido'     => false,
            'IDusuario'    => $request->user()->IDusuario,
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

    public function index()
    {
        // Obtenemos todos los retos
        $retos = \App\Models\Reto::all();
        return response()->json($retos, 200);
    }

    public function actualizarReto(Request $request)
    {
        // Valida que nos envíe el ID del reto y los campos a cambiar
        $validated = $request->validate([
            'IDreto'       => 'required|exists:retos,IDreto',
            'cantidad'     => 'sometimes|numeric',
            'fecha_inicio' => 'sometimes|date',
            'fecha_final'  => 'sometimes|date|after:fecha_inicio',
            'activo'       => 'sometimes|boolean',
            'cumplido'     => 'sometimes|boolean',
        ]);

        //Busca el registro usando Eloquent
        $reto = \App\Models\Reto::find($request->IDreto);

        // Actualiza con los datos validados
        $reto->update($validated);

        return response()->json([
            'message' => 'Reto actualizado con éxito vía Eloquent',
            'reto' => $reto
        ], 200);
    }

    public function verReto(Request $request)
    {
        // Valida que el IDreto esté presente en el JSON
        $request->validate([
            'IDreto' => 'required|exists:retos,IDreto'
        ]);

        // Busca el reto usando Eloquent
        // findOrFail detiene la ejecución si no existe
        $reto = \App\Models\Reto::findOrFail($request->IDreto);

        // Carga los datos del usuario dueño del reto
        // $reto->load('usuario');
        return response()->json($reto, 200);
    }

    public function eliminarReto(Request $request)
    {
        //Valida que el IDreto esté en el JSON
        $request->validate([
            'IDreto' => 'required|exists:retos,IDreto'
        ]);

        //Busca el reto con Eloquent
        $reto = \App\Models\Reto::findOrFail($request->IDreto);

        //Elimina el registro
        $reto->delete();

        return response()->json([
            'message' => 'Reto eliminado correctamente'
        ], 200);
    }
}
