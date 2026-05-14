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
        // Validamos los datos de entrada
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

        // Creamos el foro
        $foro = Foro::create([
            'titulo' => $request->titulo,
            'contenido' => $request->contenido,
            'IDusuario' => $request->user()->IDusuario
        ]);

        // El creador es miembro automáticamente
        return response()->json([
            'message' => 'Foro añadido correctamente',
            'foro' => $foro
        ], 201);
    }

    public function visitarForo(Request $request)
    {
        // Validamos los datos de entrada
        $foro = Foro::find($request->IDforo);

        // Si el foro no existe, mostramos un error
        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Foro no encontrado'
            ], 404);
        }

        $IDusuario = $request->user()->IDusuario; // ID del usuario que visita el foro
        $foro->increment('visitas'); // Incrementamos el contador de visitas

        /** Cargamos el creador del foro, las respuestas y los miembros. 
         * Para cada respuesta, cargamos el número de votos, 
         * el creador y si el usuario actual ya ha votado esa respuesta.*/
        $foro->creador = Usuario::where('IDusuario', $foro->IDusuario)->value('usuario');
        $foro->respuestas = Respuesta::where('IDforo', $foro->IDforo)->get()->map(function ($respuesta) use ($IDusuario) {
            $respuesta->votos = Votos_Respuesta::where('IDrespuesta', $respuesta->IDrespuesta)->count();
            $respuesta->creador = Usuario::where('IDusuario', $respuesta->IDusuario)->value('usuario');
            $respuesta->yaVotada = Votos_Respuesta::where('IDrespuesta', $respuesta->IDrespuesta)
                ->where('IDusuario', $IDusuario)
                ->exists();
            return $respuesta;
        });

        // Cargamos los miembros del foro
        $foro->miembros = Miembro::where('IDforo', $foro->IDforo)->get();

        // Devolvemos el foro con toda la información
        return response()->json([
            'message' => 'success',
            'foro' => $foro
        ], 200);
    }

    public function listarForos()
    {
        // Listamos los foros más recientes, con el número de respuestas y el creador
        $foros = Foro::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($foro) {
                $foro->respuestas = Respuesta::where('IDforo', $foro->IDforo)->count();
                $foro->creador = Usuario::where('IDusuario', $foro->IDusuario)->value('usuario');
                return $foro;
            });

        // Si no hay foros, mostramos un error
        if ($foros->isEmpty()) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No hay foros aún'
            ], 400);
        }

        // Devolvemos la lista de foros
        return response()->json([
            'message' => 'success',
            'foros' => $foros
        ], 200);
    }

    public function listarForosUsuario(Request $request)
    {
        // Listamos los foros creados por el usuario, con el número de respuestas
        $foros = Foro::where('IDusuario', '=', $request->user()->IDusuario)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($foro) {
                $foro->respuestas = Respuesta::where('IDforo', '=', $foro->IDforo)->count();
                return $foro;
            });

        // Si el usuario no ha creado ningún foro, mostramos un error
        if (count($foros) <= 0) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No has creado ningun foro'
            ], 400);
        }

        // Devolvemos la lista de foros del usuario
        return response()->json([
            'message' => 'success',
            'foros' => $foros
        ], 200);
    }

    public function actualizarForo(Request $request)
    {
        // Validamos los datos de entrada
        $validator = Validator::make($request->all(), [
            'IDforo' => 'required|integer',
            'titulo' => 'nullable|string',
            'contenido' => 'nullable|string',
        ]);

        // Si el validador falla, mostramos porque
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Cogemos solo los datos que queremos actualizar
        $datos = $request->only([
            'IDforo',
            'titulo',
            'contenido'
        ]);

        // Solo el creador del foro puede actualizarlo
        $foro = Foro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        // Si el foro no existe o el usuario no es el creador, mostramos un error
        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Foro no encontrado'
            ], 404);
        }

        // Actualizamos el foro con los datos proporcionados
        $foro->update($datos);

        // Devolvemos el foro actualizado
        return response()->json([
            'message' => 'success',
            'foro' => $foro
        ], 200);
    }

    public function borrarForo(Request $request)
    {
        // Validamos los datos de entrada
        $foro = Foro::where('IDforo', $request->IDforo)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        // Si el foro no existe o el usuario no es el creador, mostramos un error
        if (!$foro) {
            return response()->json([
                'message' => 'error',
                'errors' => 'No tienes ningún foro con ese ID'
            ], 404);
        }

        $foro->delete(); // Esto borrará el foro

        // devolvemos un mensaje de éxito
        return response()->json([
            'message' => 'success',
            'foro' => 'El foro se ha borrado correctamente'
        ], 200);
    }
}
