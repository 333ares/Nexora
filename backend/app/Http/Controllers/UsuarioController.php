<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    public function listarInfo($id)
    {
        // Buscamos usuario por id
        $usuario = Usuario::find($id);

        if (!$usuario) {
            // Si no lo encuentra, mostramos error
            return response()->json([
                'message' => 'error',
                'usuario' => 'No existe un usuario con ese ID'
            ], 400);
        }
        // Si se encuentra se muestra su información
        return response()->json([
            'message' => 'success',
            'usuario' => $usuario
        ], 200);
    }

    public function actualizarUsuario(Request $request, $id)
    {
        // Comprobamos que los datos sean validos
        $validator = Validator::make($request->all(), [
            'usuario' => 'nullable|string',
            'nombre' => 'nullable|string',
            'apellidos' => 'nullable|string',
            'email' => 'nullable|email|unique:usuarios,email',
            'password' => 'nullable|string',
        ]);

        // Si no son validos, mostramos error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Buscamos usuario por id
        $usuario = Usuario::find($id);
        // Si no lo encontramos, mostramos error
        if (!$usuario) {
            return response()->json([
                'message' => 'error',
                'animal' => 'No existe ningún usuario con ese ID'
            ], 404);
        }

        // Actualizamos datos que nos haya pasado el usuario
        $usuario->update($request->only([
            'usuario',
            'nombre',
            'apellidos',
            'email',
            'password'
        ]));

        // Mostramos usuario actualizado
        return response()->json([
            'message' => 'success',
            'animal' => $usuario
        ], 200);
    }

    public function borrarUsuario($id)
    {
        // Buscamos usuario por id
        $usuario = Usuario::find($id);
        // Si no lo encontramos, mostramos error
        if (!$usuario) {
            return response()->json([
                'message' => 'error',
                'animal' => 'No existe ningún usuario con ese ID'
            ], 404);
        }

        // Borramos usuario
        $usuario->delete();

        // Devolvemos mensaje de exito
        return response()->json([
            'message' => 'success',
            'usuario' => 'El usuario se ha borrado correctamente'
        ], 200);
    }
}
