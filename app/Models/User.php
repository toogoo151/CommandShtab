<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\Division;




class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'divisionID',
        'userType',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [];

    use HasFactory;
    protected $table = 'users';
    public $timestamps = true;

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'id';
    }
    public function getUserName()
    {
        return $this->email ?? 'Нэр олдсонгүй';
    }

    public function division()
    {
        return $this->belongsTo(Division::class, 'divisionID', 'id');
    }

    public function getUser()
    {
        try {
            $user = DB::table("users")
                ->leftJoin("main_division", "main_division.id", "=", "users.divisionID")
                ->orderBy("users.id", "DESC")
                ->select("users.*", "main_division.nickName", "main_division.id as divisionIDshuu")
                ->get();
            return $user;
        } catch (\Throwable $th) {
            return response(
                array(
                    "status" => "error",
                    "msg" => "татаж чадсангүй."
                ),
                500
            );
        }
    }

    public function getDivisionName()
    {
        try {
            $user = DB::table("users")
                ->join("main_division", "main_division.id", "=", "users.divisionID")
                ->select("main_division.nickName")
                ->get();

            return response()->json($user); // JSON болгож буцаана
        } catch (\Throwable $th) {
            return response()->json([
                "status" => "error",
                "msg" => "татаж чадсангүй."
            ], 500);
        }
    }





    /**
     * Get the password for authentication.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->password;
    }
}
