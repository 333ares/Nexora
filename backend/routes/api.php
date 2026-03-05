<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RetoController;

// Login, registro y logout
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuarios', [AuthController::class, 'registroUsuario']);
Route::get('/usuarios', [UsuarioController::class, 'index']);

// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logoutUsuario']);

    // Usuario
    Route::get('/usuarios/{id}', [UsuarioController::class, 'listarInfo']);
    Route::put('/usuarios/{id}', [UsuarioController::class, 'actualizarUsuario']);
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'borrarUsuario']);

    // Esta línea conecta la URL /api/retos con la función store del controlador
    Route::post('/retos', [RetoController::class, 'store']);
    Route::get('/retos/{id}', [RetoController::class, 'show']);
    
    Route::get('/retos', [RetoController::class, 'index']);
});
