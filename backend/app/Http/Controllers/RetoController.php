<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reto; // Importas el modelo para poder guardar

class RetoController extends Controller
{
    public function store(Request $request)
    {
        //Comprueba los datos antes de seguir
        $rules = [
            'cantidad'     => 'required|numeric|min:1',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_final'  => 'required|date|after:fecha_inicio',
            'IDusuario'    => 'required|exists:usuarios,IDusuario',
        ];

        //Ejecuta la validación
        $validatedData = $request->validate($rules);

        //Si los datos son validos, crea el reto en la base de datos
        $reto = Reto::create($validatedData);

        //Responde a Angular con un mensaje de éxito
        return response()->json([
            'message' => 'Reto creado correctamente',
            'data' => $reto
        ], 201);
    }
}