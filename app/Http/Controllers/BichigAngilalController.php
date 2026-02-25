<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BichigAngilal;
use Illuminate\Http\Request;

class BichigAngilalController extends Controller
{
    public function NewBichigAngilal(Request $req)
    {
        try {
            $insert = new BichigAngilal();
            $insert->secretName = $req->secretName;
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

    public function DeleteBichigAngilal(Request $req)
    {
        try {
            $delete = BichigAngilal::find($req->id);
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

    public function EditBichigAngilal(Request $req)
    {
        try {
            $edit = BichigAngilal::find($req->id);
            $edit->secretName = $req->secretName;
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
