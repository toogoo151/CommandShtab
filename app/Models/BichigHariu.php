<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BichigHariu extends Model
{
    protected $table = 'csh_bichig_hariu';
    public $timestamps = true;

    protected $fillable = [
        'bichigID',
        'sourceTypeID',
        'destinationTypeID',
        'dugaar',
        'aguulga',
        'pdf',
        'fileSize',
        'ognoo',
        'description',
    ];

    protected $casts = [
        'ognoo' => 'datetime',
    ];

    /**
     * Хариу бичгүүдийг csh_bichig.id-аар татах.
     * bichigID -> csh_bichig.aguulga, sourceTypeID/destinationTypeID -> main_division.nickName
     */
    public function getByBichigID($bichigID)
    {
        if (empty($bichigID)) {
            return collect([]);
        }
        try {
            return DB::table('csh_bichig_hariu')
                ->leftJoin('csh_bichig', 'csh_bichig.id', '=', 'csh_bichig_hariu.bichigID')
                ->leftJoin('main_division as source_division', 'source_division.id', '=', 'csh_bichig_hariu.sourceTypeID')
                ->leftJoin('main_division as dest_division', 'dest_division.id', '=', 'csh_bichig_hariu.destinationTypeID')
                ->where('csh_bichig_hariu.bichigID', $bichigID)
                ->orderBy('csh_bichig_hariu.id', 'ASC')
                ->select(
                    'csh_bichig_hariu.id',
                    'csh_bichig_hariu.bichigID',
                    'csh_bichig.aguulga as bichigAguulga',
                    'csh_bichig_hariu.sourceTypeID',
                    'source_division.nickName as sourceTypeName',
                    'csh_bichig_hariu.destinationTypeID',
                    'dest_division.nickName as destinationTypeName',
                    'csh_bichig_hariu.dugaar',
                    'csh_bichig_hariu.aguulga',
                    'csh_bichig_hariu.pdf',
                    'csh_bichig_hariu.fileSize',
                    'csh_bichig_hariu.ognoo',
                    'csh_bichig_hariu.description',
                    'csh_bichig_hariu.created_at',
                    'csh_bichig_hariu.updated_at'
                )
                ->get();
        } catch (\Throwable $th) {
            return collect([]);
        }
    }

    /**
     * Нэг хариу бичгийн бүлэг (ижил bichigID, dugaar, ognoo, aguulga) буцаана.
     */
    public function getHariuGroup($id)
    {
        $row = self::find($id);
        if (!$row) {
            return collect([]);
        }
        return self::where('bichigID', $row->bichigID)
            ->where('dugaar', $row->dugaar)
            ->where('aguulga', $row->aguulga)
            ->where('ognoo', $row->ognoo)
            ->orderBy('id')
            ->get();
    }
}
