<?php

namespace App\Http\Controllers;

use App\Models\BichigHariu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BichigHariuController extends Controller
{
    public function NewBichigHariu(Request $req)
    {
        try {
            $destinationIds = (array) $req->input('destinationTypeID', []);
            $destinationIds = array_filter(array_map('strval', $destinationIds));

            $req->validate([
                'bichigID' => 'required|exists:csh_bichig,id',
                'dugaar' => 'required|string|max:255',
                'aguulga' => 'required|string',
                'ognoo' => 'required|date',
                'pdf' => 'nullable',
                'pdf.*' => 'file|mimes:pdf,doc,docx|max:51200',
            ], [
                'bichigID.required' => 'Бичиг сонгоно уу.',
                'dugaar.required' => 'Дугаар оруулна уу.',
                'aguulga.required' => 'Агуулга оруулна уу.',
                'ognoo.required' => 'Огноо оруулна уу.',
            ]);

            if (count($destinationIds) < 2) {
                return response(['status' => 'error', 'msg' => 'Хаашаа явсан хэсэгт дор хаяж 2 бүтцийн нэгж сонгоно уу.'], 422);
            }

            $userID = Auth::id();
            $sourceTypeID = Auth::user()->divisionID ?? null;
            if (!$sourceTypeID) {
                return response(['status' => 'error', 'msg' => 'Нэвтэрсэн хэрэглэгчийн бүтцийн нэгж олдсонгүй.'], 422);
            }

            $pdfPaths = [];
            $totalSize = 0;
            $pdfFiles = $req->file('pdf');
            if ($pdfFiles) {
                $pdfFiles = is_array($pdfFiles) ? $pdfFiles : [$pdfFiles];
                $baseDir = 'hariu_bichig/' . $userID;
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
                $insert = new BichigHariu();
                $insert->bichigID = $req->bichigID;
                $insert->sourceTypeID = $sourceTypeID;
                $insert->destinationTypeID = $destId;
                $insert->dugaar = $req->dugaar;
                $insert->aguulga = $req->aguulga;
                $insert->pdf = $pdfStr;
                $insert->fileSize = $fileSizeKb;
                $insert->ognoo = $req->ognoo;
                $insert->description = $req->description ?? null;
                $insert->save();
            }

            return response(['status' => 'success', 'msg' => 'Амжилттай хадгаллаа.'], 200);
        } catch (\Throwable $th) {
            return response(['status' => 'error', 'msg' => $th->getMessage() ?? 'Алдаа гарлаа.'], 500);
        }
    }

    public function EditBichigHariu(Request $req)
    {
        try {
            $ids = (array) $req->input('ids', []);
            $destinationIds = (array) $req->input('destinationTypeID', []);
            $destinationIds = array_filter(array_map('strval', $destinationIds));

            $req->validate([
                'dugaar' => 'required|string|max:255',
                'aguulga' => 'required|string',
                'ognoo' => 'required|date',
                'pdf' => 'nullable',
                'pdf.*' => 'file|mimes:pdf,doc,docx|max:51200',
            ], [
                'dugaar.required' => 'Дугаар оруулна уу.',
                'aguulga.required' => 'Агуулга оруулна уу.',
                'ognoo.required' => 'Огноо оруулна уу.',
            ]);

            if (count($ids) < 1) {
                return response(['status' => 'error', 'msg' => 'Засах бичгийг сонгоно уу.'], 422);
            }
            if (count($destinationIds) < 2) {
                return response(['status' => 'error', 'msg' => 'Хаашаа явсан хэсэгт дор хаяж 2 бүтцийн нэгж сонгоно уу.'], 422);
            }

            $first = BichigHariu::findOrFail($ids[0]);
            $userID = Auth::id();

            $keepPaths = array_filter(array_map('trim', explode(';', $req->input('pdf_keep', ''))));
            $newPaths = [];
            $newSize = 0;
            $pdfFiles = $req->file('pdf');
            if ($pdfFiles) {
                $pdfFiles = is_array($pdfFiles) ? $pdfFiles : [$pdfFiles];
                $baseDir = 'hariu_bichig/' . $userID;
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

            BichigHariu::whereIn('id', $ids)->delete();

            $sourceTypeID = Auth::user()->divisionID ?? $first->sourceTypeID;
            foreach ($destinationIds as $destId) {
                $insert = new BichigHariu();
                $insert->bichigID = $first->bichigID;
                $insert->sourceTypeID = $sourceTypeID;
                $insert->destinationTypeID = $destId;
                $insert->dugaar = $req->dugaar;
                $insert->aguulga = $req->aguulga;
                $insert->pdf = $pdfStr;
                $insert->fileSize = $fileSizeKb;
                $insert->ognoo = $req->ognoo;
                $insert->description = $req->description ?? null;
                $insert->save();
            }

            return response(['status' => 'success', 'msg' => 'Амжилттай заслаа.'], 200);
        } catch (\Throwable $th) {
            return response(['status' => 'error', 'msg' => $th->getMessage() ?? 'Алдаа гарлаа.'], 500);
        }
    }

    public function DeleteBichigHariu(Request $req)
    {
        try {
            $delete = BichigHariu::findOrFail($req->id);
            $delete->delete();
            return response(['status' => 'success', 'msg' => 'Амжилттай устгалаа.'], 200);
        } catch (\Throwable $th) {
            return response(['status' => 'error', 'msg' => 'Алдаа гарлаа.'], 500);
        }
    }

    public function downloadHariuBichigFile(Request $req)
    {
        $path = $req->query('path');
        if (!$path || strpos($path, '..') !== false || strpos($path, 'hariu_bichig/') !== 0) {
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
