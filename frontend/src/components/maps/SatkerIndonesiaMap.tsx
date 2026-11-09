"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  X,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldCheck,
  Radio,
  Landmark,
  Coins,
} from "lucide-react";
import clsx from "clsx";

import {
  SatkerGeoData,
  WilayahPengawasanKL,
  SATKER_INDONESIA_LIST,
  WILAYAH_PENGAWASAN_KL_LIST,
} from "./satkerGeoData";

export { SATKER_INDONESIA_LIST, WILAYAH_PENGAWASAN_KL_LIST };
export type { SatkerGeoData, WilayahPengawasanKL };

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export function matchEselon1(satkerEselon?: string | null, targetEselon?: string | null): boolean {
  if (!targetEselon || targetEselon === "all") return true;
  if (!satkerEselon) return false;

  const s = satkerEselon.toLowerCase().trim();
  const t = targetEselon.toLowerCase().trim();

  if (s === t || s.includes(t) || t.includes(s)) return true;

  // Ditjen Dikti / Pendidikan Tinggi
  const isDiktiS = s.includes("dikti") || s.includes("pendidikan tinggi") || s.includes("tinggi");
  const isDiktiT = t.includes("dikti") || t.includes("pendidikan tinggi") || t.includes("tinggi");
  if (isDiktiS && isDiktiT) return true;

  // Ditjen Vokasi / Pendidikan Vokasi
  const isVokasiS = s.includes("vokasi");
  const isVokasiT = t.includes("vokasi");
  if (isVokasiS && isVokasiT) return true;

  // Setjen / Sekretariat Jenderal
  const isSetjenS = s.includes("setjen") || s.includes("sekretariat");
  const isSetjenT = t.includes("setjen") || t.includes("sekretariat");
  if (isSetjenS && isSetjenT) return true;

  // Itjen / Inspektorat Jenderal
  const isItjenS = s.includes("itjen") || s.includes("inspektorat");
  const isItjenT = t.includes("itjen") || t.includes("inspektorat");
  if (isItjenS && isItjenT) return true;

  // Ditjen Risbang / Riset dan Pengembangan
  const isRisbangS = s.includes("risbang") || s.includes("riset");
  const isRisbangT = t.includes("risbang") || t.includes("riset");
  if (isRisbangS && isRisbangT) return true;

  // Ditjen Saintek / Sains dan Teknologi
  const isSaintekS = s.includes("saintek") || s.includes("sains");
  const isSaintekT = t.includes("saintek") || t.includes("sains");
  if (isSaintekS && isSaintekT) return true;

  return false;
}

interface SatkerMapProps {
  filterEselon1Initial?: string;
  lockEselon1?: boolean;
  isKLLevel?: boolean;
  title?: string;
  subtitle?: string;
}

