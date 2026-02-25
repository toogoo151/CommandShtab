<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BichigAngilal extends Model
{
    use HasFactory;

    protected $table = 'csh_bichig_secret';
    public $timestamps = false;
    protected $fillable = ['secretName', 'description'];

    public function getBichigAngilal()
    {
        try {
            return DB::table($this->table)
                ->orderBy('id', 'DESC')
                ->get();
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Баримт бичиг ангилал татаж чадсангүй.',
            ], 500);
        }
    }
}
