<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BichigBarimt;
use App\Models\BichigCat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

use App\Notifications\DocumentSentNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BichigBarimtController extends Controller
{

    /**
     * Ganbat Notification
     */
    private function notifyDestinationDivisionIfDivision($document, $destinationTypeID, $senderUserID)
    {
        $isDivision = DB::table('main_division')->where('id', $destinationTypeID)->exists();
        if (!$isDivision) {
            return;
        }
        $usersInDivision = User::where('divisionID', $destinationTypeID)
            ->where('id', '!=', $senderUserID)
            ->get();
        foreach ($usersInDivision as $user) {
            $user->notify(new DocumentSentNotification($document));
        }
    }
    // Ganbat Notification end

    public function NewBichigBarimt(Request $req)
    {
        // try {
        $isYwsan = $req->input('source') === 'ywsan';

        $rules = [
            'hariutaiEseh' => 'required|in:1,2',
            'typeID' => 'required',
            'secretID' => 'required',
            'sourceTypeID' => 'required',
            'dugaar' => 'required',
            'aguulga' => 'required',
            'ognoo' => 'required',
            'pdf' => 'nullable',
            'pdf.*' => 'file|mimes:pdf,doc,docx|max:51200',
        ];
        if ($isYwsan) {
            $rules['destinationTypeID'] = 'required|array|min:1';
            $rules['destinationTypeID.*'] = 'required';
        } else {
            $rules['catID'] = 'required';
            $rules['destinationTypeID'] = 'required';
        }

        $req->validate($rules, [
            'hariutaiEseh.required' => 'Хариутай эсэх сонгоно уу.',
            'hariutaiEseh.in' => 'Хариугүй (1) эсвэл Хариутай (2) сонгоно уу.',
            'catID.required' => 'Баримт бичгийн ангилал сонгоно уу.',
            'typeID.required' => 'Баримт бичгийн төрөл сонгоно уу.',
            'secretID.required' => 'Нууцлал сонгоно уу.',
            'sourceTypeID.required' => 'Хаанаас ирсэн сонгоно уу.',
            'destinationTypeID.required' => 'Хаашаа явсан дор хаяж 1 нэгж сонгоно уу.',
            'destinationTypeID.*.required' => 'Хаашаа явсан сонгоно уу.',
            'dugaar.required' => 'Дугаар оруулна уу.',
            'aguulga.required' => 'Агуулга оруулна уу.',
            'ognoo.required' => 'Огноо оруулна уу.',
        ]);

        $destinationIds = $isYwsan
            ? (array) $req->input('destinationTypeID', [])
            : [(string) $req->destinationTypeID];
        if ($isYwsan && count($destinationIds) < 1) {
            return response(['status' => 'error', 'msg' => 'Хаашаа явсан хэсэгт дор хаяж 1 бүтцийн нэгж сонгоно уу.'], 422);
        }

        if ($req->hariutaiEseh == '2' && ($req->hariuOgnoo === null || $req->hariuOgnoo === '')) {
            return response(['status' => 'error', 'msg' => 'Хариутай сонгосон тохиолдолд Хариу өгөх огноо (минут) оруулна уу.'], 422);
        }

        $catID = $req->catID;
        if ($isYwsan) {
            $ywsanCat = BichigCat::where('catName', 'Явсан')->first();
            if (!$ywsanCat) {
                return response(['status' => 'error', 'msg' => 'Явсан ангилал тохиргоонд олдсонгүй. csh_bichig_cat хүснэгтэд "Явсан" нэртэй ангилал нэмнэ үү.'], 422);
            }
            $catID = $ywsanCat->id;
        }

        $userID = $req->userID ?? Auth::id();
        $pdfPaths = [];
        $totalSize = 0;

        $pdfFiles = $req->file('pdf');
        if ($pdfFiles) {
            if (!is_array($pdfFiles)) {
                $pdfFiles = [$pdfFiles];
            }
            $baseDir = 'ywsan_bichig/' . $userID;
            foreach ($pdfFiles as $file) {
                if ($file && $file->isValid()) {
                    $originalName = $file->getClientOriginalName();
                    $path = $file->storeAs($baseDir, $originalName, 'public');
                    if ($path) {
                        $pdfPaths[] = $path;
                        $totalSize += $file->getSize();
                    }
                }
            }
        }

        $pdfStr = count($pdfPaths) > 0 ? implode(';', $pdfPaths) : null;
        $fileSizeKb = $totalSize ? (int) round($totalSize / 1024) : null;

        foreach ($destinationIds as $destId) {
            $insert = new BichigBarimt();
            $insert->userID = $userID;
            $insert->hariutaiEseh = $req->hariutaiEseh;
            $insert->catID = $catID;
            $insert->typeID = $req->typeID;
            $insert->secretID = $req->secretID;
            $insert->level = $req->level ?? null;
            $insert->belenBaidalID = $req->belenBaidalID ?? null;
            $insert->sourceTypeID = $req->sourceTypeID;
            $insert->destinationTypeID = $destId;
            $insert->dugaar = $req->dugaar;
            $insert->aguulga = $req->aguulga;
            $insert->pdf = $pdfStr;
            $insert->fileSize = $fileSizeKb;
            $insert->ognoo = $req->ognoo;
            $insert->hariuOgnoo = $req->hariuOgnoo ?? null;
            $insert->description = $req->description ?? null;
            $insert->save();

            // Ganbat Notification

            $this->notifyDestinationDivisionIfDivision($insert, $destId, $userID);
            // Ganbat Notification end
        }

        return response([
            'status' => 'success',
            'msg' => 'Амжилттай хадгаллаа.',
        ], 200);
        // } catch (\Throwable $th) {
        //     return response([
        //         'status' => 'error',
        //         'msg' => 'Алдаа гарлаа.',
        //     ], 500);
        // }
    }

    public function DeleteBichigBarimt(Request $req)
    {
        try {
            $delete = BichigBarimt::find($req->id);
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

    public function EditBichigBarimt(Request $req)
    {
        try {
            $isYwsan = $req->input('source') === 'ywsan';

            $rules = [
                'hariutaiEseh' => 'required|in:1,2',
                'typeID' => 'required',
                'secretID' => 'required',
                'sourceTypeID' => 'required',
                'dugaar' => 'required',
                'aguulga' => 'required',
                'ognoo' => 'required',
                'pdf' => 'nullable',
                'pdf.*' => 'file|mimes:pdf,doc,docx|max:51200',
            ];
            if ($isYwsan) {
                $rules['ids'] = 'required|array|min:1';
                $rules['ids.*'] = 'required|exists:csh_bichig,id';
                $rules['destinationTypeID'] = 'required|array|min:1';
                $rules['destinationTypeID.*'] = 'required';
            } else {
                $rules['id'] = 'required|exists:csh_bichig,id';
                $rules['catID'] = 'required';
                $rules['destinationTypeID'] = 'required';
            }

            $req->validate($rules, [
                'hariutaiEseh.required' => 'Хариутай эсэх сонгоно уу.',
                'catID.required' => 'Баримт бичгийн ангилал сонгоно уу.',
                'typeID.required' => 'Баримт бичгийн төрөл сонгоно уу.',
                'secretID.required' => 'Нууцлал сонгоно уу.',
                'sourceTypeID.required' => 'Хаанаас ирсэн сонгоно уу.',
                'destinationTypeID.required' => 'Хаашаа явсан дор хаяж 1 нэгж сонгоно уу.',
                'destinationTypeID.*.required' => 'Хаашаа явсан сонгоно уу.',
                'dugaar.required' => 'Дугаар оруулна уу.',
                'aguulga.required' => 'Агуулга оруулна уу.',
                'ognoo.required' => 'Огноо оруулна уу.',
            ]);

            if ($req->hariutaiEseh == '2' && ($req->hariuOgnoo === null || $req->hariuOgnoo === '')) {
                return response(['status' => 'error', 'msg' => 'Хариутай сонгосон тохиолдолд Хариу өгөх огноо (минут) оруулна уу.'], 422);
            }

            $catID = $req->catID ?? null;
            if ($isYwsan) {
                $ywsanCat = BichigCat::where('catName', 'Явсан')->first();
                if (!$ywsanCat) {
                    return response(['status' => 'error', 'msg' => 'Явсан ангилал тохиргоонд олдсонгүй. csh_bichig_cat хүснэгтэд "Явсан" нэртэй ангилал нэмнэ үү.'], 422);
                }
                $catID = $ywsanCat->id;
            }

            if ($isYwsan) {
                $ids = (array) $req->input('ids', []);
                $destinationIds = (array) $req->input('destinationTypeID', []);
                if (count($destinationIds) < 1) {
                    return response(['status' => 'error', 'msg' => 'Хаашаа явсан хэсэгт дор хаяж 1 бүтцийн нэгж сонгоно уу.'], 422);
                }

                $first = BichigBarimt::findOrFail($ids[0]);
                $userID = $first->userID;

                $keepPaths = array_filter(array_map('trim', explode(';', $req->input('pdf_keep', ''))));
                $newPaths = [];
                $newSize = 0;
                $pdfFiles = $req->file('pdf');
                if ($pdfFiles) {
                    if (!is_array($pdfFiles)) {
                        $pdfFiles = [$pdfFiles];
                    }
                    $baseDir = 'ywsan_bichig/' . $userID;
                    foreach ($pdfFiles as $file) {
                        if ($file && $file->isValid()) {
                            $originalName = $file->getClientOriginalName();
                            $path = $file->storeAs($baseDir, $originalName, 'public');
                            if ($path) {
                                $newPaths[] = $path;
                                $newSize += $file->getSize();
                            }
                        }
                    }
                }
                $allPaths = array_merge($keepPaths, $newPaths);
                $pdfStr = count($allPaths) > 0 ? implode(';', $allPaths) : null;
                $fileSizeKb = $first->fileSize ? (int) $first->fileSize : 0;
                if (count($newPaths) > 0) {
                    $fileSizeKb += (int) round($newSize / 1024);
                }

                BichigBarimt::whereIn('id', $ids)->delete();

                foreach ($destinationIds as $destId) {
                    $insert = new BichigBarimt();
                    $insert->userID = $userID;
                    $insert->hariutaiEseh = $req->hariutaiEseh;
                    $insert->catID = $catID;
                    $insert->typeID = $req->typeID;
                    $insert->secretID = $req->secretID;
                    $insert->level = $req->level ?? null;
                    $insert->belenBaidalID = $req->belenBaidalID ?? null;
                    $insert->sourceTypeID = $req->sourceTypeID;
                    $insert->destinationTypeID = $destId;
                    $insert->dugaar = $req->dugaar;
                    $insert->aguulga = $req->aguulga;
                    $insert->pdf = $pdfStr;
                    $insert->fileSize = $fileSizeKb;
                    $insert->ognoo = $req->ognoo;
                    $insert->hariuOgnoo = $req->hariuOgnoo ?? null;
                    $insert->description = $req->description ?? null;
                    $insert->save();

                    // Ganbat Notification

                    $this->notifyDestinationDivisionIfDivision($insert, $destId, $userID);
                    // Ganbat Notification end
                }

                return response([
                    'status' => 'success',
                    'msg' => 'Амжилттай заслаа.',
                ], 200);
            }

            $edit = BichigBarimt::findOrFail($req->id);
            $userID = $edit->userID;
            if ($req->has('userID')) {
                $edit->userID = $req->userID;
                $userID = $req->userID;
            }
            $edit->hariutaiEseh = $req->hariutaiEseh;
            $edit->catID = $catID;
            $edit->typeID = $req->typeID;
            $edit->secretID = $req->secretID;
            $edit->level = $req->level ?? null;
            $edit->belenBaidalID = $req->belenBaidalID ?? null;
            $edit->sourceTypeID = $req->sourceTypeID;
            $edit->destinationTypeID = $req->destinationTypeID;
            $edit->dugaar = $req->dugaar;
            $edit->aguulga = $req->aguulga;

            $keepPaths = array_filter(array_map('trim', explode(';', $req->input('pdf_keep', ''))));
            $newPaths = [];
            $newSize = 0;
            $pdfFiles = $req->file('pdf');
            if ($pdfFiles) {
                if (!is_array($pdfFiles)) {
                    $pdfFiles = [$pdfFiles];
                }
                $baseDir = 'ywsan_bichig/' . $userID;
                foreach ($pdfFiles as $file) {
                    if ($file && $file->isValid()) {
                        $originalName = $file->getClientOriginalName();
                        $path = $file->storeAs($baseDir, $originalName, 'public');
                        if ($path) {
                            $newPaths[] = $path;
                            $newSize += $file->getSize();
                        }
                    }
                }
            }
            $allPaths = array_merge($keepPaths, $newPaths);
            $edit->pdf = count($allPaths) > 0 ? implode(';', $allPaths) : null;
            if (count($newPaths) > 0) {
                $edit->fileSize = (int) $edit->fileSize + (int) round($newSize / 1024);
            }

            $edit->ognoo = $req->ognoo;
            $edit->hariuOgnoo = $req->hariuOgnoo ?? null;
            $edit->description = $req->description ?? null;
            $edit->save();

            // Ganbat Notification
            $this->notifyDestinationDivisionIfDivision($edit, $edit->destinationTypeID, $userID);
            // Ganbat Notification

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

    /**
     * Явсан баримтын хавсралт файл татах (storage/app/public/ywsan_bichig/userID/...)
     */
    public function downloadYwsanBichigFile(Request $req)
    {
        $path = $req->query('path');
        if (!$path || strpos($path, '..') !== false || strpos($path, 'ywsan_bichig/') !== 0) {
            abort(404);
        }
        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }
        $fullPath = Storage::disk('public')->path($path);
        $mimeType = Storage::disk('public')->mimeType($path);
        $name = basename($path);
        $content = file_get_contents($fullPath);
        $disposition = $req->query('download') ? 'attachment' : 'inline';
        return response($content, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => $disposition . '; filename="' . $name . '"',
        ]);
    }
}
