<?php

namespace App\Http\Controllers;

use App\Models\Foro;
use App\Models\Miembro;
use App\Models\Respuesta;
use App\Models\Usuario;
use Illuminate\Http\Request;

class MiembrosController extends Controller
{
    public function unirseAForo(Request $request)
    {
        $foro = Foro::find($request->IDforo);

        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Foro no encontrado'
            ], 404);
        }

        $esCreador = Foro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->exists();

        if ($esCreador) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Eres el creador del foro'
            ], 400);
        }

        $yaEsMiembro = Miembro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->exists();

        if ($yaEsMiembro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Ya eres miembro de este foro'
            ], 400);
        }

        $membresia = Miembro::create([
            'IDforo' => $request->IDforo,
            'IDusuario' => $request->user()->IDusuario
        ]);

        return response()->json([
            'message' => 'success',
            'miembro' => $membresia
        ], 200);
    }

    public function salirDeForo(Request $request)
    {
        $membresia = Miembro::find($request->IDmembresia);

        if (!$membresia) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Membresia no encontrada'
            ], 404);
        }

        $esCreador = Foro::where('IDforo', $membresia->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->exists();

        if ($esCreador) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Eres el creador del foro'
            ], 400);
        }

        $membresia->delete();

        return response()->json([
            'message' => 'success',
            'respuesta' => 'La membresia se ha quitado correctamente'
        ], 200);
    }

    public function misForosMiembro(Request $request)
    {
        $IDusuario = $request->user()->IDusuario;

        $membresias = Miembro::where('IDusuario', $IDusuario)
            ->orderBy('created_at', 'desc')
            ->get();

        $foros = $membresias->map(function ($membresia) {
            $foro = Foro::find($membresia->IDforo);
            if (!$foro) return null;

            return [
                'IDforo' => $foro->IDforo,
                'IDmembresia' => $membresia->IDmiembro,
                'titulo' => $foro->titulo,
                'descripcion' => $foro->contenido,
                'creador' => Usuario::where('IDusuario', $foro->IDusuario)->value('usuario'),
                'miembro_desde' => $membresia->created_at,
                'num_miembros' => Miembro::where('IDforo', $foro->IDforo)->count(),
                'num_respuestas' => Respuesta::where('IDforo', $foro->IDforo)->count(),
            ];
        })->filter()->values();

        return response()->json([
            'message' => 'success',
            'foros'   => $foros
        ], 200);
    }
}
