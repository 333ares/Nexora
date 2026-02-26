<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

// Login, registro y logout
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuario', [AuthController::class, 'registroUsuario']);

// Rutas protegidas con autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logoutUsuario']);
    
    // Usuario
    Route::get('/usuario/{id}', [UsuarioController::class, 'listarInfo']);
    Route::put('/usuario/{id}', [UsuarioController::class, 'actualizarUsuario']);
    Route::delete('/usuario/{id}', [UsuarioController::class, 'borrarUsuario']);
});