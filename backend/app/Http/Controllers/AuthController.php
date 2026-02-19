<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registroUsuario(Request $request)
    {
        // Validamos que los datos sean correctos
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string',
            'nombre' => 'required|string',
            'apellidos' => 'required|string',
            'email' => 'required|email|unique',
            'password' => 'required|string',
        ]);

        // Si falla mostramos error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Creamos usuario
        $usuario = Usuario::create($request->all(), [
            'usuario',
            'nombre',
            'apellidos',
            'email',
            'password' => Hash::make($request->password),
        ]);

        if ($usuario) {
            return response()->json([
                'message' => 'Usuario creado correctamente'
            ], 201);

        } else {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }
    }
}
