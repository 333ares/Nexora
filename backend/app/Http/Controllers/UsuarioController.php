<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    public function listarInfo($id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'message' => 'error',
                'usuario' => 'No existe un usuario con ese ID'
            ], 400);
        } else {
            return response()->json([
                'message' => 'success',
                'usuario' => $usuario
            ], 200);
        }
    }

    public function actualizarUsuario(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'usuario' => 'nullable|string',
            'nombre' => 'nullable|string',
            'apellidos' => 'nullable|string',
            'email' => 'nullable|email|unique:usuarios,email',
            'password' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json([
                'message' => 'error',
                'animal' => 'No existe ningún usuario con ese ID'
            ], 404);
        }

        $usuario->update($request->only([
            'usuario',
            'nombre',
            'apellidos',
            'email',
            'password'
        ]));

        return response()->json([
            'message' => 'success',
            'animal' => $usuario
        ], 200);
    }
}
