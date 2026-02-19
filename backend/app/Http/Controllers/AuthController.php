<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function registroUsuario(Request $request)
    {
        // Validamos que los datos sean correctos
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string',
            'nombre' => 'required|string',
            'apellidos' => 'required|string',
            'email' => 'required|email|unique:usuarios,email',
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

        // Si el usuario se ha creado correctamente mostramos mensaje
        if ($usuario) {
            return response()->json([
                'message' => 'Usuario creado correctamente'
            ], 201);

            // Si no, mostramos el error
        } else {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }
    }

    public function loginUsuario(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        } else {
            $credenciales = $request->only('email', 'password');
        }

        if (Auth::attempt($credenciales)) {
            return response()->json([
                'message' => 'Inicio de sesión correcto'
            ], 200);
        } else {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }
    }
}
