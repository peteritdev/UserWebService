const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const date = require('date-and-time');

var config = require('../config/config.json');

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

const serviceSyncMasterData = require('../service/syncmasterdata.js');
const serviceSyncMasterData_new = require('../service/syncmasterdata_new');

const serviceSyncMasterDataV2 = require('../service/syncmasterdatav2');

const modelUser = require('../models').users; 
const modelUserPendidikanUmum = require('../models').users_pendidikan_umum;
const modelUserPendidikanDiklat = require('../models').users_pendidikan_diklat;
const modelUserRiwayatPangkat = require('../models').user_history_pangkat;
const modelUserRiwayatJabatan = require('../models').user_history_jabatan;

const modelTingkatPendidikan = require('../models').db_tingkat_pendidikan;
const modelJurusan = require('../models').db_pendidikan_jurusan;

const modelJenisPMK = require('../models').db_jenis_pmk;
const modelPMK = require('../models').user_history_peninjauan_masa_kerja;

const modelTipeKursus = require('../models').db_tipe_kursus;
const modelJenisKursus = require('../models').db_jenis_kursus;
const modelKursus = require('../models').users_pendidikan_non_formal;

const modelJenisPenghargaan = require('../models').db_jenis_penghargaan;
const modelPenghargaan = require('../models').user_history_penghargaan;

const modelHukdis = require('../models').user_history_hukum_disiplin;
const modelHistoryUnor = require('../models').user_history_unor;

const modelSKP = require('../models').user_history_skp;

const modelAngkaKredit = require('../models').user_history_angkakredit;

