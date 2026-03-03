<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    public function listarInfo(Request $request)
    {
        // Buscamos usuario por id
        $usuario = $request->user();

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

    public function actualizarUsuario(Request $request)
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
        $usuario = $request->user();

        // Si no lo encontramos, mostramos error
        if (!$usuario) {
            return response()->json([
                'message' => 'error',
                'usuario' => 'No existe ningún usuario con ese ID'
            ], 404);
        }

        // Cogemos los datos que nos haya pasado el usuario
        $datos = $request->only([
            'usuario',
            'nombre',
            'apellidos',
            'email',
            'password'
        ]);

        // Si la password no esta vacia, la encriptamos
        if (!empty($datos['password'])) {
            $datos['password'] = bcrypt($datos['password']);
        } else {
            unset($datos['password']);
        }

        // Actualizamos datos
        $usuario->update($datos);

        // Mostramos usuario actualizado
        return response()->json([
            'message' => 'success',
            'usuario' => $usuario
        ], 200);
    }

    public function borrarUsuario(Request $request)
    {
        // Buscamos usuario por id
        $usuario = $request->user();
        // Si no lo encontramos, mostramos error
        if (!$usuario) {
            return response()->json([
                'message' => 'error',
                'usuario' => 'No existe ningún usuario con ese ID'
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
