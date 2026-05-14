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
        // Validar que se reciba el ID del foro
        $foro = Foro::find($request->IDforo);

        // Verificar que el foro exista
        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Foro no encontrado'
            ], 404);
        }

        // Verificar que el usuario no sea el creador del foro
        $esCreador = Foro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->exists();

        // Verificar que el usuario no sea ya miembro del foro
        if ($esCreador) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Eres el creador del foro'
            ], 400);
        }

        // Verificar que el usuario no sea ya miembro del foro
        $yaEsMiembro = Miembro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->exists();

        // Si el usuario ya es miembro, retornar un error
        if ($yaEsMiembro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Ya eres miembro de este foro'
            ], 400);
        }

        // Crear la membresía del usuario en el foro
        $membresia = Miembro::create([
            'IDforo' => $request->IDforo,
            'IDusuario' => $request->user()->IDusuario
        ]);

        // Retornar la respuesta con la membresía creada
        return response()->json([
            'message' => 'success',
            'miembro' => $membresia
        ], 200);
    }

    public function salirDeForo(Request $request)
    {
        // Validar que se reciba el ID de la membresía
        $membresia = Miembro::find($request->IDmembresia);

        // Verificar que la membresía exista
        if (!$membresia) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Membresia no encontrada'
            ], 404);
        }

        // Verificar que la membresía pertenezca al usuario autenticado
        $esCreador = Foro::where('IDforo', $membresia->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->exists();

        // Verificar que el usuario sea miembro del foro
        if ($esCreador) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Eres el creador del foro'
            ], 400);
        }

        $membresia->delete(); // Eliminar la membresía del usuario en el foro

        // Retornar la respuesta indicando que se ha salido del foro
        return response()->json([
            'message' => 'success',
            'respuesta' => 'La membresia se ha quitado correctamente'
        ], 200);
    }

    public function misForosMiembro(Request $request)
    {
        // Obtener el ID del usuario autenticado
        $IDusuario = $request->user()->IDusuario;

        // Obtener las membresías del usuario ordenadas por fecha de creación (más recientes primero)
        $membresias = Miembro::where('IDusuario', $IDusuario)
            ->orderBy('created_at', 'desc')
            ->get();

        // Mapear las membresías a los foros correspondientes
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

        // Retornar la respuesta con los foros en los que el usuario es miembro
        return response()->json([
            'message' => 'success',
            'foros'   => $foros
        ], 200);
    }
}