module.exports = {

    syncProfile( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncUserProfile.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {

                    libUtil.writeLog("--- Start Sync Master Data ---", "syncuser");
                    libUtil.writeLog(">>> NIP : " + req.body.nip);
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({
                            "status_code": "-99",
                            "status_msg": "NIP not found at BKN"
                        });
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{            
                        
                        /*Update User Data*/
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        // Tanggal Lahir
                        var xTglLahirFormattedDate = "";
                        if( result.data.tglLahir != null && result.data.tglLahir != "" ){
                            xTglLahirFormattedDate = libUtil.parseToFormattedDate( result.data.tglLahir );
                        }

                        // Tmt Jabatan
                        var xTmtJabatanFormattedDate = "";
                        if( result.data.tmtJabatan != null && result.data.tmtJabatan != "" ){                            
                            xTmtJabatanFormattedDate = libUtil.parseToFormattedDate( result.data.tmtJabatan );
                        }
                        

                        // Thn Lulus
                        var xThnLulusFormattedDate = "";
                        if( result.data.tahunLulus != null && result.data.tahunLulus != "" ){                            
                            xThnLulusFormattedDate = libUtil.parseToFormattedDate( result.data.tahunLulus );
                        }

                        // TMT CPNS
                        var xTmtCpns = "";
                        if( result.data.tmtCpns != null && result.data.tmtCpns != "" ){                            
                            xTmtCpns = libUtil.parseToFormattedDate( result.data.tmtCpns );
                        }                        

                        // Tgl SK CPNS
                        var xTglSkCpns = "";
                        if( result.data.tglSkCpns != null && result.data.tglSkCpns != "" ){                            
                            xTglSkCpns = libUtil.parseToFormattedDate( result.data.tglSkCpns );
                        }

                        // Tgl Surat dokter CPNS
                        var xTglSuratDokterCPNS = "";
                        if( result.data.tglSuratKeteranganDokter != null && result.data.tglSuratKeteranganDokter != "" ){                            
                            xTglSuratDokterCPNS = libUtil.parseToFormattedDate( result.data.tglSuratKeteranganDokter );
                        }

                        // TMT PNS
                        var xTmtPns = "";
                        if( result.data.tmtPns != null && result.data.tmtPns != "" ){                            
                            xTmtPns = libUtil.parseToFormattedDate( result.data.tmtPns );
                        }

                        // Tgl SK PNS
                        var xTglSkPns = "";
                        if( result.data.tglSkPns != null && result.data.tglSkPns != "" ){                            
                            xTglSkPns = libUtil.parseToFormattedDate( result.data.tglSkPns );
                        }

                        // Tgl Surat Dokter PNS
                        var xTglSuratDokterPNS = "0000-00-00";
                        
                        // Tgl STTPL
                        var xTglSttpl = "";
                        if( result.data.tglSttpl != null && result.data.tglSttpl != "" ){                            
                            xTglSttpl = libUtil.parseToFormattedDate( result.data.tglSttpl );
                        }

                        // Tgl NPWP
                        var xTglNpwp = "";
                        if( result.data.tglNpwp != null && result.data.tglNpwp != "" ){                            
                            xTglNpwp = libUtil.parseToFormattedDate( result.data.tglNpwp );
                        }

                        // Tgl TMT Eselon
                        var xTmtEselon = "";
                        if( result.data.tmtEselon != null && result.data.tmtEselon != "" ){                            
                            xTmtEselon = libUtil.parseToFormattedDate( result.data.tmtEselon );
                        }

                        // Tgl TMT Gol. Akhir
                        var xTmtGolAkhir = "";
                        if( result.data.tmtGolAkhir != null && result.data.tmtGolAkhir != "" ){                            
                            xTmtGolAkhir = libUtil.parseToFormattedDate( result.data.tmtGolAkhir );
                        }

                        // Tgl Surat keterangan bebas narkoba
                        var xTglSuratKetBebasNarkoba = "";
                        if( result.data.tglSuratKeteranganBebasNarkoba != null && result.data.tglSuratKeteranganBebasNarkoba != "" ){
                            xTglSuratKetBebasNarkoba = libUtil.parseToFormattedDate( result.data.tglSuratKeteranganBebasNarkoba );
                        }

                        // Tgl SKCK
                        var xTglSkck = "";
                        if( result.data.tglSkck != null && result.data.tglSkck != "" ){
                            xTglSkck = libUtil.parseToFormattedDate( result.data.tglSkck );
                        }

                        // Tgl SPMT
                        var xTglSPMT = "";
                        if( result.data.tglSpmt != null && result.data.tglSpmt != "" ){
                            xTglSPMT = libUtil.parseToFormattedDate( result.data.tglSpmt );
                        }

                        // Tgl Meninggal
                        var xTglMeninggal = "";
                        if( result.data.tglMeninggal != null && result.data.tglMeninggal != "" ){
                            xTglMeninggal = libUtil.parseToFormattedDate( result.data.tglMeninggal );
                        }

                        var xInitSaveAgama = serviceSyncMasterData.saveAgama(result.data.agamaId, result.data.agama);
                        xInitSaveAgama.then(function(pAgamaId){
                            
                            var xInitSaveJenisKawin = serviceSyncMasterData.saveStatusPernikahan( result.data.jenisKawinId, result.data.statusPerkawinan);
                            xInitSaveJenisKawin.then( function( pJenisKawinId ){

                                var xInitTipePegawai = serviceSyncMasterData.saveTipePegawai(result.data.jenisJabatanId, result.data.jenisJabatan);
                                xInitTipePegawai.then( function( pTipePegawaiId ){

                                    var xInitKppn = serviceSyncMasterData.saveKppn(result.data.kppnId, result.data.kppnNama);
                                    xInitKppn.then( function(pKppnId){
                                        var xInitJenisPegawai = serviceSyncMasterData.saveJenisPegawai( result.data.jenisPegawaiId, result.data.jenisPegawaiNama);
                                        xInitJenisPegawai.then(function( pJenisPegawaiId ){

                                            var xInitKedudukan = serviceSyncMasterData.saveKedudukan( result.data.kedudukanPnsId, result.data.kedudukanPnsNama );
                                            xInitKedudukan.then( function( pKedudukanId ){

                                                var xInitTingkatPendidikan = serviceSyncMasterData.saveTingkatPendidikan( result.data.tkPendidikanTerakhirId, result.data.tkPendidikanTerakhir );
                                                                                      
                                                
                                                xInitTingkatPendidikan.then( function( pTingkatPendidikanId ){

                                                    var xInitJabatan = serviceSyncMasterData.saveJabatan( result.data.jabatanStrukturalId, result.data.jabatanStrukturalNama);
                                                    xInitJabatan.then( function( pJabatanId ){
                                                        
                                                        var xInitStatusPegawai = serviceSyncMasterData.saveStatusPegawai( 0, result.data.statusPegawai);
                                                        xInitStatusPegawai.then(function( pStatusPegawaiId ){

                                                            var xInitJurusan = serviceSyncMasterData.savePendidikanJurusan( result.data.pendidikanTerakhirId, result.data.pendidikanTerakhirNama);
                                                            xInitJurusan.then( function( pJurusanId ){

                                                                var xInitGolonganAwal = serviceSyncMasterData.saveGolongan( result.data.golRuangAwalId, result.data.golRuangAwal );
                                                                xInitGolonganAwal.then( function( pGolonganAwalId ){

                                                                    var xInitKtua = serviceSyncMasterData.saveKtua( result.data.ktuaId, result.data.ktuaNama );
                                                                    xInitKtua.then( function( pKtuaId ){

                                                                        var xInitTaspen = serviceSyncMasterData.saveTaspen( result.data.taspenId, result.data.taspenNama );
                                                                        xInitTaspen.then( function( pTaspenId ){

                                                                            var xInitJabatanFungsional = serviceSyncMasterData.saveJabatanFungsional( result.data.jabatanFungsionalId, result.data.jabatanFungsionalNama );
                                                                            xInitJabatanFungsional.then( function( pJabatanFungsionalId ){
                                                                                
                                                                                var xInitJabatanFungsionalUmum = serviceSyncMasterData.saveJabatanFungsionalUmum( result.data.jabatanFungsionalUmumId, result.data.jabatanFungsionalUmumNama );
                                                                                xInitJabatanFungsionalUmum.then( function( pJabatanFungsionalUmumId ){
                                                                                    
                                                                                    var xInitInstansiInduk = serviceSyncMasterData.saveInstansiInduk( result.data.instansiIndukId, result.data.instansiIndukNama );
                                                                                    xInitInstansiInduk.then( function( pInstansiIndukId ){

                                                                                       var xInitSatuanKerjaInduk = serviceSyncMasterData.saveSatuanKerjaInduk( result.data.satuanKerjaIndukId, result.data.satuanKerjaIndukNama );
                                                                                       xInitSatuanKerjaInduk.then( function( pSatuanKerjaIndukId ){
                                                                                           
                                                                                            var xInitKanreg = serviceSyncMasterData.saveKanreg( result.data.kanregId, result.data.kanregNama );
                                                                                            xInitKanreg.then( function( pKanregId ){

                                                                                                var xInitInstansiKerja = serviceSyncMasterData.saveInstansiKerja( result.data.instansiKerjaId, result.data.instansiKerjaNama );
                                                                                                xInitInstansiKerja.then( function( pInstansiKerjaId ){

                                                                                                    var xInitSatuanKerja = serviceSyncMasterData.saveSatuanKerja( result.data.satuanKerjaKerjaId, result.data.satuanKerjaKerjaNama );
                                                                                                    xInitSatuanKerja.then( function( pSatuanKerjaId ){

                                                                                                        var xInitEselon = serviceSyncMasterData.saveEselon( result.data.eselonId, result.data.eselon );
                                                                                                        xInitEselon.then( function( pEselonId ){

                                                                                                            var xInitUnor = serviceSyncMasterData.saveUnor( result.data.unorId, result.data.unorNama );
                                                                                                            xInitUnor.then( function( pUnorId ){

                                                                                                                var xInitUnorInduk = serviceSyncMasterData.saveUnorInduk( result.data.unorIndukId, result.data.unorIndukNama );
                                                                                                                xInitUnorInduk.then( function( pUnorIndukId ){

                                                                                                                    var xInitGolonganAwal = serviceSyncMasterData.saveGolongan( result.data.golRuangAwalId, result.data.golRuangAwal );
                                                                                                                    xInitGolonganAwal.then( function( pGolongaAwalId ){

                                                                                                                        var xInitGolonganAkhir = serviceSyncMasterData.saveGolonganRuangAkhir( result.data.golRuangAkhirId, result.data.golRuangAkhir );
                                                                                                                        xInitGolonganAkhir.then( function( pGolongaAkhirId ){

                                                                                                                            var xInitJabatanStruktural = serviceSyncMasterData.saveJabatanStruktural( result.data.jabatanStrukturalId, result.data.jabatanStrukturalNama );
                                                                                                                            xInitJabatanStruktural.then( function( pJabatanStrukturalId ){

                                                                                                                                modelUser
                                                                                                                                    .findOrCreate({
                                                                                                                                        where: {
                                                                                                                                            nip: result.data.nipBaru
                                                                                                                                        },
                                                                                                                                        defaults:{
                                                                                                                                                    name: result.data.nama,
                                                                                                                                                    gelar_depan: result.data.gelarDepan,
                                                                                                                                                    gelar_belakang: result.data.gelarBelakang,
                                                                                                                                                    tempat_lahir: result.data.tempatLahir,
                                                                                                                                                    tanggal_lahir: ( xTglLahirFormattedDate == "" ? null : xTglLahirFormattedDate ),
                                                                                                                                                    jenis_kelamin_id: (result.data.jenisKelamin == "Pria" ? config.jenisKelamin.pria : ( result.data.jenisKelamin == "Wanita" ? config.jenisKelamin.wanita : "" )),
                                                                                                                                                    agama_id: ( ( result.data.agamaId == "" && result.data.agamaId == null ) ? null : pAgamaId ),
                                                                                                                                                    status_pernikahan_id: ( ( result.data.jenisKawinId == "" && result.data.jenisKawinId == null ) ? null : pJenisKawinId ),
                                                                                                                                                    //alamat_tinggal: result.data.alamat,
                                                                                                                                                    //alamat_ktp: result.data.alamat,
                                                                                                                                                    tipe_pegawai_id: ( ( result.data.jenisJabatanId == "" && result.data.jenisJabatanId == null ) ? null : pTipePegawaiId ),
                                                                                                                                                    status_pegawai_id: ( ( result.data.statusPegawai == "" && result.data.statusPegawai == null ) ? null : pStatusPegawaiId ),
                                                                                                                                                    kppn: ( ( result.data.kppnId == "" && result.data.kppnNama == null ) ? null : pKppnId ),
                                                                                                                                                    jenis_pegawai_id: ( ( result.data.jenisPegawaiId == "" && result.data.jenisPegawaiId == null ) ? null : pJenisPegawaiId ),
                                                                                                                                                    kedudukan_id: ( ( result.data.kedudukanPnsId == "" && result.data.kedudukanPnsId == null ) ? null : pKedudukanId ),
                                                                                                                                                    askes_atau_bpjs: ( result.data.noAskes == null ? result.data.bpjs : result.data.noAskes ),
                                                                                                                                                    no_taspen: result.data.noTaspen,
                                                                                                                                                    taspen_id: ( ( result.data.taspenId == "" && result.data.taspenId == null ) ? null : pTaspenId ), 
                                                                                                                                                    no_npwp: result.data.noNpwp,
                                                                                                                                                    tgl_npwp: ( xTglNpwp == "" ? null : xTglNpwp ),
                                                                                                                                                    nik: result.data.nik,
                                                                                                                                                    //no_hp: result.data.noHp,
                                                                                                                                                    //email: result.data.email,
                                                                                                                                                    nama_jabatan_id: pJabatanId,
                                                                                                                                                    jabatan_struktural_id: ( ( result.data.jabatanStrukturalId == "" && result.data.jabatanStrukturalId == null ) ? null : pJabatanStrukturalId ),
                                                                                                                                                    jabatan_fungsional_id: ( ( result.data.jabatanFungsionalId == "" && result.data.jabatanFungsionalId == null ) ? null : pJabatanFungsionalId ),
                                                                                                                                                    jabatan_fungsional_umum_id: ( ( result.data.jabatanFungsionalUmumId == "" && result.data.jabatanFungsionalUmumId == null ) ? null : pJabatanFungsionalUmumId ),
                                                                                                                                                    lokasi_kerja: result.data.lokasiKerja,
                                                                                                                                                    tmt_jabatan: ( xTmtJabatanFormattedDate == "" ? null : xTmtJabatanFormattedDate ),
                                                                                                                                                    
                                                                                                                                                    tingkat_pendidikan_id: ( ( result.data.tkPendidikanTerakhirId == "" && result.data.tkPendidikanTerakhirId == null ) ? null : pTingkatPendidikanId ),
                                                                                                                                                    diktat_struktural: result.data.latihanStrukturalNama,
                                                                                                                                                    pendidikan_jurusan_id: ( ( result.data.pendidikanTerakhirId == "" && result.data.pendidikanTerakhirId == null ) ? null : pJurusanId ),
                                                                                                                                                    
                                                                                                                                                    instansi_induk_id: ( ( result.data.instansiIndukId == "" && result.data.instansiIndukId == null ) ? null : pInstansiIndukId ),
                                                                                                                                                    satuan_kerja_induk_id: ( ( result.data.satuanKerjaIndukId == "" && result.data.satuanKerjaIndukId == null ) ? null : pSatuanKerjaIndukId ),
                                                                                                                                                    kanreg_id: ( ( result.data.kanregId == "" && result.data.kanregId == null ) ? null : pKanregId ),
                                                                                                                                                    instansi_kerja_id: ( ( result.data.instansiKerjaId == "" && result.data.instansiKerjaId == null ) ? null : pInstansiKerjaId ),
                                                                                                                                                    instansi_kerja_kode_cepat: result.data.instansiKerjaKodeCepat,
                                                                                                                                                    satuan_kerja_id: ( ( result.data.satuanKerjaId == "" && result.data.satuanKerjaId == null ) ? null : pSatuanKerjaId ),
                                                                                                                                                    masa_kerja_tahun: result.data.mkTahun,
                                                                                                                                                    masa_kerja_bulan: result.data.mkBulan,
                                                                                                                                                    eselon_id: ( ( result.data.eselonId == "" && result.data.eselonId == null ) ? null : pEselonId ),
                                                                                                                                                    eselon_level: result.data.eselonLevel,
                                                                                                                                                    tmt_eselon: ( xTmtEselon == "" ? null : xTmtEselon ),
                                                                                                                                                    unor_id: ( ( result.data.unorId == "" && result.data.unorId == null ) ? null : pUnorId ),
                                                                                                                                                    unor_induk_id: ( ( result.data.unorIndukId == "" && result.data.unorIndukId == null ) ? null : pUnorIndukId ),
                                                                                                                                                    
                                                                                                                                                    tahun_lulus: ( xThnLulusFormattedDate == "" ? null : xThnLulusFormattedDate ),
                                                                                                                                                    last_sync_at: currDateTime,

                                                                                                                                                    golongan_ruang_id: ( ( result.data.golRuangAwalId == "" && result.data.golRuangAwalId == null ) ? null : pGolonganAwalId ),
                                                                                                                                                    golongan_ruang_akhir_id: ( ( result.data.golRuangAkhirId == "" && result.data.golRuangAkhirId == null ) ? null : pGolongaAkhirId ),
                                                                                                                                                    tmt_golongan_akhir: ( xTmtGolAkhir == "" ? null : xTmtGolAkhir ),
                                                                                                                                                    tmt_cpns: ( xTmtCpns == "" ? null : xTmtCpns ),
                                                                                                                                                    tgl_sk_cpns: ( xTglSkCpns == "" ? null : xTglSkCpns ),
                                                                                                                                                    no_sk_cpns: ( ( result.data.nomorSkCpns == "" && result.data.nomorSkCpns == null ) ? null : result.data.nomorSkCpns ),
                                                                                                                                                    no_surat_dokter_cpns: ( ( result.data.noSuratKeteranganDokter == "" && result.data.noSuratKeteranganDokter == null ) ? null : result.data.noSuratKeteranganDokter ),
                                                                                                                                                    tgl_surat_dokter_cpns: ( xTglSuratDokterCPNS == "" ? null : xTglSuratDokterCPNS ),
                                                                                                                                                    tmt_pns: ( xTmtPns == "" ? null : xTmtPns ),
                                                                                                                                                    tgl_sk_pns: ( xTglSkPns == "" ? null : xTglSkPns ),
                                                                                                                                                    no_sk_pns: ( ( result.data.nomorSkPns == "" && result.data.nomorSkPns == null ) ? null : result.data.nomorSkPns ),
                                                                                                                                                    
                                                                                                                                                    
                                                                                                                                                    no_surat_dokter_pns: "",
                                                                                                                                                    tgl_surat_dokter_pns: "0000-00-00",
                                                                                                                                                    no_sttpl: ( ( result.data.nomorSttpl == "" && result.data.nomorSttpl == null ) ? null : result.data.nomorSttpl ),
                                                                                                                                                    tgl_sttpl: ( xTglSttpl == "" ? null : xTglSttpl ),

                                                                                                                                                    tgl_surat_ket_dokter: ( xTglSuratDokterCPNS == "" ? null : xTglSuratDokterCPNS ),
                                                                                                                                                    no_surat_ket_dokter: result.data.noSuratKeteranganDokter,
                                                                                                                                                    jml_istri_suami: result.data.jumlahIstriSuami,
                                                                                                                                                    jml_anak: result.data.jumlahAnak,
                                                                                                                                                    no_surat_ket_bebas_narkoba: result.data.noSuratKeteranganBebasNarkoba,
                                                                                                                                                    tgl_surat_ket_bebas_narkoba: ( xTglSuratKetBebasNarkoba == "" ? null : xTglSuratKetBebasNarkoba ),
                                                                                                                                                    skck: result.data.skck,
                                                                                                                                                    tgl_skck: (xTglSkck == "" ? null: xTglSkck),
                                                                                                                                                    akte_kelahiran: result.data.akteKelahiran,
                                                                                                                                                    akte_meninggal: result.data.akteMeninggal,
                                                                                                                                                    tgl_meninggal: (xTglMeninggal == "" ? null: xTglMeninggal),
                                                                                                                                                    status_hidup: ( result.data.statusHidup == "true" ? 1 : 0 ),
                                                                                                                                                    kartu_pegawai: result.data.noSeriKarpeg,
                                                                                                                                                    no_spmt: result.data.nomorSptm,
                                                                                                                                                    tgl_spmt: (xTglSPMT == "" ? null: xTglSPMT)



                                                                                                                                        }
                                                                                                                                    })
                                                                                                                                    .spread(( data, created ) => {
                                                                                                                                        if( created ){
                                                                                                                                            joResult = JSON.stringify({
                                                                                                                                                "status_code": "00",
                                                                                                                                                "status_msg": "Status Pegawai successfully created"
                                                                                                                                            });
                                                                                                                                            res.setHeader('Content-Type','application/json');
                                                                                                                                            res.status(201).send(joResult);
                                                                                                                                        }else{          
                                                                                                                                            
                                                                                                                                            // console.log(">>> STATUS PEGAWAI ID : " + result.data.statusPegawai + "(" + pStatusPegawaiId + ")");

                                                                                                                                            modelUser
                                                                                                                                                .update({
                                                                                                                                                    name: result.data.nama,
                                                                                                                                                    gelar_depan: result.data.gelarDepan,
                                                                                                                                                    gelar_belakang: result.data.gelarBelakang,
                                                                                                                                                    tempat_lahir: result.data.tempatLahir,
                                                                                                                                                    tanggal_lahir: ( xTglLahirFormattedDate == "" ? null : xTglLahirFormattedDate ),
                                                                                                                                                    jenis_kelamin_id: (result.data.jenisKelamin == "Pria" ? config.jenisKelamin.pria : ( result.data.jenisKelamin == "Wanita" ? config.jenisKelamin.wanita : "" )),
                                                                                                                                                    agama_id: ( ( result.data.agamaId == "" && result.data.agamaId == null ) ? null : pAgamaId ),
                                                                                                                                                    status_pernikahan_id: ( ( result.data.jenisKawinId == "" && result.data.jenisKawinId == null ) ? null : pJenisKawinId ),
                                                                                                                                                    //alamat_tinggal: result.data.alamat,
                                                                                                                                                    //alamat_ktp: result.data.alamat,
                                                                                                                                                    tipe_pegawai_id: ( ( result.data.jenisJabatanId == "" && result.data.jenisJabatanId == null ) ? null : pTipePegawaiId ),
                                                                                                                                                    status_pegawai_id: ( ( result.data.statusPegawai == "" && result.data.statusPegawai == null ) ? null : pStatusPegawaiId ),
                                                                                                                                                    kppn: ( ( result.data.kppnId == "" && result.data.kppnNama == null ) ? null : pKppnId ),
                                                                                                                                                    jenis_pegawai_id: ( ( result.data.jenisPegawaiId == "" && result.data.jenisPegawaiId == null ) ? null : pJenisPegawaiId ),
                                                                                                                                                    kedudukan_id: ( ( result.data.kedudukanPnsId == "" && result.data.kedudukanPnsId == null ) ? null : pKedudukanId ),
                                                                                                                                                    askes_atau_bpjs: ( result.data.noAskes == null ? result.data.bpjs : result.data.noAskes ),
                                                                                                                                                    no_taspen: result.data.noTaspen,
                                                                                                                                                    taspen_id: ( ( result.data.taspenId == "" && result.data.taspenId == null ) ? null : pTaspenId ), 
                                                                                                                                                    no_npwp: result.data.noNpwp,
                                                                                                                                                    tgl_npwp: ( xTglNpwp == "" ? null : xTglNpwp ),
                                                                                                                                                    nik: result.data.nik,
                                                                                                                                                    //no_hp: result.data.noHp,
                                                                                                                                                    //email: result.data.email,
                                                                                                                                                    nama_jabatan_id: pJabatanId,
                                                                                                                                                    jabatan_struktural_id: ( ( result.data.jabatanStrukturalId == "" && result.data.jabatanStrukturalId == null ) ? null : pJabatanStrukturalId ),
                                                                                                                                                    jabatan_fungsional_id: ( ( result.data.jabatanFungsionalId == "" && result.data.jabatanFungsionalId == null ) ? null : pJabatanFungsionalId ),
                                                                                                                                                    jabatan_fungsional_umum_id: ( ( result.data.jabatanFungsionalUmumId == "" && result.data.jabatanFungsionalUmumId == null ) ? null : pJabatanFungsionalUmumId ),
                                                                                                                                                    lokasi_kerja: result.data.lokasiKerja,
                                                                                                                                                    tmt_jabatan: ( xTmtJabatanFormattedDate == "" ? null : xTmtJabatanFormattedDate ),
                                                                                                                                                    
                                                                                                                                                    tingkat_pendidikan_id: ( ( result.data.tkPendidikanTerakhirId == "" && result.data.tkPendidikanTerakhirId == null ) ? null : pTingkatPendidikanId ),
                                                                                                                                                    diktat_struktural: result.data.latihanStrukturalNama,
                                                                                                                                                    pendidikan_jurusan_id: ( ( result.data.pendidikanTerakhirId == "" && result.data.pendidikanTerakhirId == null ) ? null : pJurusanId ),
                                                                                                                                                    
                                                                                                                                                    instansi_induk_id: ( ( result.data.instansiIndukId == "" && result.data.instansiIndukId == null ) ? null : pInstansiIndukId ),
                                                                                                                                                    satuan_kerja_induk_id: ( ( result.data.satuanKerjaIndukId == "" && result.data.satuanKerjaIndukId == null ) ? null : pSatuanKerjaIndukId ),
                                                                                                                                                    kanreg_id: ( ( result.data.kanregId == "" && result.data.kanregId == null ) ? null : pKanregId ),
                                                                                                                                                    instansi_kerja_id: ( ( result.data.instansiKerjaId == "" && result.data.instansiKerjaId == null ) ? null : pInstansiKerjaId ),
                                                                                                                                                    instansi_kerja_kode_cepat: result.data.instansiKerjaKodeCepat,
                                                                                                                                                    satuan_kerja_id: ( ( result.data.satuanKerjaId == "" && result.data.satuanKerjaId == null ) ? null : pSatuanKerjaId ),
                                                                                                                                                    masa_kerja_tahun: result.data.mkTahun,
                                                                                                                                                    masa_kerja_bulan: result.data.mkBulan,
                                                                                                                                                    eselon_id: ( ( result.data.eselonId == "" && result.data.eselonId == null ) ? null : pEselonId ),
                                                                                                                                                    eselon_level: result.data.eselonLevel,
                                                                                                                                                    tmt_eselon: ( xTmtEselon == "" ? null : xTmtEselon ),
                                                                                                                                                    unor_id: ( ( result.data.unorId == "" && result.data.unorId == null ) ? null : pUnorId ),
                                                                                                                                                    unor_induk_id: ( ( result.data.unorIndukId == "" && result.data.unorIndukId == null ) ? null : pUnorIndukId ),
                                                                                                                                                    
                                                                                                                                                    tahun_lulus: ( xThnLulusFormattedDate == "" ? null : xThnLulusFormattedDate ),
                                                                                                                                                    last_sync_at: currDateTime,

                                                                                                                                                    golongan_ruang_id: ( ( result.data.golRuangAwalId == "" && result.data.golRuangAwalId == null ) ? null : pGolonganAwalId ),
                                                                                                                                                    golongan_ruang_akhir_id: ( ( result.data.golRuangAkhirId == "" && result.data.golRuangAkhirId == null ) ? null : pGolongaAkhirId ),
                                                                                                                                                    tmt_golongan_akhir: ( xTmtGolAkhir == "" ? null : xTmtGolAkhir ),
                                                                                                                                                    tmt_cpns: ( xTmtCpns == "" ? null : xTmtCpns ),
                                                                                                                                                    tgl_sk_cpns: ( xTglSkCpns == "" ? null : xTglSkCpns ),
                                                                                                                                                    no_sk_cpns: ( ( result.data.nomorSkCpns == "" && result.data.nomorSkCpns == null ) ? null : result.data.nomorSkCpns ),
                                                                                                                                                    no_surat_dokter_cpns: ( ( result.data.noSuratKeteranganDokter == "" && result.data.noSuratKeteranganDokter == null ) ? null : result.data.noSuratKeteranganDokter ),
                                                                                                                                                    tgl_surat_dokter_cpns: ( xTglSuratDokterCPNS == "" ? null : xTglSuratDokterCPNS ),
                                                                                                                                                    tmt_pns: ( xTmtPns == "" ? null : xTmtPns ),
                                                                                                                                                    tgl_sk_pns: ( xTglSkPns == "" ? null : xTglSkPns ),
                                                                                                                                                    no_sk_pns: ( ( result.data.nomorSkPns == "" && result.data.nomorSkPns == null ) ? null : result.data.nomorSkPns ),
                                                                                                                                                    no_surat_dokter_pns: "",
                                                                                                                                                    tgl_surat_dokter_pns: "0000-00-00",
                                                                                                                                                    no_sttpl: ( ( result.data.nomorSttpl == "" && result.data.nomorSttpl == null ) ? null : result.data.nomorSttpl ),
                                                                                                                                                    tgl_sttpl: ( xTglSttpl == "" ? null : xTglSttpl ),

                                                                                                                                                    tgl_surat_ket_dokter: ( xTglSuratDokterCPNS == "" ? null : xTglSuratDokterCPNS ),
                                                                                                                                                    no_surat_ket_dokter: result.data.noSuratKeteranganDokter,
                                                                                                                                                    jml_istri_suami: result.data.jumlahIstriSuami,
                                                                                                                                                    jml_anak: result.data.jumlahAnak,
                                                                                                                                                    no_surat_ket_bebas_narkoba: result.data.noSuratKeteranganBebasNarkoba,
                                                                                                                                                    tgl_surat_ket_bebas_narkoba: ( xTglSuratKetBebasNarkoba == "" ? null : xTglSuratKetBebasNarkoba ),
                                                                                                                                                    skck: result.data.skck,
                                                                                                                                                    tgl_skck: (xTglSkck == "" ? null: xTglSkck),
                                                                                                                                                    akte_kelahiran: result.data.akteKelahiran,
                                                                                                                                                    akte_meninggal: result.data.akteMeninggal,
                                                                                                                                                    tgl_meninggal: (xTglMeninggal == "" ? null: xTglMeninggal),
                                                                                                                                                    status_hidup: ( result.data.statusHidup == "true" ? 1 : 0 ),
                                                                                                                                                    kartu_pegawai: result.data.noSeriKarpeg

                                                                                                                                                },{
                                                                                                                                                    where: {
                                                                                                                                                        nip: result.data.nipBaru
                                                                                                                                                    }
                                                                                                                                                })
                                                                                                                                                .then( () => {

                                                                                                                                                    joResult = JSON.stringify({
                                                                                                                                                        "status_code": "00",
                                                                                                                                                        "status_msg": "Status Pegawai successfully updated"
                                                                                                                                                    });
                                                                                                                                                    res.setHeader('Content-Type','application/json');
                                                                                                                                                    res.status(201).send(joResult);
                                                                                                                                                } );
                                                                                                                                            
                                                                                                                                        }
                                                                                                                                    } )

                                                                                                                            })

                                                                                                                        } )

                                                                                                                    } )

                                                                                                                } )

                                                                                                            })

                                                                                                        } )

                                                                                                    } )

                                                                                                } )

                                                                                            } )

                                                                                       } )

                                                                                    } )

                                                                                } )

                                                                            } )

                                                                        } )

                                                                    })

                                                                } )                                                


                                                            } )

                                                        });

                                                    } )

                                                    
                                                } )

                                            } )

                                        });

                                    } );

                                } );

                            } );

                        });     
                        

                    }     
                
                } )
                .catch( (err) => {
                    res.status(400).send(err);
                } );
            }
        });

    },

    syncRiwayatPendidikan( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

            var xTglLulus = "";
            var xTingkatPendidikan = "";
            var xPendidikanJurusan = "";

            if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncRiwayatPendidikan.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {

                    if( result.code == 1 ){

                        /*Update User Data*/
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        libUtil.writeLog("--- Start Sync Pendidikan Umum ---", "syncuser");
                        libUtil.writeLog(">>> NIP : " + req.body.nip);
                        for( let i = 0; i < result.data.length; i++ ){

                            xTglLulus = "";
                            xTingkatPendidikan = "0";
                            xPendidikanJurusan = "0";

                            //if( (result.data[i].tkPendidikanId != "" && result.data[i].tkPendidikanId != null) && (result.data[i].tkPendidikanNama != "" && result.data[i].tkPendidikanNama != null) ){                                
                                var xInitTkPendidikan = serviceSyncMasterData.saveTingkatPendidikan(result.data[i].tkPendidikanId, result.data[i].tkPendidikanNama);                           
                                xInitTkPendidikan.then( function( pTkPendidikanId ){
                                    var xInitJurusan = serviceSyncMasterData.savePendidikanJurusan(result.data[i].pendidikanId, result.data[i].pendidikanNama);
                                    xInitJurusan.then(function(pJurusanId){
                                        modelUser
                                            .findOne({
                                                where: {
                                                    nip: req.body.nip
                                                }
                                            })
                                            .then( userData => {
                                                if( userData == null ){
                                                    libUtil.writeLog("Result [Sync Pendidikan Umum] : NIP " + req.body.nip + " not found");
                                                }else{

                                                    if( result.data[i].tglLulus != null && result.data[i].tglLulus != "" ){
                                                        xTglLulus = libUtil.parseToFormattedDate( result.data[i].tglLulus );
                                                    }

                                                    modelUserPendidikanUmum
                                                        .findOrCreate({
                                                            where:{
                                                                code: result.data[i].id
                                                            },
                                                            defaults:{
                                                                user_id: userData.id,
                                                                tingkat_pendidikan_id: ( ( result.data[i].tkPendidikanId != null && result.data[i].tkPendidikanId != "" ) ? parseInt( pTkPendidikanId ) : null ),
                                                                pendidikan_nama : result.data[i].tkPendidikanNama,
                                                                jurusan_id: ( ( result.data[i].pendidikanId != null && result.data[i].pendidikanId != "" ) ? parseInt( pJurusanId ) : null ),
                                                                jurusan_nama: result.data[i].pendidikanNama,
                                                                nama_sekolah: result.data[i].namaSekolah,
                                                                no_sttb: result.data[i].nomorIjasah,
                                                                tgl_sttb: ( xTglLulus == "" ? null : xTglLulus ),
                                                                tahun_kelulusan: result.data[i].tahunLulus,
                                                                created_at: currDateTime
                                                            }
                                                        })
                                                        .spread( ( pendidikanUmum, created ) => {
                                                            if( created ){
                                                                joResult = JSON.stringify({
                                                                    "status_code": "00",
                                                                    "status_msg": "Pendidikan Umum successfully created"
                                                                });
                                                                libUtil.writeLog("Result [Sync Pendidikan Umum] : " + joResult);
                                                                
                                                            }else{

                                                                if( result.data[i].tglLulus != null && result.data[i].tglLulus != "" ){
                                                                    xTglLulus = libUtil.parseToFormattedDate( result.data[i].tglLulus );
                                                                }

                                                                modelUserPendidikanUmum
                                                                    .update({
                                                                        tingkat_pendidikan_id: ( result.data[i].tkPendidikanId != null ? parseInt( result.data[i].tkPendidikanId ) : null ),
                                                                        pendidikan_nama : result.data[i].tkPendidikanNama,
                                                                        jurusan_id: xPendidikanJurusan,
                                                                        jurusan_nama: result.data[i].pendidikanNama,
                                                                        nama_sekolah: result.data[i].namaSekolah,
                                                                        no_sttb: result.data[i].nomorIjasah,
                                                                        tgl_sttb: ( xTglLulus == "" ? null : xTglLulus ),
                                                                        tahun_kelulusan: result.data[i].tahunLulus,
                                                                        updated_at: currDateTime
                                                                    },{
                                                                        where: {
                                                                            code: result.data[i].id
                                                                        }
                                                                    })
                                                                    .then( () => {
                                                                        joResult = JSON.stringify({
                                                                            "status_code": "00",
                                                                            "status_msg": "Pendidikan Umum successfully updated"
                                                                        });
                                                                        libUtil.writeLog("Result [Sync Pendidikan Umum] : " + joResult);
                                                                        
                                                                    });
                                                            }
                                                        } );
                                                }
                                            } );
                                    })
                                });                               
                            //}       
                            

                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Pendidikan Umum successfully sync"
                        });
                        res.setHeader('Content-Type','application/json');
                        res.status(200).send(joResult);        

                    }else{
                        joResult = JSON.stringify({
                            "status_code": "-99",
                            "status_msg": "Pendidikan Umum not found"
                        });
                        res.setHeader('Content-Type','application/json');
                        res.status(200).send(joResult);   
                    }
                    
                } )
                .catch( (err) => {
                    res.status(400).send(err);
                } );
            }
        });

    },

    syncRiwayatDiklat( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

            if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncRiwayatDiklat.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {

                    if( result.code == 1 && result.data.length > 0 ){

                        /*Update User Data*/
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        libUtil.writeLog("--- Start Sync Riwayat Diklat ---", "syncuser");
                        libUtil.writeLog(">>> NIP : " + req.body.nip);
                        for( let i = 0; i < result.data.length; i++ ){

                            var xInitNamaDiklat = serviceSyncMasterData.saveNamaDiklat( result.data[i].latihanStrukturalId, result.data[i].latihanStrukturalNama);
                            xInitNamaDiklat.then(function(pNamaDiklatId){

                                var xTglLulus = "";
                                if( result.data[i].tanggal != null && result.data[i].tanggal != "" ){
                                    xTglLulus = libUtil.parseToFormattedDate( result.data[i].tanggal );
                                }                                  

                                modelUser
                                .findOne({
                                    where: {
                                        nip: req.body.nip
                                    }
                                })
                                .then( userData => {
                                    if( userData == null ){
                                        libUtil.writeLog("Result [Sync Pendidikan Diklat] : NIP " + req.body.nip + " not found");
                                    }else{                                 

                                        modelUserPendidikanDiklat
                                            .findOrCreate({
                                                where:{
                                                    code: result.data[i].id
                                                },
                                                defaults:{
                                                    user_id: userData.id,
                                                    nama_diklat_id: ( ( result.data.latihanStrukturalId == "" && result.data.latihanStrukturalId == null ) ? null : pNamaDiklatId ),
                                                    tahun: result.data[i].tahun,
                                                    tanggal_mulai: ( xTglLulus == "" ? null : xTglLulus ),                                                 
                                                    created_at: currDateTime
                                                }
                                            })
                                            .spread( ( pendidikanDiklat, created ) => {
                                                if( created ){
                                                    joResult = JSON.stringify({
                                                        "status_code": "00",
                                                        "status_msg": "Pendidikan Diklat successfully created"
                                                    });
                                                    libUtil.writeLog("Result [Sync Pendidikan Diklat] : " + joResult);
                                                    
                                                }else{
                                                    modelUserPendidikanDiklat
                                                        .update({
                                                            nama_diklat_id: ( ( result.data[i].latihanStrukturalId == "" && result.data[i].latihanStrukturalId == null ) ? null : pNamaDiklatId ),
                                                            tahun: result.data[i].tahun,
                                                            tanggal_mulai: ( xTglLulus == "" ? null : xTglLulus ),                                                 
                                                            created_at: currDateTime
                                                        },{
                                                            where: {
                                                                code: result.data[i].id
                                                            }
                                                        })
                                                        .then( () => {
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "Pendidikan Diklat successfully updated"
                                                            });
                                                            libUtil.writeLog("Result [Sync Pendidikan Diklat] : " + joResult);
                                                            
                                                        });
                                                }
                                            } );
                                    }
                                } );

                            });
                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Pendidikan Diklat successfully sync"
                        });
                        res.setHeader('Content-Type','application/json');
                        res.status(200).send(joResult);      
                    
                    }else{
                        joResult = JSON.stringify({
                            "status_code": "-99",
                            "status_msg": "Pendidikan Diklat not found"
                        });
                        res.setHeader('Content-Type','application/json');
                        res.status(200).send(joResult); 
                    }
                    
                } )
                .catch( (err) => {
                    res.status(400).send(err);
                } );
            }
        });

    },

    syncRiwayatPangkat( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

            if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncRiwayatPangkat.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {

                    /*Update User Data*/
                    libUtil.getCurrDateTime(function( currTime ){
                        currDateTime = currTime;
                    });

                    libUtil.writeLog("--- Start Sync Riwayat Pangkat ---", "syncuser");
                    libUtil.writeLog(">>> NIP : " + req.body.nip);
                    for( let i = 0; i < result.data.length; i++ ){

                        console.log(">>> Sudah di sini ... 1");

                        var xInitGolongan = serviceSyncMasterData.saveGolongan( result.data[i].golonganId, result.data[i].golongan );
                        xInitGolongan.then( function( pGolonganId ){

                            var xInitKenaikanPangkat = serviceSyncMasterData.saveKenaikanPangkat( result.data[i].jenisKPId, result.data[i].jenisKPNama );
                            xInitKenaikanPangkat.then(function(pKenaikanPangkatId){

                                var xTglSk = "";
                                var xTmtGolongan = "";
                                var xTglPerteken = "";

                                if( result.data[i].skTanggal != null && result.data[i].skTanggal != "" ){
                                    xTglSk = libUtil.parseToFormattedDate( result.data[i].skTanggal );
                                }

                                if( result.data[i].tmtGolongan != null && result.data[i].tmtGolongan != "" ){
                                    xTmtGolongan = libUtil.parseToFormattedDate( result.data[i].tmtGolongan );
                                }

                                if( result.data[i].tglPertekBkn != null && result.data[i].tglPertekBkn != "" ){
                                    xTglPerteken = libUtil.parseToFormattedDate( result.data[i].tglPertekBkn );
                                }

                                modelUser
                                    .findOne({
                                        where: {
                                            nip: req.body.nip,
                                        }
                                    })
                                    .then( userData => {
                                        if( userData == null ){
                                            libUtil.writeLog("Result [Sync Riwayat Kenaikan Pangkat] : NIP " + req.body.nip + " not found");
                                        }else{

                                            modelUserRiwayatPangkat
                                                .findOrCreate({
                                                    where:{
                                                        code: result.data[i].id,
                                                        user_id: userData.id
                                                    },
                                                    defaults:{
                                                        user_id: userData.id,
                                                        golongan_id: ( ( result.data[i].golonganId == "" && result.data[i].golonganId == null ) ? null : pGolonganId ),
                                                        tmt_golongan: ( xTmtGolongan == "" ? null : xTmtGolongan ),
                                                        no_nota: result.data[i].noPertekBkn,
                                                        tgl_nota: ( xTglPerteken === "" ? null : xTglPerteken ),
                                                        no_sk: result.data[i].skNomor,
                                                        tgl_sk: ( xTglSk === "" ? null : xTglSk ),
                                                        jenis_kp_id: ( ( result.data[i].jenisKPId == "" && result.data[i].jenisKPId == null ) ? null : pKenaikanPangkatId ),                                                    
                                                        kredit: ( result.data[i].jumlahKreditUtama !== "null" && result.data[i].jumlahKreditUtama != "" ? result.data[i].jumlahKreditUtama : null ),
                                                        masa_kerja_thn: ( result.data[i].masaKerjaGolonganTahun !== "null" && result.data[i].masaKerjaGolonganTahun != "" ? result.data[i].masaKerjaGolonganTahun : 0 ),
                                                        masa_kerja_bln: ( result.data[i].masaKerjaGolonganBulan !== "null" && result.data[i].masaKerjaGolonganBulan != "" ? result.data[i].masaKerjaGolonganBulan : 0 ),
                                                        created_at: currDateTime
                                                    }
                                                })
                                                .spread( ( pendidikanDiklat, created ) => {
                                                    if( created ){
                                                        joResult = JSON.stringify({
                                                            "status_code": "00",
                                                            "status_msg": "Riwayat Pangkat successfully created"
                                                        });
                                                        libUtil.writeLog("Result [Sync Riwayat Pangkat] : " + joResult);
                                                        
                                                    }else{
                                                        modelUserRiwayatPangkat
                                                            .update({
                                                                user_id: userData.id,
                                                                golongan_id: ( ( result.data[i].golonganId == "" && result.data[i].golonganId == null ) ? null : pGolonganId ),
                                                                tmt_golongan: ( xTmtGolongan == "" ? null : xTmtGolongan ),
                                                                no_nota: result.data[i].noPertekBkn,
                                                                tgl_nota: ( xTglPerteken == "" ? null : xTglPerteken ),
                                                                no_sk: result.data[i].skNomor,
                                                                tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                                jenis_kp_id: ( ( result.data[i].jenisKPId == "" && result.data[i].jenisKPId == null ) ? null : pKenaikanPangkatId ),                                                    
                                                                kredit: ( result.data[i].jumlahKreditUtama !== "null" && result.data[i].jumlahKreditUtama != "" ? result.data[i].jumlahKreditUtama : null ),
                                                                masa_kerja_thn: ( result.data[i].masaKerjaGolonganTahun !== "null" && result.data[i].masaKerjaGolonganTahun != "" ? result.data[i].masaKerjaGolonganTahun : 0 ),
                                                                masa_kerja_bln: ( result.data[i].masaKerjaGolonganBulan !== "null" && result.data[i].masaKerjaGolonganBulan != "" ? result.data[i].masaKerjaGolonganBulan : 0 ),
                                                                updated_at: currDateTime
                                                            },{
                                                                where: {
                                                                    code: result.data[i].id
                                                                }
                                                            })
                                                            .then( () => {
                                                                joResult = JSON.stringify({
                                                                    "status_code": "00",
                                                                    "status_msg": "Riwayat Pangkat successfully updated"
                                                                });
                                                                libUtil.writeLog("Result [Sync Riwayat Pangkat] : " + joResult);
                                                                
                                                            });
                                                    }
                                                } );
                                        }
                                    } );

                            });

                        } ); 
                    }

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Riwayat Pangkat successfully sync"
                    });
                    res.setHeader('Content-Type','application/json');
					res.status(200).send(joResult);        
                    
                } )
                .catch( (err) => {
                    res.status(400).send(err);
                } );
            }
        });

    },

    syncRiwayatJabatan( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

            if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncRiwayatJabatan.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {

                    /*Update User Data*/
                    libUtil.getCurrDateTime(function( currTime ){
                        currDateTime = currTime;
                    });

                    libUtil.writeLog("--- Start Sync Riwayat Jabatan ---", "syncuser");
                    libUtil.writeLog(">>> NIP : " + req.body.nip);
                    for( let i = 0; i < result.data.length; i++ ){

                        var xInitPangkat = serviceSyncMasterData.savePangkat( 0, result.data[i].jenisJabatan );

                        xInitPangkat.then( function( pPangkatId ){

                            var xInitInstansiKerja = serviceSyncMasterData.saveInstansiKerja( result.data[i].instansiKerjaId, result.data[i].instansiKerjaNama );
                            xInitInstansiKerja.then(function(pInstansiKerjaId){

                                var xInitSatuanKerja = serviceSyncMasterData.saveSatuanKerja( result.data[i].satuanKerjaId, result.data[i].satuanKerjaNama );
                                xInitSatuanKerja.then(function(pSatuanKerjaId){

                                    var xUnor = serviceSyncMasterData.saveUnor( result.data[i].unorId, result.data[i].unorNama );
                                    xUnor.then(function(pUnorId){

                                        var xUnorInduk = serviceSyncMasterData.saveUnorInduk( result.data[i].unorIndukId, result.data[i].unorIndukNama );
                                        xUnorInduk.then(function(pUnorIndukId){

                                            var xEselon = serviceSyncMasterData.saveEselon( result.data[i].eselonId, result.data[i].eselon );
                                            xEselon.then(function(pEselonId){

                                                var xJabatanFungsional = serviceSyncMasterData.saveJabatanFungsional( result.data[i].jabatanFungsionalId, result.data[i].jabatanFungsionalNama );
                                                xJabatanFungsional.then(function(pJabatanFungsionalId){

                                                    var xJabatanFungsionalUmum = serviceSyncMasterData.saveJabatanFungsionalUmum( result.data[i].jabatanFungsionalUmumId, result.data[i].jabatanFungsionalUmumNama );
                                                    xJabatanFungsionalUmum.then(function(pJabatanFungsionalUmumId){

                                                        var xTmtJabatan = "";
                                                        var xTanggalSK = "";
                                                        var xTmtPelantikan = "";

                                                        if( result.data[i].tmtJabatan != null && result.data[i].tmtJabatan != "" ){
                                                            xTmtJabatan = libUtil.parseToFormattedDate( result.data[i].tmtJabatan );
                                                        }

                                                        if( result.data[i].tanggalSk != null && result.data[i].tanggalSk != "" ){
                                                            xTanggalSK = libUtil.parseToFormattedDate( result.data[i].tanggalSk );
                                                        }

                                                        if( result.data[i].tmtPelantikan != null && result.data[i].tmtPelantikan != "" ){
                                                            xTmtPelantikan = libUtil.parseToFormattedDate( result.data[i].tmtPelantikan );
                                                        }

                                                        modelUser
                                                            .findOne({
                                                                where: {
                                                                    nip: req.body.nip,
                                                                }
                                                            })
                                                            .then( userData => {
                                                                if( userData == null ){
                                                                    libUtil.writeLog("Result [Sync Riwayat Jabatan] : NIP " + req.body.nip + " not found");
                                                                }else{

                                                                    modelUserRiwayatJabatan
                                                                        .findOrCreate({
                                                                            where:{
                                                                                code: result.data[i].id,
                                                                                user_id: userData.id
                                                                            },
                                                                            defaults:{
                                                                                user_id: userData.id,
                                                                                jenis_jabatan_id: ( ( result.data[i].jenisJabatan == "" && result.data[i].jenisJabatan == null ) ? null : pPangkatId ),
                                                                                instansi_kerja_id: ( ( result.data[i].instansiKerjaId == "" && result.data[i].instansiKerjaId == null ) ? null : pInstansiKerjaId ),
                                                                                satuan_kerja_id: ( ( result.data[i].satuanKerjaId == "" && result.data[i].satuanKerjaId == null ) ? null : pSatuanKerjaId ),
                                                                                unor_id: ( ( result.data[i].unorId == "" && result.data[i].unorId == null ) ? null : pUnorId ),
                                                                                unor_induk_id: ( ( result.data[i].unorIndukId == "" && result.data[i].unorIndukId == null ) ? null : pUnorIndukId ),
                                                                                eselon_id: ( ( result.data[i].eselonId == "" && result.data[i].eselonId == null ) ? null : pEselonId ),
                                                                                jabatan_fungsional_id: ( ( result.data[i].jabatanFungsionalId == "" && result.data[i].jabatanFungsionalId == null ) ? null : pJabatanFungsionalId ),
                                                                                jabatan_fungsional_umum_id: ( ( result.data[i].jabatanFungsionalUmumId == "" && result.data[i].jabatanFungsionalUmumId == null ) ? null : pJabatanFungsionalUmumId ),
                                                                                tmt_jabatan: ( xTmtJabatan == "" ? null : xTmtJabatan ),
                                                                                tanggal_sk: ( xTanggalSK == "" ? null : xTanggalSK ),
                                                                                tmt_pelantikan: ( xTmtPelantikan == "" ? null : xTmtPelantikan ),
                                                                                updated_at: currDateTime
                                                                            }
                                                                        })
                                                                        .spread( ( pendidikanDiklat, created ) => {
                                                                            if( created ){
                                                                                joResult = JSON.stringify({
                                                                                    "status_code": "00",
                                                                                    "status_msg": "Riwayat Pangkat successfully created"
                                                                                });
                                                                                libUtil.writeLog("Result [Sync Riwayat Pangkat] : " + joResult);
                                                                                
                                                                            }else{
                                                                                modelUserRiwayatJabatan
                                                                                    .update({
                                                                                        user_id: userData.id,
                                                                                        jenis_jabatan_id: ( ( result.data[i].jenisJabatan == "" && result.data[i].jenisJabatan == null ) ? null : pPangkatId ),
                                                                                        instansi_kerja_id: ( ( result.data[i].instansiKerjaId == "" && result.data[i].instansiKerjaId == null ) ? null : pInstansiKerjaId ),
                                                                                        satuan_kerja_id: ( ( result.data[i].satuanKerjaId == "" && result.data[i].satuanKerjaId == null ) ? null : pSatuanKerjaId ),
                                                                                        unor_id: ( ( result.data[i].unorId == "" && result.data[i].unorId == null ) ? null : pUnorId ),
                                                                                        unor_induk_id: ( ( result.data[i].unorIndukId == "" && result.data[i].unorIndukId == null ) ? null : pUnorIndukId ),
                                                                                        eselon_id: ( ( result.data[i].eselonId == "" && result.data[i].eselonId == null ) ? null : pEselonId ),
                                                                                        jabatan_fungsional_id: ( ( result.data[i].jabatanFungsionalId == "" && result.data[i].jabatanFungsionalId == null ) ? null : pJabatanFungsionalId ),
                                                                                        jabatan_fungsional_umum_id: ( ( result.data[i].jabatanFungsionalUmumId == "" && result.data[i].jabatanFungsionalUmumId == null ) ? null : pJabatanFungsionalUmumId ),
                                                                                        tmt_jabatan: ( xTmtJabatan == "" ? null : xTmtJabatan ),
                                                                                        tanggal_sk: ( xTanggalSK == "" ? null : xTanggalSK ),
                                                                                        tmt_pelantikan: ( xTmtPelantikan == "" ? null : xTmtPelantikan ),  
                                                                                        updated_at: currDateTime
                                                                                    },{
                                                                                        where: {
                                                                                            code: result.data[i].id
                                                                                        }
                                                                                    })
                                                                                    .then( () => {
                                                                                        joResult = JSON.stringify({
                                                                                            "status_code": "00",
                                                                                            "status_msg": "Riwayat Jabatan successfully updated"
                                                                                        });
                                                                                        libUtil.writeLog("Result [Sync Riwayat Jabatan] : " + joResult);
                                                                                        
                                                                                    });
                                                                            }
                                                                        } );
                                                                }
                                                            } );

                                                    });

                                                });

                                            });

                                        });

                                    });

                                });       

                                

                            });

                        } ); 
                    }

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Riwayat Pangkat successfully sync"
                    });
                    res.setHeader('Content-Type','application/json');
					res.status(200).send(joResult);        
                    
                } )
                .catch( (err) => {
                    res.status(400).send(err);
                } );
            }
        });

    },

    syncPMK( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncPMK.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    libUtil.writeLog("--- Start Sync Master Data ---", "syncpmk");
                    libUtil.writeLog(">>> NIP : " + req.body.nip);
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        for( let i = 0; i < result.data.length; i++ ){
                        
                            var xTglAwal = "";
                            var xTglAkhir = "";
                            var xTglSK = "";
                            var xTglBKN = "";

                            if( result.data[i].tanggalAwal != null && result.data[i].tanggalAwal != "" ){
                                xTglAwal = libUtil.parseToFormattedDate( result.data[i].tanggalAwal );
                            }
                            if( result.data[i].tanggalSelesai != null && result.data[i].tanggalSelesai != "" ){
                                xTglAkhir = libUtil.parseToFormattedDate( result.data[i].tanggalSelesai );
                            }
                            if( result.data[i].tanggalSk != null && result.data[i].tanggalSk != "" ){
                                xTglSK = libUtil.parseToFormattedDate( result.data[i].tanggalSk );
                            }
                            if( result.data[i].tanggalBkn != null && result.data[i].tanggalBkn != "" ){
                                xTglBKN = libUtil.parseToFormattedDate( result.data[i].tanggalBkn );
                            }

                            modelUser
                                .findOne({
                                    where: {
                                        nip: req.body.nip
                                    }
                                })
                                .then( userData => {
                                    if( userData == null ){
                                        libUtil.writeLog("Result [Sync PMK] : NIP " + req.body.nip + " not found");
                                    }else{

                                        modelPMK
                                            .findOrCreate({
                                                where: {
                                                    code: result.data[i].id
                                                },
                                                defaults:{
                                                    user_id: userData.id,
                                                    instansi_perusahaan: result.data[i].pengalaman,
                                                    tgl_awal: ( xTglAwal == "" ? null : xTglAwal ),
                                                    tgl_akhir: ( xTglAkhir == "" ? null : xTglAkhir ),
                                                    no_surat_keputusan: result.data[i].nomorSk,
                                                    tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                    masa_kerja_tahun: result.data[i].masaKerjaTahun,
                                                    masa_kerja_bulan: result.data[i].masaKerjaBulan,
                                                    no_bkn: result.data[i].nomorBkn,
                                                    tgl_bkn: ( xTglBKN == "" ? null : xTglBKN ),
                                                    createdAt: currDateTime
                                                }
                                            })
                                            .spread( ( pmkData , created ) => {
                                                if( created ){
                                                    joResult = JSON.stringify({
                                                        "status_code": "00",
                                                        "status_msg": "PMK successfully created"
                                                    });
                                                    libUtil.writeLog("Result [Sync PMK] : " + joResult);
                                                }else{
                                                    modelPMK
                                                        .update({
                                                            instansi_perusahaan: result.data[i].pengalaman,
                                                            tgl_awal: ( xTglAwal == "" ? null : xTglAwal ),
                                                            tgl_akhir: ( xTglAkhir == "" ? null : xTglAkhir ),
                                                            no_surat_keputusan: result.data[i].nomorSk,
                                                            tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                            masa_kerja_tahun: result.data[i].masaKerjaTahun,
                                                            masa_kerja_bulan: result.data[i].masaKerjaBulan,
                                                            no_bkn: result.data[i].nomorBkn,
                                                            tgl_bkn: ( xTglBKN == "" ? null : xTglBKN ),
                                                            updatedAt: currDateTime
                                                        },{
                                                            where:{
                                                                code: result.data[i].id
                                                            }
                                                        })
                                                        .then( () => {
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "PMK successfully updated"
                                                            });
                                                            libUtil.writeLog("Result [Sync PMK] : " + joResult);
                                                        } );
                                                }
                                            } );

                                    }
                                });

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncKursus( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;
            var xTglMulai = "";

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncKursus.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    libUtil.writeLog("--- Start Sync Master Data ---", "synckursus");
                    libUtil.writeLog(">>> NIP : " + req.body.nip);
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            for( let i = 0; i < result.data.length; i++ ){

                                if( result.data[i].tanggalKursus != null && result.data[i].tanggalKursus != "" ){
                                    xTglMulai = libUtil.parseToFormattedDate( result.data[i].tanggalKursus );
                                }

                                modelUser
                                    .findOne({
                                        where: {
                                            nip: req.body.nip
                                        }
                                    })
                                    .then( userData => {
                                        if( userData == null ){
                                            libUtil.writeLog("Result [Sync Kursus] : NIP " + req.body.nip + " not found");
                                        }else{

                                            modelKursus
                                                .findOrCreate({
                                                    where: {
                                                        code: result.data[i].id
                                                    },
                                                    defaults:{
                                                        user_id: userData.id,
                                                        name: result.data[i].namaKursus,
                                                        penyelenggara: result.data[i].institusiPenyelenggara,
                                                        tgl_mulai: ( xTglMulai == "" ? null : xTglMulai ),
                                                        tahun_kursus: ( result.data[i].tahunKursus != 'null' ? result.data[i].tahunKursus : 0),
                                                        no_piagam: result.data[i].noSertipikat,
                                                        lama_kursus: ( result.data[i].lamaNyaKursus != 'null' ? result.data[i].lamaNyaKursus : 0),
                                                        createdAt: currDateTime
                                                    }
                                                })
                                                .spread( ( pmkData , created ) => {
                                                    if( created ){
                                                        joResult = JSON.stringify({
                                                            "status_code": "00",
                                                            "status_msg": "Kursus successfully created"
                                                        });
                                                        libUtil.writeLog("Result [Sync Kursus] : " + joResult);
                                                    }else{
                                                        modelKursus
                                                            .update({
                                                                name: result.data[i].namaKursus,
                                                                penyelenggara: result.data[i].institusiPenyelenggara,
                                                                tgl_mulai: ( xTglMulai == "" ? null : xTglMulai ),
                                                                tahun_kursus: ( result.data[i].tahunKursus != 'null' ? result.data[i].tahunKursus : 0),
                                                                no_piagam: result.data[i].noSertipikat,
                                                                lama_kursus: ( result.data[i].lamaNyaKursus != 'null' ? result.data[i].lamaNyaKursus : 0),
                                                                
                                                                updatedAt: currDateTime
                                                            },{
                                                                where:{
                                                                    code: result.data[i].id
                                                                }
                                                            })
                                                            .then( () => {
                                                                joResult = JSON.stringify({
                                                                    "status_code": "00",
                                                                    "status_msg": "Kursus successfully updated"
                                                                });
                                                                libUtil.writeLog("Result [Sync Kursus] : " + joResult);
                                                            } );
                                                    }
                                                } );

                                        }
                                    });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncPenghargaan( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;
            var xTglSK = "";

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncPenghargaan.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 
                        libUtil.writeLog("--- Start Sync Master Data ---", "syncpenghargaan");
                        libUtil.writeLog(">>> NIP : " + req.body.nip);
                        libUtil.writeLog(">>> Length" + result.data.length);
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                if( result.data[i].skDate != null && result.data[i].skDate != "" && result.data[i].skDate != "-" ){
                                    xTglSK = result.data[i].skDate;
                                }
                                libUtil.writeLog(">>> Tgl SK : " + xTglSK);

                                var xJenisPenghargaan = serviceSyncMasterData.saveJenisPenghargaan( result.data[i].jenisHarga, result.data[i].namaHarga );
                                xJenisPenghargaan.then(function(pJenisPenghargaan){
                                    libUtil.writeLog(">>> ID : " + result.data[i].id);
                                    modelUser
                                        .findOne({
                                            where: {
                                                nip: req.body.nip
                                            }
                                        })
                                        .then( userData => {
                                            if( userData == null ){
                                                libUtil.writeLog("Result [Sync Penghargaan] : NIP " + req.body.nip + " not found");
                                            }else{

                                                modelPenghargaan
                                                    .findOrCreate({
                                                        where: {
                                                            code: result.data[i].id
                                                        },
                                                        defaults:{
                                                            user_id: userData.id,
                                                            jenis_penghargaan_id: pJenisPenghargaan,
                                                            no_sk: result.data[i].skNomor,
                                                            tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                            tahun: ( result.data[i].tahun != 'null' ? result.data[i].tahun : 0),
                                                            createdAt: currDateTime
                                                        }
                                                    })
                                                    .spread( ( penghargaanData , created ) => {
                                                        if( created ){
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "Penghargaan successfully created"
                                                            });
                                                            libUtil.writeLog("Result [Sync Penghargaan] : " + joResult);
                                                        }else{
                                                            modelPenghargaan
                                                                .update({
                                                                    jenis_penghargaan_id: pJenisPenghargaan,
                                                                    no_sk: result.data[i].skNomor,
                                                                    tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                                    tahun: ( result.data[i].tahun != 'null' ? result.data[i].tahun : 0),
                                                                    
                                                                    updatedAt: currDateTime
                                                                },{
                                                                    where:{
                                                                        code: result.data[i].id
                                                                    }
                                                                })
                                                                .then( () => {
                                                                    joResult = JSON.stringify({
                                                                        "status_code": "00",
                                                                        "status_msg": "Penghargaan successfully updated"
                                                                    });
                                                                    libUtil.writeLog("Result [Sync Penghargaan] : " + joResult);
                                                                } );
                                                        }
                                                    } );

                                            }
                                        });
                                });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncHukumDisiplin( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncHukumDisiplin.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "synchukdis");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length" + result.data.length);
                        }
                        
                        
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                
                                var xTglSkHd = "";
                                if( result.data[i].skTanggal != null && result.data[i].skTanggal != "" && result.data[i].skTanggal != "-" ){
                                    xTglSkHd = result.data[i].skTanggal;
                                }
                                var xTglAkhirHukum = "";
                                if( result.data[i].akhirHukumTanggal != null && result.data[i].akhirHukumTanggal != "" && result.data[i].akhirHukumTanggal != "-" ){
                                    xTglAkhirHukum = result.data[i].skTanggal;
                                }
                                var xTMTHd = "";
                                if( result.data[i].hukumanTanggal != null && result.data[i].hukumanTanggal != "" && result.data[i].hukumanTanggal != "-" ){
                                    xTMTHd = result.data[i].skTanggal;
                                }

                                var xJenisHukuman = serviceSyncMasterData.saveJenisHukuman( result.data[i].jenisHukuman, result.data[i].jenisHukumanNama );
                                xJenisHukuman.then(function(pJenisHukuman){
                                    modelUser
                                        .findOne({
                                            where: {
                                                nip: req.body.nip
                                            }
                                        })
                                        .then( userData => {
                                            if( userData == null ){
                                                libUtil.writeLog("Result [Sync Hukdis] : NIP " + req.body.nip + " not found");
                                            }else{

                                                modelHukdis
                                                    .findOrCreate({
                                                        where: {
                                                            code: result.data[i].id
                                                        },
                                                        defaults:{
                                                            user_id: userData.id,
                                                            jenis_hukuman_id: pJenisHukuman,
                                                            no_sk_hd: result.data[i].skNomor,
                                                            tgl_sk_hd: ( xTglSkHd == "" ? null : xTglSkHd ),
                                                            tmt_hd: ( xTMTHd == "" ? null : xTMTHd ),
                                                            masa_hukuman_tahun: ( result.data[i].masaTahun != 'null' ? result.data[i].masaTahun : 0),
                                                            masa_hukuman_bulan: ( result.data[i].masaBulan != 'null' ? result.data[i].masaBulan : 0),
                                                            akhir_hukuman: ( xTglAkhirHukum == "" ? null : xTglAkhirHukum ),
                                                            no_pp: result.data[i].nomorPp,
                                                            alasan_hukuman: result.data[i].alasanHukumanDisiplin,
                                                            createdAt: currDateTime
                                                        }
                                                    })
                                                    .spread( ( hukdis , created ) => {
                                                        if( created ){
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "Hukdis successfully created"
                                                            });
                                                            libUtil.writeLog("Result [Sync Hukdis] : " + joResult);
                                                        }else{
                                                            modelHukdis
                                                                .update({
                                                                    no_sk_hd: result.data[i].skNomor,
                                                                    jenis_hukuman_id: pJenisHukuman,
                                                                    tgl_sk_hd: ( xTglSkHd == "" ? null : xTglSkHd ),
                                                                    tmt_hd: ( xTMTHd == "" ? null : xTMTHd ),
                                                                    masa_hukuman_tahun: ( result.data[i].masaTahun != 'null' ? result.data[i].masaTahun : 0),
                                                                    masa_hukuman_bulan: ( result.data[i].masaBulan != 'null' ? result.data[i].masaBulan : 0),
                                                                    akhir_hukuman: ( xTglAkhirHukum == "" ? null : xTglAkhirHukum ),
                                                                    no_pp: result.data[i].nomorPp,
                                                                    alasan_hukuman: result.data[i].alasanHukumanDisiplin,
                                                                    
                                                                    updatedAt: currDateTime
                                                                },{
                                                                    where:{
                                                                        code: result.data[i].id
                                                                    }
                                                                })
                                                                .then( () => {
                                                                    joResult = JSON.stringify({
                                                                        "status_code": "00",
                                                                        "status_msg": "Hukdis successfully updated"
                                                                    });
                                                                    libUtil.writeLog("Result [Sync Hukdis] : " + joResult);
                                                                } );
                                                        }
                                                    } );

                                            }
                                        });
                                });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncDP3( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;
            var xTglSK = "";

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncDP3.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "syncdp3");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length : " + result.data.length);
                        }
                        
                        
                        /*libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                if( result.data[i].skDate != null && result.data[i].skDate != "" && result.data[i].skDate != "-" ){
                                    xTglSK = result.data[i].skDate;
                                }
                                libUtil.writeLog(">>> Tgl SK : " + xTglSK);

                                var xJenisPenghargaan = serviceSyncMasterData.saveJenisPenghargaan( result.data[i].jenisHarga, result.data[i].namaHarga );
                                xJenisPenghargaan.then(function(pJenisPenghargaan){
                                    libUtil.writeLog(">>> ID : " + result.data[i].id);
                                    modelUser
                                        .findOne({
                                            where: {
                                                nip: req.body.nip
                                            }
                                        })
                                        .then( userData => {
                                            if( userData == null ){
                                                libUtil.writeLog("Result [Sync Penghargaan] : NIP " + req.body.nip + " not found");
                                            }else{

                                                modelPenghargaan
                                                    .findOrCreate({
                                                        where: {
                                                            code: result.data[i].id
                                                        },
                                                        defaults:{
                                                            user_id: userData.id,
                                                            jenis_penghargaan_id: pJenisPenghargaan,
                                                            no_sk: result.data[i].skNomor,
                                                            tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                            tahun: ( result.data[i].tahun != 'null' ? result.data[i].tahun : 0),
                                                            createdAt: currDateTime
                                                        }
                                                    })
                                                    .spread( ( penghargaanData , created ) => {
                                                        if( created ){
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "Penghargaan successfully created"
                                                            });
                                                            libUtil.writeLog("Result [Sync Penghargaan] : " + joResult);
                                                        }else{
                                                            modelPenghargaan
                                                                .update({
                                                                    jenis_penghargaan_id: pJenisPenghargaan,
                                                                    no_sk: result.data[i].skNomor,
                                                                    tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                                    tahun: ( result.data[i].tahun != 'null' ? result.data[i].tahun : 0),
                                                                    
                                                                    updatedAt: currDateTime
                                                                },{
                                                                    where:{
                                                                        code: result.data[i].id
                                                                    }
                                                                })
                                                                .then( () => {
                                                                    joResult = JSON.stringify({
                                                                        "status_code": "00",
                                                                        "status_msg": "Penghargaan successfully updated"
                                                                    });
                                                                    libUtil.writeLog("Result [Sync Penghargaan] : " + joResult);
                                                                } );
                                                        }
                                                    } );

                                            }
                                        });
                                });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);*/
                    }
                });

            }

        });
    },

    syncPWK( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;
            var xTglSK = "";

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncPWK.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "syncpwk");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length" + result.data.length);
                        }
                        
                        
                        /*libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                if( result.data[i].skDate != null && result.data[i].skDate != "" && result.data[i].skDate != "-" ){
                                    xTglSK = result.data[i].skDate;
                                }
                                libUtil.writeLog(">>> Tgl SK : " + xTglSK);

                                var xJenisPenghargaan = serviceSyncMasterData.saveJenisPenghargaan( result.data[i].jenisHarga, result.data[i].namaHarga );
                                xJenisPenghargaan.then(function(pJenisPenghargaan){
                                    libUtil.writeLog(">>> ID : " + result.data[i].id);
                                    modelUser
                                        .findOne({
                                            where: {
                                                nip: req.body.nip
                                            }
                                        })
                                        .then( userData => {
                                            if( userData == null ){
                                                libUtil.writeLog("Result [Sync Penghargaan] : NIP " + req.body.nip + " not found");
                                            }else{

                                                modelPenghargaan
                                                    .findOrCreate({
                                                        where: {
                                                            code: result.data[i].id
                                                        },
                                                        defaults:{
                                                            user_id: userData.id,
                                                            jenis_penghargaan_id: pJenisPenghargaan,
                                                            no_sk: result.data[i].skNomor,
                                                            tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                            tahun: ( result.data[i].tahun != 'null' ? result.data[i].tahun : 0),
                                                            createdAt: currDateTime
                                                        }
                                                    })
                                                    .spread( ( penghargaanData , created ) => {
                                                        if( created ){
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "Penghargaan successfully created"
                                                            });
                                                            libUtil.writeLog("Result [Sync Penghargaan] : " + joResult);
                                                        }else{
                                                            modelPenghargaan
                                                                .update({
                                                                    jenis_penghargaan_id: pJenisPenghargaan,
                                                                    no_sk: result.data[i].skNomor,
                                                                    tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                                                    tahun: ( result.data[i].tahun != 'null' ? result.data[i].tahun : 0),
                                                                    
                                                                    updatedAt: currDateTime
                                                                },{
                                                                    where:{
                                                                        code: result.data[i].id
                                                                    }
                                                                })
                                                                .then( () => {
                                                                    joResult = JSON.stringify({
                                                                        "status_code": "00",
                                                                        "status_msg": "Penghargaan successfully updated"
                                                                    });
                                                                    libUtil.writeLog("Result [Sync Penghargaan] : " + joResult);
                                                                } );
                                                        }
                                                    } );

                                            }
                                        });
                                });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);*/
                    }
                });

            }

        });
    },

    syncPNSUnor( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncPNSUnor.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "syncpnsunor");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length : " + result.data.length);
                        }
                        
                        
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                
                                var xTglSk = "";
                                if( result.data[i].skTanggal != null && result.data[i].skTanggal != "" && result.data[i].skTanggal != "-" ){
                                    xTglSk = result.data[i].skTanggal;
                                }

                                var xUnor = serviceSyncMasterData.saveUnor( result.data[i].unorBaru, result.data[i].namaUnorBaru );
                                xUnor.then(function(pUnorId){
                                    modelUser
                                        .findOne({
                                            where: {
                                                nip: req.body.nip
                                            }
                                        })
                                        .then( userData => {
                                            if( userData == null ){
                                                libUtil.writeLog("Result [Sync PNSUnor] : NIP " + req.body.nip + " not found");
                                            }else{

                                                modelHistoryUnor
                                                    .findOrCreate({
                                                        where: {
                                                            code: result.data[i].id
                                                        },
                                                        defaults:{
                                                            user_id: userData.id,
                                                            unor_id: pUnorId,
                                                            no_sk: ( result.data[i].skNomor !== null ? result.data[i].skNomor : "" ) ,
                                                            tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                            prosedur_asal: result.data[i].asalNama,
                                                            createdAt: currDateTime
                                                        }
                                                    })
                                                    .spread( ( hukdis , created ) => {
                                                        if( created ){
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "PNS Unor successfully created"
                                                            });
                                                            libUtil.writeLog("Result [Sync PNSUnor] : " + joResult);
                                                        }else{
                                                            modelHistoryUnor
                                                                .update({
                                                                    unor_id: pUnorId,
                                                                    no_sk: ( result.data[i].skNomor !== null ? result.data[i].skNomor : "" ) ,
                                                                    tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                                    prosedur_asal: result.data[i].asalNama,
                                                                    
                                                                    updatedAt: currDateTime
                                                                },{
                                                                    where:{
                                                                        code: result.data[i].id
                                                                    }
                                                                })
                                                                .then( () => {
                                                                    joResult = JSON.stringify({
                                                                        "status_code": "00",
                                                                        "status_msg": "PNS Unor successfully updated"
                                                                    });
                                                                    libUtil.writeLog("Result [Sync PNSUnor] : " + joResult);
                                                                } );
                                                        }
                                                    } );

                                            }
                                        });
                                });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncRiwayatPemberhentian( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncRiwayatPemberhentian.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "syncriwayatpemberhentian");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length : " + result.data.length);
                        }
                        
                        
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                
                                var xTglSk = "";
                                if( result.data[i].skTanggal != null && result.data[i].skTanggal != "" && result.data[i].skTanggal != "-" ){
                                    xTglSk = result.data[i].skTanggal;
                                }

                                modelUser
                                    .findOne({
                                        where: {
                                            nip: req.body.nip
                                        }
                                    })
                                    .then( userData => {
                                        if( userData == null ){
                                            libUtil.writeLog("Result [Sync Riwayat Pemberhentian] : NIP " + req.body.nip + " not found");
                                        }else{

                                            modelHistoryPemberhentian
                                                .findOrCreate({
                                                    where: {
                                                        code: result.data[i].id
                                                    },
                                                    defaults:{
                                                        user_id: userData.id,
                                                        jenis_pemberhentian_id: result.data[i].jenisHenti,
                                                        kedudukan_id: result.data[i].kedudukanHukumPns,
                                                        no_sk: ( result.data[i].skNomor !== null ? result.data[i].skNomor : "" ) ,
                                                        tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                        prosedur_asal: result.data[i].asalNama,
                                                        createdAt: currDateTime
                                                    }
                                                })
                                                .spread( ( hukdis , created ) => {
                                                    if( created ){
                                                        joResult = JSON.stringify({
                                                            "status_code": "00",
                                                            "status_msg": "PNS Unor successfully created"
                                                        });
                                                        libUtil.writeLog("Result [Sync PNSUnor] : " + joResult);
                                                    }else{
                                                        modelHistoryPemberhentian
                                                            .update({
                                                                jenis_pemberhentian_id: result.data[i].jenisHenti,
                                                                kedudukan_id: result.data[i].kedudukanHukumPns,
                                                                no_sk: ( result.data[i].skNomor !== null ? result.data[i].skNomor : "" ) ,
                                                                tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                                prosedur_asal: result.data[i].asalNama,
                                                                
                                                                updatedAt: currDateTime
                                                            },{
                                                                where:{
                                                                    code: result.data[i].id
                                                                }
                                                            })
                                                            .then( () => {
                                                                joResult = JSON.stringify({
                                                                    "status_code": "00",
                                                                    "status_msg": "Riwayat Pemberhentian successfully updated"
                                                                });
                                                                libUtil.writeLog("Result [Sync Riwayat Pemberhentian] : " + joResult);
                                                            } );
                                                    }
                                                } );

                                        }
                                    });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncAngkaKredit( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncAngkaKredit.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "syncangkakredit");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length : " + result.data.length);
                        }
                        
                        
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                
                                var xTglSk = "";
                                if( result.data[i].tanggalSk != null && result.data[i].tanggalSk != "" && result.data[i].tanggalSk != "-" ){
                                    xTglSk = result.data[i].tanggalSk;
                                }

                                modelUser
                                    .findOne({
                                        where: {
                                            nip: req.body.nip
                                        }
                                    })
                                    .then( userData => {
                                        if( userData == null ){
                                            libUtil.writeLog("Result [Sync Angka Kredit] : NIP " + req.body.nip + " not found");
                                        }else{

                                            modelAngkaKredit
                                                .findOrCreate({
                                                    where: {
                                                        code: result.data[i].id
                                                    },
                                                    defaults:{
                                                        user_id: userData.id,
                                                        no_sk: ( result.data[i].nomorSk !== null ? result.data[i].nomorSk : "" ) ,
                                                        tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                        bln_mulai: result.data[i].bulanMulaiPenailan,
                                                        thn_mulai: result.data[i].tahunMulaiPenailan,
                                                        bln_selesai: result.data[i].bulanSelesaiPenailan,
                                                        thn_selesai: result.data[i].tahunSelesaiPenailan,
                                                        kredit_utama_baru: result.data[i].kreditUtamaBaru,
                                                        kredit_penunjang_baru: result.data[i].kreditPenunjangBaru,
                                                        is_angka_kredit_pertama: ( result.data[i].isAngkaKreditPertama !== null ? result.data[i].isAngkaKreditPertama : 0 ),
                                                        createdAt: currDateTime
                                                    }
                                                })
                                                .spread( ( angkaKredit , created ) => {
                                                    if( created ){
                                                        joResult = JSON.stringify({
                                                            "status_code": "00",
                                                            "status_msg": "Angka Kredit successfully created"
                                                        });
                                                        libUtil.writeLog("Result [Sync Angka Kredit] : " + joResult);
                                                    }else{
                                                        modelHistoryPemberhentian
                                                            .update({
                                                                no_sk: ( result.data[i].nomorSk !== null ? result.data[i].nomorSk : "" ) ,
                                                                tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                                bln_mulai: result.data[i].bulanMulaiPenailan,
                                                                thn_mulai: result.data[i].tahunMulaiPenailan,
                                                                bln_selesai: result.data[i].bulanSelesaiPenailan,
                                                                thn_selesai: result.data[i].tahunSelesaiPenailan,
                                                                kredit_utama_baru: result.data[i].kreditUtamaBaru,
                                                                kredit_penunjang_baru: result.data[i].kreditPenunjangBaru,
                                                                is_angka_kredit_pertama: ( result.data[i].isAngkaKreditPertama !== null ? result.data[i].isAngkaKreditPertama : 0 ),
                                                                
                                                                updatedAt: currDateTime
                                                            },{
                                                                where:{
                                                                    code: result.data[i].id
                                                                }
                                                            })
                                                            .then( () => {
                                                                joResult = JSON.stringify({
                                                                    "status_code": "00",
                                                                    "status_msg": "Riwayat Angka Kredit successfully updated"
                                                                });
                                                                libUtil.writeLog("Result [Sync Riwayat Angka Kredit] : " + joResult);
                                                            } );
                                                    }
                                                } );

                                        }
                                    });

                            }
                        }else{

                        }
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncLHKPN( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncLHKPN.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 

                        if( result.errorCode == 500 ){
                            joResult = JSON.stringify({});
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }else{
                            libUtil.writeLog("--- Start Sync Master Data ---", "synclhkpn");
                            libUtil.writeLog(">>> NIP : " + req.body.nip);
                            libUtil.writeLog(">>> Length : " + result.data.length);
                        }
                        
                        
                        /*libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                
                                var xTglSk = "";
                                if( result.data[i].tanggalSk != null && result.data[i].tanggalSk != "" && result.data[i].tanggalSk != "-" ){
                                    xTglSk = result.data[i].tanggalSk;
                                }

                                modelUser
                                    .findOne({
                                        where: {
                                            nip: req.body.nip
                                        }
                                    })
                                    .then( userData => {
                                        if( userData == null ){
                                            libUtil.writeLog("Result [Sync Angka Kredit] : NIP " + req.body.nip + " not found");
                                        }else{

                                            modelAngkaKredit
                                                .findOrCreate({
                                                    where: {
                                                        code: result.data[i].id
                                                    },
                                                    defaults:{
                                                        user_id: userData.id,
                                                        no_sk: ( result.data[i].nomorSk !== null ? result.data[i].nomorSk : "" ) ,
                                                        tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                        bln_mulai: result.data[i].bulanMulaiPenailan,
                                                        thn_mulai: result.data[i].tahunMulaiPenailan,
                                                        bln_selesai: result.data[i].bulanSelesaiPenailan,
                                                        thn_selesai: result.data[i].tahunSelesaiPenailan,
                                                        kredit_utama_baru: result.data[i].kreditUtamaBaru,
                                                        kredit_penunjang_baru: result.data[i].kreditPenunjangBaru,
                                                        is_angka_kredit_pertama: ( result.data[i].isAngkaKreditPertama !== null ? result.data[i].isAngkaKreditPertama : 0 ),
                                                        createdAt: currDateTime
                                                    }
                                                })
                                                .spread( ( angkaKredit , created ) => {
                                                    if( created ){
                                                        joResult = JSON.stringify({
                                                            "status_code": "00",
                                                            "status_msg": "Angka Kredit successfully created"
                                                        });
                                                        libUtil.writeLog("Result [Sync Angka Kredit] : " + joResult);
                                                    }else{
                                                        modelHistoryPemberhentian
                                                            .update({
                                                                no_sk: ( result.data[i].nomorSk !== null ? result.data[i].nomorSk : "" ) ,
                                                                tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                                                bln_mulai: result.data[i].bulanMulaiPenailan,
                                                                thn_mulai: result.data[i].tahunMulaiPenailan,
                                                                bln_selesai: result.data[i].bulanSelesaiPenailan,
                                                                thn_selesai: result.data[i].tahunSelesaiPenailan,
                                                                kredit_utama_baru: result.data[i].kreditUtamaBaru,
                                                                kredit_penunjang_baru: result.data[i].kreditPenunjangBaru,
                                                                is_angka_kredit_pertama: ( result.data[i].isAngkaKreditPertama !== null ? result.data[i].isAngkaKreditPertama : 0 ),
                                                                
                                                                updatedAt: currDateTime
                                                            },{
                                                                where:{
                                                                    code: result.data[i].id
                                                                }
                                                            })
                                                            .then( () => {
                                                                joResult = JSON.stringify({
                                                                    "status_code": "00",
                                                                    "status_msg": "Riwayat Angka Kredit successfully updated"
                                                                });
                                                                libUtil.writeLog("Result [Sync Riwayat Angka Kredit] : " + joResult);
                                                            } );
                                                    }
                                                } );

                                        }
                                    });

                            }
                        }else{

                        }*/
                        
                        libUtil.writeLog(">>> " + joResult);
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }
                });

            }

        });
    },

    syncSKP( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;
            var xTglSK = "";

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                const options = {
                    url : config.syncFromBKN.syncSKP.apiUrl + "/" + req.body.nip,
                    method: "GET",
                    headers: {
                        "Authorization": "bearer " + req.body.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Postman-Token": config.syncFromBKN.postmanToken,
                        "Cache-Control": "no-cache",
                        "Origin": "http://localhost:20000"
                    }
                };

                libUtil.curlRequest( options ).then( (result) => {
                    
                    if( result.code == 0 ){                        
                        joResult = JSON.stringify({});
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    }else{ 
                        libUtil.writeLog("--- Start Sync Master Data ---", "Sync SKP");
                        libUtil.writeLog(">>> NIP : " + req.body.nip);
                        libUtil.writeLog(">>> Length" + result.data.length);
                        libUtil.getCurrDateTime(function( currTime ){
                            currDateTime = currTime;
                        });

                        if( result.data !== null ){

                            libUtil.writeLog(">>> There is Data...");
                            
                            for( let i = 0; i < result.data.length; i++ ){

                                modelUser
                                    .findOne({
                                        where: {
                                            nip: req.body.nip
                                        }
                                    })
                                    .then( userData => {
                                        if( userData == null ){
                                            libUtil.writeLog("Result [Sync SKP] : NIP " + req.body.nip + " not found");
                                        }else{

                                            var xPenilaiTMTGolongan = "";
                                            if( result.data[i].penilaiTmtGolongan != null && result.data[i].penilaiTmtGolongan.trim() != "" && result.data[i].penilaiTmtGolongan.trim() != "-" ){
                                                xPenilaiTMTGolongan = result.data[i].penilaiTmtGolongan;
                                            }
                                            console.log("Result [Sync SKP] : Penilai TMT Golongan (Ori): " + result.data[i].penilaiTmtGolongan);
                                            console.log("Result [Sync SKP] : Penilai TMT Golongan: " + xPenilaiTMTGolongan);
                                            


                                            var xAtasanPenilaiTMTGolongan = "";
                                            if( result.data[i].atasanPenilaiTmtGolongan != null && result.data[i].atasanPenilaiTmtGolongan.trim() != "" && result.data[i].atasanPenilaiTmtGolongan.trim() != "-" ){
                                                xAtasanPenilaiTMTGolongan = result.data[i].atasanPenilaiTmtGolongan;
                                            }
                                            console.log("Result [Sync SKP] : Atasan Penilai TMT Golongan: " + xAtasanPenilaiTMTGolongan);
                                            
                                            modelSKP
                                                .findOrCreate({
                                                    where:{
                                                        code: result.data[i].id
                                                    },
                                                    defaults:{
                                                        user_id: userData.id,
                                                        code: result.data[i].id,
                                                        tahun: result.data[i].tahun,
                                                        nilai_skp: result.data[i].nilaiSkp,
                                                        orientasi_pelayanan: result.data[i].orientasiPelayanan,
                                                        integritas: result.data[i].integritas,
                                                        komitmen: result.data[i].komitmen,
                                                        disiplin: result.data[i].disiplin,
                                                        kerjasama: result.data[i].kerjasama,
                                                        nilai_perilaku_kerja: result.data[i].nilaiPerilakuKerja,
                                                        nilai_prestasi_kerja: result.data[i].nilaiPrestasiKerja,
                                                        kepemimpinan: result.data[i].kepemimpinan,
                                                        jumlah: result.data[i].jumlah,
                                                        nilai_rata_rata: result.data[i].nilairatarata,
                                                        penilai_nip: result.data[i].penilaiNipNrp,
                                                        penilai_nama: result.data[i].penilaiNama,
                                                        atasan_penilai_nama: result.data[i].atasanPenilaiNama,
                                                        penilai_unor_nama: result.data[i].penilaiUnorNama,
                                                        atasan_penilai_unor_nama: result.data[i].atasanPenilaiUnorNama,
                                                        penilai_jabatan: result.data[i].penilaiJabatan,
                                                        atasan_penilai_jabatan: result.data[i].atasanPenilaiJabatan,
                                                        penilai_golongan: result.data[i].penilaiGolongan,
                                                        atasan_penilai_golongan: result.data[i].atasanPenilaiGolongan,

                                                        penilai_tmt_golongan: ( xPenilaiTMTGolongan == "" ? null : xPenilaiTMTGolongan ),
                                                        atasan_penilai_tmt_golongan: ( xAtasanPenilaiTMTGolongan == "" ? null : xAtasanPenilaiTMTGolongan ),
                                                        
                                                        status_penilai: result.data[i].statusPenilai,
                                                        atasan_status_penilai: result.data[i].statusAtasanPenilai,
                                                        pangkat_id: parseInt( result.data[i].jenisJabatan ),
                                                        createdAt: currDateTime
                                                    }
                                                })
                                                .spread( ( skp, created ) => {
                                                    if( created ){
                                                        libUtil.writeLog("Result [Sync SKP] : " + req.body.nip + " --> Sync SKP successfully Updated");
                                                    }else{
                                                        modelSKP
                                                            .update({
                                                                code: result.data[i].id,
                                                                tahun: result.data[i].tahun,
                                                                nilai_skp: result.data[i].nilaiSkp,
                                                                orientasi_pelayanan: result.data[i].orientasiPelayanan,
                                                                integritas: result.data[i].integritas,
                                                                komitmen: result.data[i].komitmen,
                                                                disiplin: result.data[i].disiplin,
                                                                kerjasama: result.data[i].kerjasama,
                                                                nilai_perilaku_kerja: result.data[i].nilaiPerilakuKerja,
                                                                nilai_prestasi_kerja: result.data[i].nilaiPrestasiKerja,
                                                                kepemimpinan: result.data[i].kepemimpinan,
                                                                jumlah: result.data[i].jumlah,
                                                                nilai_rata_rata: result.data[i].nilairatarata,
                                                                penilai_nip: result.data[i].penilaiNipNrp,
                                                                penilai_nama: result.data[i].penilaiNama,
                                                                atasan_penilai_nama: result.data[i].atasanPenilaiNama,
                                                                penilai_unor_nama: result.data[i].penilaiUnorNama,
                                                                atasan_penilai_unor_nama: result.data[i].atasanPenilaiUnorNama,
                                                                penilai_jabatan: result.data[i].penilaiJabatan,
                                                                atasan_penilai_jabatan: result.data[i].atasanPenilaiJabatan,
                                                                penilai_golongan: result.data[i].penilaiGolongan,
                                                                atasan_penilai_golongan: result.data[i].atasanPenilaiGolongan,
                                                                penilai_tmt_golongan: ( xPenilaiTMTGolongan == "" ? null : xPenilaiTMTGolongan ),
                                                                atasan_penilai_tmt_golongan: ( xAtasanPenilaiTMTGolongan == "" ? null : xAtasanPenilaiTMTGolongan ),
                                                                status_penilai: result.data[i].statusPenilai,
                                                                atasan_status_penilai: result.data[i].statusAtasanPenilai,
                                                                pangkat_id: parseInt( result.data[i].jenisJabatan ),
                                                                updatedAt: currDateTime
                                                            },{
                                                                where: {
                                                                    code: result.data[i].id
                                                                }
                                                            })
                                                            .then( () => {                                                                
                                                                libUtil.writeLog("Result [Sync SKP] : " + req.body.nip + " --> Sync SKP successfully Updated");
                                                            } );
                                                    }
                                                })

                                        }
                                    })
                                    .catch( error => {
                                        libUtil.writeLog("Error [SyncUser.syncSKP] : " + error);
                                    } );

                            }

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "SKP successfully Created/Updated"
                            });

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        
                        }else{
                            libUtil.writeLog(">>> There is No Data...");
                        }

                    }

                });
            
            }

        });

    }

}