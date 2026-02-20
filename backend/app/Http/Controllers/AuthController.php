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

        $usuario = Usuario::create([
            'usuario' => $request->usuario,
            'nombre' => $request->nombre,
            'apellidos' => $request->apellidos,
            'email' => $request->email,
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
        // Validamos que las credenciales sean correctas
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Si el validador falla, mosrtamos error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'error',
                'errors' => $validator->errors()
            ], 400);
        }

        // Buscamos el usuario por email
        $usuario = Usuario::where('email', $request->email)->first();

        // Validamos credenciales
        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json([
                'message' => 'error',
                'errors' => 'El correo o la contraseña no son correctos'
            ], 400);
        }

        // Generamos token
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto',
            'token' => $token,
            'usuario' => $usuario
        ], 200);
    }

    public function logoutUsuario(Request $request)
    {
        return response()->json([
            'message' => 'Cierre de sesión correcto'
        ], 200);
    }
}
