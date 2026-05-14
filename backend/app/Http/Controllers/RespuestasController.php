<?php

namespace App\Http\Controllers;

use App\Models\Respuesta;
use App\Models\Usuario;
use App\Models\Votos_Respuesta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class RespuestasController extends Controller
{
    private function moderarContenido(string ...$textos): void
    {
        $input = implode("\n", array_filter($textos));

        $response = Http::withToken(config('services.openai.key'))
            ->post('https://api.openai.com/v1/moderations', ['input' => $input]);

        $flagged = $response->json('results.0.flagged', false);

        if ($flagged) {
            abort(422, 'El contenido infringe las normas de la comunidad.');
        }
    }

    public function responderForo(Request $request)
    {
        // Moderar lenguaje
        $this->moderarContenido($request->respuesta);
      
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'IDforo' => 'required|integer',
            'respuesta' => 'required|string',
        ]);

        // Si la validación falla, devolver un error con los mensajes de validación
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Crear la respuesta en la base de datos
        $respuesta = Respuesta::create([
            'IDforo' => $request->IDforo,
            'respuesta' => $request->respuesta,
            'IDusuario' => $request->user()->IDusuario
        ]);

        // Añadir el nombre de usuario del creador a la respuesta
        $respuesta->creador = Usuario::where('IDusuario', $respuesta->IDusuario)->value('usuario');

        // Devolver un mensaje de éxito 
        return response()->json([
            'message' => 'Respuesta añadida correctamente',
            'respuesta' => $respuesta
        ], 201);
    }

    public function modificarRespuesta(Request $request)
    {
        // Moderar lenguaje
        $this->moderarContenido($request->respuesta);
      
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'IDrespuesta' => 'required|integer',
            'respuesta' => 'nullable|string'
        ]);

        // Si la validación falla, devolver un error con los mensajes de validación
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Buscar la respuesta por su ID y el ID del usuario
        $respuesta = Respuesta::where('IDrespuesta', $request->IDrespuesta)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        // Si no se encuentra la respuesta, devolver un error
        if (!$respuesta) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Respuesta no encontrada'
            ], 404);
        }

        // Actualizar la respuesta con los nuevos datos
        $datos = $request->only([
            'respuesta'
        ]);

        $respuesta->update($datos);

        // Devolver un mensaje de éxito 
        return response()->json([
            'message' => 'success',
            'respuesta' => $respuesta
        ], 200);
    }

    public function borrarRespuesta(Request $request)
    {
        // Validar los datos de entrada
        $respuesta = Respuesta::where('IDrespuesta', $request->IDrespuesta)
            ->where('IDusuario', $request->user()->IDusuario)
            ->first();

        // Si no se encuentra la respuesta, devolver un error
        if (!$respuesta) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Respuesta no encontrada'
            ], 404);
        }

        // Eliminar la respuesta
        $respuesta->delete();

        // Devolver un mensaje de éxito
        return response()->json([
            'message' => 'success',
            'respuesta' => 'La respuesta se ha borrado correctamente'
        ], 200);
    }

    public function toggleVotoRespuesta(Request $request)
    {
        // Validar los datos de entrada
        $respuesta = Respuesta::find($request->IDrespuesta);

        // Si no se encuentra la respuesta, devolver un error
        if (!$respuesta) {
            return response()->json([
                'message' => 'error',
                'errors' => 'Respuesta no encontrada'
            ], 404);
        }

        // Obtener el ID del usuario que vota
        $IDusuario = $request->user()->IDusuario;

        // Verificar si el usuario ya ha votado esta respuesta
        $votoExistente = Votos_Respuesta::where('IDusuario', $IDusuario)
            ->where('IDrespuesta', $respuesta->IDrespuesta)
            ->first();

        // Si el voto ya existe, eliminarlo (desvotar), de lo contrario, crear un nuevo voto
        if ($votoExistente) {
            Votos_Respuesta::where('IDusuario', $IDusuario)
                ->where('IDrespuesta', $respuesta->IDrespuesta)
                ->delete();

            $votado = false;
        } else {
            Votos_Respuesta::create([
                'IDusuario' => $IDusuario,
                'IDrespuesta' => $respuesta->IDrespuesta
            ]);

            $votado = true;
        }

        // Contar el número total de votos para la respuesta después de la acción
        $votos = Votos_Respuesta::where('IDrespuesta', $respuesta->IDrespuesta)->count();

        // Devolver un mensaje de éxito con el nuevo conteo de votos y el estado de votación
        return response()->json([
            'message' => 'success',
            'votos' => $votos,
            'votado' => $votado
        ], 200);
    }
}
