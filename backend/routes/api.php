<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RetoController;

// Login, registro y logout
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuario', [AuthController::class, 'registroUsuario']);

// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logoutUsuario']);

    // Usuario
    Route::get('/usuario', [UsuarioController::class, 'listarInfo']);
    Route::put('/usuario', [UsuarioController::class, 'actualizarUsuario']);
    Route::delete('/usuario', [UsuarioController::class, 'borrarUsuario']);

// Esta línea conecta la URL /api/retos con la función store del controlador
Route::post('/retos', [RetoController::class, 'store']);
});
