<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BichigType extends Model
{
    use HasFactory;

    protected $table = 'csh_bichig_type';
    public $timestamps = false;
    protected $fillable = ['typeName', 'description'];

    public function getBichigType()
    {
        try {
            return DB::table($this->table)
                ->orderBy('id', 'DESC')
                ->get();
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Баримт бичиг төрөл татаж чадсангүй.',
            ], 500);
        }
    }
}
