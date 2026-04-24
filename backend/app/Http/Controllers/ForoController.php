<?php

namespace App\Http\Controllers;

use App\Models\Foro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ForoController extends Controller
{
    function crearForo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string',
            'contenido' => 'required|string',
        ]);

        // Si el validador falla, mostramos porque
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $foro = Foro::create([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'IDusuario' => $request->user()->IDusuario
        ]);

        return response()->json([
            'message' => 'Foro añadido correctamente',
            'foro' => $foro
        ], 201);
    }
}
