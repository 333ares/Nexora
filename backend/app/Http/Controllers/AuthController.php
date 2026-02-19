<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Usuario;

class AuthController extends Controller
{
    public function registroUsuario(Request $request)
    {
        // Validamos que los datos sean correctos
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string',
            'nombre' => 'required|string',
            'apellidos' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Si falla mostramos error
        if ($validator->fails()) {
            return response(
                [
                    'message' => 'error',
                    'errors' => $validator->errors()
                ],
                400
            );
        }

        // Creamos usuario
        Usuario::create($request->only([
            'name',
            'surname',
            'email',
        ]));
    }
}
