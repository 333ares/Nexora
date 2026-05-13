<?php

namespace App\Http\Controllers;

use App\Models\Foro;
use App\Models\Miembro;
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
}
