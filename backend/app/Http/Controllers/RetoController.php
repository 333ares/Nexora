<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reto;
use Carbon\Carbon; 

class RetoController extends Controller
{
    public function store(Request $request) {
        // Validamos solo lo que el usuario SÍ puede tocar
        $validated = $request->validate([
            'titulo'    => 'required|string|min:3',
            'cantidad'  => 'required|numeric|min:1',
            'emoji'     => 'nullable|string',
            'IDusuario' => 'required|exists:usuarios,IDusuario',
        ]);

        // 2. Definimos los valores automáticos (Sysdate y +1 mes)
        $fechaInicio = Carbon::now(); // Fecha actual del sistema
        $fechaFinal  = $fechaInicio->copy()->addMonth(); // Exactamente un mes después

        // 3. Creamos el registro con los estados por defecto
        $reto = Reto::create([
            'titulo'       => $validated['titulo'],
            'cantidad'     => $validated['cantidad'],
            'emoji'        => $validated['emoji'] ?? '🎯',
            'IDusuario'    => $validated['IDusuario'],
            'fecha_inicio' => $fechaInicio,
            'fecha_final'  => $fechaFinal,
            'activo'       => true,  // Forzado por defecto
            'cumplido'     => false, // Forzado por defecto
        ]);

        return response()->json($reto, 201);
    }

    public function index()
    {
        // Obtenemos todos los retos
        $retos = \App\Models\Reto::all();
        return response()->json($retos, 200);
    }
    
    public function actualizarReto (Request $request)
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