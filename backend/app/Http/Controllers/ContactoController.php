<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contacto;

class ContactoController extends Controller
{
    /**
     * Listar todos los mensajes de contacto.
     */
    public function verTodos()
    {
        // Obtener todos los contactos, ordenados del más reciente al más antiguo
        $contactos = Contacto::orderBy('created_at', 'desc')->get();
        return response()->json($contactos);
    }

    /**
     * Guardar un nuevo mensaje de contacto en la base de datos.
     */
    public function guardarMensaje(Request $request)
    {
        // 1. Validar los datos que llegan
        $request->validate([
            'nombre'  => 'required|string',
            'email'   => 'required|email',
            'asunto'  => 'required|string',
            'mensaje' => 'required|string',
        ]);

        try {
            // 2. Crear y guardar el registro en la base de datos usando el Modelo
            $contacto = Contacto::create($request->all());

            // 3. Responder con el registro creado
            return response()->json([
                'message' => 'Mensaje guardado correctamente.',
                'data' => $contacto
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al guardar: ' . $e->getMessage()], 500);
        }
    }
}
