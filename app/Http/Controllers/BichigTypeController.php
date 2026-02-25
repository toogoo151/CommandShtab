<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BichigType;
use Illuminate\Http\Request;

class BichigTypeController extends Controller
{
    public function NewBichigType(Request $req)
    {
        try {
            $insert = new BichigType();
            $insert->typeName = $req->typeName;
            $insert->description = $req->description ?? null;
            $insert->save();
            return response([
                'status' => 'success',
                'msg' => 'Амжилттай хадгаллаа.',
            ], 200);
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Алдаа гарлаа.',
            ], 500);
        }
    }

    public function DeleteBichigType(Request $req)
    {
        try {
            $delete = BichigType::find($req->id);
            $delete->delete();
            return response([
                'status' => 'success',
                'msg' => 'Амжилттай устгалаа.',
            ], 200);
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Алдаа гарлаа.',
            ], 500);
        }
    }

    public function EditBichigType(Request $req)
    {
        try {
            $edit = BichigType::find($req->id);
            $edit->typeName = $req->typeName;
            $edit->description = $req->description ?? null;
            $edit->save();
            return response([
                'status' => 'success',
                'msg' => 'Амжилттай заслаа.',
            ], 200);
        } catch (\Throwable $th) {
            return response([
                'status' => 'error',
                'msg' => 'Алдаа гарлаа.',
            ], 500);
        }
    }
}
