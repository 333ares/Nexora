<?php

namespace App\Http\Controllers;

use App\Models\Foro;
use App\Models\Miembro;
use App\Models\Respuesta;
use App\Models\Usuario;
use App\Models\Votos_Respuesta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ForoController extends Controller
{
    public function crearForo(Request $request)
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

    public function visitarForo(Request $request)
    {
        $foro = Foro::find($request->IDforo);

        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Foro no encontrado'
            ], 404);
        }

        $foro->increment('visitas');
        $foro->respuestas = Respuesta::where('IDforo', $foro->IDforo)->get()->map(function ($respuesta) {
            $respuesta->votos = Votos_Respuesta::where('IDrespuesta', $respuesta->IDrespuesta)->count();
            return $respuesta;
        });

        $foro->miembros = Miembro::where('IDforo', $foro->IDforo)->get();

        return response()->json([
            'message' => 'success',
            'foro' => $foro
        ], 200);
    }

    public function listarForos()
    {
        $foros = Foro::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($foro) {
                $foro->respuestas = Respuesta::where('IDforo', $foro->IDforo)->count();
                $foro->creador = Usuario::where('IDusuario', $foro->IDusuario)->value('usuario');
                return $foro;
            });

        if ($foros->isEmpty()) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No hay foros aún'
            ], 400);
        }

        return response()->json([
            'message' => 'success',
            'foros' => $foros
        ], 200);
    }

    public function listarForosUsuario(Request $request)
    {
        $foros = Foro::where('IDusuario', '=', $request->user()->IDusuario)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($foro) {
                $foro->respuestas = Respuesta::where('IDforo', '=', $foro->IDforo)->count();
                return $foro;
            });

        if (count($foros) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No has creado ningun foro'
            ], 400);
        }

        return response()->json([
            'message' => 'success',
            'foros' => $foros
        ], 200);
    }

    public function actualizarForo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'IDforo' => 'required|integer',
            'titulo' => 'nullable|string',
            'contenido' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $datos = $request->only([
            'IDforo',
            'titulo',
            'contenido'
        ]);

        $foro = Foro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Foro no encontrado'
            ], 404);
        }

        $foro->update($datos);

        return response()->json([
            'message' => 'success',
            'foro' => $foro
        ], 200);
    }

    public function borrarForo(Request $request)
    {
        $foro = Foro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No tienes ningún foro con ese ID'
            ], 404);
        }

        $foro->delete();

        return response()->json([
            'message' => 'success',
            'foro' => 'El foro se ha borrado correctamente'
        ], 200);
    }
}
