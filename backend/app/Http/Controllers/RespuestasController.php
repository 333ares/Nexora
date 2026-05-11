<?php

namespace App\Http\Controllers;

use App\Models\Respuesta;
use App\Models\Votos_Respuesta;
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

    public function modificarRespuesta(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'IDrespuesta' => 'required|integer',
            'respuesta' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $respuesta = Respuesta::where('IDrespuesta', $request->IDrespuesta)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        if (!$respuesta) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Respuesta no encontrada'
            ], 404);
        }

        $datos = $request->only([
            'respuesta'
        ]);

        $respuesta->update($datos);

        return response()->json([
            'message' => 'success',
            'movimiento' => $respuesta
        ], 200);
    }

    public function borrarRespuesta(Request $request)
    {
        $respuesta = Respuesta::where('IDrespuesta', $request->IDrespuesta)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        if (!$respuesta) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Respuesta no encontrada'
            ], 404);
        }

        $respuesta->delete();

        return response()->json([
            'message' => 'success',
            'respuesta' => 'La respuesta se ha borrado correctamente'
        ], 200);
    }

    public function toggleVotoRespuesta(Request $request)
    {
        $respuesta = Respuesta::find($request->IDrespuesta);

        if (!$respuesta) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Respuesta no encontrada'
            ], 404);
        }

        $IDusuario = $request->user()->IDusuario;

        $votoExistente = Votos_Respuesta::where('IDusuario', $IDusuario)
            ->where('IDrespuesta', $respuesta->IDrespuesta)
            ->first();

        if ($votoExistente) {
            Votos_Respuesta::where('IDusuario', $IDusuario)
                ->where('IDrespuesta', $respuesta->IDrespuesta)
                ->delete();

            $respuesta->decrement('votos');
            $votado = false;
        } else {

            Votos_Respuesta::create([
                'user_id' => $IDusuario,
                'respuesta_id' => $respuesta->IDrespuesta
            ]);

            $respuesta->increment('votos');
            $votado = true;
        }

        return response()->json([
            'message' => 'success',
            'votos' => $respuesta->fresh()->votos,
            'votado' => $votado // Para el front (color del boton)
        ], 200);
    }
}
