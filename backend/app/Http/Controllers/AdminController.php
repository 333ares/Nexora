<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function listarUsuarios(Request $request)
    {
        // Coger el id del admin
        $admin = $request->user()->id;

        // Solo el admin tiene el id 1
        if ($admin == 1) {
            // Coger todos los usuarios
            $usuarios = Usuario::all();

            // Si no hay usuarios, devolver un mensaje de error
            if (count($usuarios) <= 0) {
                return response()->json([
                    'message' => 'error',
                    'usuarios' => 'No se encontraron usuarios'
                ], 200);
            }

            // Devolver los usuarios
            return response()->json([
                'message' => 'success',
                'usuarios' => $usuarios
            ], 200);
        } else {
            // Si no es el admin, devolver un mensaje de error
            return response()->json([
                'message' => 'error',
                'error' => 'No autorizado'
            ], 403);
        }
    }

    public function bloquearUsuario(Request $request)
    {
        $admin = $request->user()->id;

        if ($admin == 1) {
            // Validar que el user_id es un entero y que existe en la base de datos
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer'
            ]);

            // Si la validación falla, devolver un mensaje de error
            if ($validator->fails()) {
                return response()->json([
                    'message' => 'error',
                    'error' => $validator->errors()
                ], 422);
            }

            // Buscar el usuario por su id
            $usuario = Usuario::find($request->user_id);

            // Si el usuario no existe, devolver un mensaje de error
            if (!$usuario) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            $usuario->estado = 'bloqueado'; // Cambiar el estado del usuario a bloqueado
            $usuario->save(); // Guardar los cambios en la base de datos

            // Devolver el usuario bloqueado
            return response()->json([
                'message' => 'success',
                'usuario' => $usuario
            ], 200);
        } else {
            return response()->json([
                'message' => 'error',
                'error' => 'No autorizado'
            ], 403);
        }
    }

    public function desbloquearUsuario(Request $request)
    {
        $admin = $request->user()->id;

        if ($admin == 1) {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'error',
                    'error' => $validator->errors()
                ], 422);
            }

            $usuario = Usuario::find($request->user_id);

            if (!$usuario) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            $usuario->estado = 'activo'; // Cambiar el estado del usuario a activo
            $usuario->save(); // Guardar los cambios en la base de datos 

            // Devolver el usuario desbloqueado
            return response()->json([
                'message' => 'success', 
                'usuario' => $usuario
            ], 200);
        } else {
            return response()->json([
                'message' => 'error',
                'error' => 'No autorizado'
            ], 403);
        }
    }

    public function eliminarUsuario(Request $request)
    {
        $admin = $request->user()->id;

        if ($admin == 1) {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|integer'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'error',
                    'error' => $validator->errors()
                ], 422);
            }

            // Buscar el usuario por su id
            $usuario = Usuario::find($request->user_id);

            // Si el usuario no existe, devolver un mensaje de error
            if (!$usuario) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            // Eliminar el usuario de la base de datos
            $usuario->delete();

            // Devolver un mensaje de éxito
            return response()->json([
                'message' => 'success',
                'usuario' => 'Usuario eliminado correctamente'
            ], 200);
        } else {
            return response()->json([
                'message' => 'error',
                'error' => 'No autorizado'
            ], 403);
        }
    }
}
