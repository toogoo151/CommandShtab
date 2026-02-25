<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\LoginAttempt;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            // Regenerate session to prevent session fixation attacks
            $request->session()->regenerate();

            // Successful login, store the login details
            $user = Auth::user();
            $this->storeLoginDetails($user->id, $request->ip());

            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'user_type' => $user->user_type ?? null,
                ]
            ], 200);
        }

        $user = User::where('email', $request->email)->first();

        if ($user) {
            // User exists, so the password must be incorrect
            return response()->json(['message' => 'Нууц үг буруу.'], 401);
        } else {
            // User does not exist
            return response()->json(['message' => 'Хэрэглэгчийн нэр буруу байна.'], 401);
        }
    }

    public function getTuvshin()
    {
        return Auth::user()->userType;
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful'
        ], 200);
    }

    private function storeLoginDetails($userId, $ipAddress)
    {
        // Store the login details in your database
        try {
            $user = User::find($userId);
            if ($user) {
                LoginAttempt::create([
                    'email' => $user->email,
                    'user_ip' => $ipAddress,
                    'successful' => 'Нэвтэрсэн',
                ]);
            }
        } catch (\Exception $e) {
            // Log error if LoginAttempt table doesn't exist or has different structure
            \Log::error('Failed to store login details: ' . $e->getMessage());
        }
    }
}
