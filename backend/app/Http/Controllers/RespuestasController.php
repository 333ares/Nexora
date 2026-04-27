<?php

namespace App\Http\Controllers;

use App\Models\Respuesta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RespuestasController extends Controller
{
    public function responderForo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'IDforo' => 'required|integer',
            'respuesta' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $respuesta = Respuesta::create([
            'IDforo' => $request->IDforo,
            'respuesta' => $request->respuesta,
            'IDusuario' => $request->user()->IDusuario
        ]);

        return response()->json([
            'message' => 'Respuesta añadida correctamente',
            'respuesta' => $respuesta
        ], 201);
    }
}
