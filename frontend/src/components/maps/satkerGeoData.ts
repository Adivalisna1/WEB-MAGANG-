export interface SatkerGeoData {
  id: number | string;
  nama: string;
  kode: string;
  eselon1: string;
  kota: string;
  provinsi: string;
  lat: number;
  lng: number;
  saldoBuku: number;
  saldoBank: number;
  selisih: number;
  status: 'match' | 'selisih' | 'pending';
  dokumenList: {
    nama: string;
    kategori: string;
    tanggal: string;
    status: string;
  }[];
}

export interface WilayahPengawasanKL {
  id: string;
  kodeWilayah: string;
  nama: string;
  satkerUtama: string;
  eselon1: string;
  pusatKota: string;
  lat: number;
  lng: number;
  radiusMeter: number;
  satkerIds: (number | string)[];
}

export const SATKER_INDONESIA_LIST: SatkerGeoData[] = [
  {
    "id": 693300,
    "nama": "PUSAT DATA DAN INFORMASI",
    "kode": "023.69.693300",
    "eselon1": "SEKRETARIAT JENDERAL",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.1754,
    "lng": 106.8897,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Dokumen Rekening Koran Periode 30 Juni 2026",
        "kategori": "Rekening Koran",
        "tanggal": "-",
        "status": "Belum Diunggah"
      }
    ]
  },
  {
    "id": 693318,
    "nama": "SEKRETARIAT JENDERAL",
    "kode": "023.69.693318",
    "eselon1": "SEKRETARIAT JENDERAL",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.1214,
    "lng": 106.7535,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Dokumen Rekening Koran Periode 30 Juni 2026",
        "kategori": "Rekening Koran",
        "tanggal": "-",
        "status": "Belum Diunggah"
      }
    ]
  },
  {
    "id": 694365,
    "nama": "PUSAT PEMBIAYAAN DAN ASESMEN PENDIDIKAN TINGGI",
    "kode": "023.69.694365",
    "eselon1": "SEKRETARIAT JENDERAL",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.285,
    "lng": 106.8392,
    "saldoBuku": 19395424819,
    "saldoBank": 7158646776,
    "selisih": 12236778043,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1918819908 (RPL 088 DB PPAPT UTK ADIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918819432 (RPL 088 DB PPAPT UTK KIPK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 19301004485302 (RPL 088 DB PPAPT UTK KIPK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 19301004486308 (RPL 088 DB PPAPT UTK ADIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1220013939718 (RPL 088 PS PPAPT UTK PGBLN BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1220013944437 (RPL 088 DB PPAPT UTK BPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1220013921104 (RPL 088 DB PPAPT UTK KIPK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1220013921237 (RPL 088 DB PPAPT UTK ADIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 101300017472 (RPL 088 DB PPAPT UTK ADIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 101300017464 (RPL 088 DB PPAPT UTK KIPK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9892316943651000 (BPG 088 PPAPT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 694988,
    "nama": "BADAN INDUSTRI MINERAL",
    "kode": "023.69.694988",
    "eselon1": "SEKRETARIAT JENDERAL",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.0643,
    "lng": 106.9337,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Dokumen Rekening Koran Periode 30 Juni 2026",
        "kategori": "Rekening Koran",
        "tanggal": "-",
        "status": "Belum Diunggah"
      }
    ]
  },
  {
    "id": 693319,
    "nama": "INSPEKTORAT JENDERAL",
    "kode": "023.69.693319",
    "eselon1": "INSPEKTORAT JENDERAL",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.205,
    "lng": 106.6179,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Dokumen Rekening Koran Periode 30 Juni 2026",
        "kategori": "Rekening Koran",
        "tanggal": "-",
        "status": "Belum Diunggah"
      }
    ]
  },
  {
    "id": 693200,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XVII RIAU",
    "kode": "023.69.693200",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Riau",
    "provinsi": "RIAU",
    "lat": 0.5071,
    "lng": 101.5103,
    "saldoBuku": 80357231,
    "saldoBank": 0,
    "selisih": 80357231,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126932001000 (BPG 008 LLDIKTI WIL XVII)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8008800872 (RPL 008 PDT LLPTWXVII UTK EX UP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693203,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH - MEDAN",
    "kode": "023.69.693203",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sumatera Utara",
    "provinsi": "SUMATERA UTARA",
    "lat": 3.5952,
    "lng": 98.7347,
    "saldoBuku": 76395978,
    "saldoBank": 76395978,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126932031000 (BPG 004 LLDIKTI WIL I)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1050021472216 (RPL 004 PDT LLDIKTI WIL I UTK DANA PKMDA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693204,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH II PALEMBANG",
    "kode": "023.69.693204",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sumatera Selatan",
    "provinsi": "SUMATERA SELATAN",
    "lat": -2.9761,
    "lng": 104.8379,
    "saldoBuku": 138319656,
    "saldoBank": 34711656,
    "selisih": 103608000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932041000 (BPG 014 LLDIKTI WILAYAH II 693204)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1933461249 (RPL 014 PDT LLDIKTI WIL II UTK PPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693205,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH III DKI JAKARTA",
    "kode": "023.69.693205",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta",
    "provinsi": "DKI JAKARTA",
    "lat": -6.2088,
    "lng": 106.9081,
    "saldoBuku": 730272000,
    "saldoBank": 692716505,
    "selisih": 37555495,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932051000 (BPG 088 LLDIKTI WIL III)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 6932050006 (RPL 088 PS LLDIKTI III UTK PNLT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693206,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH IV BANDUNG",
    "kode": "023.69.693206",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -6.9175,
    "lng": 107.6816,
    "saldoBuku": 17275889958,
    "saldoBank": 17275889958,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 80325006932061000 (BPG 022 LLDIKTI WILAYAH IV)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 601300018884 (RPL 022 PS LLDIKTI IV BDG UTK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693207,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH - YOGYAKARTA",
    "kode": "023.69.693207",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "DI Yogyakarta",
    "provinsi": "DI YOGYAKARTA",
    "lat": -7.7713,
    "lng": 110.44,
    "saldoBuku": 9603155248,
    "saldoBank": 9603155248,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 98919469320710 (BPG 030 LLDIKTI WIL V)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD Cabang Utama Yogyakarta - 1111002125 (RPL 030 DT LLDIKTI YK UTK PPPM & PMPT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693208,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH VI SEMARANG",
    "kode": "023.69.693208",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Tengah",
    "provinsi": "JAWA TENGAH",
    "lat": -7.0051,
    "lng": 110.5006,
    "saldoBuku": 672881821,
    "saldoBank": 672881821,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932081000 (BPG 026 LLDIKTI WILAYAH VI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 008301111116306 (RPL 026 KS LLDIKTI WIL VI UTK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126932081000 (BPG 026 LLDIKTI WIL VI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1360083172814 (RPL 026 KS LLDIKTI WIL VI UTK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693209,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH VII SURABAYA",
    "kode": "023.69.693209",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.2575,
    "lng": 112.8146,
    "saldoBuku": 184949808,
    "saldoBank": 184949808,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932091000 (BPG 031 LLDIKTI WIL VII)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17201003436300 (RPL 031 PS LLDIKTI UTK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693210,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH VIII DENPASAR",
    "kode": "023.69.693210",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bali",
    "provinsi": "BALI",
    "lat": -8.6705,
    "lng": 115.2751,
    "saldoBuku": 27211585,
    "saldoBank": 0,
    "selisih": 27211585,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932101000 (BPG 037 LLDIKTI WIL VIII)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1932955477 (RPL 037 PS LLDIKTI WIL VIII UTK BOPTN PT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693211,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH IX MAKASSAR",
    "kode": "023.69.693211",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Selatan",
    "provinsi": "SULAWESI SELATAN",
    "lat": -5.1477,
    "lng": 119.4952,
    "saldoBuku": 150000000,
    "saldoBank": 150000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932111000 (BPG 054 LLDIKTI WIL IX)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 40301001838309 (RPL 054 PS LLDIKTI WIL IX UNTUK DROPING)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693212,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH - PADANG",
    "kode": "023.69.693212",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sumatera Barat",
    "provinsi": "SUMATERA BARAT",
    "lat": -0.9471,
    "lng": 100.4797,
    "saldoBuku": 70338031,
    "saldoBank": 70338031,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126932121000 (BPG 010 LLDIKTI WILAYAH X PADANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 901300011185 (RPL 010 PS LLDIKTI WIL X UTK PNLTN DSN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693213,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XI BANJARMASIN",
    "kode": "023.69.693213",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Selatan",
    "provinsi": "KALIMANTAN SELATAN",
    "lat": -3.3194,
    "lng": 114.6533,
    "saldoBuku": 153760225,
    "saldoBank": 153760225,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 98919469321310 (BPG 045 LLDIKTI WIL XI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 5515555599 (RPL 045 DB LLDIKTI UTK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693214,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XII AMBON",
    "kode": "023.69.693214",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Maluku",
    "provinsi": "MALUKU",
    "lat": -3.6954,
    "lng": 128.2439,
    "saldoBuku": 78855003,
    "saldoBank": 78855003,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946932141000 (BPG 061 LLDIKTI WILAYAH XII AMBON)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1933174884 (RPL 061 DB LLDIKTI XII UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693215,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XIII BANDA ACEH",
    "kode": "023.69.693215",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.5483,
    "lng": 95.3863,
    "saldoBuku": 29802400,
    "saldoBank": 29802400,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446932151000 (BPG 001 LLDIKTI WILAYAH XIII)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1000648717 (RPL 001 PS 693215 UTKDKPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693216,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XIV BIAK",
    "kode": "023.69.693216",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Papua",
    "provinsi": "PAPUA",
    "lat": -2.5916,
    "lng": 140.7315,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586932161000 (BPG 064 LLDIKTI WIL XIV)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 30801001772301 (RPL 064 PS LLDIKTI XIV UNTUK MENAMPUNG D)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693217,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XV KUPANG",
    "kode": "023.69.693217",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Nusa Tenggara Timur",
    "provinsi": "NUSA TENGGARA TIMUR",
    "lat": -10.1772,
    "lng": 123.6695,
    "saldoBuku": 600000000,
    "saldoBank": 600000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126932171000 (BPG 039 LLDIKTI WIL XV)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 169601000058306 (RPL 039 PDT LLDIKTI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693218,
    "nama": "LEMBAGA LAYANAN PENDIDIKAN TINGGI WILAYAH XVI GORONTALO",
    "kode": "023.69.693218",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Gorontalo",
    "provinsi": "GORONTALO",
    "lat": 0.5435,
    "lng": 123.1193,
    "saldoBuku": 60000000,
    "saldoBank": 60000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586932181000 (BPG 050 LLPT WILAYAH XVI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 0000011010-01-30-000559-5 (RPL 050 PS LLDIKTI WIL XVI UNTUK PKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 000001100-01-30-000560-0 (RPL 050 PS LLDIKTI WIL XVI UNTUK RISET)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693371,
    "nama": "SEKRETARIAT DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kode": "023.69.693371",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.2828,
    "lng": 107.0381,
    "saldoBuku": 1121995102,
    "saldoBank": 0,
    "selisih": 1121995102,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 98919469337110 (BPG 088 SETDITJEN DIKTI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693372,
    "nama": "UNIVERSITAS PEMBANGUNAN NASIONAL \"VETERAN\" JAKARTA",
    "kode": "023.69.693372",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta",
    "provinsi": "DKI JAKARTA",
    "lat": -6.1548,
    "lng": 106.7719,
    "saldoBuku": 270107573620,
    "saldoBank": 0,
    "selisih": 270107573620,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1919788819 (RPL 088 BLU UPNVJ UTK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787779 (RPL 088 BLU UPNVJ UTK OPS P BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 9888817171 (RPL 088 BLU UPNVJ UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 20401300004647 (RPL 088 BLU UPNVJ UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1570070707717 (RPL 088 BLU UPNVJ UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787611 (RPL 088 BLU UPNV JAKARTA UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1000819199 (RPL 088 BLU UPNVJ UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 9888818186 (RPL 088 BLU UPNVJ UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 20401300004639 (RPL 088 BLU UPNVJ UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788820 (RPL 088 BLU UPNVJ UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933721000 (BPG 088 UPN VETERAN JAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912155011 (RPL 088 BLU UPNVJ UTK OPS K PKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787713 (RPL 088 BLU UPNVJ UTK OPS K AKK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787724 (RPL 088 BLU UPNVJ UTK OPS K UPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787735 (RPL 088 BLU UPNVJ UTK OPS K FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787746 (RPL 088 BLU UPNVJ UTK OPS K FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787757 (RPL 088 BLU UPNVJ UTK OPS K FT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787768 (RPL 088 BLU UPNVJ UTK OPS K FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787791 (RPL 088 BLU UPNVJ UTK OPS K FIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788831 (RPL 088 BLU UPNVJ UTK OPS K FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788842 (RPL 088 BLU UPNVJ UTK OPS K FIKES)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788853 (RPL 088 BLU UPNVJ UTK OPS K LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788864 (RPL 088 BLU UPNVJ UTK OPS K BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788875 (RPL 088 BLU UPNVJ UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787780 (RPL 088 BLU UPNVJ UTK DK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919788897 (RPL 088 BLU UPNVJ UTK DK BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran DKI - 40101000016 (RPL 088 BLU UPNVJ)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919787622 (RPL 088 BLU UPNV JAKARTA UTK DK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3320011673 (RPL 088 BLU UPNVJ UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3320012210 (RPL 088 BLU UPNVJ UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693373,
    "nama": "UNIVERSITAS SINGAPERBANGSA KARAWANG",
    "kode": "023.69.693373",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -6.8635,
    "lng": 107.5454,
    "saldoBuku": 386907289928,
    "saldoBank": 0,
    "selisih": 386907289928,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 8608600885 (RPL 086 BLU UNSIKA UTK OPS 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933731000 (BPG 086 UNSIKA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009170 (RPL 086 BLU UNSIKA UTK OPS 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009162 (RPL 086 BLU UNSIKA UTK OPS 4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009188 (RPL 086 BLU UNSIKA UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1234512345 (RPL 086 BLU UNSIKA UTK PKE 3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1730017932287 (RPL 086 BLU UNSIKA UTK DK 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7300749962 (RPL 086 BLU UNSIKA UTK OPS 3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7301048078 (RPL 086 BLU UNSIKA UTK PKE 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7301048151 (RPL 086 BLU UNSIKA UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BJB - 88990088990 (RPL 086 BLU UNSIKA UTK PKE 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BJB - 122333444455 (RPL 086 BLU UNSIKA UTK DK 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009269 (RPL 086 BLU UNSIKA UTK OPS 5)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009277 (RPL 086 BLU UNSIKA UTK OPS 6)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009285 (RPL 086 BLU UNSIKA UTK OPS 7)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009293 (RPL 086 BLU UNSIKA UTK OPS 8)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009358 (RPL 086 BLU UNSIKA UTK OPS 9)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009366 (RPL 086 BLU UNSIKA UTK OPS 10)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009374 (RPL 086 BLU UNSIKA UTK OPS 11)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009382 (RPL 086 BLU UNSIKA UTK OPS 12)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009308 (RPL 086 BLU UNSIKA UTK OPS 13)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009316 (RPL 086 BLU UNSIKA UTK OPS 14)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009324 (RPL 086 BLU UNSIKA UTK OPS 15)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009332 (RPL 086 BLU UNSIKA UTK OPS 16)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009340 (RPL 086 BLU UNSIKA UTK OPS 17)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1730086086080 (RPL 086 BLU UNSIKA U)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 18101300009560 (RPL 086 BLU UNSIKA UTK OPS 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693374,
    "nama": "UNIVERSITAS SILIWANGI",
    "kode": "023.69.693374",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -7.0271,
    "lng": 107.6311,
    "saldoBuku": 30978118916,
    "saldoBank": 0,
    "selisih": 30978118916,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446933741000 (BPG 025 UNIVERSITAS SILIWANGI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741001 (BPP 025 UNIVERSITAS SILIWANGI 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741002 (BPP 025 UNIVERSITAS SILIWANGI 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741003 (BPP 025 UNIVERSITAS SILIWANGI 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741004 (BPP 025 UNIVERSITAS SILIWANGI 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741005 (BPP 025 UNIVERSITAS SILIWANGI 05)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741006 (BPP 025 UNIVERSITAS SILIWANGI 06)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446933741007 (BPP 025 UNIVERSITAS SILIWANGI 07)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024000 (RPL 025 BLU UNSIL UNTUK OPS PN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024011 (RPL 025 BLU UNSIL UNTUK OPS 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024022 (RPL 025 BLU UNSIL UNTUK OPS 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024033 (RPL 025 BLU UNSIL UNTUK OPS 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024044 (RPL 025 BLU UNSIL UNTUK OPS 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024055 (RPL 025 BLU UNSIL UNTUK OPS 05)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024066 (RPL 025 BLU UNSIL UNTUK OPS 06)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024077 (RPL 025 BLU UNSIL UNTUK OPS 07)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024088 (BLU UNSIL UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2542024099 (RPL 025 BLU UNSIL UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 9333395557 (RPL 025 BLU UNSIL UNTUK OPS PN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BJB - 20109333333 (RPL 025 BLU UNSIL UNTUK OPS PN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693375,
    "nama": "UNIVERSITAS PEMBANGUNAN NASIONAL \"VETERAN\" YOGYAKARTA",
    "kode": "023.69.693375",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "DI Yogyakarta",
    "provinsi": "DI YOGYAKARTA",
    "lat": -7.7173,
    "lng": 110.3038,
    "saldoBuku": 297782408378,
    "saldoBank": 297782408378,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1990009870 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370001955448 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370001955661 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK BPD - 1111002090 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 138001000011303 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 501300009611 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8989897797 (RPL 030 BLU UPNVY UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK BPD - 1311013116 (RPL 030 BLU UPNVY UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK BPD - 1311013488 (RPL 030 BLU UPNVY UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1992718854 (RPL 030 BLU UPNVY UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000219617083 (RPL 030 BLU UPNVY UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370206227841 (RPL 030 BLU UPNVY UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1880006546 (RPL 030 BLU UPNVY UNTUK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909653054 (RPL 030 BLU UPNVY UNTUK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909653565 (RPL 030 BLU UPNVY UNTUK OPS K FTM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909654423 (RPL 030 BLU UPNVY UNTUK OPS K FTI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909654875 (RPL 030 BLU UPNVY UNTUK OPS K  FP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909654036 (RPL 030 BLU UPNVY UNTUK OPS K  FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909655336 (RPL 030 BLU UPNVY UNTUK OPS K FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909655700 (RPL 030 BLU UPNVY UNTUK OPS K AKPK/AKK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1999004568 (RPL 030 BLU UPNVY UNTUK DK KAPITASI BPJS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1999003213 (RPL 030 BLU UPNVY UNTUK DK BEASISWA BI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1999000450 (RPL 030 BLU UPNVY UNTUK DK BEASISWA KEME)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1990004566 (RPL 030 BLU UPNVY UNTUK DK BP3 SNMPTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1999006543 (RPL 030 BLU UPNVY UNTUK DK KELEMBAGAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933751000 (BPG 030 UPN VETERAN YOGYAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933751001 (BPP 030 UPN VETERAN YOGYAKARTA 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1999002583 (RPL 030 BLU UPNVY UNTUK OPS K  UPA(Unit )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693376,
    "nama": "UNIVERSITAS PEMBANGUNAN NASIONAL \"VETERAN\" JAWA TIMUR",
    "kode": "023.69.693376",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.2035,
    "lng": 112.6784,
    "saldoBuku": 261373138442,
    "saldoBank": 0,
    "selisih": 261373138442,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933761000 (BPG 031 UPN VETERAN JAWA TIMUR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 3355767676 (RPL 031 BLU UPN UTK OPS PL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 3515767676 (RPL 031 BLU UPN UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4517767676 (RPL 031 BLU UPN UTK OPS FP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5157767676 (RPL 031 BLU UPN UTK OPS FT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6118767676 (RPL 031 BLU UPN UTK OPS FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7111767676 (RPL 031 BLU UPN UTK OPS FAD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8113767676 (RPL 031 BLU UPN UTK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4955767676 (RPL 031 BLU UPN UTK OPS FIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5755767676 (RPL 031 BLU UPN UTK OPS FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6660767676 (RPL 031 BLU UPN UTK OPS BUK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5560767676 (RPL 031 BLU UPN UTK OPS BAKPK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8840767676 (RPL 031 BLU UPN UTK OPS UPA LPT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4488767676 (RPL 031 BLU UPN UTK OPS UPA BHS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4330767676 (RPL 031 BLU UPN UTK OPS UPA PSTKA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5990767676 (RPL 031 BLU UPN UTK OPS UPA TIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6440767676 (RPL 031 BLU UPN UTK OPS LP3M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6600767676 (RPL 031 BLU UPN UTK OPS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2255767676 (RPL 031 BLU UPN UTK OPS PEN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2597767676 (RPL 031 BLU UPN UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6707767676 (RPL 031 BLU UTK UTK DK LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8808767676 (RPL 031 BLU UPN UTK DK SPP UKT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8307767676 (RPL 031 BLU UPN UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5907767676 (RPL 031 BLU UPN UTK DK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 3221100076 (RPL 031 BLU UPN UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1420008000076 (RPL 031 BLU UPN UTK\u00a0OPS\u00a0PEN\u00a0DKTR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 201307676768 (RPL 031 BLU UPN UTK OPS PEN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000202000527 (RPL 031 BLU UPN VETERAN UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1420000400076 (RPL 031 BLU UPN VETERAN UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2027767677 (RPL 031 BLU UPN VTRN UTK OPS Kantin)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 3039767676 (RPL 031 BLU UPN VTRN UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4049767676 (RPL 031 BLU UPN VTRN UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6062767676 (RPL 031 BLU UPN VTRN UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 201400242418 (RPL 031 BLU UPN VTRN UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7022767676 (RPL 031 BLU UPN VTRN UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5456767676 (RPL 031 BLU UPN UTK OPS UPA LUK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4540767676 (RPL 031 BLU UPN UTK OPS UPA PTPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693377,
    "nama": "UNIVERSITAS HALU OLEO",
    "kode": "023.69.693377",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Tenggara",
    "provinsi": "SULAWESI TENGGARA",
    "lat": -3.9985,
    "lng": 122.5751,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933771000 (BPG 060 UNIVERSITAS HALU OLEO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081985 (RPL 060 BLU UHO UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081816 (RPL 060 BLU UHO UNTUK PKE FAK. PETERNAKA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081838 (RPL 060 BLU UHO UNTUK PKE FIB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081827 (RPL 060 BLU UHO UNTUK PKE FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081941 (RPL 060 BLU UHO UNTUK PKE FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081678 (RPL 060 BLU UHO UNTUK PKE FAK FARMASI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081601 (RPL 060 BLU UHO UNTUK PKE PPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081656 (RPL 060 BLU UHO UNTUK PKE FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081930 (RPL 060 BLU UHO UNTUK PKE FAK. TEKNIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081861 (RPL 060 BLU UHO UNTUK PKE FKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081634 (RPL 060 BLU UHO UNTUK PKE FAK. HUKUM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081952 (RPL 060 BLU UHO UNTUK PKE FAK. KEDOKTERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081850 (RPL 060 BLU UHO UNTUK PKE FAK KEHUTANAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081645 (RPL 060 BLU UHO UNTUK PKE FAK. EKONOMI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081929 (RPL 060 BLU UHO UNTUK PKE FAK. PERTANIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081577 (RPL 060 BLU UHO UNTUK PKE FPIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081974 (RPL 060 BLU UHO UNTUK DANA DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1981081689 (RPL 060 BLU UHO UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1919139750 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK SULTRA - 24301040000293 (RPL 060 BLU UHO UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK SULTRA - 103021010236 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1901301908825 (RPL 060 BLU UHO UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 8210333333 (RPL 060 BLU UHO UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 19201005735308 (RPL 060 BLU UHO UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 19201006691400 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 8210099416 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 19201006723401 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK SULTRA - 103021010327 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 8210100090 (RPL 060 BLU UHO UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693378,
    "nama": "UNIVERSITAS SRIWIJAYA",
    "kode": "023.69.693378",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Indralaya / Palembang",
    "provinsi": "Sumatera Selatan",
    "lat": -3.2185,
    "lng": 104.6495,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933781000 (BPG 014 UNIVERSITAS SRIWIJAYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693379,
    "nama": "UNIVERSITAS LAMPUNG",
    "kode": "023.69.693379",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Lampung",
    "provinsi": "LAMPUNG",
    "lat": -5.45,
    "lng": 105.3292,
    "saldoBuku": 461778150007,
    "saldoBank": 0,
    "selisih": 461778150007,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933791000 (BPG 17 UNIVERSITAS LAMPUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911594446 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911594015 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK LAMPUNG - 4050005001371 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran KB - 1003756129 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 34401300000910 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 2309230925 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1915336729 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 9801171717307 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 185901000006305 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1140066224422 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7348412862 (RPL 017 BLU UNILA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911731019 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911733130 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911734928 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911736674 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911764862 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911765378 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911765844 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911767625 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911768244 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911768776 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911769394 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911770014 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911770795 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911771187 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911771472 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911772997 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911773718 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911774927 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911775535 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911775896 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911776209 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911776662 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911777418 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911777860 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911778456 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911779641 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911779867 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911780646 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911781005 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911781367 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1930899319 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2026839431 (RPL 017 BLU UNILA UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000218745298 (RPL 017 BLU UNIVERSITAS LAMPUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2085888627 (RPL 017 BLU UNILA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1801400031652 (RPL 017 BLU UNILA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912299326 (RPL 017 BLU UNILA untuk DK KS EURO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK LAMPUNG - 4050005001366 (RPL 017 BLU UNILA UNTUK DK PEMDA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911594037 (RPL 017 BLU UNILA UNTUK DK HIBAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911594322 (RPL 017 BLU UNILA UNTUK DK PEMDA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911594989 (RPL 017 BLU UNILA UNTUK DK PEMPUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911595348 (RPL 017 BLU UNILA UNTUK DK SWASTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1914668269 (RPL 017 BLU UNILA UNTUK DK KS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2013338791 (RPL 017 BLU UNILA UNTUK DK KS USD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693380,
    "nama": "UNIVERSITAS TANJUNGPURA",
    "kode": "023.69.693380",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Pontianak",
    "provinsi": "Kalimantan Barat",
    "lat": -0.0573,
    "lng": 109.3475,
    "saldoBuku": 210454514173,
    "saldoBank": 0,
    "selisih": 210454514173,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933801000 (BPG 042 Universitas Tanjungpura)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933803335 (RPL 042 BLU UNTAN untuk OPSP MANDIRI LEM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933802229 (RPL 042 BLU UNTAN untuk OPSP KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933804442 (RPL 042 BLU UNTAN untuk OPSP KONTRIBUSI )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Kalbar - 1010006666 (RPL 042 BLU UNTAN UTK OPSP S1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Kalbar - 1010009991 (RPL 042 BLU UNTAN UTK OPSP BD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1460049006666 (RPL 042 BLU UNTAN UTK OPSP PASCA SARJANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 6667676997 (RPL 042 BLU UNTAN UTK OPSP PPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 4201308887770 (RPL 042 BLU UNTAN UTK OPSP PENDAPATAN RS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933806675 (RPL 042 BLU UNTAN UTK OPSP KLINIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 6667779764 (RPL 042 BLU UNTAN UTK OPSP UUSU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933808888 (RPL 042 BLU UNTAN untuk OPSK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933805559 (RPL 042 BLU UNTAN untuk OPSK FAK HUKUM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933806664 (RPL 042 BLU UNTAN untuk OPSK FAK EKONOMI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933807771 (RPL 042 BLU UNTAN untuk OPSK FAK PERTANI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933809994 (RPL 042 BLU UNTAN untuk OPSK FAK TEKNIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933800005 (RPL 042 BLU UNTAN untuk OPSK FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801123 (RPL 042 BLU UNTAN untuk OPSK FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801134 (RPL 042 BLU UNTAN untuk OPSK FAK KEHUTAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801145 (RPL 042 BLU UNTAN untuk OPSK FAK MIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801156 (RPL 042 BLU UNTAN untuk OPSK FAK KEDOKTE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801167 (RPL 042 BLU UNTAN untuk OPSK UPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801178 (RPL 042 BLU UNTAN untuk OPSK BKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801189 (RPL 042 BLU UNTAN untuk OPSK RUMAH SAKIT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 4201400039566 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000204935909 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Kalbar - C35727 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 3000218150 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000204920405 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Kalbar - C35754 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000216447888 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 30010137580001 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Kalbar - C35847 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 30010137580002 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 4201400041717 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000230183087 (RPL 042 BLU UNTAN UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6933801112 (RPL 042 BLU Untan untuk DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693381,
    "nama": "UNIVERSITAS LAMBUNG MANGKURAT",
    "kode": "023.69.693381",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Banjarmasin",
    "provinsi": "Kalimantan Selatan",
    "lat": -3.2982,
    "lng": 114.5847,
    "saldoBuku": 253401067121,
    "saldoBank": 253401067121,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933811000 (BPG 045 ULM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933811001 (BPP 045 ULM 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933811002 (BPP 045 ULM 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 310061006600 (RPL 045 BLU ULM UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK KALSEL - 7555555557 (RPL 045 BLU ULM UTK OPS HIBAH PSDKU ULM )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK PANIN - 6005004313 (RPL 045 BLU ULM UTK OPS LAB GENOMIK ULM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 8888310344 (RPL 045 BLU ULM UTK OPSPL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 8888310322 (RPL 045 BLU ULM1 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1001309999997 (RPL 045 BLU ULM2 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 310075700008 (RPL 045 BLU ULM3 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7299443188 (RPL 045 BLU ULM4 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 62301002095304 (RPL 045 BLU ULM5 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran CIMB NIAGA - 860019967000 (RPL 045 BLU ULM6 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK KALSEL - 6666666777 (RPL 045 BLU ULM7 UTK OPSPSDKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 6110061453 (RPL 045 BLU ULM UTK PKD 8)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Mega - 20610036006643 (RPL 045 BLU ULM UTK PKD 9)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000228331206 (RPL 045 BLU ULM UTK PKD 11)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Mega Syariah - 100001000358967 (RPL 045 BLU ULM7 UTK OPSPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1001302121218 (RPL 045 BLU ULM UNTUK OPS PL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 310075770001 (RPL 045 BLU ULM UNTUK OPS HIBAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693382,
    "nama": "UNIVERSITAS SAM RATULANGI",
    "kode": "023.69.693382",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Manado",
    "provinsi": "Sulawesi Utara",
    "lat": 1.4552,
    "lng": 124.8296,
    "saldoBuku": 162964360443,
    "saldoBank": 0,
    "selisih": 162964360443,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1916178668 (RPL 049 BLU UNSRAT UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1916166696 (RPL 049 BLU UNSRAT UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 170101000027306 (RPL 049 BLU UNSRAT OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 117001300000029 (RPL 049 BLU UNSRAT UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 170101000026300 (RPL 049 BLU UNSRAT UTK OPS P DANKER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran SulutGo - 4201420000099 (RPL 049 BLU UNSRAT UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 170101000535406 (RPL 049 BLU UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 117001400002248 (RPL 049 BLU UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946913821000 (BPG 049 UNIVERSITAS SAM RATULANGI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2020766828 (RPL 049 BLU UNSRAT UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693383,
    "nama": "UNIVERSITAS NEGERI MANADO",
    "kode": "023.69.693383",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Utara",
    "provinsi": "SULAWESI UTARA",
    "lat": 1.4748,
    "lng": 124.9046,
    "saldoBuku": 54989531316,
    "saldoBank": 54989531316,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933831000 (BPG 049 UNIMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000052300 (RPL 049 BLU UNIMA UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000061309 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN DEN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000060303 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN SEW)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000059302 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN MAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000064307 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN SEW)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000055308 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN PEN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000054302 (RPL 049 BLU UNIMA UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000066309 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN SEW)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000056304 (RPL 049 BLU UNIMA UTK OPS PENERIMAAN IPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000063301 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN SEW)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000057300 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN TPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000053306 (RPL 049 BLU UNIMA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 000110130000800 (RPL 049 BLU UNIMA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000058306 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN WIS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7730007175 (RPL 049 BLU UNIMA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000067305 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN KER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000065303 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN SEW)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 145801000068301 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN OPT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSG Cabang Utama - 801420000049 (RPL 049 BLU\nUNIMA UTK OPS PENERIMAAN JOS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693384,
    "nama": "UNIVERSITAS NEGERI GORONTALO",
    "kode": "023.69.693384",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Gorontalo",
    "provinsi": "GORONTALO",
    "lat": 0.5975,
    "lng": 122.9831,
    "saldoBuku": 8155931355,
    "saldoBank": 0,
    "selisih": 8155931355,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586933841000 (BPG 050 UNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917352648 (RPL 050 BLU UNG UNTUK OPS PEN 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 0027-01-004497-30-6 (RPL 050 BLU UNG UNTUK OPS PEN 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 00110.01.30.000556.1 (RPL 050 BLU UNG UNTUK OPS PEN 3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 150 00 3350964 5 (RPL 050 BLU UNG UNTUK OPS PEN 4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7315256857 (RPL 050 BLU UNG UNTUK OPS PEN 5)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 8110078394 (RPL 050 BLU UNG UNTUK OPS PEN 6)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 11001400019672 (RPL 050 BLU UNG UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1916292247 (RPL 050 BLU UNG UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1916291094 (RPL 050 BLU UNG UNTUK DK SNPMB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917353754 (RPL 050 BLU UNG UNTUK OPS FIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917883782 (RPL 050 BLU UNG UNTUK OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917884107 (RPL 050 BLU UNG UNTUK OPS FSB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917527687 (RPL 050 BLU UNG UNTUK OPS FATEK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917354792 (RPL 050 BLU UNG UNTUK OPS FIS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917349125 (RPL 050 BLU UNG UNTUK OPS FOK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917519075 (RPL 050 BLU UNG UNTUK OPS FAPERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917347162 (RPL 050 BLU UNG UNTUK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917350243 (RPL 050 BLU UNG UNTUK OPS FKTP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917348188 (RPL 050 BLU UNG UNTUK OPS FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917353346 (RPL 050 BLU UNG UNTUK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917884527 (RPL 050 BLU UNG UNTUK OPS PPs)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917520433 (RPL 050 BLU UNG UNTUK OPS VOKASI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917356278 (RPL 050 BLU UNG UNTUK OPS BKKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917355300 (RPL 050 BLU UNG UNTUK OPS BAKP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917354113 (RPL 050 BLU UNG UNTUK OPS BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917885214 (RPL 050 BLU UNG UNTUK OPS LP2M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917144934 (RPL 050 BLU UNG UNTUK OPS LPMPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917148043 (RPL 050 BLU UNG UNTUK OPS SPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917147094 (RPL 050 BLU UNG UNTUK OPS DEWAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917349760 (RPL 050 BLU UNG UNTUK OPS PPBJ)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917345507 (RPL 050 BLU UNG UNTUK OPS UPA TIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917885009 (RPL 050 BLU UNG UNTUK OPS UPA PKK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917350899 (RPL 050 BLU UNG UNTUK OPS UPA BAHASA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917522690 (RPL 050 BLU UNG UNTUK OPS UPA PERPUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917149965 (RPL 050 BLU UNG UNTUK OPS UPA BK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917358265 (RPL 050 BLU UNG UNTUK OPS UNIT USAHA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917351270 (RPL 050 BLU UNG UNTUK OPS PNBP BLU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693385,
    "nama": "UNIVERSITAS TADULAKO",
    "kode": "023.69.693385",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Tengah",
    "provinsi": "SULAWESI TENGAH",
    "lat": -0.9003,
    "lng": 119.9404,
    "saldoBuku": 324662590683,
    "saldoBank": 323125439711,
    "selisih": 1537150972,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446933851000 (BPG 051 UNIVERSITAS TADULAKO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8877667775 (RPL 051 BLU UNTAD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2501300007160 (RPL 051 BLU UNTAD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Mega Syariah - 100001000324936 (RPL 051 BLU UNTAD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1910100527 (RPL 051 BLU UNTAD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1910776516 (RPL 051 BLU UNTAD UTK OPS FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1910779798 (RPL 051 BLU UNTAD UTK OPS FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910818516 (RPL 051 BLU UNTAD UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910821131 (RPL 051 BLU UNTAD UTK OPS  FAKUM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910857816 (RPL 051 BLU UNTAD UTK OPS FAPERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910949649 (RPL 051 BLU UNTAD UTK OPS FATEK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910959169 (RPL 051 BLU UNTAD UTK OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910959567 (RPL 051 BLU UNTAD UTK OPS FAHUT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910960855 (RPL 051 BLU UNTAD UTK OPS FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910964612 (RPL 051 BLU UNTAD UTK OPS FAPETKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910965435 (RPL 051 BLU UNTAD UTK OPS FKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910967704 (RPL 051 BLU UNTAD UTK OPS PASCASARJANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1910107192 (RPL 051 BLU UNTAD UTK OPS BKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911002188 (RPL 051 BLU UNTAD UTK OPS BAK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911005644 (RPL 051 BLU UNTAD UTK OPS KEMAHASISWAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911055164 (RPL 051 BLU UNTAD UTK OPS PK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911056576 (RPL 051 BLU UNTAD UTK OPS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911058041 (RPL 051 BLU UNTAD UTK OPS LPMPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911849645 (RPL 051 BLU UNTAD UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 6001005519309 (RPL 051 BLU UNTAD UTK OPS KIP DAN BBP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2501300007437 (RPL 051 BLU UNTAD\u00a0UTK\u00a0OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1985576815 (RPL 051 BLU UNTAD UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1985580005 (RPL 051 BLU UNTAD UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1985503596 (RPL 051 BLU UNTAD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2010829533 (RPL 051 BLU UNTAD UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Utang Pajak - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693386,
    "nama": "UNIVERSITAS NEGERI MAKASSAR",
    "kode": "023.69.693386",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Makassar",
    "provinsi": "Sulawesi Selatan",
    "lat": -5.1854,
    "lng": 119.4312,
    "saldoBuku": 533097000825,
    "saldoBank": 533097000825,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1918528567 (RPL 054 BLU UNM UNTUK OPS Pengeluaran)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918532958 (RPL 054 BLU UNM UNTUK OPS Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 6933861000 (BPG 054 UNIVERSITAS NEGERI MAKASSAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918534445 (RPL 054 BLU UNM UNTUK Ops Pengeluaran)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918531239 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918317136 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918331897 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918325363 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918319019 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918328262 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918327406 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918326264 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918330587 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918321324 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918323489 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 401300019206 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 40301300000190 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 5001005600301 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 5544440545 (RPL 054 BLU UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 5001005601307 (RPL 054 BLU UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran CIMB - 860021207800 (RPL 054 BLU UNM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 4445553366 (RPL 054 BLU UNM UNTUK Ops Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000192801235 (RPL 054 BLU UNM UNTUK Ops Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 401300019191 (RPL 054 BLU UNM UNTUK Ops Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000205892693 (RPL 054 BLU UNM UNTUK Ops Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran CIMB - 860021210900 (RPL 054 BLU UNM UNTUK Ops Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000233204921 (RPL 054 BLU UNM UNTUK Ops Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693387,
    "nama": "UNIVERSITAS NEGERI MEDAN",
    "kode": "023.69.693387",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Medan",
    "provinsi": "Sumatera Utara",
    "lat": 3.6064,
    "lng": 98.7123,
    "saldoBuku": 364465367106,
    "saldoBank": 364285367106,
    "selisih": 180000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 989194693387100 (BPG 004 UNIMED)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7088252537 (RPL 004 BLU UNIMED UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7088252526 (RPL 004 BLU UNIMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7088252548 (RPL 004 BLU UNIMED UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1060020230663 (RPL 004 BLU UNIMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1060002306630 (RPL 004 BLU UNIMED UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK SUMUT SYARIAH - 61001240000051 (RPL 004 BLU UNIMED UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK SUMUT SYARIAH - 61001240000050 (RPL 004 BLU UNIMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 301300013890 (RPL 004 BLU UNIMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 63301001555304 (RPL 004 BLU UNIMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 2004567881 (RPL 004 BLU UNIMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693388,
    "nama": "UNIVERSITAS PATTIMURA",
    "kode": "023.69.693388",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Ambon",
    "provinsi": "Maluku",
    "lat": -3.6554,
    "lng": 128.1923,
    "saldoBuku": 80804958050,
    "saldoBank": 0,
    "selisih": 80804958050,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933881000 (BPG 061 UNIVERSITAS PATTIMURA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007196054 (RPL 061 Unpatti untuk OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2401300003277 (RPL 061 Unpatti untuk DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 101002543305 (RPL 061 BLU Unpatti untuk OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007229558 (RPL 061 UNPATTI UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408475 (RPL 061 LPMPP UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408533 (BPP 061 LPPM Unpatti utk OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408624 (RPL 061 PERTANIAN UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408053 (RPL 061 ISIP UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408400 (RPL 061 KIP UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408558 (RPL 061 PAS SJN UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007401330 (RPL 061 EKONOMI UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408103 (RPL 061 KEDOKTERAN UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408665 (RPL 061 TEKNIK UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007406396 (RPL 061 HUKUM UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408673 (RPL 061 REKTORAT UNPATTI utk OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408616 (RPL 061 PERIKANAN UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007408640 (RPL 061 SAINS UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860010271589 (RPL 061 PSDKU UNPATTI UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7297767447 (RPL 061 BLU UNPATTI UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7339395618 (RPL 061 BLU Unpatti untuk OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7347590503 (RPL 061 BLU UNPATTI UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000228060253 (RPL 061 BLU UNPATTI UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2401400052516 (RPL 061 BLU UNPATTI UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2401400050077 (RPL 061 BLU UNPATTI UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6780678993 (RPL 061 BLU UNPATTI UNTUK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2401400052215 (RPL 061 BLU UNPATTI UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693389,
    "nama": "UNIVERSITAS UDAYANA",
    "kode": "023.69.693389",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jimbaran / Bali",
    "provinsi": "Bali",
    "lat": -8.7981,
    "lng": 115.1724,
    "saldoBuku": 198464801364,
    "saldoBank": 171429655769,
    "selisih": 27035145595,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 701300009627 (RPL 037 BLU UNUD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911507837 (RPL 037 BLU UNUD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911485289 (RPL 037 BLU UNUD UTK OPS NON UKT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911460478 (RPL 037 BLU UNUD UTK OPS FAPET)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1750003634085 (RPL 037 BLU UNUD UTK OPS SPBU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911483893 (RPL 037 BLU UNUD UTK OPS RSGM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126933891000 (BPG 037 UNIVERSITAS UDAYANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911479398 (RPL 037 BLU UNUD UTK OPS FIB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911482266 (RPL 037 BLU UNUD UTK OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911482776 (RPL 037 BLU UNUD UTK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911484456 (RPL 037 BLU UNUD UTK OPS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911481705 (RPL 037 BLU UNUD UTK OPS FTP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911480451 (RPL 037 BLU UNUD UTK OPS FP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911490049 (RPL 037 BLU UNUD UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911516218 (RPL 037 BLU UNUD UTK OPS RSGM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911462931 (RPL 037 BLU UNUD UTK OPS FKP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911472406 (RPL 037 BLU UNUD UTK OPS BU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911477936 (RPL 037 BLU UNUD UTK OPS PASCA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911461392 (RPL 037 BLU UNUD UTK OPS BKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911462012 (RPL 037 BLU UNUD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911462454 (RPL 037 BLU UNUD UTK OPS FT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911462680 (RPL 037 BLU UNUD UTK OPS FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911471322 (RPL 037 BLU UNUD UTK OPS RSPTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911475076 (RPL 037 BLU UNUD UTK OPS FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 110121000632 (RPL 037 BLU UNUD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911473920 (RPL 037 BLU UNUD UTK OPS FKH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911460933 (RPL 037 BLU UNUD UTK OPS FPAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911461642 (RPL 037 BLU UNUD UTK OPS BAKH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911515022 (RPL 037 BLU UNUD UTK OPS RSPTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 55601002229304 (RPL 037 BLU UNUD UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911462227 (RPL 037 BLU UNUD UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911487616 (RPL 037 BLU UNUD UTK OPS BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911477142 (RPL 037 BLU UNUD UTK OPS KP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1750003630596 (RPL 037 BLU UNUD UTK OPS RSPTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1750003630331 (RPL 037 BLU UNUD UTK OPS IPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 340105000033 (RPL 037 BLU UNUD UNTUK OPS PENERIMAAN BL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 340105000148 (RPL 037 PS UNUD UTK CATUS PATA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693390,
    "nama": "UNIVERSITAS MATARAM",
    "kode": "023.69.693390",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Mataram",
    "provinsi": "Nusa Tenggara Barat",
    "lat": -8.5833,
    "lng": 116.0967,
    "saldoBuku": 105052663676,
    "saldoBank": 0,
    "selisih": 105052663676,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 80325006933901000 (BPG 038 Universitas Mataram)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006477 (RPL 038 BLU UNRAM OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1610014541408 (RPL 038 BLU UNRAM OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran NTB - Sriwijaya - 5040100003224 (RPL 038 BLU UNRAM OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7296403347 (RPL 038 BLU UNRAM OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1909658406 (RPL 038 BLU UNRAM OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 5201004520302 (RPL 038 BLU UNRAM OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1610014541499 (RPL 038 BLU UNRAM OPS PNRMN BISNIS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006697 (RPL 038 BLU UNRAM UTK SPORT CENTER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1610014543495 (RPL 038 BLU UNRAM OPS PNRMN RS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1909658042 (RPL 038 BLU UNRAM OPS PNRMN RS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran CIMB - 860019793300 (RPL 038 BLU UNRAM OPS PNRMN RS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006485 (RPL 038 BLU UNRAM UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1610014541382 (RPL 038 BLU UNRAM UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran NTB - Sriwijaya - 5040100037223 (RPL 038 BLU UNRAM UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1909657582 (RPL 038 BLU UNRAM UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 5201004525302 (RPL 038 BLU UNRAM UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006508 (RPL 038 BLU UNRAM OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006493 (RPL 038 BLU UNRAM UTK OPS REKTORAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006516 (RPL 038 BLU UNRAM UTK OPS RS UNRAM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006524 (RPL 038 BLU UNRAM UTK OPS PERTANIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006532 (RPL 038 BLU UNRAM UTK OPS FATEPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006540 (RPL 038 BLU UNRAM UTK OPS FHISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006558 (RPL 038 BLU UNRAM UTK OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006566 (RPL 038 BLU UNRAM UTK OPS LPMPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006574 (RPL 038 BLU UNRAM UTK OPS FPT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006582 (RPL 038 BLU UNRAM UTK OPS FKIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006590 (RPL 038 BLU UNRAM UTK OPS FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300006605 (RPL 038 BLU UNRAM UTK OPS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 10001300001271 (RPL 038 BLU UNRAM UTK OPS FT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 10001300001289 (RPL 038 BLU UNRAM UTK OPS PPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7296491874 (RPL 038 BLU UNRAM UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 5040404001231 (RPL 038 UNRAM UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran NTB - 700000022064442 (RPL 038 UNRAM UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2101300007041 (RPL 038 BLU UNRAM UNTUK DK RPATA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693391,
    "nama": "UNIVERSITAS NUSA CENDANA",
    "kode": "023.69.693391",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kupang",
    "provinsi": "Nusa Tenggara Timur",
    "lat": -10.1554,
    "lng": 123.6583,
    "saldoBuku": 164507105779,
    "saldoBank": 0,
    "selisih": 164507105779,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 1696.01.000057.30.0 (RPL 039 BLU UNDANA UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000039.30.2 (RPL 039 BLU UNDANA UTK OPS FAPERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000046.30.9 (RPL 039 BLU UNDANA UTK OPS PPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000032.30.0 (RPL 039 BLU UNDANA UTK OPS FST)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000054.30.2 (RPL 039 BLU UNDANA UTK OPS UPT PTIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000040.30.3 (RPL 039 BLU UNDANA UTK OPS LAKER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000035.30.8 (RPL 039 BLU UNDANA UTK OPS FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000045.30.3 (RPL 039 BLU UNDANA UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000042.30.5 (RPL 039 BLU UNDANA UTK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000043.30.1 (RPL 039 BLU UNDANA UTK OPS KEBAHASAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000049.30.7 (RPL 039 BLU UNDANA UTK OPS PERPUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000041.30.9 (RPL 039 BLU UNDANA UTK OPS FKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000036.30.4 (RPL 039 BLU UNDANA UTK OPS LP2M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000051.30.4 (RPL 039 BLU UNDANA UTK OPS RS UNDANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000038.30.6 (RPL 039 BLU UNDANA UTK OPS FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000037.30.0 (RPL 039 BLU UNDANA UTK OPS BAK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000044.30.7 (RPL 039 BLU UNDANA UTK OPS LP3M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000050.30.8 (RPL 039 BLU UNDANA UTK OPS BAUK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000055.30.8 (RPL 039 BLU UNDANA UTK OPS SPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000053.30.6 (RPL 039 BLU UNDANA UTK OPS BPKH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 169601.000033.30.6 (RPL 039 BLU UNDANA UTK OPS FKKH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000047.30.5 (RPL 039 BLU UNDANA UTK OPS FPKP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000048.30.1 (RPL 039 BLU UNDANA UTK OPS UPT RISET TER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000056.30.4 (RPL 039 BLU UNDANA UTK OPS BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000052.30.0 (RPL 039 BLU UNDANA UTK OPS OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 3901005132308 (RPL 039 BLU UNDANA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586933911000 (BPG 039 UNIVERSITAS NUSA CENDANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2201300005344 (RPL 039 BLU UNDANA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2201300005336 (RPL 039 BLU UNDANA UTK OPS PENER BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2201300005352 (RPL 039 BLU UNDANA UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 181008077777-5 (RPL 039 BLU UNDANA UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1810008777774 (RPL 039 BLU UNDANA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 2009446460 (RPL 039 BLU UNDANA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1000033226 (RPL 039 BLU UNDANA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912915198 (RPL 039 BLU UNDANA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 2011410886 (RPL 039 BLU UNDANA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK NTT - 2514857051 (RPL 039 BLU UNDANA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran CAPITAL - 2190990241 (RPL 039 BLU UNDANA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran CIMB NIAGA - 800212269200 (RPL 039 UNDANA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2201400023103 (RPL 039 BLU UNDANA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1696.01.000313.40.5 (RPL 039 BLU UNDANA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 30009873400002 (RPL 039 BLU UNDANA UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK NOBU - 50320008828 (RPL 039 BLU UNDANA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2201400026119 (RPL 039 BLU UNDANA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran CAPITAL - 2190904628 (RPL 039 BLU UNDANA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693392,
    "nama": "UNIVERSITAS BENGKULU",
    "kode": "023.69.693392",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bengkulu",
    "provinsi": "BENGKULU",
    "lat": -3.8004,
    "lng": 102.328,
    "saldoBuku": 109166139158,
    "saldoBank": 103277521363,
    "selisih": 5888617795,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 2500002211 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2500002233 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2500002266 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2500002277 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2500002299 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 179-00-0533069-6 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 179-00-0533074-6 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 179-00-0533076-1 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 179-00-0533078-7 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Bengkulu - 10110000666 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Bengkulu - 10304017006 (RPL 016 BLU UNIB UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00000037-01-30-000626-2 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 11501005413302 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7298982832 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 4310049951 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 4310051159 (RPL 016 BLU UNIB UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 4310051453 (RPL 016 BLU UNIB UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Mega Syariah - 10000100326840 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Mega Syariah - 300003001167395 (RPL 016 BLU UNIB UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1000640326 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3000197886 (RPL 016 BLU UNIB UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2500002244 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2500002200 (RPL 016 BLU UNIB UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 179-00-0533077-9 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7298982751 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 11501005412306 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500002288 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003305 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003383 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003372 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001104 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001193 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003394 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001159 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001160 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001148 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001137 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003316 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003361 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003350 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003349 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500003327 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500001182 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2500004412 (RPL 016 BLU UNIB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933921000 (BPG 016 UNIVERSITAS BENGKULU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693393,
    "nama": "UNIVERSITAS PENDIDIKAN GANESHA",
    "kode": "023.69.693393",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bali",
    "provinsi": "BALI",
    "lat": -8.6165,
    "lng": 115.1389,
    "saldoBuku": 94940503721,
    "saldoBank": 0,
    "selisih": 94940503721,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 8801002736308 (RPL 132 BLU UNDIKSHA untuk OPS BRIVA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002740307 (RPL 132 BLU UNDIKSHA untuk OPS NON BRIVA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002742309 (RPL 132 BLU UNDIKSHA untuk OPS BLU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002732304 (RPL 132 BLU UNDIKSHA untuk OPS LP3M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002733300 (RPL 132 BLU UNDIKSHA untuk OPS FIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002734306 (RPL 132 BLU UNDIKSHA untuk OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002730302 (RPL 132 BLU UNDIKSHA untuk OPS FOK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002743305 (RPL 132 BLU UNDIKSHA untuk OPS FTK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002739306 (RPL 132 BLU UNDIKSHA untuk OPS PNBP REKT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002741303 (RPL 132 BLU UNDIKSHA untuk OPS Fakultas )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002738300 (RPL 132 BLU UNDIKSHA untuk OPS FBS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002744301 (RPL 132 BLU UNDIKSHA untuk OPS FE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002737304 (RPL 132 BLU UNDIKSHA untuk OPS FHIS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002735302 (RPL 132 BLU UNDIKSHA untuk OPS LP2M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002731308 (RPL 132 BLU UNDIKSHA untuk OPS Fakultas )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 25801300002777 (RPL 132 BLU UNDIKSHA untuk PKE 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1909955204 (RPL 132 BLU UNDIKSHA Untuk  PKE 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1909957234 (RPL 132 BLU UNDIKSHA Untuk DK 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD BALI - 14015002981 (RPL 132 BLU UNDIKSHA untuk PKD 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1450016897767 (RPL 132 BLU UNDIKSHA Untuk DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002745307 (RPL 132 BLU UNDIKSHA untuk PKD 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 25801400008526 (RPL 132 BLU UNDIKSHA untuk PKD 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD BALI - 140121000112 (RPL 132 BLU UNDIKSHA UNTUK OPS VA BPD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1923020806 (RPL 132 BLU UNDIKSHA UNTUK OPS VA BNI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8801002757304 (RPL 132 BLU UNDIKSHA untuk OPS UPA PPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1450017133477 (RPL 132 BLU UNDIKSHA untuk OPS VA MDRI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 25801300002874 (RPL 132 BLU UNDIKSHA untuk OPS VA BTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7345701448 (RPL 132 BLU UNDIKSHA untuk OPS VA BSI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586933931000 (BPg 132 UNDIKSHA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 25801400008526 (BPg 132 UNDIKSHA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693394,
    "nama": "UNIVERSITAS KHAIRUN",
    "kode": "023.69.693394",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Maluku Utara",
    "provinsi": "MALUKU UTARA",
    "lat": 0.7905,
    "lng": 127.4451,
    "saldoBuku": 174292996404,
    "saldoBank": 174292996404,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 2225202022 (RPL 062 BLU UNKHAIR PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00000210-01-30-000671-9 (RPL 062 BLU UNKHAIR UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2225202033 (RPL 062 BLU UNKHAIR UTK OPS PEN. LAINNYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00000210-01-30-000670-1 (RPL 062 BLU UNKHAIR UTK OPS PEN. AKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD MALUKU - 601031924 (RPL 062 BLU UNKHAIR UTK OPS PENERIMAAN.)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7220020252 (RPL 062 BLU UNKHAIR UTK OPS PENERIMAAN.)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000202636904 (RPL 062 BLU UNKHAIR UTK OPS PKD.)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946933941000 (BPG 062 UNIVERSITAS KHAIRUN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2225202044 (RPL 062 BLU UNKHAIR OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2225202055 (RPL 062 BLU UNKHAIR OPS DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913108795 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913109710 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913120701 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913123688 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913121658 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913106742 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913112532 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913114493 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1913107951 (RPL 062 BLU UNKHAIR UTK OPS PENGELUARAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693395,
    "nama": "UNIVERSITAS BANGKA BELITUNG",
    "kode": "023.69.693395",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bangka Belitung",
    "provinsi": "BANGKA BELITUNG",
    "lat": -2.1333,
    "lng": 106.1792,
    "saldoBuku": 44989920121,
    "saldoBank": 15489916732,
    "selisih": 29500003389,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586933951000 (BPG 015 UBB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000377300 (RPL 015 BLU UBB UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000379302 (RPL 015 BLU UBB UNTUK OPS BPP FAPERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3710055757 (RPL 015 BLU UBB UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 20901300003853 (RPL 015 BLU UBB UNTUK OPS BPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 20901300003861 (RPL 015 BLU UBB UTK DK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000374302 (RPL 015 BLU UBB UNTUK OPS BPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7771970221 (RPL 015 BLU UBB UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000382305 (RPL 015 BLU UBB UNTUK OPS BPP FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000385303 (RPL 015 BLU UBB UNTUK OPS BPP LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK SUMSEL BABEL - 1443022509 (RPL 015 BLU UBB UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000383301 (RPL 015 BLU UBB UNTUK OPS BPP FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 214501000375308 (RPL 015 BLU UBB UTK DK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 20901300003879 (RPL 015 BLU UBB UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000384307 (RPL 015 BLU UBB UNTUK OPS BPP BAKK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000376304 (RPL 015 BLU UBB UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000380303 (RPL 015 BLU UBB UNTUK OPS BPP FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000381309 (RPL 015 BLU UBB UNTUK OPS BPP FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000378306 (RPL 015 BLU UBB UNTUK OPS BPP FST)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 6611662232 (RPL 015 BLU UBB UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933951002 (BPP 015 UBB 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933951003 (BPP 015 UBB 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933951004 (BPP 015 UBB 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933951005 (BPP 015 UBB 05)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933951006 (BPP 015 UBB 06)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933951008 (BPP 015 UBB 08)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 214501000485307 (RPL 015 BLU UBB\nUNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Sumsel Babel - 1444025078 (Deposito Berjangka)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 214501000547400 (Deposito Berjangka)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2026129205 (Deposito Berjangka)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 20901400014102 (Deposito Berjangka)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3710056933 (Deposito Berjangka)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3710057119 (Deposito Berjangka)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693396,
    "nama": "UNIVERSITAS BORNEO TARAKAN",
    "kode": "023.69.693396",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Utara",
    "provinsi": "KALIMANTAN UTARA",
    "lat": 3.3278,
    "lng": 117.6411,
    "saldoBuku": 1034018986,
    "saldoBank": 1034018986,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586933961000 (BPG 048 UBT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 51100221 (BPN 048 UBT 693396)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2228722242 (BPN 048 UBT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1922411291 (RPL 048 KS UBT UNTUK PPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 24501300001742 (RPL 048 KS UBT UNTUK SNPMB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 51100239 (RPL 048 KS UBT UNTUK LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693397,
    "nama": "UNIVERSITAS TRUNODJOYO MADURA",
    "kode": "023.69.693397",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.3671,
    "lng": 112.7641,
    "saldoBuku": 144525463561,
    "saldoBank": 144525463561,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 80325006933971000 (BPG 036 UNIVERSITAS TRUNOJOYO MADURA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007340 (RPL 036 BLU UTM UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007358 (RPL 036 BLU UTM UNTUK OPS 5)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 601003052307 (RPL 036 BLU UTM UNTUK OPS 4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jatim - 1051006280 (RPL 036 BLU UTM UNTUK OPS 3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2584040114 (RPL 036 BLU UTM UNTUK OPS 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2584040103 (RPL 036 BLU UTM UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914429571 (RPL 036 BLU UTM UTK OPS TOEFL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914430337 (RPL 036 BLU UTM UTK OPS BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914431874 (RPL 036 BLU UTM UTK OPS LAB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914428760 (RPL 036  BLU UTM UTK OPS PERPUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1926899429 (RPL 036  BLU UTM UTK OPS KLINIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jatim - 1051006298 (RPL 036 BLU UTM UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 700000023558647 (RPL 036 BLU UTM UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7363196785 (RPL 036 BLU UTM UNTUK OPS 8)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KB Bank - 30000034953 (RPL 036 BLU UTM UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KB Bank - 10000004502 (RPL 036 BLU UTM UNTUK OPS 7)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2030611806 (RPL 036 BLU UTM UTK OPS LUK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007366 (RPL 036 BLU UTM UTK OPS BPKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007390 (RPL 036 BLU UTM UTK OPS BAAK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007447 (RPL 036 BLU UTM UTK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007382 (RPL 036 BLU UTM UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007489 (RPL 036 BLU UTM UTK OPS FP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007374 (RPL 036 BLU UTM UTK OPS FT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007552 (RPL 036 BLU UTM UTK OPS FISIB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007502 (RPL 036 BLU UTM UTK OPS FIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007455 (RPL 036 BLU UTM UTK OPS FKIS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007497 (RPL 036 BLU UTM UTK OPS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007413 (RPL 036 BLU UTM UTK OPS PERPUS 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007471 (RPL 036 BLU UTM UTK OPS TIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007421 (RPL 036 BLU UTM UTK OPS BHS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007463 (RPL 036 BLU UTM UTK OPS LABTER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007528 (RPL 036 BLU UTM UTK OPS LPMPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007439 (RPL 036 BLU UTM UTK OPS PKK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007405 (RPL 036 BLU UTM UTK OPS LBK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007536 (RPL 036 BLU UTM UTK OPS PTPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007510 (RPL 036 BLU UTM UTK OPS LUK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2801300007544 (RPL 036 BLU UTM UTK OPS PSCSRJ)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693398,
    "nama": "UNIVERSITAS MARITIM RAJA ALI HAJI",
    "kode": "023.69.693398",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kepulauan Riau",
    "provinsi": "KEPULAUAN RIAU",
    "lat": 0.9167,
    "lng": 104.5208,
    "saldoBuku": 1194904916,
    "saldoBank": 1161193616,
    "selisih": 33711300,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586933981000 (BPG 009 UMRAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003439306 (RPL 009 KS\u0100\u00a0UMRAH\u0100\u00a0untuk\u0100\u00a0Research\u0100\u00a0NUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003438300 (RPL 009 KS UMRAH untuk PEMKAB ANAMBAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003440307 (BPN 009 UMRAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586933981001 (BPP 009 UMRAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003454306 (RPL 009 KS\u0100\u00a0UMRAH\u0100\u00a0untuk Penelitian PT P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006217 (RPL 009 KS UMRAH untuk PEMKAB LINGGA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006233 (RPL 009 KS UMRAH untuk\u0100\u00a0JCU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003475302 (RPL 009 KS UMRAH UNTUK KPDI KE 16)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003473300 (RPL 009 KS UMRAH UTK BEASISWA BIDIKMISI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003472304 (RPL 009 KS UMRAH UTK SNPMB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 17401003467309 (RPL 009 KS UMRAH UTK TEKNOKRATIK RPJMD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003464301 (RPL 009 PS UMRAH UTK MACIFIC)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003468305 (RPL 009 KS\u0100\u00a0UMRAH\u0100\u00a0UTK\u0100\u00a0DRTPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003465307 (RPL 009 KS UMRAH UTK BANK INDONESIA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003470302 (RPL 009 KS UMRAH UTK SMM PTN-BARAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 17401003469301 (RPL 009 KS UMRAH UTK WWFI FIKP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 17401003471308 (RPL 009 KS UMRAH UTK BKS PTN BARAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003466303 (RPL 009 KS UMRAH UTK MKWK LPMPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006241 (RPL 009 KS UMRAH untuk Republic Polytech)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006322 (RPL 009 KS UMRAH UTK PROGRAM KREATIFITAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006314 (RPL 009 KS UMRAH UTK PEMKO TANJUNGPINANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006259 (RPL 009 KS UMRAH untuk PT CCI Bintan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006398 (RPL 009 KS UMRAH UTK PENDANAAN TOEP TPDA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006364 (RPL 009 PS UMRAH UTK PKPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006356 (RPL 009 PDHL UMRAH UTK 2H7SLZSA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006380 (RPL 009 KS UMRAH UTK PENDANAAN PPG THP I)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006429 (RPL 009 KS UMRAH UTK DPRD KOTA BATAM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003505301 (RPL 009 PDHL UMRAH UNTUK 24XNQEHA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006437 (RPL 009 PS UMRAH UTK PASCASARJANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 14801300006615 (RPL 009 KS UMRAH UNTUK DPMPTSP KEPRI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003531302 (RPL 009 PS UMRAH UNTUK ICOSMES)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17401003530306 (RPL 009 PK UMRAH UTK LPPD SEKDAPROVKEPRI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693399,
    "nama": "INSTITUT SENI INDONESIA PADANGPANJANG",
    "kode": "023.69.693399",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sumatera Barat",
    "provinsi": "SUMATERA BARAT",
    "lat": -0.8931,
    "lng": 100.3435,
    "saldoBuku": 29872183841,
    "saldoBank": 29872183841,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586933991000 (BPG 011 ISI PADANGPANJANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 10000622854 (RPL 011 BLU ISI PP UTK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 23101001794306 (RPL 011 BLU ISI PP UTK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 23101001793300 (RPL 011 BLU ISI PP UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK NAGARI - 9000101006400 (RPL 011 BLU ISI PP UTK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297114195 (RPL 011 BLU ISI PP UTK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297148162 (RPL 011 BLU ISI PP UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297113946 (RPL 011 BLU ISI PP UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297113997 (RPL 011 BLU ISI PP UTK OPS K NON)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297114128 (RPL 011 BLU ISI PP UTK OPS K FSRD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297114168 (RPL 011 BLU ISI PP UTK OPS K FSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Nagari - 9000302004514 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000203627477 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000203627868 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000203626171 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000212961285 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000212960475 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000227972787 (RPL 011 BLU ISI PP UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1110001510011 (RPL 011 BLU ISI PP UTK OPS P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693400,
    "nama": "INSTITUT SENI BUDAYA INDONESIA ACEH",
    "kode": "023.69.693400",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.6023,
    "lng": 95.2501,
    "saldoBuku": 175820363,
    "saldoBank": 175820363,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446934001000 (BPG 001 ISBI ACEH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BANK ACEH Syariah - 1101020000651 (RPL 001 PS ISBI ACEH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1000641912 (BPN 001 ISBI ACEH 693400)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7298935548 (BPN 001 ISBI ACEH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693401,
    "nama": "INSTITUT SENI INDONESIA YOGYAKARTA",
    "kode": "023.69.693401",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "DI Yogyakarta",
    "provinsi": "DI YOGYAKARTA",
    "lat": -7.8809,
    "lng": 110.3895,
    "saldoBuku": 881658168,
    "saldoBank": 881658168,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 7780015100 (BPN 030 ISI YOGYAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370030151464 (BPN 030 ISI YOGYAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7750015105 (RPL 030 PDT ISI YOGYAKARTA UTK PENELITIA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7740015107 (RPL 030 PS ISI YOGYAKARTA UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7760015104 (RPL 030 PDT ISI YOGYAKARTA UTK SNPMB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934011000 (BPG 030 ISI YOGYAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 23601003151300 (BPN 030 ISI YOGYAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370001100151 (RPL 030 PDT ISI YOGYAKARTA UTK BEASISWA )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693402,
    "nama": "INSTITUT TEKNOLOGI SUMATERA",
    "kode": "023.69.693402",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Lampung",
    "provinsi": "LAMPUNG",
    "lat": -5.396,
    "lng": 105.193,
    "saldoBuku": 1574511454,
    "saldoBank": 0,
    "selisih": 1574511454,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934021000 (BPG 017 ITERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911725073 (BPN 017 ITERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 28501002794300 (BPN 017 ITERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1140070708089 (BPN 017 ITERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7667676007 (BPN 017 ITERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 98919469340210001 (BPP 017 ITERA 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 98919469340210002 (BPP 017 ITERA 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912790574 (RPL 017 PS ITERA UNTUK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 28501002795306 (RPL 017 KS ITERA UNTUK PEMERINTAHAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1140029475988 (RPL 017 PS ITERA UNTUK SPONSORSHIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1140029450056 (RPL 017 KS ITERA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693403,
    "nama": "INSTITUT SENI BUDAYA INDONESIA BANDUNG",
    "kode": "023.69.693403",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -6.8064,
    "lng": 107.7256,
    "saldoBuku": 583260100,
    "saldoBank": 583260100,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934031000 (BPG 022 ISBI BANDUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1300026736077 (BPN 022 ISBI BANDUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1300026735947 (RPL 022 PS ISBI BANDUNG UTK SWAKELOLA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1300026735970 (RPL 022 PS ISBI BANDUNG UTK RISET PKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693404,
    "nama": "INSTITUT SENI INDONESIA SURAKARTA",
    "kode": "023.69.693404",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Tengah",
    "provinsi": "JAWA TENGAH",
    "lat": -6.9511,
    "lng": 110.3644,
    "saldoBuku": 50184499172,
    "saldoBank": 50118206516,
    "selisih": 66292656,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 989194693404100 (BPG 028 ISI SURAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jateng - 1002151501 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 9701002722308 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 9701002720306 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1380000001151 (RPL 028 BLU ISI SKA UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 1515511551 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 8080151151 (RPL 028 BLU ISI SKA UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3101300006747 (RPL 028 BLU ISI SKA UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 9701002721302 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 9701003000301 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 9701002999303 (RPL 028 BLU ISI SKA UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693405,
    "nama": "INSTITUT SENI BUDAYA INDONESIA TANAH PAPUA",
    "kode": "023.69.693405",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Papua",
    "provinsi": "PAPUA",
    "lat": -2.5376,
    "lng": 140.5953,
    "saldoBuku": 4452761,
    "saldoBank": 4452761,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934051000 (BPG 063 ISBI TANAH PAPUA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 6934055558 (BPN 063 ISBI TANAH PAPUA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693406,
    "nama": "INSTITUT SENI INDONESIA BALI",
    "kode": "023.69.693406",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bali",
    "provinsi": "BALI",
    "lat": -8.7801,
    "lng": 115.2246,
    "saldoBuku": 255935560,
    "saldoBank": 255935560,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1450016886547 (BPN 037 ISI BALI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 110121000621 (BPN 037 ISI BALI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934061000 (BPG 037 ISI BALI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934061001 (BPP 037 ISI BALI 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934061002 (BPP 037 ISI BALI 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934061003 (BPP 037 ISI BALI 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934061004 (BPP 037 ISI BALI 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934061005 (BPP 037 ISI BALI 05)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 140016886513 (RPL 037 KS ISI BALI UTK PPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1450016896173 (RPL 037 KS ISI BALI UTK snpmb)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1450016886539 (RPL 037 KS ISI BALI UTK SPK3A)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693407,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS INDONESIA)",
    "kode": "023.69.693407",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Depok / Jakarta",
    "provinsi": "Jawa Barat",
    "lat": -6.365,
    "lng": 106.8286,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934071000 (BPG 088 UNIVERSITAS INDONESIA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693408,
    "nama": "DITJEN DIKTI (PTN BH - INSTITUT PERTANIAN BOGOR)",
    "kode": "023.69.693408",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bogor",
    "provinsi": "Jawa Barat",
    "lat": -6.5583,
    "lng": 106.7267,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran Tidak ada pembukaan rekening untuk PTN BH - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693409,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS PENDIDIKAN INDONESIA)",
    "kode": "023.69.693409",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -6.9471,
    "lng": 107.4099,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934091000 (BPG 022 UPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693410,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS GADJAH MADA)",
    "kode": "023.69.693410",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sleman / Yogyakarta",
    "provinsi": "DI Yogyakarta",
    "lat": -7.7713,
    "lng": 110.3775,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693411,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS AIRLANGGA)",
    "kode": "023.69.693411",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Surabaya",
    "provinsi": "Jawa Timur",
    "lat": -7.2683,
    "lng": 112.7589,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934111000 (BPG 031 UNIVERSITAS AIRLANGGA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693412,
    "nama": "DITJEN DIKTI (PTN BH - INSTITUT TEKNOLOGI BANDUNG)",
    "kode": "023.69.693412",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bandung",
    "provinsi": "Jawa Barat",
    "lat": -6.8915,
    "lng": 107.6107,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934121000 (BPG 022 ITB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693413,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS PADJADJARAN)",
    "kode": "023.69.693413",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jatinangor / Sumedang",
    "provinsi": "Jawa Barat",
    "lat": -6.9264,
    "lng": 107.7747,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934131000 (BPG 022 UNIVERSITAS PADJADJARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693414,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS DIPONEGORO)",
    "kode": "023.69.693414",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Semarang",
    "provinsi": "Jawa Tengah",
    "lat": -7.0504,
    "lng": 110.4398,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934141000 (BPG 026 UNIVERSITAS DIPONEGORO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693415,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS HASANUDDIN)",
    "kode": "023.69.693415",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Makassar",
    "provinsi": "Sulawesi Selatan",
    "lat": -5.1345,
    "lng": 119.4892,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693416,
    "nama": "DITJEN DIKTI (PTN BH - INSTITUT TEKNOLOGI SEPULUH NOPEMBER)",
    "kode": "023.69.693416",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Surabaya",
    "provinsi": "Jawa Timur",
    "lat": -7.2824,
    "lng": 112.7944,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934161000 (BPG 031 ITS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693417,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS SUMATERA UTARA)",
    "kode": "023.69.693417",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Medan",
    "provinsi": "Sumatera Utara",
    "lat": 3.5654,
    "lng": 98.6559,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran Tidak ada pembukaan rekening untuk PTN BH - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693418,
    "nama": "UNIVERSITAS TIDAR",
    "kode": "023.69.693418",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Tengah",
    "provinsi": "JAWA TENGAH",
    "lat": -7.1147,
    "lng": 110.4501,
    "saldoBuku": 87359262688,
    "saldoBank": 87359262688,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934181000 (BPG 115 UNIVERSITAS TIDAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 8101300007772 (RPL 115 BLU UNTIDAR UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 8101300005550 (RPL 115 BLU UNTIDAR UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7007805805 (RPL 115 BLU UNTIDAR UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jateng - 1005014863 (RPL 115 BLU UNTIDAR UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 8101300008883 (RPL 115 BLU UNTIDAR UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jateng - 1005015231 (RPL 115 BLU UNTIDAR UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 8002026008 (RPL BLU UNTIDAR UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693419,
    "nama": "UNIVERSITAS NEGERI JAKARTA",
    "kode": "023.69.693419",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Timur",
    "provinsi": "DKI Jakarta",
    "lat": -6.1954,
    "lng": 106.8789,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693420,
    "nama": "UNIVERSITAS JENDERAL SOEDIRMAN",
    "kode": "023.69.693420",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Purwokerto",
    "provinsi": "Jawa Tengah",
    "lat": -7.4124,
    "lng": 109.2483,
    "saldoBuku": 340007602785,
    "saldoBank": 340007602785,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1914962000 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1800022744447 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1800044322222 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3301300007084 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3301300007076 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 7701002919307 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jateng - 1003016010 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8886888857 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914494223 (RPL 029 BLU UNSOED UNTUK OPS LPTSI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914497892 (RPL 029 BLU UNSOED UNTUK OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914502235 (RPL 029 BLU UNSOED UNTUK OPS PASCASARJAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914572600 (RPL 029 BLU UNSOED UNTUK OPS FAK PETERNA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914573002 (RPL 029 BLU UNSOED UNTUK OPS FAK BIOLOGI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914492384 (RPL 029 BLU UNSOED UNTUK OPS SPI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914492941 (RPL 029 BLU UNSOED UNTUK OPS RSGM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914493706 (RPL 029 BLU UNSOED UNTUK OPS BADAN PENGE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914494755 (RPL 029 BLU UNSOED UNTUK OPS FPIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914498422 (RPL 029 BLU UNSOED UNTUK OPS FIB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914498896 (RPL 029 BLU UNSOED UNTUK OPS FAK ILMU KE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914499367 (RPL 029 BLU UNSOED UNTUK OPS BPKIH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914499991 (RPL 029 BLU UNSOED UNTUK OPS BIRO KEMAHA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914502701 (RPL 029 BLU UNSOED UNTUK OPS LP3M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914504731 (RPL 029 BLU UNSOED UNTUK OPS LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914571061 (RPL 029 BLU UNSOED UNTUK OPS FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914571276 (RPL 029 BLU UNSOED UNTUK OPS FAK KEDOKTE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914572189 (RPL 029 BLU UNSOED UNTUK OPS FAK TEKNIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914572407 (RPL 029 BLU UNSOED UNTUK OPS FAK HUKUM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914572780 (RPL 029 BLU UNSOED UNTUK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914573658 (RPL 029 BLU UNSOED UNTUK OPS FAK PERTANI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914961663 (RPL 029 BLU UNSOED UNTUK OPS PKKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914501491 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914500475 (RPL 029 BLU UNSOED UNTUK OPS BIRO KEU DA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1800055522223 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1800055777728 (RPL 029 BLU UNSOED UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1914574277 (RPL 029 BLU UNSOED UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934201000 (BPG 029 UNSUD PWT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693421,
    "nama": "UNIVERSITAS SEMBILANBELAS NOVEMBER KOLAKA",
    "kode": "023.69.693421",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Tenggara",
    "provinsi": "SULAWESI TENGGARA",
    "lat": -3.9445,
    "lng": 122.4389,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 2222615555 (BPN 156 USN KOLAKA 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1620019111925 (BPN 156 USN KOLAKA 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1620011190059 (RPL 156 PS USN KOLAKA UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 375832737 (BNI Giro TDK HIT BBB Pemerintah)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934211000 (BPG 156 USN KOLAKA (Virtual Account))",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 21601003671304 (RPL 156 KS USN KOLAKA U ANTAM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 21601003672300 (RPL 156 PS USN KOLAKA U KL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693422,
    "nama": "UNIVERSITAS TIMOR",
    "kode": "023.69.693422",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Nusa Tenggara Timur",
    "provinsi": "NUSA TENGGARA TIMUR",
    "lat": -10.1232,
    "lng": 123.5333,
    "saldoBuku": 1721363054,
    "saldoBank": 0,
    "selisih": 1721363054,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 027601002319305 (BPN 172 UNIVERSITAS TIMOR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934221000 (BPG 172 UNIVERSITAS TIMOR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 027601002320306 (RPL 172 PS UNIMOR UNTUK MENAMPUNG UKT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 027601002323304 (RPL 172 PS UNIMOR UNTUK DANA PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 027601002318309 (RPL 172 PS UNIVERSITAS TIMOR UNTUK SNPMB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693423,
    "nama": "UNIVERSITAS SULAWESI BARAT",
    "kode": "023.69.693423",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Barat",
    "provinsi": "SULAWESI BARAT",
    "lat": -2.6775,
    "lng": 118.952,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran Senayan Kantor Kas BKPM - 9891946934231000 (BPG 059 UNSULBAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD Sulselbar - 720020000590591 (BPN 059 UNSULBAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 120301307777773 (BPN 059 UNSULBAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 4701077777309 (BPN 059 UNSULBAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4777774211 (BPN 059 UNSULBAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693424,
    "nama": "UNIVERSITAS JEMBER",
    "kode": "023.69.693424",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jember",
    "provinsi": "Jawa Timur",
    "lat": -8.1654,
    "lng": 113.7167,
    "saldoBuku": 430908223746,
    "saldoBank": 0,
    "selisih": 430908223746,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 143-00-6062888-8 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 220301000563307 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1909508856 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD Jatim - 31201179 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 00000030-01-30-001133-2 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 4123222224 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004750302 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 00000030-01-30-001134-0 (RPL 131 BLU UNEJ UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 143-00-6068777-7 (RPL 131 BLU UNEJ UNTUK OPS UKOM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran JATIM - DB594826/BB.205.01.00 (RPL 131 BLU UNEJ UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - AB003101449/7000000201054893 (RPL 131 BLU UNIVERSITAS JEMBER UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - AB00310174/7000000204773607 (RPL 131 BLU UNIVERSITAS JEMBER UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 3001400047110 (RPL 131 BLU UNIVERSITAS JEMBER UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 3001300011439 (RPL 131 BLU UNEJ UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934241000 (BPG 131 UNIVERSITAS JEMBER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934241001 (BPP 131 UNIVERSITAS JEMBER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004757304 (RPL 131 BLU UNEJ UNTUK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004783305 (RPL 131 BLU UNEJ UNTUK OPS BPP FAK HUKUM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004770302 (RPL 131 BLU UNEJ UNTUK OPS BPP FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004775302 (RPL 131 BLU UNEJ UNTUK OPS BPP FAK PERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004794306 (RPL 131 BLU UNEJ UNTUK OPS BPP FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004779306 (RPL 131 BLU UNEJ UNTUK OPS BPP FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004785307 (RPL 131 BLU UNEJ UNTUK OPS BPP FIB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004778300 (RPL 131 BLU UNEJ UNTUK OPS BPP FTP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004769301 (RPL 131 BLU UNEJ UNTUK OPS BPP FKG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004774306 (RPL 131 BLU UNEJ UNTUK OPS BPP FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004773300 (RPL 131 BLU UNEJ UNTUK OPS BPP FAK KEDOK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004772304 (RPL 131 BLU UNEJ UNTUK OPS BPP FAK TEKNI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004777304 (RPL 131 BLU UNEJ UNTUK OPS BPP FKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004776308 (RPL 131 BLU UNEJ UNTUK OPS BPP FAK FARMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004780307 (RPL 131 BLU UNEJ UNTUK OPS BPP FKEP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004771308 (RPL 131 BLU UNEJ UNTUK OPS BPP FIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004793300 (RPL 131 BLU UNEJ UNTUK OPS BPP PASCA SAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004781303 (RPL 131 BLU UNEJ UNTUK OPS BPP LPMPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004791308 (RPL 131 BLU UNEJ UNTUK OPS BPP LP2M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 1301003576302 (RPL 131 BLU UNEJ UNTUK OPS BPP KAMPUS BO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 4401003568302 (RPL 131 BLU UNIVERSITAS JEMBER UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 6501002998300 (RPL 131 BLU UNEJ UNTUK OPS BPP KAMPUS PA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004786303 (RPL 131 BLU UNEJ UNTUK OPS BPP REKTORAT )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004784301 (RPL 131 BLU UNEJ UNTUK OPS BPP REKTORAT )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004803309 (RPL 131 BLU UNEJ UNTUK OPS JUBUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 2101004747309 (RPL 131 BLU UNEJ UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 143-00-6064666-6 (RPL 131 BLU UNEJ UNTUK OPS PENGELUARAN U)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693425,
    "nama": "UNIVERSITAS RIAU",
    "kode": "023.69.693425",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Riau",
    "provinsi": "RIAU",
    "lat": 0.5611,
    "lng": 101.3741,
    "saldoBuku": 73606141486,
    "saldoBank": 51243364093,
    "selisih": 22362777393,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001555.2 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2025777224 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2025777337 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 2020000239 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRKS - 101.12.00017 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSN - 1002244553 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 108.00.5848.1111 (RPL 008 BLU UNRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17001004541304 (RPL 008 BLU UNRI UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRKS - 1017000029 (RPL 008 BLU UNRI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRKS - 1017000030 (RPL 008 BLU UNRI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRKS - 1017000031 (RPL 008 BLU UNRI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRKS - 1017000032 (RPL 008 BLU UNRI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001556.0 (RPL 008 BLU UNRI UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001557.8 (RPL 008 BLU UNRI FISIP UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001558.6 (RPL 008 BLU UNRI FEB UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001559.4 (RPL 008 BLU UNRI FMIPA UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001560.9 (RPL 008 BLU UNRI FPK UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001561.7 (RPL 008 BLU UNRI FKIP UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001562.5 (RPL 008 BLU UNRI FP UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001563.3 (RPL 008 BLU UNRI FK UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001564.1 (RPL 008 BLU UNRI FH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001565.9 (RPL 008 BLU UNRI PPS UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001566.7 (RPL 008 BLU UNRI FKP UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001567.5 (RPL 008 BLU UNRI RKTRAT UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001568.3 (RPL 008 BLU UNRI AKDM UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001569.1 (RPL 008 BLU UNRI PSTKA UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001570.6 (RPL 008 BLU UNRI LPPM UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001571.4 (RPL 008 BLU UNRI LPPMP UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001572.2 (RPL 008 BLU UNRI RSP UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001573.0 (RPL 008 BLU UNRI PIUADB UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00039.01.30.001574.8 (RPL 008 BLU UNRI FT UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 115001300000162 (RPL 008 PS UTK SMMPTN BARAT 2026)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7772026441 (RPL 008 PS UTK SMMPTN BARAT 2026)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7354435009 (RPL 008 PS UTK SMMPTN BARAT 2026)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1080050000257 (RPL 008 PS UTK SMMPTN BARAT 2026)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 17001004727308 (RPL 008 PS UTK SMMPTN BARAT 2026)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 115001300000154 (RPL 008 PS UTK OPS SMMPTN BARAT 2026)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934251000 (BPG 008 UNIVERSITAS RIAU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KKP - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693426,
    "nama": "UNIVERSITAS JAMBI",
    "kode": "023.69.693426",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jambi",
    "provinsi": "JAMBI",
    "lat": -1.6101,
    "lng": 103.6756,
    "saldoBuku": 196105477459,
    "saldoBank": 172217788673,
    "selisih": 23887688786,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934261000 (BPG 012 UNIVERSITAS JAMBI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934261001 (BPP 012 UNIVERSITAS JAMBI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1100019865267 (Rpl 012 BLU UNJA UTK OPS-Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD Jambi - 3006652793 (RPL 012 BLU UNJA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 2001006879302 (RPL 012 BLU UNJA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 9888811227 (RPL 012 BLU UNJA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3801300009557 (RPL 012 BLU UNJA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1100019865168 (Rpl 012 BLU UNJA UTK OPS-PPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1100019865077 (Rpl 012 BLU UNJA UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1100019865218 (Rpl 012 BLU UNJA UTK DK KERJASAMA-PPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1100019865002 (Rpl 012 BLU UNJA UTK DK KS REKTORAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1100019865051 (Rpl 012 BLU UNJA UTK DK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006651468 (RPL 012 BLU UNJA UTK OPS BPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652394 (RPL 012 BLU UNJA UTK OPS FKIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652424 (RPL 012 BLU UNJA UTK OPS BPP LP2M)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652432 (RPL 012 BLU UNJA UTK OPS FAPERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652459 (RPL 012 BLU UNJA UTK OPS FSAINTEK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652467 (RPL 012 BLU UNJA UTKK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652475 (RPL 012 BLU UNJA UTK OPS FAPET)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652483 (RPL 012 BLU UNJA UTK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652491 (RPL 012 BLU UNJA UTK OPS FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652513 (RPL 012 BLU UNJA UTK OPS BUPK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006652928 (RPL 012 BLU UNJA UTK OPS PASCA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3006646033 (RPL 012 BLU UNJA UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1916609335 (RPL 012 BLU UNJA UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3801400043752 (RPL 012 BLU UNJA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3801400044481 (RPL 012 BLU UNJA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3007566726 (RPL 012 BLU UNJA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3007566734 (RPL 012 BLU UNJA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Jambi - 3007570677 (RPL 012 BLU UNJA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3801400044790 (RPL 012 BLU UNJA UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693427,
    "nama": "UNIVERSITAS PALANGKA RAYA",
    "kode": "023.69.693427",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Tengah",
    "provinsi": "KALIMANTAN TENGAH",
    "lat": -2.2161,
    "lng": 113.9764,
    "saldoBuku": 61111657489,
    "saldoBank": 0,
    "selisih": 61111657489,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1590012024518 (RPL 043 BLU UPR UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran KALTENG - 1000102020202 (RPL 043 BLU UPR UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 00000243-01-004062-30-1 (RPL 043 BLU UPR UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BCA - 8601359995 (RPL 043 BLU UTK DK PIHAK KE TIGA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 2601300005455 (RPL 043 BLU UPR UTK PL DAN KIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1937662260 (RPL 043 BLU UPR UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1590012330220 (RPL 043 BLU UTK DANA BPU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1590012024526 (RPL 043 BLU UPR UTK BPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934271000 (BPG 043 UNIVERSITAS PALANGKA RAYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1590012024534 (BPP 043 UPR UTK BOPTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1590012024542 (BPP 043 UPR UTK RM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209532-8 (BPP 043 UPR UTK NON BELANJA MODAL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 24301004084303 (BPP DARI RPL 043 BLU UPR UTK OPS HONORAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209442-0 (BPP 043 UPR FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209348-9 (BPP 043 UPR UTK FAKULTAS PERTANIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209501-3 (BPP 043 UPR UTK LAB TERPADU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209494-1 (BPP 043 UPR UTK LP3MP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209470-1 (BPP 043 UPR UTK LPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209453-7 (BPP 043 UPR UTK FAKULTAS HUKUM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209371-1 (BPP 043 UPR UTK UPT PERPUSTAKAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209383-6 (BPP 043 UPR UTK UPT LLG CIMTROP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209392-7 (BPP 043 UPR UTK UPT BAHASA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209505-4 (BPP 043 UPR UTK TIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209477-6 (BPP 043 UPR UTK PASCASARJANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209572-4 (BPP 043 UPR UTK LAB ALAM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209459-4 (BPP 043 UPR UTK FISIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209328-1 (BPP 043 UPR UTK FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209341-4 (BPP 043 UPR UTK FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209466-9 (BPP 043 UPR UTK FAKULTAS TEKNIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 159-00-1209463-6 (BPP 043 UPR UTK FAKULTAS KEDOKTERAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693428,
    "nama": "UNIVERSITAS MULAWARMAN",
    "kode": "023.69.693428",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Samarinda",
    "provinsi": "Kalimantan Timur",
    "lat": -0.4682,
    "lng": 117.1536,
    "saldoBuku": 158759106750,
    "saldoBank": 158759106750,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 7689998887 (RPL 046 BLU UNMUL UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00000147-01-30-000071-2 (RPL 046 BLU UNMUL UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 6020056327 (RPL 046 BLU UNMUL UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 2011400011 (RPL 046 BLU UNMUL UTK OPS 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1480066679799 (RPL 046 BLU UNMUL UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 2011400020 (RPL 046 BLU UNMUL UTK OPS 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7333333718 (RPL 046 BLU UNMUL UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 8201888880305 (RPL 046 BLU UNMUL UTK OPS 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000009302 (RPL 046 BLU UNMUL UTK OPS 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 8201999990302 (RPL 046 BLU UNMUL UTK OPS 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000001304 (RPL 046 BLU UNMUL UTK OPS 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000004302 (RPL 046 BLU UNMUL UTK OPS REKTORAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000007300 (RPL 046 BLU UNMUL UTK OPS FH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000010303 (RPL 046 BLU UNMUL UTK OPS FAHUTAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000002300 (RPL 046 BLU UNMUL UTK OPS FARMASI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000008306 (RPL 046 BLU UNMUL UTK OPS FISIPOL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000016309 (RPL 046 BLU UNMUL UTK OPS FK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000005308 (RPL 046 BLU UNMUL UTK OPS FPIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000017305 (RPL 046 BLU UNMUL UTK OPS KESMAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000014307 (RPL 046 BLU UNMUL UTK OPS FMIPA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000015303 (RPL 046 BLU UNMUL UTK OPS TEKNIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000012305 (RPL 046 BLU UNMUL UTK OPS FAPERTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000006304 (RPL 046 BLU UNMUL UTK OPS FEB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000013301 (RPL 046 BLU UNMUL UTK OPS FKIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000003306 (RPL 046 BLU UNMUL UTK OPS FIB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000011309 (RPL 046 BLU UNMUL UTK OPS UPT LBG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000018301 (RPL 046 BLU UNMUL UTK OPS FKG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7687776661 (RPL 046 BLU UNMUL UTK DK 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00000147-01-30-000070-4 (RPL 046 BLU UNMUL UTK DK 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 8201005770307 (RPL 046 BLU UNMUL UTK DK 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 229601000019307 (RPL 046 BLU UNMUL UTK RPATA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586934281000 (BPG 046 UNIVERSITAS MULAWARMAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693429,
    "nama": "UNIVERSITAS SAMUDRA",
    "kode": "023.69.693429",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.4387,
    "lng": 95.3358,
    "saldoBuku": 887120998,
    "saldoBank": 0,
    "selisih": 887120998,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446934291000 (BPG 002 UNIVERSITAS SAMUDRA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 1132913656 (BPN 002 UNIVERSITAS SAMUDRA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK ACEH - 53601021234567 (RPL 002 PS UNSAM UNTUK UANG KULIAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 2025010771 (RPL 002 PS UNSAM UNTUK UANG KULIAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 1002200331 (RPL 002 PS UNSAM UNTUK UANG KULIAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 2610033325 (RPL 002 PS UNSAM UNTUK UANG KULIAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693430,
    "nama": "UNIVERSITAS TEUKU UMAR",
    "kode": "023.69.693430",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.6594,
    "lng": 95.4303,
    "saldoBuku": 1999717318,
    "saldoBank": 0,
    "selisih": 1999717318,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446934301000 (BPG 003 Universitas Teuku Umar)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 2020010889 (RPL 003 PS UTU UNTUK DANA BEASISWA DLL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 2020010811 (BPN 003 UNIVERSITAS TEUKU UMAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK ACEH Syariah - 6001048888888 (BPN 003 UNIVERSITAS TEUKU UMAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1343434349 (BPN 003 UNIVERSITAS TEUKU UMAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693431,
    "nama": "UNIVERSITAS CENDERAWASIH",
    "kode": "023.69.693431",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jayapura",
    "provinsi": "Papua",
    "lat": -2.5916,
    "lng": 140.669,
    "saldoBuku": 223140925606,
    "saldoBank": 0,
    "selisih": 223140925606,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934311000 (BPG 063 UNIVERSITAS CENDERAWASIH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1540020021774 (RPL 063 BLU UNIV CENDRAWASIH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1540020007377 (RPL 063 BLU UNIV CENDRAWASIH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8811000228 (RPL 063 BLU UNIV CENDRAWASIH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 44601001269300 (RPL 063 BLU UNIV CENDRAWASIH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8811000444 (RPL 063 BLU UNIV CENDRAWASIH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD PAPUA - 1900102000101 (RPL 063 BLU UNIV CENDRAWASIH UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1701300006101 (RPL 063 BLU UNIV CENDRAWASIH UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 44601001339309 (RPL 063 BLU UNIV CENDRAWASIH UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Belanja Perjadin Belum Disahkan - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693432,
    "nama": "UNIVERSITAS PAPUA",
    "kode": "023.69.693432",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Papua Barat",
    "provinsi": "PAPUA BARAT",
    "lat": -0.8615,
    "lng": 134.1245,
    "saldoBuku": 36726194968,
    "saldoBank": 36726194968,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1600005828088 (BPN 065 Universitas Papua)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 810012693432100 (BPG 065 Universitas Papua)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 160-00-0594104-8 (RPL 065 KS UNIPA UNTUK PPPM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693433,
    "nama": "UNIVERSITAS SULTAN AGENG TIRTAYASA",
    "kode": "023.69.693433",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Banten",
    "provinsi": "BANTEN",
    "lat": -6.1104,
    "lng": 106.2179,
    "saldoBuku": 400598744480,
    "saldoBank": 0,
    "selisih": 400598744480,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 7770707329 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BJB - 14856533001 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934331000 (BPG 020 UNTIRTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707341 (RPL 020 BLU UNTIRTA UNTUK OPS PENGELUARA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707352 (RPL 020 BLU UNTIRTA UNTUK OPS BPP UNIVER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707443 (RPL 020 BLU UNTIRTA UNTUK OPS BPP BPKU ()",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707454 (RPL 020 BLU UNTIRTA UNTUK OPS BPP BAKK ()",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707465 (RPL 020 BLU UNTIRTA UNTUK OPS BPP BAKK N)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707363 (RPL 020 BLU UNTIRTA UNTUK OPS BPP F HUKU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707374 (RPL 020 BLU UNTIRTA UNTUK OPS BPP FKIP ()",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707385 (RPL 020 BLU UNTIRTA UNTUK OPS BPP F TEKN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707409 (RPL 020 BLU UNTIRTA UNTUK OPS BPP FEB (I)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707396 (RPL 020 BLU UNTIRTA UNTUK OPS BPP F PERT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707410 (RPL 020 BLU UNTIRTA UNTUK OPS BPP FISIP )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707421 (RPL 020 BLU UNTIRTA UNTUK OPS BPP PASCAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707512 (RPL 020 BLU UNTIRTA UNTUK OPS BPP LPMPP )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707567 (RPL 020 BLU UNTIRTA UNTUK OPS BPP UPA TI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707487 (RPL 020 BLU UNTIRTA UNTUK OPS BPP SPI (I)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707476 (RPL 020 BLU UNTIRTA UNTUK OPS BPP PERPUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707498 (RPL 020 BLU UNTIRTA UNTUK OPS BPP LP2M ()",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707318 (RPL 020 BLU UNTIRTA UNTUK DK (IDR))",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707873 (RPL 020 BLU UNTIRTA UNTUK OPS SNMPTN (ID)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707432 (RPL 020 BLU UNTIRTA UNTUK OPS BPP F KEDO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1000642935 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 4701309990453 (RPL 020 BLU UNTIRTA (IDR))",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707748 (RPL 020 BLU UNTIRTA UNTUK OPS BPP UPA TE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707657 (RPL 020 BLU UNTIRTA UNTUK OPS BPP UPA LA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707613 (RPL 020 BLU UNTIRTA UNTUK OPS BPP UPA BA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 7770707919 (RPL 020 BLU UNTIRTA UNTUK OPS PPG (IDR))",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 73000558369 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 4701309990461 (RPL 020 BLU UNTIRTA UNTUK OPS BPU UNTIRT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BCA - 245-7777007 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 8401005465308 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1630055995511 (RPL 020 BLU UNTIRTA UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1918774964 (No Seri. PAB  1673210) (RPL 020 BLU UNTIRTA  UNTUK PKD DEPOSITO )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3080043166 (No.4345469) (RPL 020 Universitas Sultan Ageng Tirtaya)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BJB - 007-DEP-007250000047 (A 98781) (RPL020 BLU UNTIRTA U PKD DEP BJB 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BJB - 0569-DEP-0569260000037((A01055118) (RPL020 BLU UNTIRTA U PKD DEP BJB 3))",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - AB00422382/7000000207052398 (RPL 020 BLU UNTIRTA Untuk PKD DEPOSITO B)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - SY 162414 (RPL 0202 BLU UNTIRTA Untuk PKD DEPOSITO )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Banten - A055653 (RPL 020 BLU UNTIRTA UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693434,
    "nama": "UNIVERSITAS MUSAMUS",
    "kode": "023.69.693434",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Papua",
    "provinsi": "PAPUA",
    "lat": -2.7012,
    "lng": 140.681,
    "saldoBuku": 32622465285,
    "saldoBank": 0,
    "selisih": 32622465285,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 35201003080303 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK OP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 35201003079302 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK OP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 35201004025403 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK PK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1540020076208 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK OP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1540020076224 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK OP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1540020076257 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1918538053 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK OP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1913159285 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934341000 (BPG 068 UNIVERSITAS MUSAMUS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD PAPUA - 4000123000123 (RPL 068 BLU UNIVERSITAS MUSAMUS UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693435,
    "nama": "UNIVERSITAS MALIKUSSALEH",
    "kode": "023.69.693435",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.5187,
    "lng": 95.1145,
    "saldoBuku": 118629238762,
    "saldoBank": 48002800,
    "selisih": 118581235962,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446934351000 (BPG 089 Universitas Malikussaleh)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 6934355577 (RPL 089 BLU Unimal UTK OPS PGL BSI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 6934355553 (RPL 089 BLU Unimal UTK OPS PNM BSI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 6934355561 (RPL 089 Unimal UTK PKD BSI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK ACEH Syariah - 3001876934351 (RPL 089 BLU Unimal UTK PKD BAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK ACEH Syariah - 3001876934350 (RPL 089 BLU Unimal UTK OPS PNM BAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BANK ACEH Syariah - 3001876934352 (RPL 089 BLU Unimal UTK OPS PGL BAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1000626689 (RPL 089 BLU Unimal UTK OPS PNM BTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1000626690 (RPL 089 BLU Unimal UTK DK BTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1000626678 (RPL 089 BLU Unimal UTK PKD BTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7319061236 (RPL 089 BLU Unimal UTK Jaminan Toga BSI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693436,
    "nama": "INSTITUT TEKNOLOGI KALIMANTAN",
    "kode": "023.69.693436",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Timur",
    "provinsi": "KALIMANTAN TIMUR",
    "lat": -0.5022,
    "lng": 117.2161,
    "saldoBuku": 15679184059,
    "saldoBank": 15454132354,
    "selisih": 225051705,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 12101004874308 (BPN 047 INSTITUT\nTEKNOLOGI\nKALIMANTAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909655416 (BPN 047 INSTITUT\nTEKNOLOGI\nKALIMANTAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8110000888 (BPN 047 INSTITUT\nTEKNOLOGI\nKALIMANTAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1490018516114 (BPN 047 INSTITUT\nTEKNOLOGI\nKALIMANTAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1909990533 (RPL 047 PS ITK UTK DANA OP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 5555533337 (BPN 047 ITK BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918446627 (RPL 047 PDHL ITK UTK 2LP2BUTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 98919469343610 (BPG 047 ITK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934361001 (BPP 047 ITK 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934361002 (BPP 047 ITK 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934361003 (BPP 047 ITK 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934361004 (BPP 047 ITK 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934361005 (BPP 047 ITK 05)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693437,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS SEBELAS MARET)",
    "kode": "023.69.693437",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Surakarta / Solo",
    "provinsi": "Jawa Tengah",
    "lat": -7.5561,
    "lng": 110.8553,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934371000 (BPG 028 UNIVERSITAS SEBELAS MARET)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693438,
    "nama": "DIREKTORAT PEMBELAJARAN DAN KEMAHASISWAAN",
    "kode": "023.69.693438",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -5.9533,
    "lng": 106.7526,
    "saldoBuku": 12364934493,
    "saldoBank": 12364934493,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934381000 (BPG 088 DIREKTORAT BELMAWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1220014213402 (RPL 088 DB DIT BELMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693439,
    "nama": "DIREKTORAT KELEMBAGAAN",
    "kode": "023.69.693439",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.4061,
    "lng": 106.6774,
    "saldoBuku": 2120466000,
    "saldoBank": 0,
    "selisih": 2120466000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934391000 (BPG 088 DIREKTORAT KELEMBAGAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693440,
    "nama": "DIREKTORAT SUMBER DAYA",
    "kode": "023.69.693440",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.0759,
    "lng": 107.1677,
    "saldoBuku": 1679686301,
    "saldoBank": 1679686301,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934401000 (BPG 088 DIREKTORAT SUMBER DAYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934401001 (BPP 088 DIREKTORAT SUMBER DAYA 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934401002 (BPP 088 DIREKTORAT SUMBER DAYA 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934401003 (BPP 088 DIREKTORAT SUMBER DAYA 03)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934401004 (BPP 088 DIREKTORAT SUMBERDAYA 04)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934401005 (BPP 088 DIREKTORAT SUMBERDAYA 05)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693441,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS ANDALAS)",
    "kode": "023.69.693441",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Padang",
    "provinsi": "Sumatera Barat",
    "lat": -0.9142,
    "lng": 100.4608,
    "saldoBuku": 562400,
    "saldoBank": 0,
    "selisih": 562400,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BPD SUMATERA BARAT - 9000016934411000 (BPG 010 UNIVERSITAS ANDALAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693443,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS BRAWIJAYA)",
    "kode": "023.69.693443",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Malang",
    "provinsi": "Jawa Timur",
    "lat": -7.9525,
    "lng": 112.6144,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934431000 (BPG 032 UNIVERSITAS BRAWIJAYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693444,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS NEGERI PADANG)",
    "kode": "023.69.693444",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Padang",
    "provinsi": "Sumatera Barat",
    "lat": -0.8932,
    "lng": 100.3524,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BPD SUMATERA BARAT - 900001693444000 (BPG 010 UNIVERSITAS NEGERI PADANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693445,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS NEGERI MALANG)",
    "kode": "023.69.693445",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Malang",
    "provinsi": "Jawa Timur",
    "lat": -7.9624,
    "lng": 112.6183,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693446,
    "nama": "INSTITUT TEKNOLOGI BACHARUDDIN JUSUF HABIBIE",
    "kode": "023.69.693446",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Selatan",
    "provinsi": "SULAWESI SELATAN",
    "lat": -5.0937,
    "lng": 119.359,
    "saldoBuku": 179821,
    "saldoBank": 179821,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934461000 (BPG 057 ITH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 19201300003391 (BPN 057 ITH HABIBIE PAREPARE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693447,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS NEGERI YOGYAKARTA)",
    "kode": "023.69.693447",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Yogyakarta",
    "provinsi": "DI Yogyakarta",
    "lat": -7.7744,
    "lng": 110.3867,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693448,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS NEGERI SURABAYA)",
    "kode": "023.69.693448",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Surabaya",
    "provinsi": "Jawa Timur",
    "lat": -7.3114,
    "lng": 112.7275,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 80325006934481000 (BPG 031 UNIVERSITAS NEGERI SURABAYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693449,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS NEGERI SEMARANG)",
    "kode": "023.69.693449",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Semarang",
    "provinsi": "Jawa Tengah",
    "lat": -7.0494,
    "lng": 110.3927,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891576906451000 (BPG 026 UNIVERSITAS NEGERI SEMARANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693450,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS TERBUKA)",
    "kode": "023.69.693450",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Tangerang Selatan",
    "provinsi": "Banten",
    "lat": -6.3454,
    "lng": 106.7567,
    "saldoBuku": 296936226,
    "saldoBank": 0,
    "selisih": 296936226,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586934501000 (BPG 127 UNIVERSITAS TERBUKA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693451,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS SYIAH KUALA)",
    "kode": "023.69.693451",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Banda Aceh",
    "provinsi": "Aceh",
    "lat": 5.5683,
    "lng": 95.3697,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran Tidak ada pembukaan rekening untuk PTN BH - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693460,
    "nama": "POLITEKNIK NEGERI BANYUWANGI",
    "kode": "023.69.693460",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.1464,
    "lng": 112.8586,
    "saldoBuku": 547715716,
    "saldoBank": 60767000,
    "selisih": 486948716,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 3636778884 (BPN 100 Politeknik Negeri Banyuwangi)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8101446934601000 (BPG 100 Politeknik Negeri Banyuwangi)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7296271904 (RPL 100 PS Politeknik Negeri Banyuwangi)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693461,
    "nama": "POLITEKNIK NEGERI KETAPANG",
    "kode": "023.69.693461",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Barat",
    "provinsi": "KALIMANTAN BARAT",
    "lat": -0.0263,
    "lng": 109.405,
    "saldoBuku": 77874524,
    "saldoBank": 77874524,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 7779999418 (BPN 094 POLTEK KETAPANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 108801300001373 (BPN 094 POLITEKNIK NEGERI KETAPANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8101446934611000 (BPG 094 POLTEK KETAPANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 108801300001276 (RPL 094 DB POLTEK KTG UTK BS PNLT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693462,
    "nama": "POLITEKNIK NEGERI LHOKSEUMAWE",
    "kode": "023.69.693462",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.4409,
    "lng": 95.5347,
    "saldoBuku": 4028091330,
    "saldoBank": 4028091330,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 6934621008 (BPN 089 POLITEKNIK NEGERI LSW)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 1111111120 (RPL 089 PS PNL UTK UKT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 8101446934621000 (BPG 089 POLITEKNIK NEGERI LHOKSEUMAWE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297975937 (RPL 089 PS PNL UTK BNT PENDIDIKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693463,
    "nama": "POLITEKNIK NEGERI MEDAN",
    "kode": "023.69.693463",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Medan",
    "provinsi": "Sumatera Utara",
    "lat": 3.5654,
    "lng": 98.6559,
    "saldoBuku": 87696740716,
    "saldoBank": 87696740716,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934631000 (BPG 004 POLMED)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1060019777492 (RPL 004 BLU POLMED UTK OPS UMPN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 4444333524 (RPL 004 BLU POLMED UTK OPS 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1060019776874 (RPL 004 BLU POLMED UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1060019777666 (RPL 004 BLU POLMED UTK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1060019777245 (RPL 004 BLU POLMED UTK OPS PENGELUARAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000203049166 (RPL 004 BLU POLMED UTK PKD 5)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 59201300000345 (RPL 004 BLU POLMED UTK OPS GIRO)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000234884900 (RPL 004 BLU POLMED UTK PKD 6)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693464,
    "nama": "POLITEKNIK NEGERI PADANG",
    "kode": "023.69.693464",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sumatera Barat",
    "provinsi": "SUMATERA BARAT",
    "lat": -1.0567,
    "lng": 100.4292,
    "saldoBuku": 55659872427,
    "saldoBank": 0,
    "selisih": 55659872427,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934641000 (BPG 010 PNP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 901300011177 (RPL 010 BLU PNP UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 000090140007266 7 (RPL 010 BLU POLTEKN PADANG UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7301717312 (RPL 010 BLU PNP UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Nagari - 21020101001222 (RPL 010 BLU PNP UTK OPS PEN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2025111186 (RPL 010 BLU PNP UTK OPS PENG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2025444489 (RPL 010 PS PNP UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693465,
    "nama": "POLITEKNIK PERTANIAN NEGERI PAYAKUMBUH",
    "kode": "023.69.693465",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sumatera Barat",
    "provinsi": "SUMATERA BARAT",
    "lat": -0.836,
    "lng": 100.5237,
    "saldoBuku": 399834451,
    "saldoBank": 0,
    "selisih": 399834451,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 3012000256 (BPN 011 POLITANI NEGERI PYK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934651000 (BPG 011 POLITANIPYK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 25601002220306 (RPL 011 PS POLITANI NEGERI PYK UTK BS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 25601002221302 (RPL 011 KS POLITANI NGR PYK UTK PEND)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693466,
    "nama": "POLITEKNIK NEGERI SRIWIJAYA",
    "kode": "023.69.693466",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Palembang",
    "provinsi": "Sumatera Selatan",
    "lat": -2.9815,
    "lng": 104.7324,
    "saldoBuku": 143181955713,
    "saldoBank": 0,
    "selisih": 143181955713,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934661000 (BPG 014 POLSRI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 34201500600300 (RPL 014 BLU POLSRI UTK OPS PNM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 34201700800302 (RPL 014 BLU POLSRI UTK OPS PGL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1130019972888 (RPL 014 BLU POLSRI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693467,
    "nama": "POLITEKNIK NEGERI LAMPUNG",
    "kode": "023.69.693467",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Lampung",
    "provinsi": "LAMPUNG",
    "lat": -5.5596,
    "lng": 105.2787,
    "saldoBuku": 34281579587,
    "saldoBank": 34281579587,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586934671000 (BPG 017 POLITEKNIK NEGERI LAMPUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1140029449686 (RPL 017 BLU POLINELA UNTUK OPS PENGELUAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297672268 (RPL 017 BLU POLINELA UNTUK OPS PENERIMAA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7102525626 (RPL 017 BLU POLINELA UNTUK OPS PENERIMAA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1140029449538 (RPL 017 BLU POLINELA UNTUK OPS PENERIMAA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7102525637 (RPL 017 BLU POLINELA UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1000643712 (RPL 017 BLU POLINELA UNTUK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1000669642 (RPL 017 BLU POLINELA UNTUK OPS PENERIMAA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1801300008385 (RPL 017 BLU POLINELA UTK OPS PENERIMAAN )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693468,
    "nama": "POLITEKNIK NEGERI JAKARTA",
    "kode": "023.69.693468",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Depok / Jakarta",
    "provinsi": "Jawa Barat",
    "lat": -6.365,
    "lng": 106.8286,
    "saldoBuku": 185495371374,
    "saldoBank": 185495371374,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934681000 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1570012341971 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1570012341997 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911781221 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BJB - 5050413883318 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3000190283 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran Bank Muamalat Indonesia - 3300020156 (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693469,
    "nama": "POLITEKNIK NEGERI BANDUNG",
    "kode": "023.69.693469",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bandung",
    "provinsi": "Jawa Barat",
    "lat": -6.8715,
    "lng": 107.5738,
    "saldoBuku": 215713022896,
    "saldoBank": 215713022896,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586934691000 (BPG 022 POLBAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586934691001 (BPP 022 POLBAN\n 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 154901000016303 (FIPL 022 BLU POLBAN UTK OPS K1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 154901000017309 (RPL 022 BLU POLBAN UTK OPS K2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1320000202607 (RPL 022 BLU POLBAN UTK OPS P2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BJB - 5350109885530 (RPL 022 BLU POLBAN UTK OPS P4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7297275733 (RPL 022 BLU POLBAN UTK OPS P3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 154901000018305 (RPL 022 BLU POLBAN UTK OPS P1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1320000202508 (RPL 022 BLU POLBAN UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 1122222002 (RPL 022 BLU POLBAN UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000220045174 (RPL 022 BLU POLBAN UTK PKD1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693470,
    "nama": "POLITEKNIK MANUFAKTUR NEGERI BANDUNG",
    "kode": "023.69.693470",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -7.0248,
    "lng": 107.83,
    "saldoBuku": 37292360068,
    "saldoBank": 37292360068,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 40501001778303 (RPL 022 BLU POLMAN BDG UTK OPS P2KR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918411752 (RPL 022 BLU POLMAN BDG UTK PKD1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1320029970077 (RPL 022 BLU POLMAN BANDUNG UTK DK1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1320029969921 (RPL 022 BLU POLMAN BANDUNG UTK DK2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 40501001779309 (RPL 022 BLU POLMAN BDG UTK PKE 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1000657212 (RPL 022 BLU POLMAN BDG UTK PKE2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BJB - 5350109893529 (RPL 022 BLU POLMAN BDG UTK PKE3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1918413385 (RPL 022 BLU POLMAN BDG UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BJB - 5350402000004 (RPL 022 BLU POLMAN BDG UTK PKD4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2048211117 (RPL 022 BLU POLMAN BDG UTK PKD5)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934701000 (BPG 022 POLMAN BANDUNG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693471,
    "nama": "POLITEKNIK NEGERI SEMARANG",
    "kode": "023.69.693471",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Semarang",
    "provinsi": "Jawa Tengah",
    "lat": -7.0504,
    "lng": 110.4398,
    "saldoBuku": 167342248699,
    "saldoBank": 0,
    "selisih": 167342248699,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934711000 (BPG 026 POLINES)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Jateng - 1055005407 (RPL 026 BLU POLINES UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1350026000024 (RPL 026 BLU POLINES UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6081997812 (RPL 026 BLU POLINES UNTUK OPS PENERIMAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6081997823 (RPL 026 BLU POLINES UNTUK OPS PENGELUARA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6081997834 (RPL 026 BLU POLINES UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6081997845 (RPL 026 BLU POLINES UNTUK DK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 6081997856 (RPL 026 BLU POLINES UNTUK DK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 43501001514300 (RPL 026 BLU POLINES UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7339071278 (RPL 026 BLU POLINES UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 43501003709406 (RPL 026 BLU POLINES UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693472,
    "nama": "POLITEKNIK ELEKTRONIKA NEGERI SURABAYA",
    "kode": "023.69.693472",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Surabaya",
    "provinsi": "Jawa Timur",
    "lat": -7.2764,
    "lng": 112.7944,
    "saldoBuku": 80363336314,
    "saldoBank": 0,
    "selisih": 80363336314,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934721000 (BPG 031 PENS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1400024517642 (RPL 031 BLU PENS UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911692557 (RPL 031 BLU PENS UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8585555852 (RPL 031 BLU PENS UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 00058.01.30.000136.9 (RPL 031 BLU PENS UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1400024517659 (RPL 031 BLU PENS UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911694372 (RPL 031 BLU PENS UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911695706 (RPL 031 BLU PENS UTK DK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1400024517428 (RPL 031 BLU PENS UTK DK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 5557757556 (RPL 031 BLU PENS UTK DK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 140-00-5000025-7 (RPL 031 BLU PENS UTK DK UBISMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 00058.01.40.004587-3 (RPL 031 BLU PENS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000207188120 (RPL 031 BLU PENS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000223296630 (RPL 031 BLU PENS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 2086050071 (RPL 031 BLU PENS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693473,
    "nama": "POLITEKNIK PERKAPALAN NEGERI SURABAYA",
    "kode": "023.69.693473",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.2871,
    "lng": 112.5429,
    "saldoBuku": 90235472441,
    "saldoBank": 76235472441,
    "selisih": 14000000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934731000 (BPG 031 PPNS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 3373377375 (RPL 031 BLU PPNS UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911297749 (RPL 031 BLU PPNS UTK OPS BELANJA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000220179421 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 5801400047613 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911302579 (RPL 031 BLU PPNS UTK KERJSAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1400024514409 (RPL 031 BLU PPNS UTK PEND)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000220179367 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911305263 (RPL 031 BLU PPNS UTK PEND 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 5801300001351 (RPL 031 BLU PPNS UTK PKE)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2081911209 (RPL 031 BLU PPNS UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7000000232146227 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 5801400048855 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2066896765 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2086024074 (RPL 031 BLU PPNS UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693474,
    "nama": "POLITEKNIK NEGERI MALANG",
    "kode": "023.69.693474",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Malang",
    "provinsi": "Jawa Timur",
    "lat": -7.9464,
    "lng": 112.6154,
    "saldoBuku": 177872450970,
    "saldoBank": 0,
    "selisih": 177872450970,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI -  (RPL 032 BLU POLINEMA UTK OPS1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI -  (RPL 032 BLU POLINEMA UTK OPS2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN -  (RPL 032 BLU POLINEMA UTK OPS3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI -  (RPL 032 BLU POLINEMA UTK OPS4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI -  (RPL 032 BLU POLINEMA UTK OPS5)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - S-21/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK OPS K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN -  (RPL 032 BLU POLINEMA UTK OPS PSDKU-K)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN -  (RPL 032 BLU POLINEMA UTK OPS PSDKU-L)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN -  (RPL 032 BLU POLINEMA UTK OPS PSDKU-P)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - S-727/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK PKD2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - S-728/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK PKD1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - S-1183/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK PKD3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - S-1182/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK PKD4)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - S-3608/KPN.1203/2024 (BPG 032 POLINEMA 693474)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - S-157/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - S-565/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK DK 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - S-540/KPN.1604/2025 (RPL 032 BLU POLINEMA UTK DK 1)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693475,
    "nama": "POLITEKNIK NEGERI JEMBER",
    "kode": "023.69.693475",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.3648,
    "lng": 112.963,
    "saldoBuku": 55507105145,
    "saldoBank": 0,
    "selisih": 55507105145,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1430099888339 (RPL 131 BLU POLIJE UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7575750502 (RPL 131 BLU POLIJE UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 3001300011358 (RPL 131 BLU POLIJE UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 3001300011366 (RPL 131 BLU POLIJE UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1430099888669 (RPL 131 BLU POLIJE UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 8101446934751000 (BPG 131 POLITEKNIK NEGERI JEMBER)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7332018234 (RPL 131 BLU POLIJE UNTUK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000209820107 (RPL 131 BLU POLIJE UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 300140004854 (RPL 131 BLU POLIJE UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7000000225438662 (RPL 131 BLU POLIJE UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 300140005134 (RPL 131 BLU POLIJE UNTUK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693476,
    "nama": "POLITEKNIK NEGERI BALI",
    "kode": "023.69.693476",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Badung / Bali",
    "provinsi": "Bali",
    "lat": -8.7981,
    "lng": 115.1724,
    "saldoBuku": 87225404775,
    "saldoBank": 42191904775,
    "selisih": 45033500000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934761000 (BPG 037 POLITEKNIK NEGERI BALI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 350105000452 (RPL 037 BLU POLITEKNIK BALI UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 350105000464 (RPL 037 BLU POLITEKNIK BALI UTK OPS PGLN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 350105000476 (RPL 037 BLU POLITEKNIK BALI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1750003649695 (RPL 037 BLU POLITEKNIK BALI UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 0350105000488 (RPL 037 BLU POLITEKNIK BALI UTK DK RPATA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BPD BALI - 350301006208 (RPL 037 BLU POLITEKNIK BALI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD BALI - 350302001774 (RPL 037 BLU POLITEKNIK BALI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD BALI - 350301006193 (RPL 037 BLU POLITEKNIK BALI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 0007-01-40-009272-4 (RPL 037 BLU POLITEKNIK BALI UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693477,
    "nama": "POLITEKNIK NEGERI PONTIANAK",
    "kode": "023.69.693477",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Barat",
    "provinsi": "KALIMANTAN BARAT",
    "lat": 0.0277,
    "lng": 109.2688,
    "saldoBuku": 24397262692,
    "saldoBank": 24397262692,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934771000 (BPG 042 POLITEKNIK NEGERI PONTIANAK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 5876000097 (RPL 042 BLU POLNEP UNTUK OPSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 5876000053 (RPL 042 BLU POLNEP UNTUK OPSK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran PT. BANK KALIMANTAN TENGAH CABANG SUKAMARA - 4010102000312 (RPL 042 BLU POLNEP UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 4201300008518 (RPL 042 BLU POLNEP UNTUK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 4201300008495 (RPL 042 BLU POLNEP UNTUK OPSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 4201300008487 (RPL 042 BLU POLNEP UNTUK OPSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 4201300008500 (RPL 042 BLU POLNEP UNTUK OPSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 5876000020 (RPL 042 BLU POLNEP UNTUK OPSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran PT. BANK KALBAR KANTOR CABANG PEMBANTU UNTAN - 1010099991 (RPL 042 BLU POLNEP UNTUK OPSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 4201300008796 (RPL 042 BLU POLNEP UNTUK OPSK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693478,
    "nama": "POLITEKNIK NEGERI BANJARMASIN",
    "kode": "023.69.693478",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Selatan",
    "provinsi": "KALIMANTAN SELATAN",
    "lat": -3.2654,
    "lng": 114.5171,
    "saldoBuku": 380147312,
    "saldoBank": 349997312,
    "selisih": 30150000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934781000 (BPG 045 POLIBAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1001300010762 (RPL 140 PDHL POLIBAN UNTUK 2968VS4A)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 5005663105 (RPL 045 PS POLIBAN UTK KERJASAMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 5005664109 (RPL 045 PS POLIBAN UTK KEG MAHASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 5005665103 (RPL 045 DB POLIBAN UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7304408598 (RPL 045 PS POLIBAN BJM UTK FMD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1910529545 (BPN 045 POLIBAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1001300010893 (RPL 045 PDHL POLIBAN UNTUK 27MPCKWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 1001300010835 (BPN 045 POLIBAN 2)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693479,
    "nama": "POLITEKNIK PERTANIAN NEGERI SAMARINDA",
    "kode": "023.69.693479",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Timur",
    "provinsi": "KALIMANTAN TIMUR",
    "lat": -0.4482,
    "lng": 117.0799,
    "saldoBuku": 103500000,
    "saldoBank": 0,
    "selisih": 103500000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934791000 (BPG 046 POLITANI SAMARINDA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1480024433750 (RPL 046 PS POLITANI UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 7776678885 (BPN 046 POLITANI SAMARINDA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7766667885 (RPL 046 KS POLITANI UTK PNGMBGN SDM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran Bank Kaltimtara Syariah Capem Loa Bakung - 5500055000 (RPL 046 KS POLITANI SMD UNTUK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693480,
    "nama": "POLITEKNIK NEGERI SAMARINDA",
    "kode": "023.69.693480",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Timur",
    "provinsi": "KALIMANTAN TIMUR",
    "lat": -0.6118,
    "lng": 117.1656,
    "saldoBuku": 3671165000,
    "saldoBank": 0,
    "selisih": 3671165000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1480002520255 (BPn 046 Politeknik Negeri Samarinda)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934801000 (BPG 046 POLNES)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7298308098 (RPL 046 KS POLNES UTK BP3)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7301517577 (RPL 046 KS POLNES UNTUK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 0011426514 (RPL 046 KS POLNES UNTUK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 0011444440 (RPL 046 KS POLNES UTK KAJIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1480025194013 (RPL 046 PDHL PONES UTK 2DFE11PA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1480025425326 (RPL 046 DB POLNES UNTUK KIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693481,
    "nama": "POLITEKNIK NEGERI UJUNG PANDANG",
    "kode": "023.69.693481",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Makassar",
    "provinsi": "Sulawesi Selatan",
    "lat": -5.1345,
    "lng": 119.4892,
    "saldoBuku": 65676160576,
    "saldoBank": 45659924019,
    "selisih": 20016236557,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 00004.01.30.001912.5 (RPL 054 BLU POLIUPG untuk OPS Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00004.01.30.001913.3 (RPL 054 BLU POLIUPG untuk OPS Pengeluara)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00004.01.30.001914.1 (RPL 054 BLU POLIUPG untuk Dana Kelolaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 00004.01.30.001915.9 (RPL 054 BLU POLIUPG untuk OPS Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934811000 (BPG 054 POLIUPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7373202661 (RPL 054 BLU POLIUPG Untuk PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 7373202774 (BPN 054 POLIUPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 2076816618 (RPL 054 BLU POLIUPG Untuk OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BCA KCP Tentara Pelajar - 3656838888 (RPL 054 BLU POLIUPG Untuk DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693482,
    "nama": "POLITEKNIK PERTANIAN NEGERI PANGKAJENE KEPULAUAN",
    "kode": "023.69.693482",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Selatan",
    "provinsi": "SULAWESI SELATAN",
    "lat": -5.2573,
    "lng": 119.4447,
    "saldoBuku": 553745238,
    "saldoBank": 553745238,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1911908646 (RPL 054 PS POLIPANGKEP UNTUK DANA PUSAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9891946934821000 (BPG 054 POLIPANGKEP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 22301002177308 (BPN 054 POLI PANGKEP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693483,
    "nama": "POLITEKNIK NEGERI KUPANG",
    "kode": "023.69.693483",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Nusa Tenggara Timur",
    "provinsi": "NUSA TENGGARA TIMUR",
    "lat": -10.2868,
    "lng": 123.619,
    "saldoBuku": 432627096,
    "saldoBank": 46201096,
    "selisih": 386426000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586934831000 (BPG 039 Politeknik Negeri Kupang)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 0039-01-005119-30-0 (BPN 039  POLITEKNIK NEGERI  KPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 0039-01-005120-30-1 (RPL 039 PS POLTEK NGR UTK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 0039-01-005118-30-4 (RPL 039 KS POLTEK NGR UTK KEMITRAAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693484,
    "nama": "POLITEKNIK PERTANIAN NEGERI KUPANG",
    "kode": "023.69.693484",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Nusa Tenggara Timur",
    "provinsi": "NUSA TENGGARA TIMUR",
    "lat": -10.0661,
    "lng": 123.7135,
    "saldoBuku": 66550042,
    "saldoBank": 0,
    "selisih": 66550042,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934841000 (BPG 039 POLITANI KUPANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1913053528 (BPN 039 POLITANI KUPANG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran PT. BPD NTT - 2510574087 (BPN 039 POLITANI KPG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 3901005131302 (RPL 039 PS POLITANI KPG UTK SPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693485,
    "nama": "POLITEKNIK NEGERI AMBON",
    "kode": "023.69.693485",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Maluku",
    "provinsi": "MALUKU",
    "lat": -3.6414,
    "lng": 128.1077,
    "saldoBuku": 282480352,
    "saldoBank": 282480352,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 2027370104 (BPN 061 POLTEK AMBON)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 80325006934851000 (BPG 061 POLNAM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 114501300000119 (RPL061 PS POLNAM untuk Sosialisasi)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693486,
    "nama": "POLITEKNIK NEGERI MANADO",
    "kode": "023.69.693486",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Utara",
    "provinsi": "SULAWESI UTARA",
    "lat": 1.5288,
    "lng": 124.7684,
    "saldoBuku": 777260462,
    "saldoBank": 0,
    "selisih": 777260462,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934861000 (BPG 049 Politeknik Negeri Manado)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1500055550105 (BPN 049 Politeknik Negeri Manado)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1500029850193 (RPL 049 Politeknik Negeri Manado utk PS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 0001101300008337 (RPL 049 PS Polimdo UTK Penerimaan)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934861001 (BPP 049 POLIMDO 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934861002 (BPP 049 POLIMDO 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693487,
    "nama": "POLITEKNIK MANUFAKTUR NEGERI BANGKA BELITUNG",
    "kode": "023.69.693487",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bangka Belitung",
    "provinsi": "BANGKA BELITUNG",
    "lat": -2.0793,
    "lng": 106.043,
    "saldoBuku": 7155995,
    "saldoBank": 0,
    "selisih": 7155995,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 7296684885 (BPN 015 POLMAN BABEL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1922156635 (BPN 015 POLMAN BABEL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 32401001679309 (BPN 015 POLMAN BABEL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934871000 (BPG 015 POLMAN BABEL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 32401001677307 (RPL 015 PDT POLMAN UTK BEASISWA MHS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 32401001678303 (RPL 015 PDT POLMAN UTK OPS LSP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693488,
    "nama": "POLITEKNIK NEGERI BATAM",
    "kode": "023.69.693488",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kepulauan Riau",
    "provinsi": "KEPULAUAN RIAU",
    "lat": 0.9707,
    "lng": 104.3846,
    "saldoBuku": 184776310978,
    "saldoBank": 202590805640,
    "selisih": 17814494662,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934881000 (BPG 137 POLITEKNIK NEGERI BATAM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1222222238 (RPL 137 BLU POLTEK BTM UTK OPS PG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2701300014571 (RPL 137 BLU POLTEK BTM UTK OPS PG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2701300014563 (RPL 137 BLU POLTEK BTM UTK OPS PN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran KCU Batam - 10000003469 (RPL 137 BLU POLBATAM UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 8888202511 (RPL 137 BLU POLTEK BTM UTK OPS PN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 3000234978 (RPL 137 BLU POLTEK BTM UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KB Bukopin - 30000002029 (RPL 137 BLU POLTEK BTM UTK PKD)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 1333333346 (RPL 137 BLU POLTEK BTM UTK OPS PN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 8888202522 (RPL 137 BLU POLTEK BTM UTK OPS PG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KB Bukopin - 1003300249 (RPL 137 BLU POLTEK BTM UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KB Bukopin - 1003301245 (RPL 137 BLU POLTEK BTM UTK OPS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran KB Bukopin - 1003299241 (RPL 137 BLU POLTEK BTM UTK DK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693489,
    "nama": "POLITEKNIK PERIKANAN NEGERI TUAL",
    "kode": "023.69.693489",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Maluku",
    "provinsi": "MALUKU",
    "lat": -3.805,
    "lng": 128.1934,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586934891000 (BPG 084 POLIKANT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007079482 (BPN 084 POLITEKNIK PERIKANAN NEGERI TUAL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007079789 (RPL 084 PS POLIKAN TUAL UNTUK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1860007057835 (RPL 084 PS POLIKAN TUAL UTK DANA LAINNYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693490,
    "nama": "POLITEKNIK NEGERI MEDIA KREATIF",
    "kode": "023.69.693490",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta",
    "provinsi": "DKI JAKARTA",
    "lat": -6.3184,
    "lng": 106.8576,
    "saldoBuku": 4407743342,
    "saldoBank": 4407743342,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934901000 (BPG 088 POLIMEDIA KREATIF)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934901001 (BPP 088 POLIMEDIA KREATIF 01)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934901002 (BPP 088 POLIMEDIA KREATIF 02)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 165701000017302 (RPL 088 KS POLIMEDIA KREATIF UTK PENELIT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 165701000018308 (RPL 088 PS POLIMEDIA UTK KIP DAN ADIK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 6669349094 (RPL 088 PS POLIMEDIA UTK KJMU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 6669349005 (BPN 088 POL NEGERI MEDIA KREATIF)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693491,
    "nama": "POLITEKNIK MARITIM NEGERI INDONESIA",
    "kode": "023.69.693491",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Tengah",
    "provinsi": "JAWA TENGAH",
    "lat": -6.894,
    "lng": 110.5446,
    "saldoBuku": 191651660,
    "saldoBank": 60441660,
    "selisih": 131210000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934911000 (BPG 025 693491)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 1911074506 (RPL 026 DB POLIMARIN UTK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1911071425 (BPN 026 POLIMARIN PEMERINTAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693492,
    "nama": "POLITEKNIK NEGERI BALIKPAPAN",
    "kode": "023.69.693492",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Badung / Bali",
    "provinsi": "Bali",
    "lat": -8.7981,
    "lng": 115.1724,
    "saldoBuku": 262315289,
    "saldoBank": 0,
    "selisih": 262315289,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126934921000 (BPG 047 POLTEKBA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 149-00-4102030-8 (BPN 047 POLITEKNIK NEGERI BALIKPAPAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 149-00-7102030-1 (RPL 047 KS POLTEKBA UTK DPKSBS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 149-00-6102030-3 (RPL 047 DB POLTEKBA UTK KIP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BPD Kaltimtara - 31445566 (RPL 047 PS POLTEKBA UTK DANA BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693493,
    "nama": "AKADEMI KOMUNITAS NEGERI PACITAN",
    "kode": "023.69.693493",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.0354,
    "lng": 112.6775,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934931000 (BPG 099 AKN PACITAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912599908 (BPN 099 AKN PACITAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693494,
    "nama": "AKADEMI KOMUNITAS NEGERI ACEH BARAT",
    "kode": "023.69.693494",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Aceh",
    "provinsi": "ACEH",
    "lat": 5.7704,
    "lng": 95.2492,
    "saldoBuku": 36548705,
    "saldoBank": 0,
    "selisih": 36548705,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446934941000 (BPG 003 AKN ACEH BARAT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7310192869 (RPL 003 PS AKN A BARAT UNTK PNLTN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693495,
    "nama": "AKADEMI KOMUNITAS NEGERI REJANG LEBONG",
    "kode": "023.69.693495",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Bengkulu",
    "provinsi": "BENGKULU",
    "lat": -3.7464,
    "lng": 102.1918,
    "saldoBuku": 468466,
    "saldoBank": 0,
    "selisih": 468466,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1790005328856 (BPN 146 Akademi Komunitas Negeri Rejang )",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934951000 (BPG 146 AKREL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1790005533646 (RPL 146 PS AKADEMI  KOMUNITAS NEGERI REJ)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693496,
    "nama": "POLITEKNIK NEGERI INDRAMAYU",
    "kode": "023.69.693496",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -6.6954,
    "lng": 107.5445,
    "saldoBuku": 139694000,
    "saldoBank": 71000000,
    "selisih": 68694000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 8101446934961000 (BPG 024 POLITEKNIK NEGERI INDRAMAYU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 1002220608 (RPL 024 DB POLINDRA UTK PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1920127978 (BPN 024 POLINDRA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 15601300002983 (BPN 024 POLINDRA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BSI - 1002220508 (BPN 024 POLINDRA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693497,
    "nama": "POLITEKNIK NEGERI CILACAP",
    "kode": "023.69.693497",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Tengah",
    "provinsi": "JAWA TENGAH",
    "lat": -7.0347,
    "lng": 110.2288,
    "saldoBuku": 95050812,
    "saldoBank": 0,
    "selisih": 95050812,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946934971000 (BPG 130 Politeknik Negeri Cilacap)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4412345053 (BPN 130 Politeknik Negeri Cilacap)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 4412345042 (RPL 130 PS POLITEKNIK NEGERI CILACAP UNT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7297440785 (BPN 130 Politeknik Negeri Cilacap)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1800017289945 (BPN 130 POLITEKNIK NEGERI CILACAP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693498,
    "nama": "POLITEKNIK NEGERI SUBANG",
    "kode": "023.69.693498",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Barat",
    "provinsi": "JAWA BARAT",
    "lat": -7.1482,
    "lng": 107.4693,
    "saldoBuku": 317590051,
    "saldoBank": 0,
    "selisih": 317590051,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BSI - 4441231119 (BPN 021 Politeknik Negeri Subang)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 0123.01.003372.30.1 (BPN 021 Politeknik Negeri Subang)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 654586934981000 (BPG 021 Politeknik Negeri Subang)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 0123.01003373.30.7 (RPL 021 Politeknik Negeri Subang)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693499,
    "nama": "POLITEKNIK NEGERI MADURA",
    "kode": "023.69.693499",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.4882,
    "lng": 112.6023,
    "saldoBuku": 7979011,
    "saldoBank": 7979011,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 1400090005068 (BPN 036 Politeknik Negeri madura)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126934991000 (BPG 036 Politeknik Negeri madura)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1400070005054 (RPL 036 PS Poltera UTK Dana Lainnya)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693500,
    "nama": "POLITEKNIK NEGERI MADIUN",
    "kode": "023.69.693500",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.158,
    "lng": 113.0926,
    "saldoBuku": 49454026,
    "saldoBank": 49454026,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126935001000 (BPG 033 POLITEKNIK NEGERI MADIUN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BTN - 2901300003992 (BPN 033 POLTEK NEGERI MADIUN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 4501693500302 (RPL 033 PS PNM UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 4501693300304 (RPL 033 PS PNM UTK DANA PENELITIAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693501,
    "nama": "POLITEKNIK NEGERI SAMBAS",
    "kode": "023.69.693501",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Barat",
    "provinsi": "KALIMANTAN BARAT",
    "lat": -0.1359,
    "lng": 109.3545,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 1912156682 (BPN 093 POLITEKNIK NEGERI SAMBAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9891946935011000 (BPG 093 POLITEKNIK NEGERI SAMBAS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912149201 (RPL 093 PS POLTESA UNTUK DANA LAINNYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693502,
    "nama": "POLITEKNIK NEGERI TANAH LAUT",
    "kode": "023.69.693502",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Selatan",
    "provinsi": "KALIMANTAN SELATAN",
    "lat": -3.429,
    "lng": 114.6028,
    "saldoBuku": 14280186,
    "saldoBank": 0,
    "selisih": 14280186,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586935021000 (BPG 168 POLITEKNIK NEGERI TANAH LAUT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 168401000007304 (RPL 168 PS POLITALA UTK PENAMPUNGAN DANA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 168401000008300 (BPN 168 POLITEKNIK NEGERI TANAH LAUT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 117401300000368 (BPN 168 POLITEKNIK NEGERI TANAH LAUT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7348891493 (RPL 168 PS POLITALA DN PENELITIAN /)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7349477445 (RPL 168 KS POLITALA PWS CETAK SAWAH)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7351435784 (RPL 168 PS POLITALA DANA PKM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7359396842 (RPL 168 PS POLITALA KRTF MHS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7363051078 (RPL 168 KS POLITALA SERTIKOM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7363693487 (RPL 168 KS POLITALA REVIT SMA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693503,
    "nama": "POLITEKNIK NEGERI FAKFAK",
    "kode": "023.69.693503",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Papua Barat",
    "provinsi": "PAPUA BARAT",
    "lat": -0.8075,
    "lng": 133.9883,
    "saldoBuku": 61624189,
    "saldoBank": 0,
    "selisih": 61624189,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586935031000 (BPG 067 POLITEKNIK NEGERI FAKFAK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 108101001423309 (RPL 067   PDHL POLINEF)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 108101001424305 (RPL 067 KS POLTEK NEGERI FAKFAK UNTUK BU)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 108101001425301 (BPN 067 POLTEK NEGERI FAKFAK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693504,
    "nama": "POLITEKNIK NEGERI NUSA UTARA",
    "kode": "023.69.693504",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Sulawesi Utara",
    "provinsi": "SULAWESI UTARA",
    "lat": 1.3652,
    "lng": 124.8541,
    "saldoBuku": 86378323,
    "saldoBank": 0,
    "selisih": 86378323,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946935041000 (BPG 083 POLNUSTAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1912329589 (RPL 083 PS POLNUSTAR UTK PENYALURAN BOPT)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 1917733939 (BPN 083 POLITEKNIK NEGERI NUSA UTARA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693505,
    "nama": "POLITEKNIK NEGERI BENGKALIS",
    "kode": "023.69.693505",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Riau",
    "provinsi": "RIAU",
    "lat": 0.3975,
    "lng": 101.4598,
    "saldoBuku": 1063052351,
    "saldoBank": 1063052351,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 18901001312307 (BPN 120 Politeknik Negeri Bengkalis)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 654586935051000 (BPG 120 POLBENG)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "Rek. Koran BRI - 18901001311301 (RPL 120 PS POLBENG UTK KERJASAM\u0410)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Terverifikasi"
      }
    ]
  },
  {
    "id": 693506,
    "nama": "AKADEMI KOMUNITAS NEGERI PUTRA SANG FAJAR BLITAR",
    "kode": "023.69.693506",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jawa Timur",
    "provinsi": "JAWA TIMUR",
    "lat": -7.1354,
    "lng": 112.3824,
    "saldoBuku": 59996405,
    "saldoBank": 0,
    "selisih": 59996405,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BTN - 38801300001003 (RPL 150 PS AKN PSF BLITAR UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7299180519 (BPN 150 AKN PSF BLITAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BTN - 38801300000992 (BPN 150 AKN PSF BLITAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1710008008818 (BPN 150 AKN PSF BLITAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 901005361306 (RPL 150 PS AKN PSF BLITAR UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 901005362302 (BPN 150 AKN PSF BLITAR)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 7299193513 (RPL 150 PS AKN PSF BLITAR UTK BEASISWA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 8100126935061000 (BPG 150 AKB)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693507,
    "nama": "POLITEKNIK NEGERI NUNUKAN",
    "kode": "023.69.693507",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Kalimantan Utara",
    "provinsi": "KALIMANTAN UTARA",
    "lat": 3.3818,
    "lng": 117.5049,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BRI - 654586935071000 (BPG 152 POLITEKNIK NEGERI NUNUKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 62701001458301 (RPL 152 KS PNN UNTUK SWAKELOLA SNBP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 62701001553305 (RPL 152 KS POLITEKNIK NEGERI NUNUKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 8308102020 (BPN 152 POLITEKNIK NEGERI NUNUKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BRI - 62701001457305 (BPN 152 POLITEKNIK NEGERI NUNUKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BSI - 9999567417 (BPN 152 POLITEKNIK NEGERI NUNUKAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693508,
    "nama": "AKADEMI KOMUNITAS NEGERI SENI DAN BUDAYA YOGYAKARTA",
    "kode": "023.69.693508",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "DI Yogyakarta",
    "provinsi": "DI YOGYAKARTA",
    "lat": -7.6602,
    "lng": 110.484,
    "saldoBuku": 155580000,
    "saldoBank": 0,
    "selisih": 155580000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran MANDIRI - 8100126935081000 (BPG 030 AKN YOGYAKARTA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370024847515 (BPN 030 AKN SENI BUDAYA YOGYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370024847614 (RPL 030 PS AKN SENBUD YGY UTK PROG KATAL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran MANDIRI - 1370025425774 (RPL 030 PS AKN SENBUD YGY UTK Penelitian)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693512,
    "nama": "DIREKTORAT AKADEMIK PENDIDIKAN TINGGI VOKASI",
    "kode": "023.69.693512",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.0533,
    "lng": 106.4575,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Dokumen Rekening Koran Periode 30 Juni 2026",
        "kategori": "Rekening Koran",
        "tanggal": "-",
        "status": "Belum Diunggah"
      }
    ]
  },
  {
    "id": 694808,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS NEGERI JAKARTA)",
    "kode": "023.69.694808",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Jakarta Timur",
    "provinsi": "DKI Jakarta",
    "lat": -6.1954,
    "lng": 106.8789,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran - - - (-)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 694824,
    "nama": "DITJEN DIKTI (PTN BH - UNIVERSITAS SRIWIJAYA)",
    "kode": "023.69.694824",
    "eselon1": "DIREKTORAT JENDERAL PENDIDIKAN TINGGI",
    "kota": "Indralaya / Palembang",
    "provinsi": "Sumatera Selatan",
    "lat": -3.2185,
    "lng": 104.6495,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9891946933781000 (BPG 014 UNIVERSITAS SRIWIJAYA)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693320,
    "nama": "DIREKTORAT JENDERAL RISET DAN PENGEMBANGAN",
    "kode": "023.69.693320",
    "eselon1": "DIREKTORAT JENDERAL RISET DAN PENGEMBANGAN",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.4924,
    "lng": 107.0126,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Dokumen Rekening Koran Periode 30 Juni 2026",
        "kategori": "Rekening Koran",
        "tanggal": "-",
        "status": "Belum Diunggah"
      }
    ]
  },
  {
    "id": 691863,
    "nama": "DIREKTORAT BINA TALENTA SAINS DAN TEKNOLOGI",
    "kode": "023.69.691863",
    "eselon1": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -5.8128,
    "lng": 106.9694,
    "saldoBuku": 222745079,
    "saldoBank": 0,
    "selisih": 222745079,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9892546918631000 (BPG 088 DIT BINA TALENTA SAINTEK)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9892546918631001 (BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9892546918631002 (BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 693321,
    "nama": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kode": "023.69.693321",
    "eselon1": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.381,
    "lng": 106.3838,
    "saldoBuku": 74089650,
    "saldoBank": 300000000,
    "selisih": 225910350,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9892546933211000 (BPG 088 DITJEN SAINS DAN TEKNOLOGI)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Perlu Klarifikasi"
      },
      {
        "nama": "Rek. Koran BNI - 9892546933211001 (BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9892546933211002 (BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9892546933211003 (BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "Rek. Koran BNI - 9892546933211004 (BPP)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 695422,
    "nama": "SEKOLAH MENENGAH ATAS UNGGUL GARUDA BELITUNG TIMUR",
    "kode": "023.69.695422",
    "eselon1": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.2699,
    "lng": 107.3644,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9892546954221000 (BPG 107 SMA UNGGUL GARUDA BELTIM)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 695423,
    "nama": "SEKOLAH MENENGAH ATAS UNGGUL GARUDA TIMOR TENGAH SELATAN",
    "kode": "023.69.695423",
    "eselon1": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -5.7909,
    "lng": 106.4893,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9892546954231000 (BPG 039 SMA UNGGUL GARUDA TTS)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 695424,
    "nama": "SEKOLAH MENENGAH ATAS UNGGUL GARUDA KONAWE SELATAN",
    "kode": "023.69.695424",
    "eselon1": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -6.6712,
    "lng": 106.7468,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9892546954241000 (BPG 060 SMA UNGGUL GARUDA KONSEL)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  },
  {
    "id": 695425,
    "nama": "SEKOLAH MENENGAH ATAS UNGGUL GARUDA BULUNGAN",
    "kode": "023.69.695425",
    "eselon1": "DIREKTORAT JENDERAL SAINS DAN TEKNOLOGI",
    "kota": "Jakarta Pusat",
    "provinsi": "DKI Jakarta",
    "lat": -5.8339,
    "lng": 107.3338,
    "saldoBuku": 0,
    "saldoBank": 0,
    "selisih": 0,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rek. Koran BNI - 9892546954251000 (BPG 185 SMA UNGGUL GARUDA BULUNGAN)",
        "kategori": "Rekening Koran",
        "tanggal": "30 Jun 2026",
        "status": "Belum Diunggah"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Per 30 Juni 2026",
        "kategori": "BAP Kas",
        "tanggal": "30 Jun 2026",
        "status": "Review"
      }
    ]
  }
];

export const WILAYAH_PENGAWASAN_KL_LIST: WilayahPengawasanKL[] = [
  {
    "id": "wil-01",
    "kodeWilayah": "WIL-01",
    "nama": "Wilayah I - DKI Jakarta, Jawa Barat, Banten & Satker Pusat",
    "satkerUtama": "Universitas Indonesia (UI)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Jakarta, Depok & Bandung",
    "lat": -6.55,
    "lng": 107.05,
    "radiusMeter": 130000,
    "satkerIds": [
      693300,
      693318,
      694365,
      694988,
      693319,
      693205,
      693206,
      693371,
      693372,
      693373,
      693374,
      693378,
      693403,
      693407,
      693408,
      693409,
      693412,
      693413,
      693419,
      693433,
      693438,
      693439,
      693440,
      693450,
      693468,
      693469,
      693470,
      693490,
      693496,
      693498,
      693512,
      694808,
      693320,
      691863,
      693321,
      695422,
      695423,
      695424,
      695425
    ]
  },
  {
    "id": "wil-02",
    "kodeWilayah": "WIL-02",
    "nama": "Wilayah II - Jawa Tengah & DI Yogyakarta",
    "satkerUtama": "Universitas Gadjah Mada (UGM)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Yogyakarta, Semarang & Surakarta",
    "lat": -7.5,
    "lng": 110.35,
    "radiusMeter": 110000,
    "satkerIds": [
      693207,
      693208,
      693375,
      693401,
      693404,
      693410,
      693414,
      693418,
      693420,
      693437,
      693447,
      693449,
      693471,
      693491,
      693497,
      693508
    ]
  },
  {
    "id": "wil-03",
    "kodeWilayah": "WIL-03",
    "nama": "Wilayah III - Jawa Timur & Madura",
    "satkerUtama": "Universitas Airlangga (Unair)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Surabaya, Malang & Jember",
    "lat": -7.5,
    "lng": 112.7,
    "radiusMeter": 120000,
    "satkerIds": [
      693209,
      693376,
      693397,
      693411,
      693416,
      693424,
      693443,
      693445,
      693448,
      693460,
      693472,
      693473,
      693474,
      693475,
      693493,
      693499,
      693500,
      693506
    ]
  },
  {
    "id": "wil-04",
    "kodeWilayah": "WIL-04",
    "nama": "Wilayah IV - Sumatera Bagian Utara, Barat & Aceh",
    "satkerUtama": "Universitas Sumatera Utara (USU)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Medan, Banda Aceh & Padang",
    "lat": 2.5,
    "lng": 99.0,
    "radiusMeter": 420000,
    "satkerIds": [
      693200,
      693203,
      693212,
      693215,
      693387,
      693398,
      693399,
      693400,
      693417,
      693425,
      693429,
      693430,
      693435,
      693441,
      693444,
      693451,
      693462,
      693463,
      693464,
      693465,
      693488,
      693494,
      693505
    ]
  },
  {
    "id": "wil-05",
    "kodeWilayah": "WIL-05",
    "nama": "Wilayah V - Sumatera Bagian Selatan & Lampung",
    "satkerUtama": "Universitas Sriwijaya (Unsri)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Palembang & Bandar Lampung",
    "lat": -3.2,
    "lng": 104.5,
    "radiusMeter": 250000,
    "satkerIds": [
      693204,
      693379,
      693392,
      693395,
      693402,
      693426,
      693466,
      693467,
      693487,
      693495,
      694824
    ]
  },
  {
    "id": "wil-06",
    "kodeWilayah": "WIL-06",
    "nama": "Wilayah VI - Kalimantan Se-Wilayah",
    "satkerUtama": "Universitas Mulawarman (Unmul)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Samarinda, Banjarmasin & Pontianak",
    "lat": -1.5,
    "lng": 115.5,
    "radiusMeter": 380000,
    "satkerIds": [
      693213,
      693380,
      693381,
      693396,
      693427,
      693428,
      693436,
      693461,
      693477,
      693478,
      693479,
      693480,
      693492,
      693501,
      693502,
      693507
    ]
  },
  {
    "id": "wil-07",
    "kodeWilayah": "WIL-07",
    "nama": "Wilayah VII - Sulawesi Se-Wilayah",
    "satkerUtama": "Universitas Hasanuddin (Unhas)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Makassar, Manado & Kendari",
    "lat": -2.5,
    "lng": 121.0,
    "radiusMeter": 450000,
    "satkerIds": [
      693211,
      693218,
      693377,
      693382,
      693383,
      693384,
      693385,
      693386,
      693415,
      693421,
      693423,
      693446,
      693481,
      693482,
      693486,
      693504
    ]
  },
  {
    "id": "wil-08",
    "kodeWilayah": "WIL-08",
    "nama": "Wilayah VIII - Bali, Nusa Tenggara, Maluku & Papua",
    "satkerUtama": "Universitas Udayana (Unud)",
    "eselon1": "Ditjen Pendidikan Tinggi",
    "pusatKota": "Denpasar, Kupang, Ambon & Jayapura",
    "lat": -6.0,
    "lng": 128.0,
    "radiusMeter": 850000,
    "satkerIds": [
      693210,
      693214,
      693216,
      693217,
      693388,
      693389,
      693390,
      693391,
      693393,
      693394,
      693405,
      693406,
      693422,
      693431,
      693432,
      693434,
      693476,
      693483,
      693484,
      693485,
      693489,
      693503
    ]
  }
];
