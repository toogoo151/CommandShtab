<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Redirect, Response, File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function NewUser(Request $req)
    {
        try {
            $req->validate([
                'divisionID' => 'required',
                'userType'   => 'required',
                'email'      => 'required|email|unique:users,email',
                'password'   => 'required|min:6',
            ], [
                'divisionID.required' => 'Бүтцийн нэгж сонгоно уу.',
                'userType.required'   => 'Хэрэглэгчийн түвшин сонгоно уу.',
                'email.required'      => 'Цахим хаяг оруулна уу.',
                'email.unique'        => 'Энэ цахим хаяг бүртгэлтэй байна.',
                'password.required'   => 'Нууц үг оруулна уу.',
                'password.min'        => 'Нууц үг хамгийн багадаа 6 тэмдэгт.',
            ]);

            $insertUser = new User();
            $insertUser->divisionID = $req->divisionID;
            $insertUser->userType   = $req->userType;
            $insertUser->email      = $req->email;
            $insertUser->password   = Hash::make($req->password);
            $insertUser->save();

            return response([
                "status" => "success",
                "msg"    => "Амжилттай хадгаллаа."
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response([
                "status" => "error",
                "msg"    => $e->validator->errors()->first()
            ], 422);
        } catch (\Throwable $th) {
            return response([
                "status" => "error",
                "msg"    => "Алдаа гарлаа."
            ], 500);
        }
    }

    public function EditUser(Request $req)
    {
        try {
            $edit = User::findOrFail($req->id);

            $rules = [
                'divisionID' => 'required',
                'userType'   => 'required',
                'email'      => 'required|email|unique:users,email,' . $req->id,
            ];
            if ($req->filled('password')) {
                $rules['password'] = 'min:6';
            }
            $req->validate($rules, [
                'divisionID.required' => 'Бүтцийн нэгж сонгоно уу.',
                'userType.required'   => 'Хэрэглэгчийн түвшин сонгоно уу.',
                'email.required'      => 'Цахим хаяг оруулна уу.',
                'email.unique'        => 'Энэ цахим хаяг өөр хэрэглэгчид бүртгэлтэй.',
                'password.min'        => 'Нууц үг хамгийн багадаа 6 тэмдэгт.',
            ]);

            $edit->divisionID = $req->divisionID;
            $edit->userType   = $req->userType;
            $edit->email      = $req->email;

            if ($req->password && trim($req->password) !== "") {
                $edit->password = Hash::make($req->password);
            }

            $edit->save();

            return response([
                "status" => "success",
                "msg"    => "Амжилттай заслаа."
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response([
                "status" => "error",
                "msg"    => $e->validator->errors()->first()
            ], 422);
        } catch (\Throwable $th) {
            return response([
                "status" => "error",
                "msg"    => "Алдаа гарлаа."
            ], 500);
        }
    }

    public function DeleteUser(Request $req)
    {
        try {
            $delete = User::find($req->id);
            $delete->delete();
            return response(
                array(
                    "status" => "success",
                    "msg" => "Амжилттай устгалаа."
                ),
                200
            );
        } catch (\Throwable $th) {
            return response(
                array(
                    "status" => "error",
                    "msg" => "Алдаа гарлаа."
                ),
                500
            );
        }
    }


    public function changePassword(Request $request)
    {
        $request->validate(
            [
                'current_password' => 'required',
                'new_password' => 'required|min:6|confirmed',
            ],
            [
                'new_password.confirmed' => 'Шинэ нууц үг таарахгүй байна',
                'new_password.min' => 'Нууц үг хамгийн багадаа 6 тэмдэгтэй байна',
                'current_password.required' => 'Одоогийн нууц үгээ оруулна уу',
            ]
        );

        $user = Auth::user();


        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Одоогийн нууц үг буруу байна'
            ], 422);
        }


        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Амжилттай солигдлоо'
        ], 200);
    }
}
