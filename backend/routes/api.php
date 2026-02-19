<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'loginUsuario']);
Route::post('/usuario', [AuthController::class, 'registroUsuario']);
Route::post('/logout', [AuthController::class, 'logoutUsuario']);