export default function SatkerIndonesiaMap({
  filterEselon1Initial = "all",
  lockEselon1 = false,
  isKLLevel = false,
  title = "Peta Sebaran & Rekonsiliasi Kas Satker Se-Nusantara",
  subtitle = "Monitoring interaktif geografis, saldo kas riil, dan kelengkapan bukti dokumen satker",
}: SatkerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // Mode View: default 'wilayah' (lingkaran pengawasan + penanda satker)
  const [viewMode, setViewMode] = useState<"wilayah" | "satker">("wilayah");
  const [selectedSatker, setSelectedSatker] = useState<SatkerGeoData | null>(null);
  const [selectedWilayah, setSelectedWilayah] = useState<WilayahPengawasanKL | null>(null);
  const [searchWilayahSatker, setSearchWilayahSatker] = useState<string>("");
  const [expandedSatkerId, setExpandedSatkerId] = useState<number | string | null>(null);

  const [filterEselon, setFilterEselon] = useState<string>(filterEselon1Initial);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchSatker, setSearchSatker] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Sinkronisasi filter saat prop inisial berubah (misal sesudah data user terambil)
  useEffect(() => {
    if (filterEselon1Initial) {
      setFilterEselon(filterEselon1Initial);
    }
  }, [filterEselon1Initial, lockEselon1]);

  // Normalisasi value untuk elemen dropdown select
  const currentSelectEselonValue = useMemo(() => {
    if (!filterEselon || filterEselon === "all") return "all";
    const f = filterEselon.toLowerCase();
    if (f.includes("dikti") || f.includes("tinggi")) return "Ditjen Dikti";
    if (f.includes("vokasi")) return "Ditjen Vokasi";
    if (f.includes("setjen") || f.includes("sekretariat")) return "Setjen";
    if (f.includes("risbang") || f.includes("riset")) return "Ditjen Risbang";
    if (f.includes("saintek") || f.includes("sains")) return "Ditjen Saintek";
    if (f.includes("itjen") || f.includes("inspektorat")) return "Itjen";
    return filterEselon;
  }, [filterEselon]);

  // Filtered Satkers untuk mode individual
  const filteredSatkers = useMemo(() => {
    return SATKER_INDONESIA_LIST.filter((s) => {
      if (filterEselon !== "all" && !matchEselon1(s.eselon1, filterEselon)) {
        return false;
      }
      if (filterStatus !== "all" && s.status !== filterStatus) {
        return false;
      }
      if (
        searchSatker.trim() &&
        !s.nama.toLowerCase().includes(searchSatker.toLowerCase()) &&
        !s.kota.toLowerCase().includes(searchSatker.toLowerCase()) &&
        !s.kode.toLowerCase().includes(searchSatker.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [filterEselon, filterStatus, searchSatker]);

  // Wilayah Pengawasan K/L Teragregasi (dengan data satker binaan & total saldo)
  const aggregatedWilayah = useMemo(() => {
    return WILAYAH_PENGAWASAN_KL_LIST.map((w) => {
      const satkersInWilayah = SATKER_INDONESIA_LIST.filter((s) =>
        w.satkerIds.includes(s.id) &&
        (filterEselon === "all" || matchEselon1(s.eselon1, filterEselon))
      );
      const totalBuku = satkersInWilayah.reduce((acc, s) => acc + s.saldoBuku, 0);
      const totalBank = satkersInWilayah.reduce((acc, s) => acc + s.saldoBank, 0);
      const totalSelisih = satkersInWilayah.reduce((acc, s) => acc + s.selisih, 0);
      const matchCount = satkersInWilayah.filter((s) => s.status === "match").length;
      const selisihCount = satkersInWilayah.filter((s) => s.status === "selisih").length;
      const hasSelisih = selisihCount > 0;
      return {
        ...w,
        satkers: satkersInWilayah,
        totalBuku,
        totalBank,
        totalSelisih,
        matchCount,
        selisihCount,
        hasSelisih,
      };
    });
  }, [filterEselon]);

  // Filtered Wilayah untuk mode lingkaran pengawasan K/L
  const filteredWilayah = useMemo(() => {
    return aggregatedWilayah.filter((w) => {
      if (w.satkers.length === 0) return false;
      if (filterStatus === "match" && w.hasSelisih) return false;
      if (filterStatus === "selisih" && !w.hasSelisih) return false;
      if (searchSatker.trim()) {
        const query = searchSatker.toLowerCase();
        const matchName = w.nama.toLowerCase().includes(query);
        const matchSatker = w.satkers.some(
          (s) =>
            s.nama.toLowerCase().includes(query) ||
            s.kota.toLowerCase().includes(query) ||
            s.kode.toLowerCase().includes(query)
        );
        if (!matchName && !matchSatker) return false;
      }
      return true;
    });
  }, [aggregatedWilayah, filterStatus, searchSatker]);

  // Statistik Cepat Peta (menyesuaikan viewMode)
  const stats = useMemo(() => {
    if (viewMode === "wilayah") {
      const totalWilayah = filteredWilayah.length;
      const totalSatker = filteredWilayah.reduce((acc, w) => acc + w.satkers.length, 0);
      const match = filteredWilayah.reduce((acc, w) => acc + w.matchCount, 0);
      const selisih = filteredWilayah.reduce((acc, w) => acc + w.selisihCount, 0);
      const totalSaldo = filteredWilayah.reduce((acc, w) => acc + w.totalBank, 0);
      return { totalWilayah, totalSatker, match, selisih, totalSaldo };
    } else {
      const totalSatker = filteredSatkers.length;
      const match = filteredSatkers.filter((s) => s.status === "match").length;
      const selisih = filteredSatkers.filter((s) => s.status === "selisih").length;
      const totalSaldo = filteredSatkers.reduce((acc, s) => acc + s.saldoBank, 0);
      return { totalWilayah: 0, totalSatker, match, selisih, totalSaldo };
    }
  }, [viewMode, filteredWilayah, filteredSatkers]);

  // Inisialisasi Peta Leaflet Secara Dinamis (Client-Side Safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (!mapInstanceRef.current && mapContainerRef.current) {
          // Center titik tengah Indonesia (Kepulauan Nusantara)
          const map = L.map(mapContainerRef.current, {
            center: [-2.5, 118.0],
            zoom: 5,
            minZoom: 4,
            maxZoom: 14,
            scrollWheelZoom: true,
            zoomControl: false,
            preferCanvas: true, // Hardware acceleration GPU
          });

          // OpenStreetMap Public Tile Layer (100% Free, No Watermark, No API Key, Optimized)
          L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
              maxZoom: 18,
              updateWhenIdle: true,
              keepBuffer: 2,
            }
          ).addTo(map);

          // Add Zoom control at top-right
          L.control.zoom({ position: "topright" }).addTo(map);

          mapInstanceRef.current = map;
          if (isMounted) setMapLoaded(true);
        }
      } catch (err) {
        console.error("Gagal memuat Leaflet Map:", err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Marker & Lingkaran pada Peta berdasarkan ViewMode & Filter
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;

    const renderLayers = async () => {
      const L = (await import("leaflet")).default;

      // Bersihkan marker dan lingkaran lama
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      circlesRef.current.forEach((c) => c.remove());
      circlesRef.current = [];

      // 1. MODE WILAYAH PENGAWASAN K/L (LINGKARAN WILAYAH + SIMPUL UTAMA)
      if (viewMode === "wilayah") {
        filteredWilayah.forEach((w) => {
          const isSelected = selectedWilayah?.id === w.id;
          const circleColor = w.hasSelisih ? "#f59e0b" : "#10b981"; // Amber vs Emerald
          const circleFill = w.hasSelisih ? "rgba(245, 158, 11, 0.14)" : "rgba(16, 185, 129, 0.14)";

          // Gambar Lingkaran Jangkauan Wilayah Pengawasan K/L
          const circle = L.circle([w.lat, w.lng], {
            radius: w.radiusMeter,
            color: circleColor,
            fillColor: circleFill,
            fillOpacity: isSelected ? 0.28 : 0.14,
            weight: isSelected ? 3 : 2,
            dashArray: "6, 6",
          }).addTo(mapInstanceRef.current);

          circle.on("click", () => {
            setSelectedWilayah(w);
            setSelectedSatker(null);
            setExpandedSatkerId(null);
            mapInstanceRef.current.panTo([w.lat, w.lng], {
              animate: true,
              duration: 0.8,
            });
          });
          circlesRef.current.push(circle);

          // Simpul Utama Wilayah Pengawasan
          const pulseColor = w.hasSelisih ? "rgba(245, 158, 11, 0.45)" : "rgba(16, 185, 129, 0.45)";
          const shortCode = w.kodeWilayah.replace("WIL-", "W-");

          const customIcon = L.divIcon({
            className: "custom-wilayah-marker",
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${pulseColor};"></div>
                  <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background-color: white; border: 3px solid ${circleColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${circleColor};">
                    ${shortCode}
                  </div>
                </div>
                <div style="margin-top: 2px; background: white; padding: 2px 8px; border-radius: 9999px; border: 1px solid #cbd5e1; font-size: 10px; font-weight: 700; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap;">
                  ${w.satkerUtama.split(" ")[0]} (${w.satkers.length} Satker)
                </div>
              </div>
            `,
          });

          const marker = L.marker([w.lat, w.lng], { icon: customIcon }).addTo(
            mapInstanceRef.current
          );

          marker.bindTooltip(
            `<strong>${w.nama}</strong><br/>
             <span style="font-size: 11px; color: #64748b;">Pengawas: ${w.eselon1}</span><br/>
             <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${w.satkers.length} Satker Diawasi &bull; Saldo: ${formatRupiah(w.totalBank)}</span><br/>
             <span style="font-size: 10px; color: ${w.hasSelisih ? '#d97706' : '#059669'}; font-weight: 600;">
               ${w.hasSelisih ? '⚠️ ' + w.selisihCount + ' Satker Ada Selisih' : '✓ Semua Satker Saldo Klop'}
             </span>`,
            { direction: "top", offset: [0, -22], opacity: 0.95 }
          );

          marker.on("click", () => {
            setSelectedWilayah(w);
            setSelectedSatker(null);
            setExpandedSatkerId(null);
            mapInstanceRef.current.panTo([w.lat, w.lng], {
              animate: true,
              duration: 0.8,
            });
          });

          markersRef.current.push(marker);

          // Tampilkan selalu pin-pin penanda satker binaan di dalam lingkaran wilayah
          w.satkers.forEach((childSatker) => {
            const childMatch = childSatker.status === "match";
            const childColor = childMatch ? "#10b981" : "#f59e0b";
            const isChildExpanded = expandedSatkerId === childSatker.id;

            const childIcon = L.divIcon({
              className: "custom-child-marker",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              html: `
                <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background-color: white; border: 2.5px solid ${childColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #1e293b; cursor: pointer; transform: ${isChildExpanded ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
                  ${childSatker.nama.slice(0, 2).toUpperCase()}
                </div>
              `,
            });

            const childMarker = L.marker([childSatker.lat, childSatker.lng], {
              icon: childIcon,
            }).addTo(mapInstanceRef.current);

            childMarker.bindTooltip(
              `<strong>${childSatker.nama}</strong><br/>
               <span style="font-size: 10px; color: ${childMatch ? '#059669' : '#d97706'};">
                 ${childMatch ? '✓ Saldo Kas Klop' : '⚠️ Selisih: ' + formatRupiah(childSatker.selisih)}
               </span>`,
              { direction: "top", offset: [0, -14], opacity: 0.95 }
            );

            childMarker.on("click", (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedWilayah(w);
              setSelectedSatker(childSatker);
              setExpandedSatkerId(childSatker.id);
            });

            markersRef.current.push(childMarker);
          });
        });
      }

      // 2. MODE TITIK SATKER INDIVIDUAL SE-NUSANTARA
      if (viewMode === "satker") {
        filteredSatkers.forEach((satker) => {
          const isMatch = satker.status === "match";
          const pinColor = isMatch ? "#10b981" : "#f59e0b";
          const pulseColor = isMatch ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)";

          const customIcon = L.divIcon({
            className: "custom-satker-marker",
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            html: `
              <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${pulseColor};"></div>
                <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background-color: white; border: 2.5px solid ${pinColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${pinColor};"></div>
                </div>
              </div>
            `,
          });

          const marker = L.marker([satker.lat, satker.lng], { icon: customIcon }).addTo(
            mapInstanceRef.current
          );

          marker.bindTooltip(
            `<strong>${satker.nama}</strong><br/><span style="font-size: 11px; color: ${isMatch ? '#059669' : '#d97706'};">${isMatch ? '✓ Saldo Kas Klop' : '⚠️ Selisih: ' + formatRupiah(satker.selisih)}</span>`,
            { direction: "top", offset: [0, -14], opacity: 0.95 }
          );

          marker.on("click", () => {
            setSelectedSatker(satker);
            setSelectedWilayah(null);
            mapInstanceRef.current.panTo([satker.lat, satker.lng], {
              animate: true,
              duration: 0.8,
            });
          });

          markersRef.current.push(marker);
        });
      }
    };

    renderLayers();
  }, [viewMode, filteredSatkers, filteredWilayah, selectedWilayah]);

  // Reset Center Map ke Indonesia
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-2.5, 118.0], 5, { animate: true });
      setSelectedSatker(null);
      setSelectedWilayah(null);
      setExpandedSatkerId(null);
    }
  };

  // Zoom ke Satker tertentu
  const handleFocusSatker = (lat: number, lng: number, satkerId: number | string) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 9, { animate: true, duration: 1 });
      setExpandedSatkerId(satkerId);
    }
  };

  // Satker dalam wilayah terpilih (dengan pencarian internal menu & filter eselon)
  const activeWilayahSatkers = useMemo(() => {
    if (!selectedWilayah) return [];
    const satkers = SATKER_INDONESIA_LIST.filter((s) =>
      selectedWilayah.satkerIds.includes(s.id) &&
      (filterEselon === "all" || matchEselon1(s.eselon1, filterEselon))
    );
    if (!searchWilayahSatker.trim()) return satkers;
    const q = searchWilayahSatker.toLowerCase();
    return satkers.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.kota.toLowerCase().includes(q) ||
        s.kode.toLowerCase().includes(q)
    );
  }, [selectedWilayah, searchWilayahSatker, filterEselon]);

  // Agregasi saldo untuk wilayah terpilih
  const selectedWilayahTotals = useMemo(() => {
    if (!selectedWilayah) return null;
    const satkers = SATKER_INDONESIA_LIST.filter((s) =>
      selectedWilayah.satkerIds.includes(s.id) &&
      (filterEselon === "all" || matchEselon1(s.eselon1, filterEselon))
    );
    const totalBuku = satkers.reduce((acc, s) => acc + s.saldoBuku, 0);
    const totalBank = satkers.reduce((acc, s) => acc + s.saldoBank, 0);
    const totalSelisih = satkers.reduce((acc, s) => acc + s.selisih, 0);
    const matchCount = satkers.filter((s) => s.status === "match").length;
    const selisihCount = satkers.filter((s) => s.status === "selisih").length;
    const compliancePercent = satkers.length
      ? Math.round((matchCount / satkers.length) * 100)
      : 100;
    return {
      totalBuku,
      totalBank,
      totalSelisih,
      matchCount,
      selisihCount,
      compliancePercent,
      totalSatker: satkers.length,
    };
  }, [selectedWilayah, filterEselon]);

  return (
    <div
      className={clsx(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all duration-300",
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "relative w-full"
      )}
    >
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E90FF]/10 text-[#1E90FF] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* Filter Toolbar & Switch Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch Mode: Lingkaran Wilayah Pengawasan vs Semua Penanda Satker */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                setViewMode("wilayah");
                setSelectedSatker(null);
              }}
              className={clsx(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                viewMode === "wilayah"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Tampilkan Lingkaran Wilayah Pengawasan"
            >
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              Lingkaran Wilayah
            </button>
            <button
              onClick={() => {
                setViewMode("satker");
                setSelectedWilayah(null);
              }}
              className={clsx(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5",
                viewMode === "satker"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Tampilkan Semua Penanda Satker Se-Nusantara"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Semua Penanda Satker
            </button>
          </div>

          {/* Search Satker / Wilayah */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={viewMode === "wilayah" ? "Cari wilayah / satker..." : "Cari satker / kota..."}
              value={searchSatker}
              onChange={(e) => setSearchSatker(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E90FF] w-40 sm:w-48 shadow-2xs"
            />
          </div>

          {/* Filter Eselon 1 */}
          {lockEselon1 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700 shadow-2xs" title="Terkunci pada unit Eselon 1 akun Anda">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{filterEselon}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentSelectEselonValue}
                onChange={(e) => setFilterEselon(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] shadow-2xs"
              >
                <option value="all">Semua Eselon 1</option>
                <option value="Ditjen Dikti">Ditjen Pendidikan Tinggi (Dikti)</option>
                <option value="Ditjen Vokasi">Ditjen Pendidikan Vokasi (Vokasi)</option>
                <option value="Setjen">Sekretariat Jenderal (Setjen)</option>
                <option value="Ditjen Risbang">Ditjen Riset & Pengembangan</option>
                <option value="Ditjen Saintek">Ditjen Sains & Teknologi</option>
                <option value="Itjen">Inspektorat Jenderal (Itjen)</option>
              </select>
            </div>
          )}

          {/* Filter Status Kas */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1E90FF] shadow-2xs"
            >
              <option value="all">Semua Status Kas</option>
              <option value="match">🟢 Saldo Klop (Match)</option>
              <option value="selisih">🟡 Ada Selisih Kas</option>
            </select>
          </div>

          {/* Tombol Reset Center */}
          <button
            onClick={handleResetCenter}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Reset Posisi Peta Indonesia"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Toggle Fullscreen Card */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title={isFullscreen ? "Kecilkan Tampilan" : "Perbesar Peta"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bar Statistik Ringkas Peta */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {viewMode === "wilayah" ? (
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Wilayah Pengawasan: <strong className="text-slate-900 font-bold">{stats.totalWilayah} Zona</strong> ({stats.totalSatker} Satker Binaan)
            </span>
          ) : (
            <span className="text-slate-500 font-medium">
              Total Terpetakan: <strong className="text-slate-800 font-bold">{stats.totalSatker} Satker</strong>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong>{stats.match}</strong> Satker Klop
          </span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <strong>{stats.selisih}</strong> Satker Selisih
          </span>
        </div>
        <div className="text-slate-500">
          Akumulasi Kas Bank Terpetakan: <strong className="text-slate-900 font-bold">{formatRupiah(stats.totalSaldo)}</strong>
        </div>
      </div>

      {/* Map View Container */}
      <div className="relative w-full h-[500px] md:h-[560px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Peta (Floating di Kiri Bawah) */}
        <div className="absolute left-4 bottom-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-md text-[11px] space-y-1.5 pointer-events-auto">
          <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
            {viewMode === "wilayah" ? "Legenda Pengawasan K/L" : "Status Rekonsiliasi"}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-slate-600">
              {viewMode === "wilayah" ? "Zona Saldo Klop 100%" : "Saldo Klop (Match 100%)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-slate-600">
              {viewMode === "wilayah" ? "Zona Ada Satker Selisih" : "Perlu Verifikasi / Selisih"}
            </span>
          </div>
          {viewMode === "wilayah" && (
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              *Klik lingkaran untuk bedah satker binaan & saldo
            </p>
          )}
        </div>

        {/* ============================================================== */}
        {/* MENU BARU: SLIDING DRAWER WILAYAH PENGAWASAN ESELON 1 (K/L)   */}
        {/* Menampilkan daftar satker yang diawasi & saldo masing-masing   */}
        {/* ============================================================== */}
        {selectedWilayah && selectedWilayahTotals && (
          <div className="absolute right-3 top-3 bottom-3 w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[520px] z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
            {/* Header Menu Wilayah */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200/80 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600 text-white shadow-2xs">
                    {selectedWilayah.kodeWilayah}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                    Pengawasan K/L
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {selectedWilayah.nama}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium text-slate-700">Satker Koordinator:</span> {selectedWilayah.satkerUtama}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-700">Eselon 1 Pengawas:</span> {selectedWilayah.eselon1}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedWilayah(null);
                  setExpandedSatkerId(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors shrink-0"
                title="Tutup Menu Pengawasan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Konten Scrollable Menu Wilayah */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Ringkasan Akumulasi Saldo Eselon 1 di Wilayah Ini */}
              <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    Total Saldo Konsolidasi Wilayah ({selectedWilayahTotals.totalSatker} Satker)
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-bold",
                      selectedWilayahTotals.totalSelisih === 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {selectedWilayahTotals.totalSelisih === 0
                      ? "100% Klop"
                      : `${selectedWilayahTotals.selisihCount} Satker Ada Selisih`}
                  </span>
                </div>

                {/* 3 Kotak Saldo Agregat */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Kas Bank
                    </span>
                    <p className="font-bold text-[#1E90FF] text-xs mt-0.5 truncate" title={formatRupiah(selectedWilayahTotals.totalBank)}>
                      {formatRupiah(selectedWilayahTotals.totalBank)}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Kas Buku BKU
                    </span>
                    <p className="font-bold text-slate-800 text-xs mt-0.5 truncate" title={formatRupiah(selectedWilayahTotals.totalBuku)}>
                      {formatRupiah(selectedWilayahTotals.totalBuku)}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Total Selisih
                    </span>
                    <p
                      className={clsx(
                        "font-bold text-xs mt-0.5 truncate",
                        selectedWilayahTotals.totalSelisih === 0 ? "text-emerald-600" : "text-amber-600"
                      )}
                      title={formatRupiah(selectedWilayahTotals.totalSelisih)}
                    >
                      {selectedWilayahTotals.totalSelisih === 0 ? "Rp 0 (Klop)" : formatRupiah(selectedWilayahTotals.totalSelisih)}
                    </p>
                  </div>
                </div>

                {/* Kepatuhan Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Tingkat Kepatuhan Rekonsiliasi</span>
                    <span className="font-bold text-slate-800">
                      {selectedWilayahTotals.matchCount} dari {selectedWilayahTotals.totalSatker} Satker Klop ({selectedWilayahTotals.compliancePercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${selectedWilayahTotals.compliancePercent}%` }}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${100 - selectedWilayahTotals.compliancePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Header List Satker & Filter Cepat */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-blue-600" />
                    Daftar Satker yang Diawasi Eselon 1 ({activeWilayahSatkers.length} Satker)
                  </h4>
                </div>

                {/* Search Satker di Wilayah ini */}
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Saring nama satker / kota di wilayah ini..."
                    value={searchWilayahSatker}
                    onChange={(e) => setSearchWilayahSatker(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* DAFTAR SATKER BINAAN DALAM WILAYAH TERSEBUT */}
                <div className="space-y-2.5">
                  {activeWilayahSatkers.map((satker) => {
                    const isMatch = satker.status === "match";
                    const isExpanded = expandedSatkerId === satker.id;

                    return (
                      <div
                        key={satker.id}
                        className={clsx(
                          "bg-white rounded-xl border transition-all duration-200 p-3 shadow-2xs hover:border-blue-300",
                          isExpanded ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200"
                        )}
                      >
                        {/* Baris Atas: Nama Satker & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                #{satker.kode}
                              </span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                {satker.eselon1}
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                              {satker.nama}
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {satker.kota}, {satker.provinsi}
                            </p>
                          </div>

                          {/* Badge Status */}
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center gap-1",
                              isMatch
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            )}
                          >
                            {isMatch ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Saldo Klop
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Selisih Kas
                              </>
                            )}
                          </span>
                        </div>

                        {/* Baris Tengah: Rincian Saldo Satker Tersebut */}
                        <div className="mt-2.5 grid grid-cols-3 gap-1.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                              Saldo Kas Buku
                            </span>
                            <span className="font-bold text-slate-800 truncate block">
                              {formatRupiah(satker.saldoBuku)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                              Saldo Kas Bank
                            </span>
                            <span className="font-bold text-blue-600 truncate block">
                              {formatRupiah(satker.saldoBank)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block">
                              Selisih
                            </span>
                            <span
                              className={clsx(
                                "font-bold truncate block",
                                isMatch ? "text-emerald-600" : "text-amber-600"
                              )}
                            >
                              {isMatch ? "Rp 0" : formatRupiah(satker.selisih)}
                            </span>
                          </div>
                        </div>

                        {/* Baris Aksi: Accordion Bukti Dokumen & Tombol Fokus Peta */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setExpandedSatkerId(isExpanded ? null : satker.id)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>Bukti Dokumen ({satker.dokumenList.length})</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleFocusSatker(satker.lat, satker.lng, satker.id)}
                            className="px-2 py-1 text-[10px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                            title="Arahkan Peta ke Satker Ini"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            Fokus di Peta
                          </button>
                        </div>

                        {/* Accordion Dokumen yang Terbuka */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-blue-100 space-y-1.5 animate-in fade-in duration-150">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Berkas Dokumen Pendukung Satker:
                            </span>
                            {satker.dokumenList.map((dok, dIdx) => (
                              <div
                                key={dIdx}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-[11px]"
                              >
                                <div className="min-w-0 flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <div className="truncate">
                                    <p className="font-semibold text-slate-800 truncate">
                                      {dok.nama}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {dok.kategori} &bull; {dok.tanggal}
                                    </p>
                                  </div>
                                </div>
                                <span
                                  className={clsx(
                                    "px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0",
                                    dok.status === "Terverifikasi"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  )}
                                >
                                  {dok.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Menu Wilayah */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Zona Pengawasan K/L &bull; {selectedWilayah.kodeWilayah}
              </span>
              <button
                onClick={() => {
                  setSelectedWilayah(null);
                  setExpandedSatkerId(null);
                }}
                className="py-1 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition-colors shadow-2xs"
              >
                Tutup Menu
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* FLOATING MINI CARD (Saat Pin Satker Individual Diklik di mode Satker) */}
        {/* ============================================================== */}
        {selectedSatker && (
          <div className="absolute right-4 top-4 bottom-4 w-full max-w-[340px] sm:max-w-[370px] z-30 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-auto">
            {/* Header Mini Card */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-start justify-between gap-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 mb-1">
                  KODE #{selectedSatker.kode}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {selectedSatker.nama}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {selectedSatker.kota}, {selectedSatker.provinsi}
                </p>
              </div>
              <button
                onClick={() => setSelectedSatker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten Mini Card */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
              {/* Unit Eselon 1 Pembina */}
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Unit Pembina</span>
                <span className="font-semibold text-slate-800">{selectedSatker.eselon1}</span>
              </div>

              {/* Status Rekonsiliasi Badge */}
              <div
                className={clsx(
                  "p-3 rounded-xl border flex items-center justify-between",
                  selectedSatker.status === "match"
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-amber-50/70 border-amber-200 text-amber-800"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedSatker.status === "match" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <div>
                    <p className="font-bold text-xs leading-none">
                      {selectedSatker.status === "match" ? "Rekonsiliasi Klop" : "Ada Selisih Kas"}
                    </p>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {selectedSatker.status === "match"
                        ? "Buku & Bank klop 100%"
                        : `Selisih: ${formatRupiah(selectedSatker.selisih)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ringkasan Saldo Kas & Bank */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Saldo Kas BKU
                  </span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                    {formatRupiah(selectedSatker.saldoBuku)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Saldo Rek. Koran
                  </span>
                  <p className="font-bold text-[#1E90FF] text-xs mt-0.5 truncate">
                    {formatRupiah(selectedSatker.saldoBank)}
                  </p>
                </div>
              </div>

              {/* Berkas & Dokumen Terakhir */}
              <div>
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                  Bukti Dokumen Terakhir ({selectedSatker.dokumenList.length})
                </span>
                <div className="space-y-1.5">
                  {selectedSatker.dokumenList.map((dok, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 text-[11px] truncate">
                            {dok.nama}
                          </p>
                          <p className="text-[10px] text-slate-400">{dok.tanggal}</p>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          "px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0",
                          dok.status === "Terverifikasi"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}
                      >
                        {dok.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2">
              <button
                onClick={() => setSelectedSatker(null)}
                className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
