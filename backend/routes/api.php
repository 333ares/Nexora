<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

// Login, registro y logout
Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuario', [AuthController::class, 'registroUsuario']);
Route::post('/logout', [AuthController::class, 'logoutUsuario']);

// Usuario
Route::get('/usuario/{id}', [UsuarioController::class, 'listarInfo']);
Route::put('/usuario/{id}', [UsuarioController::class, 'actualizarUsuario']);