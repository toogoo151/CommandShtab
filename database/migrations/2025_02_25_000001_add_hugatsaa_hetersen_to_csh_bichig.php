<?php

use App\Models\BichigHariu;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('csh_bichig', function (Blueprint $table) {
            $table->integer('hugatsaaHetersen')->nullable()->after('hariuOgnoo')->comment('Хариу ирсэн үед: (hariu.ognoo - bichig.ognoo) минутанд - hariuOgnoo');
        });

        $bichigIds = \Illuminate\Support\Facades\DB::table('csh_bichig_hariu')->distinct()->pluck('bichigID');
        foreach ($bichigIds as $bichigID) {
            BichigHariu::updateHugatsaaHetersenForBichig($bichigID);
        }
    }

    public function down(): void
    {
        Schema::table('csh_bichig', function (Blueprint $table) {
            $table->dropColumn('hugatsaaHetersen');
        });
    }
};
