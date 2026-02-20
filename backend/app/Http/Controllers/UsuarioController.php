<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;

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
}
