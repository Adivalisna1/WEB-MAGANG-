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
    "saldoBuku": 34025000000,
    "saldoBank": 34025000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.12136,
    "lng": 106.75346,
    "saldoBuku": 27278000000,
    "saldoBank": 27278000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.28498,
    "lng": 106.83922,
    "saldoBuku": 30123000000,
    "saldoBank": 30123000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lng": 106.93368,
    "saldoBuku": 13396000000,
    "saldoBank": 13622000000,
    "selisih": 226000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -6.20501,
    "lng": 106.61795,
    "saldoBuku": 26496000000,
    "saldoBank": 26496000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 20446000000,
    "saldoBank": 20972000000,
    "selisih": 526000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 28266000000,
    "saldoBank": 28266000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 17514000000,
    "saldoBank": 17514000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 12529000000,
    "saldoBank": 13058000000,
    "selisih": 529000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 4315000000,
    "saldoBank": 4520000000,
    "selisih": 205000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 27975000000,
    "saldoBank": 27975000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 15754000000,
    "saldoBank": 16508000000,
    "selisih": 754000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 15950000000,
    "saldoBank": 16440000000,
    "selisih": 490000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 31495000000,
    "saldoBank": 31495000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 23673000000,
    "saldoBank": 23673000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 22596000000,
    "saldoBank": 23272000000,
    "selisih": 676000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 30420000000,
    "saldoBank": 30420000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 29147000000,
    "saldoBank": 29364000000,
    "selisih": 217000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 13311000000,
    "saldoBank": 13311000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 26898000000,
    "saldoBank": 26898000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 37555000000,
    "saldoBank": 37555000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 31202000000,
    "saldoBank": 31674000000,
    "selisih": 472000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -6.28275,
    "lng": 107.03814,
    "saldoBuku": 26605000000,
    "saldoBank": 27200000000,
    "selisih": 595000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -6.15476,
    "lng": 106.77186,
    "saldoBuku": 35013000000,
    "saldoBank": 35013000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.86346,
    "lng": 107.54536,
    "saldoBuku": 15259000000,
    "saldoBank": 15259000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.02708,
    "lng": 107.63112,
    "saldoBuku": 6748000000,
    "saldoBank": 6748000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.71726,
    "lng": 110.30376,
    "saldoBuku": 5196000000,
    "saldoBank": 5196000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -7.20346,
    "lng": 112.67836,
    "saldoBuku": 11355000000,
    "saldoBank": 11355000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 16231000000,
    "saldoBank": 16231000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 28452000000,
    "saldoBank": 28924000000,
    "selisih": 472000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 37250000000,
    "saldoBank": 37250000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 18383000000,
    "saldoBank": 18383000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 30117000000,
    "saldoBank": 30117000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 4012000000,
    "saldoBank": 4694000000,
    "selisih": 682000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 19361000000,
    "saldoBank": 19361000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": 0.59754,
    "lng": 122.98306,
    "saldoBuku": 29139000000,
    "saldoBank": 29139000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 38228000000,
    "saldoBank": 38466000000,
    "selisih": 238000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 38915000000,
    "saldoBank": 38915000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 17112000000,
    "saldoBank": 17112000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 33047000000,
    "saldoBank": 33047000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 15546000000,
    "saldoBank": 15922000000,
    "selisih": 376000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 22194000000,
    "saldoBank": 22194000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 28355000000,
    "saldoBank": 28355000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 15742000000,
    "saldoBank": 15854000000,
    "selisih": 112000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -8.61646,
    "lng": 115.13886,
    "saldoBuku": 11444000000,
    "saldoBank": 11444000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 32655000000,
    "saldoBank": 32655000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 25130000000,
    "saldoBank": 25130000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 17504000000,
    "saldoBank": 17504000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -7.36708,
    "lng": 112.76412,
    "saldoBuku": 9391000000,
    "saldoBank": 9391000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 5970000000,
    "saldoBank": 5970000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -0.89306,
    "lng": 100.34346,
    "saldoBuku": 35106000000,
    "saldoBank": 35106000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": 5.60234,
    "lng": 95.25006,
    "saldoBuku": 36278000000,
    "saldoBank": 36278000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -7.88088,
    "lng": 110.38952,
    "saldoBuku": 35496000000,
    "saldoBank": 35572000000,
    "selisih": 76000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -5.39596,
    "lng": 105.19296,
    "saldoBuku": 23566000000,
    "saldoBank": 23566000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lng": 107.72558,
    "saldoBuku": 19757000000,
    "saldoBank": 20484000000,
    "selisih": 727000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -6.95106,
    "lng": 110.36436,
    "saldoBuku": 36571000000,
    "saldoBank": 36722000000,
    "selisih": 151000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -2.53756,
    "lng": 140.59526,
    "saldoBuku": 29535000000,
    "saldoBank": 29535000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -8.78008,
    "lng": 115.22462,
    "saldoBuku": 22295000000,
    "saldoBank": 22295000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 19759000000,
    "saldoBank": 19759000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 36478000000,
    "saldoBank": 36478000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.94711,
    "lng": 107.40985,
    "saldoBuku": 26118000000,
    "saldoBank": 26596000000,
    "selisih": 478000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 30709000000,
    "saldoBank": 31118000000,
    "selisih": 409000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 31784000000,
    "saldoBank": 32268000000,
    "selisih": 484000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 17219000000,
    "saldoBank": 17219000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 20444000000,
    "saldoBank": 20444000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 32469000000,
    "saldoBank": 32469000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 33251000000,
    "saldoBank": 34032000000,
    "selisih": 781000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 7544000000,
    "saldoBank": 7544000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 19761000000,
    "saldoBank": 19761000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.11468,
    "lng": 110.45012,
    "saldoBuku": 17696000000,
    "saldoBank": 18222000000,
    "selisih": 526000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 7043000000,
    "saldoBank": 7043000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 33148000000,
    "saldoBank": 33148000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -3.94446,
    "lng": 122.43886,
    "saldoBuku": 36183000000,
    "saldoBank": 36183000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -10.12316,
    "lng": 123.53326,
    "saldoBuku": 20238000000,
    "saldoBank": 20386000000,
    "selisih": 148000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 37937000000,
    "saldoBank": 38544000000,
    "selisih": 607000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 18674000000,
    "saldoBank": 18674000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 0.56114,
    "lng": 101.37406,
    "saldoBuku": 31285000000,
    "saldoBank": 31760000000,
    "selisih": 475000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 15154000000,
    "saldoBank": 15308000000,
    "selisih": 154000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 27280000000,
    "saldoBank": 27280000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 29430000000,
    "saldoBank": 29430000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 5.43872,
    "lng": 95.33582,
    "saldoBuku": 20141000000,
    "saldoBank": 20141000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lng": 95.43028,
    "saldoBuku": 6455000000,
    "saldoBank": 6455000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 30115000000,
    "saldoBank": 30620000000,
    "selisih": 505000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 9777000000,
    "saldoBank": 9777000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 32172000000,
    "saldoBank": 32172000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -2.70118,
    "lng": 140.68102,
    "saldoBuku": 16035000000,
    "saldoBank": 16035000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 5.51869,
    "lng": 95.11455,
    "saldoBuku": 18090000000,
    "saldoBank": 18090000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 26793000000,
    "saldoBank": 26793000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 24942000000,
    "saldoBank": 25504000000,
    "selisih": 562000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -5.95328,
    "lng": 106.75257,
    "saldoBuku": 29828000000,
    "saldoBank": 29828000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -6.40613,
    "lng": 106.6774,
    "saldoBuku": 33829000000,
    "saldoBank": 33829000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.07593,
    "lng": 107.16771,
    "saldoBuku": 10072000000,
    "saldoBank": 10072000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 19367000000,
    "saldoBank": 19367000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 19759000000,
    "saldoBank": 19759000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 33643000000,
    "saldoBank": 33896000000,
    "selisih": 253000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 11157000000,
    "saldoBank": 11284000000,
    "selisih": 127000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -5.09366,
    "lng": 119.35896,
    "saldoBuku": 27874000000,
    "saldoBank": 27874000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 31103000000,
    "saldoBank": 31103000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 35306000000,
    "saldoBank": 35592000000,
    "selisih": 286000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 34035000000,
    "saldoBank": 34510000000,
    "selisih": 475000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 15261000000,
    "saldoBank": 15952000000,
    "selisih": 691000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 4606000000,
    "saldoBank": 5192000000,
    "selisih": 586000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lng": 112.85858,
    "saldoBuku": 27379000000,
    "saldoBank": 27379000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 19068000000,
    "saldoBank": 19246000000,
    "selisih": 178000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": 5.44095,
    "lng": 95.53474,
    "saldoBuku": 11737000000,
    "saldoBank": 11737000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 33536000000,
    "saldoBank": 34002000000,
    "selisih": 466000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -1.05668,
    "lng": 100.42922,
    "saldoBuku": 35785000000,
    "saldoBank": 35785000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lng": 100.52368,
    "saldoBuku": 38626000000,
    "saldoBank": 39032000000,
    "selisih": 406000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 7239000000,
    "saldoBank": 7239000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -5.55958,
    "lng": 105.27872,
    "saldoBuku": 16037000000,
    "saldoBank": 16037000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 24738000000,
    "saldoBank": 24738000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 5576000000,
    "saldoBank": 5576000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -7.02485,
    "lng": 107.83004,
    "saldoBuku": 31586000000,
    "saldoBank": 31586000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "saldoBuku": 15744000000,
    "saldoBank": 15744000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 29436000000,
    "saldoBank": 29436000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.28711,
    "lng": 112.54285,
    "saldoBuku": 24645000000,
    "saldoBank": 24880000000,
    "selisih": 235000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 13299000000,
    "saldoBank": 13299000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.36485,
    "lng": 112.96304,
    "saldoBuku": 25813000000,
    "saldoBank": 25813000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 15449000000,
    "saldoBank": 15449000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 0.02774,
    "lng": 109.26876,
    "saldoBuku": 17211000000,
    "saldoBank": 17211000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -3.26536,
    "lng": 114.51706,
    "saldoBuku": 31681000000,
    "saldoBank": 31681000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -0.44816,
    "lng": 117.07986,
    "saldoBuku": 32564000000,
    "saldoBank": 32564000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -0.61178,
    "lng": 117.16562,
    "saldoBuku": 13398000000,
    "saldoBank": 13398000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 21123000000,
    "saldoBank": 21556000000,
    "selisih": 433000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -5.25728,
    "lng": 119.44472,
    "saldoBuku": 21032000000,
    "saldoBank": 21032000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -10.28678,
    "lng": 123.61902,
    "saldoBuku": 12517000000,
    "saldoBank": 13154000000,
    "selisih": 637000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lng": 123.71348,
    "saldoBuku": 11250000000,
    "saldoBank": 11250000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -3.64136,
    "lng": 128.10766,
    "saldoBuku": 23564000000,
    "saldoBank": 23778000000,
    "selisih": 214000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": 1.52884,
    "lng": 124.76836,
    "saldoBuku": 37056000000,
    "saldoBank": 37056000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -2.07926,
    "lng": 106.04296,
    "saldoBuku": 19955000000,
    "saldoBank": 19955000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 0.97074,
    "lng": 104.38456,
    "saldoBuku": 18969000000,
    "saldoBank": 18969000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -3.80498,
    "lng": 128.19342,
    "saldoBuku": 29238000000,
    "saldoBank": 29238000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.31838,
    "lng": 106.85762,
    "saldoBuku": 9391000000,
    "saldoBank": 9391000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lng": 110.54458,
    "saldoBuku": 16823000000,
    "saldoBank": 16956000000,
    "selisih": 133000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 7728000000,
    "saldoBank": 7728000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.03538,
    "lng": 112.67747,
    "saldoBuku": 35397000000,
    "saldoBank": 35397000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 5.77042,
    "lng": 95.24917,
    "saldoBuku": 10761000000,
    "saldoBank": 10761000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -3.74636,
    "lng": 102.19176,
    "saldoBuku": 17997000000,
    "saldoBank": 17997000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.69538,
    "lng": 107.54447,
    "saldoBuku": 29725000000,
    "saldoBank": 29725000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.03471,
    "lng": 110.22885,
    "saldoBuku": 10953000000,
    "saldoBank": 10953000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -7.14823,
    "lng": 107.4693,
    "saldoBuku": 12517000000,
    "saldoBank": 13154000000,
    "selisih": 637000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -7.48823,
    "lng": 112.6023,
    "saldoBuku": 7922000000,
    "saldoBank": 7922000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -7.15803,
    "lng": 113.09261,
    "saldoBuku": 9975000000,
    "saldoBank": 10240000000,
    "selisih": 265000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -0.13588,
    "lng": 109.35452,
    "saldoBuku": 32461000000,
    "saldoBank": 32852000000,
    "selisih": 391000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -3.42898,
    "lng": 114.60282,
    "saldoBuku": 19753000000,
    "saldoBank": 19753000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -0.80746,
    "lng": 133.98826,
    "saldoBuku": 37838000000,
    "saldoBank": 37838000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 1.36522,
    "lng": 124.85412,
    "saldoBuku": 38133000000,
    "saldoBank": 38476000000,
    "selisih": 343000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": 0.39752,
    "lng": 101.45982,
    "saldoBuku": 32560000000,
    "saldoBank": 32560000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
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
    "lat": -7.13539,
    "lng": 112.38237,
    "saldoBuku": 35403000000,
    "saldoBank": 35403000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": 3.38184,
    "lng": 117.50486,
    "saldoBuku": 36470000000,
    "saldoBank": 36780000000,
    "selisih": 310000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lng": 110.48398,
    "saldoBuku": 16340000000,
    "saldoBank": 16340000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.05329,
    "lng": 106.45747,
    "saldoBuku": 6952000000,
    "saldoBank": 7424000000,
    "selisih": 472000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "saldoBuku": 30515000000,
    "saldoBank": 30515000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "saldoBuku": 4410000000,
    "saldoBank": 4510000000,
    "selisih": 100000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -6.49241,
    "lng": 107.01262,
    "saldoBuku": 15750000000,
    "saldoBank": 15750000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -5.81282,
    "lng": 106.96938,
    "saldoBuku": 25918000000,
    "saldoBank": 25918000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.38096,
    "lng": 106.38377,
    "saldoBuku": 8221000000,
    "saldoBank": 8221000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.26989,
    "lng": 107.36437,
    "saldoBuku": 24552000000,
    "saldoBank": 24552000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lng": 106.48933,
    "saldoBuku": 20448000000,
    "saldoBank": 20448000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
    "lat": -6.67125,
    "lng": 106.74685,
    "saldoBuku": 12820000000,
    "saldoBank": 12980000000,
    "selisih": 160000000,
    "status": "selisih",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Review"
      },
      {
        "nama": "Surat Konfirmasi Selisih Bank",
        "kategori": "Konfirmasi Bank",
        "tanggal": "28 Okt 2026",
        "status": "Menunggu"
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
    "lat": -5.83386,
    "lng": 107.3338,
    "saldoBuku": 30220000000,
    "saldoBank": 30220000000,
    "selisih": 0,
    "status": "match",
    "dokumenList": [
      {
        "nama": "Rekening Koran Bank Mitra Okt 2026",
        "kategori": "Rekening Koran",
        "tanggal": "30 Okt 2026",
        "status": "Terverifikasi"
      },
      {
        "nama": "BAP Kas & LPJ Bendahara Bulanan",
        "kategori": "BAP Kas",
        "tanggal": "29 Okt 2026",
        "status": "Terverifikasi"
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
