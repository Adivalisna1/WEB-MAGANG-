/* ==========================================================================
   FINSIGHT REPORTING SUITE - INTERACTIVE LOGIC & CONTROLLER
   Aplikasi Pelaporan & Verifikasi Dokumen Keuangan Instansi Pemerintah
   Role: STAFF
   ========================================================================== */

// --- 1. DATA MASTER AWAL (Authentic Government Reporting Data) ---
const INITIAL_DOCUMENTS = [
  {
    id: "DOC-2025-001",
    code: "LKjIP/2025/001",
    title: "Laporan Kinerja Instansi Pemerintah (LKjIP) Tahunan 2024",
    category: "LKjIP",
    year: "2024",
    period: "Tahunan",
    fileType: "pdf",
    fileName: "LKjIP_Final_Audited_2024.pdf",
    fileSize: "6.8 MB",
    status: "revisi",
    statusLabel: "Perlu Perbaikan",
    submitDate: "03 Okt 2026, 09:30",
    revisionBy: "Pimpinan (Dr. Ir. Hendra Gunawan, M.Si.)",
    revisionDate: "05 Okt 2026, 14:15",
    revisionNote: "Perbaiki Bab 3: Matriks Capaian Kinerja Sasaran Program 2 belum menyertakan data triwulan IV tahun anggaran 2024. Mohon periksa kembali lampiran neraca saldo.",
    step: 2, // 1: Staff, 2: Pimpinan, 3: Eselon 1, 4: Selesai
  },
  {
    id: "DOC-2025-002",
    code: "RENSTRA/2025/008",
    title: "Rencana Strategis (Renstra) Revisi Jangka Menengah 2025–2029",
    category: "Renstra",
    year: "2025",
    period: "Semester 1",
    fileType: "pdf",
    fileName: "Renstra_Revisi_2025_2029_v2.pdf",
    fileSize: "8.4 MB",
    status: "revisi",
    statusLabel: "Perlu Perbaikan",
    submitDate: "01 Okt 2026, 11:20",
    revisionBy: "Eselon 1 (Sekretaris Jenderal)",
    revisionDate: "04 Okt 2026, 16:40",
    revisionNote: "Penyesuaian target IKU 3 (Indeks Reformasi Birokrasi) sesuai instruksi Menteri PAN-RB nomor B/128/2026.",
    step: 3,
  },
  {
    id: "DOC-2025-003",
    code: "RENJA/2026/012",
    title: "Rencana Kerja (Renja) Satuan Kerja Anggaran Tahun 2026",
    category: "Renja",
    year: "2026",
    period: "Tahunan",
    fileType: "docx",
    fileName: "Renja_Satker_Pusat_2026.docx",
    fileSize: "4.2 MB",
    status: "eselon",
    statusLabel: "Menunggu Eselon 1",
    submitDate: "02 Okt 2026, 15:45",
    revisionBy: null,
    revisionNote: null,
    step: 3,
  },
  {
    id: "DOC-2025-004",
    code: "LAKIP/2025/003",
    title: "Laporan Akuntabilitas Kinerja Instansi Triwulan III",
    category: "LAKIP",
    year: "2025",
    period: "Triwulan 3",
    fileType: "pdf",
    fileName: "LAKIP_TW3_2025_Official.pdf",
    fileSize: "5.1 MB",
    status: "pimpinan",
    statusLabel: "Menunggu Pimpinan",
    submitDate: "04 Okt 2026, 10:00",
    revisionBy: null,
    revisionNote: null,
    step: 2,
  },
  {
    id: "DOC-2025-005",
    code: "PK/2025/019",
    title: "Perjanjian Kinerja Pejabat Pembuat Komitmen (PPK) 2025",
    category: "PK",
    year: "2025",
    period: "Semester 2",
    fileType: "pdf",
    fileName: "PK_PPK_Wilayah_Satu_2025.pdf",
    fileSize: "2.8 MB",
    status: "selesai",
    statusLabel: "Selesai",
    submitDate: "28 Sep 2026, 13:10",
    revisionBy: null,
    revisionNote: null,
    step: 4,
  },
  {
    id: "DOC-2025-006",
    code: "RKT/2025/005",
    title: "Rencana Kinerja Tahunan (RKT) Subbagian Keuangan 2025",
    category: "RKT",
    year: "2025",
    period: "Tahunan",
    fileType: "xlsx",
    fileName: "RKT_Keuangan_2025_Final.xlsx",
    fileSize: "3.5 MB",
    status: "selesai",
    statusLabel: "Selesai",
    submitDate: "25 Sep 2026, 08:30",
    revisionBy: null,
    revisionNote: null,
    step: 4,
  },
  {
    id: "DOC-2025-007",
    code: "IKU/2025/002",
    title: "Pengukuran Capaian Indikator Kinerja Utama (IKU) Semester 1",
    category: "IKU",
    year: "2025",
    period: "Semester 1",
    fileType: "xlsx",
    fileName: "Matriks_IKU_Semester_1_2025.xlsx",
    fileSize: "4.7 MB",
    status: "draft",
    statusLabel: "Draft",
    submitDate: "05 Okt 2026, 16:00",
    revisionBy: null,
    revisionNote: null,
    step: 1,
  },
  {
    id: "DOC-2024-041",
    code: "LKjIP/2024/022",
    title: "Laporan Realisasi Anggaran dan Kinerja Tahun 2023 (Arsip)",
    category: "LKjIP",
    year: "2024",
    period: "Tahunan",
    fileType: "pdf",
    fileName: "LKjIP_Arsip_2023.pdf",
    fileSize: "7.1 MB",
    status: "arsip",
    statusLabel: "Diarsipkan",
    submitDate: "12 Des 2024, 11:00",
    revisionBy: null,
    revisionNote: null,
    step: 4,
  }
];

// Data Dummy Pencatatan Transaksi Keuangan
const INITIAL_PENCATATAN = [
  { id: "TRX-001", date: "05 Okt 2026", spm: "SPM-2026/09/0142", desc: "Belanja Bahan Operasional Pengelolaan Laporan Keuangan", mak: "521211", type: "Debet", amount: 4850000, status: "Tercatat" },
  { id: "TRX-002", date: "04 Okt 2026", spm: "SPM-2026/09/0141", desc: "Honorarium Tim Verifikasi Dokumen Kinerja Triwulan III", mak: "521213", type: "Debet", amount: 12600000, status: "Tercatat" },
  { id: "TRX-003", date: "03 Okt 2026", spm: "SP2D-2026/10/0088", desc: "Penerimaan Pengembalian Belanja Perjalanan Dinas", mak: "425719", type: "Kredit", amount: 1750000, status: "Tercatat" },
  { id: "TRX-004", date: "02 Okt 2026", spm: "SPM-2026/09/0140", desc: "Belanja Sewa Cloud Server Repository Laporan FinSight", mak: "522141", type: "Debet", amount: 8900000, status: "Menunggu Rekon" },
  { id: "TRX-005", date: "01 Okt 2026", spm: "SPM-2026/09/0139", desc: "Pengadaan Alat Tulis Kantor & Kertas Kerja Cetak", mak: "521811", type: "Debet", amount: 3420000, status: "Tercatat" }
];

// Data Dummy Rekening Koran Bank Persepsi (BNI Giro Pemerintah)
const INITIAL_REKENING_KORAN = [
  { id: "RK-01", date: "05 Okt 2026", ref: "BNI-TRF-99210", desc: "TRF KPPN SP2D BELANJA PEGAWAI & OPERASIONAL", debit: 0, credit: 126000000, balance: 412500000, status: "Cocok" },
  { id: "RK-02", date: "04 Okt 2026", ref: "BNI-WDR-88190", desc: "PENCAIRAN CEK TUNAI UANG PERSEDIAAN (UP)", debit: 25000000, credit: 0, balance: 286500000, status: "Cocok" },
  { id: "RK-03", date: "03 Okt 2026", ref: "BNI-TRF-77402", desc: "PEMBAYARAN VENDOR TI INFRASTRUKTUR CLOUD", debit: 8900000, credit: 0, balance: 311500000, status: "Belum Dicocokkan" },
  { id: "RK-04", date: "02 Okt 2026", ref: "BNI-INT-11002", desc: "JASA GIRO BULAN SEPTEMBER 2026", debit: 0, credit: 845000, balance: 320400000, status: "Cocok" },
  { id: "RK-05", date: "01 Okt 2026", ref: "BNI-TAX-44910", desc: "PAJAK BUNGA GIRO & ADM BULANAN", debit: 169000, credit: 0, balance: 319555000, status: "Selisih" }
];

// State Aplikasi
let documentsData = [...INITIAL_DOCUMENTS];
let pencatatanData = [...INITIAL_PENCATATAN];
let rekeningData = [...INITIAL_REKENING_KORAN];
let currentTableState = "normal"; // normal | skeleton | empty | error
let selectedCategoryFilter = "all";
let selectedStatusFilter = "all";
let searchQuery = "";
let unreadNotificationCount = 3;

// --- 2. INITIALIZATION ON DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initViewportSimulator();
  initNavigation();
  initSidebar();
  initSearch();
  initDropzone();
  initModals();
  initNotificationPopover();
  initProfilePage();
  initPencatatanPage();
  initRekeningPage();
  renderDocumentsTable();
  renderSummaryStats();
  renderPencatatanTable();
  renderRekeningTable();
});

// --- 3. THEME TOGGLE (LIGHT & DARK MODE) ---
function initTheme() {
  const savedTheme = localStorage.getItem("finsight_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButtonUI(savedTheme);

  const toggleBtns = document.querySelectorAll(".btn-toggle-theme");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const nextTheme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("finsight_theme", nextTheme);
      updateThemeButtonUI(nextTheme);
      showToast("info", `Mode tampilan dialihkan ke: ${nextTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}`);
    });
  });
}

function updateThemeButtonUI(theme) {
  const iconSpan = document.getElementById("themeIconSpan");
  const textSpan = document.getElementById("themeTextSpan");
  if (theme === "dark") {
    if (iconSpan) iconSpan.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
    if (textSpan) textSpan.textContent = "Mode Terang";
  } else {
    if (iconSpan) iconSpan.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    if (textSpan) textSpan.textContent = "Mode Gelap";
  }
}

// --- 4. VIEWPORT SIMULATOR (Desktop 1440px / Tablet 768px / Mobile 390px / Fluid) ---
function initViewportSimulator() {
  const container = document.getElementById("appViewportContainer");
  const buttons = document.querySelectorAll(".viewport-btn");
  const badgeText = document.getElementById("viewportBadgeText");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const mode = btn.dataset.viewport;
      container.className = "app-viewport-container";

      if (mode === "desktop") {
        container.classList.add("frame-desktop");
        if (badgeText) badgeText.textContent = "Desktop 1440px";
      } else if (mode === "tablet") {
        container.classList.add("frame-tablet");
        if (badgeText) badgeText.textContent = "Tablet 768px";
      } else if (mode === "mobile") {
        container.classList.add("frame-mobile");
        if (badgeText) badgeText.textContent = "Mobile 390px";
      } else {
        container.classList.add("frame-fluid");
        if (badgeText) badgeText.textContent = "Layar Penuh (100%)";
      }
    });
  });
}

// --- 5. SIDEBAR & MOBILE DRAWER ---
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const backdrop = document.getElementById("mobileBackdrop");

  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      sidebar.classList.add("mobile-open");
      if (backdrop) backdrop.classList.add("active");
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    });
  }
}

// --- 6. PAGE NAVIGATION & ROUTING ---
function initNavigation() {
  const navItems = document.querySelectorAll("[data-nav-target]");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetViewId = item.dataset.navTarget;
      navigateToPage(targetViewId);

      // Close mobile drawer on navigation
      const sidebar = document.getElementById("sidebar");
      const backdrop = document.getElementById("mobileBackdrop");
      if (sidebar) sidebar.classList.remove("mobile-open");
      if (backdrop) backdrop.classList.remove("active");
    });
  });

  // Action Banner Amber: "Lihat Dokumen Revisi"
  const btnLihatRevisi = document.getElementById("btnLihatRevisi");
  if (btnLihatRevisi) {
    btnLihatRevisi.addEventListener("click", () => {
      navigateToPage("page-dokumen");
      const statusSelect = document.getElementById("filterStatus");
      if (statusSelect) {
        statusSelect.value = "revisi";
        selectedStatusFilter = "revisi";
        renderDocumentsTable();
        showToast("warning", "Tabel difilter: Hanya menampilkan dokumen yang Perlu Perbaikan.");
      }
    });
  }
}

function navigateToPage(pageId) {
  // Update view containers
  const pages = document.querySelectorAll(".view-page");
  pages.forEach(p => p.classList.remove("active-view"));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active-view");
  }

  // Update nav active classes
  const navItems = document.querySelectorAll("[data-nav-target]");
  navItems.forEach(item => {
    if (item.dataset.navTarget === pageId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Update Breadcrumb & Page Title
  const breadcrumbText = document.getElementById("breadcrumbActive");
  const pageTitleHeading = document.getElementById("pageTitleHeading");

  const titlesMap = {
    "page-dokumen": { breadcrumb: "Dokumen", heading: "Manajemen Dokumen Keuangan" },
    "page-pencatatan": { breadcrumb: "Pencatatan", heading: "Buku Pembukuan & Pencatatan Transaksi" },
    "page-rekening": { breadcrumb: "Rekening Koran", heading: "Rekonsiliasi Bank Persepsi Instansi" },
    "page-profil": { breadcrumb: "Profil Pegawai", heading: "Pengaturan Akun & Keamanan Staff" },
    "page-components": { breadcrumb: "Component Library", heading: "Design System & UI Components Showcase" },
    "page-error": { breadcrumb: "Error 500", heading: "Terjadi Kesalahan Sistem" }
  };

  if (titlesMap[pageId]) {
    if (breadcrumbText) breadcrumbText.textContent = titlesMap[pageId].breadcrumb;
    if (pageTitleHeading) pageTitleHeading.textContent = titlesMap[pageId].heading;
  }
}

// --- 7. TABEL DOKUMEN RENDERING & STATE SWITCHING ---
function renderDocumentsTable() {
  const tbody = document.getElementById("documentsTableBody");
  const stateContainer = document.getElementById("tableStateContainer");
  if (!tbody || !stateContainer) return;

  // Filter Data
  let filtered = documentsData.filter(doc => {
    const matchesCategory = selectedCategoryFilter === "all" || doc.category === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === "all" || doc.status === selectedStatusFilter;
    const matchesSearch = searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Handle Switchable States
  if (currentTableState === "skeleton") {
    tbody.innerHTML = `
      ${[1, 2, 3, 4].map(() => `
        <tr>
          <td>
            <div style="display:flex; gap:12px; align-items:center;">
              <div class="skeleton" style="width:36px; height:36px; border-radius:8px;"></div>
              <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
                <div class="skeleton skeleton-title" style="width:40%; height:14px;"></div>
                <div class="skeleton skeleton-text" style="width:75%; height:13px;"></div>
              </div>
            </div>
          </td>
          <td><div class="skeleton skeleton-pill" style="width:60px;"></div></td>
          <td><div class="skeleton skeleton-text" style="width:80px;"></div></td>
          <td><div class="skeleton skeleton-pill" style="width:110px;"></div></td>
          <td><div class="skeleton skeleton-text" style="width:90px;"></div></td>
          <td><div class="skeleton" style="width:70px; height:30px; border-radius:6px;"></div></td>
        </tr>
      `).join("")}
    `;
    return;
  }

  if (currentTableState === "empty" || filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state-box">
            <div class="empty-state-illustration">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            </div>
            <h4 class="empty-state-title">Belum Ada Pengajuan Dokumen</h4>
            <p class="empty-state-desc">Tidak ditemukan dokumen laporan yang sesuai dengan filter atau kata kunci yang dipilih. Anda dapat mengunggah berkas laporan baru sekarang.</p>
            <button class="btn btn-primary btn-md" onclick="openUploadModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Unggah Dokumen Baru
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  if (currentTableState === "error") {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="error-state-box">
            <div class="error-icon-box">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h4 class="empty-state-title" style="color:var(--color-danger);">Gagal Memuat Data Pengajuan</h4>
            <p class="empty-state-desc">Terjadi kendala saat menghubungkan ke basis data laporan instansi (HTTP 503 Service Unavailable). Silakan klik tombol muat ulang di bawah.</p>
            <button class="btn btn-secondary btn-md" onclick="setTableState('normal')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Coba Muat Ulang
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Normal State Rendering
  tbody.innerHTML = filtered.map(doc => {
    // Icon badge type
    let iconClass = "doc-pdf";
    let iconLabel = "PDF";
    if (doc.fileType === "xlsx" || doc.fileType === "xls") {
      iconClass = "doc-xls";
      iconLabel = "XLS";
    } else if (doc.fileType === "docx" || doc.fileType === "doc") {
      iconClass = "doc-word";
      iconLabel = "DOC";
    }

    // Status Badge Class
    let badgeClass = "badge-draft";
    if (doc.status === "pimpinan") badgeClass = "badge-pimpinan";
    if (doc.status === "eselon") badgeClass = "badge-eselon";
    if (doc.status === "selesai") badgeClass = "badge-selesai";
    if (doc.status === "revisi") badgeClass = "badge-revisi";
    if (doc.status === "arsip") badgeClass = "badge-arsip";

    return `
      <tr>
        <td>
          <div class="doc-cell">
            <div class="doc-icon-box ${iconClass}">
              <span style="font-size:10px; font-weight:800;">${iconLabel}</span>
            </div>
            <div style="display:flex; flex-direction:column;">
              <span class="doc-code-pill">${doc.code}</span>
              <a href="javascript:void(0)" onclick="openDetailModal('${doc.id}')" class="doc-title-text">${doc.title}</a>
              ${doc.status === "revisi" ? `
                <div class="doc-revision-note-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Catatan: ${doc.revisionNote ? doc.revisionNote.substring(0, 48) + '...' : 'Perlu perbaikan berkas'}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </td>
        <td><span class="category-pill">${doc.category}</span></td>
        <td>
          <div style="display:flex; flex-direction:column;">
            <span style="font-weight:600; font-size:13px;">${doc.year}</span>
            <span style="font-size:11.5px; color:var(--text-muted);">${doc.period}</span>
          </div>
        </td>
        <td>
          <span class="status-badge ${badgeClass}">
            <span class="dot"></span>
            ${doc.statusLabel}
          </span>
        </td>
        <td>
          <span style="font-size:12.5px; color:var(--text-muted);">${doc.submitDate}</span>
        </td>
        <td>
          <div class="actions-group">
            ${doc.status === "revisi" ? `
              <button class="btn btn-sm btn-outline warning" style="color:var(--status-revisi-dot); border-color:var(--status-revisi-border); background:var(--status-revisi-bg);" onclick="openEditRevisiModal('${doc.id}')" title="Edit & Perbaiki Dokumen">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Perbaiki
              </button>
            ` : doc.status === "draft" ? `
              <button class="btn btn-sm btn-primary" onclick="submitDraftForVerification('${doc.id}')" title="Kirim ke Pimpinan untuk diverifikasi">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Kirim
              </button>
            ` : ''}
            <button class="btn-action-icon primary" onclick="openDetailModal('${doc.id}')" title="Lihat Detail & Alur Verifikasi">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
            <button class="btn-action-icon" onclick="downloadDocumentFile('${doc.fileName}')" title="Unduh Berkas">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  const entriesInfo = document.getElementById("tableEntriesInfo");
  if (entriesInfo) {
    entriesInfo.textContent = `Menampilkan ${filtered.length} dari ${documentsData.length} dokumen`;
  }
}

// Function to switch table view states via pill buttons
window.setTableState = function(state) {
  currentTableState = state;
  const pills = document.querySelectorAll(".state-pill-btn");
  pills.forEach(p => {
    if (p.dataset.state === state) p.classList.add("active");
    else p.classList.remove("active");
  });
  renderDocumentsTable();
};

// --- 8. STATS SUMMARY RENDERING ---
function renderSummaryStats() {
  const total = documentsData.length;
  const selesai = documentsData.filter(d => d.status === "selesai").length;
  const revisi = documentsData.filter(d => d.status === "revisi").length;
  const pimpinan = documentsData.filter(d => d.status === "pimpinan").length;
  const eselon = documentsData.filter(d => d.status === "eselon").length;
  const draft = documentsData.filter(d => d.status === "draft").length;
  const menungguTotal = pimpinan + eselon;

  // Update Hero Counter
  const totalHero = document.getElementById("statTotalHero");
  if (totalHero) totalHero.textContent = total;

  // Counts
  const countSelesai = document.getElementById("countSelesai");
  const countRevisi = document.getElementById("countRevisi");
  const countMenunggu = document.getElementById("countMenunggu");
  const countDraft = document.getElementById("countDraft");

  if (countSelesai) countSelesai.textContent = selesai;
  if (countRevisi) countRevisi.textContent = revisi;
  if (countMenunggu) countMenunggu.textContent = menungguTotal;
  if (countDraft) countDraft.textContent = draft;

  // Progress bar percentages
  const pctSelesai = total > 0 ? (selesai / total) * 100 : 0;
  const pctRevisi = total > 0 ? (revisi / total) * 100 : 0;
  const pctMenunggu = total > 0 ? (menungguTotal / total) * 100 : 0;
  const pctDraft = total > 0 ? (draft / total) * 100 : 0;

  const barSelesai = document.getElementById("barSelesai");
  const barRevisi = document.getElementById("barRevisi");
  const barMenunggu = document.getElementById("barMenunggu");
  const barDraft = document.getElementById("barDraft");

  if (barSelesai) barSelesai.style.width = `${pctSelesai}%`;
  if (barRevisi) barRevisi.style.width = `${pctRevisi}%`;
  if (barMenunggu) barMenunggu.style.width = `${pctMenunggu}%`;
  if (barDraft) barDraft.style.width = `${pctDraft}%`;

  // Amber Banner revision count update
  const revisionBannerCount = document.getElementById("revisionBannerCount");
  if (revisionBannerCount) revisionBannerCount.textContent = revisi;
}

// --- 9. GLOBAL SEARCH & TABLE FILTERS ---
function initSearch() {
  const globalSearch = document.getElementById("globalSearchInput");
  const tableSearch = document.getElementById("tableSearchInput");
  const filterCat = document.getElementById("filterCategory");
  const filterStat = document.getElementById("filterStatus");

  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      if (tableSearch) tableSearch.value = searchQuery;
      navigateToPage("page-dokumen");
      renderDocumentsTable();
    });
  }

  if (tableSearch) {
    tableSearch.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      if (globalSearch) globalSearch.value = searchQuery;
      renderDocumentsTable();
    });
  }

  if (filterCat) {
    filterCat.addEventListener("change", (e) => {
      selectedCategoryFilter = e.target.value;
      renderDocumentsTable();
    });
  }

  if (filterStat) {
    filterStat.addEventListener("change", (e) => {
      selectedStatusFilter = e.target.value;
      renderDocumentsTable();
    });
  }

  // Keyboard shortcut Ctrl+K or Cmd+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (globalSearch) globalSearch.focus();
    }
  });
}

// --- 10. DRAG & DROP ZONE LOGIC ---
let selectedTempFile = null;

function initDropzone() {
  const dropzone = document.getElementById("quickDropzone");
  const fileInput = document.getElementById("quickFileInput");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFilesSelected(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("drag-over");
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("drag-over");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files.length > 0) {
      handleFilesSelected(dt.files[0]);
    }
  });
}

function handleFilesSelected(file) {
  // Validate File Extension & Size (max 10MB)
  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
  const ext = file.name.split('.').pop().toLowerCase();
  const maxBytes = 10 * 1024 * 1024; // 10MB

  if (!allowedExtensions.includes(ext)) {
    showToast("error", `Format file .${ext} tidak didukung. Harap unggah PDF, DOC, DOCX, XLS, atau XLSX.`);
    return;
  }

  if (file.size > maxBytes) {
    showToast("error", `Ukuran berkas melebihi batas 10MB (${(file.size / (1024*1024)).toFixed(1)} MB).`);
    return;
  }

  selectedTempFile = file;
  const previewBox = document.getElementById("quickFilePreviewBox");
  const fileNameText = document.getElementById("quickFileName");
  const fileSizeText = document.getElementById("quickFileSize");

  if (previewBox && fileNameText && fileSizeText) {
    fileNameText.textContent = file.name;
    fileSizeText.textContent = `${(file.size / (1024*1024)).toFixed(2)} MB • Siap dilampirkan`;
    previewBox.style.display = "flex";
  }

  showToast("success", `Berkas "${file.name}" berhasil dipilih. Klik "Buka Form Upload" untuk melengkapi data.`);
}

window.removeQuickFile = function(e) {
  if (e) e.stopPropagation();
  selectedTempFile = null;
  const previewBox = document.getElementById("quickFilePreviewBox");
  const fileInput = document.getElementById("quickFileInput");
  if (previewBox) previewBox.style.display = "none";
  if (fileInput) fileInput.value = "";
  showToast("info", "Lampiran berkas dibatalkan.");
};

// --- 11. MODAL UPLOAD DOKUMEN (FULL WORKFLOW) ---
function initModals() {
  // Backdrop close
  const modals = document.querySelectorAll(".modal-backdrop");
  modals.forEach(m => {
    m.addEventListener("click", (e) => {
      if (e.target === m) {
        m.classList.remove("active");
      }
    });
  });

  // Modal Upload Form Validation & Submit
  const uploadForm = document.getElementById("formUploadDokumen");
  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      executeUploadProcess();
    });
  }

  // Modal Edit Revisi Form Submit
  const editRevisiForm = document.getElementById("formEditRevisi");
  if (editRevisiForm) {
    editRevisiForm.addEventListener("submit", (e) => {
      e.preventDefault();
      executeEditRevisiProcess();
    });
  }
}

window.openUploadModal = function() {
  const modal = document.getElementById("modalUploadDokumen");
  if (!modal) return;

  // Pre-fill file if already dropped
  if (selectedTempFile) {
    const modalFileDisplay = document.getElementById("modalSelectedFileDisplay");
    if (modalFileDisplay) {
      modalFileDisplay.textContent = `Berkas Terpilih: ${selectedTempFile.name} (${(selectedTempFile.size / (1024*1024)).toFixed(2)} MB)`;
      modalFileDisplay.style.display = "block";
    }
  }

  modal.classList.add("active");
};

window.closeUploadModal = function() {
  const modal = document.getElementById("modalUploadDokumen");
  if (modal) modal.classList.remove("active");
};

function executeUploadProcess() {
  const kategori = document.getElementById("uploadKategori").value;
  const judul = document.getElementById("uploadJudul").value.trim();
  const tahun = document.getElementById("uploadTahun").value;
  const periode = document.getElementById("uploadPeriode").value;
  const progressBox = document.getElementById("uploadProgressContainer");
  const progressBar = document.getElementById("uploadProgressBar");
  const progressPercent = document.getElementById("uploadProgressPercent");
  const btnSubmit = document.getElementById("btnSubmitUpload");

  if (!kategori || !judul || !tahun) {
    showToast("error", "Harap isi semua kolom wajib bertanda bintang (*).");
    return;
  }

  // Disable button and show progress animation
  if (btnSubmit) btnSubmit.disabled = true;
  if (progressBox) progressBox.classList.add("active");

  let progress = 0;
  const interval = setInterval(() => {
    progress += 20;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        // Create new document in memory
        const newDocId = `DOC-2026-${String(documentsData.length + 1).padStart(3, '0')}`;
        const newCode = `${kategori}/${tahun}/${String(documentsData.length + 1).padStart(3, '0')}`;
        const fileName = selectedTempFile ? selectedTempFile.name : `${kategori}_${tahun}_Pengajuan.pdf`;

        const newDoc = {
          id: newDocId,
          code: newCode,
          title: judul,
          category: kategori,
          year: tahun,
          period: periode,
          fileType: fileName.split('.').pop().toLowerCase() || "pdf",
          fileName: fileName,
          fileSize: selectedTempFile ? `${(selectedTempFile.size / (1024*1024)).toFixed(1)} MB` : "4.5 MB",
          status: "pimpinan",
          statusLabel: "Menunggu Pimpinan",
          submitDate: "Hari ini, Baru saja",
          revisionBy: null,
          revisionNote: null,
          step: 2
        };

        documentsData.unshift(newDoc);
        renderDocumentsTable();
        renderSummaryStats();

        // Reset and close
        if (progressBox) progressBox.classList.remove("active");
        if (progressBar) progressBar.style.width = "0%";
        if (btnSubmit) btnSubmit.disabled = false;
        closeUploadModal();
        removeQuickFile();
        document.getElementById("formUploadDokumen").reset();

        showToast("success", `Dokumen "${judul}" berhasil diunggah dan dikirim ke Pimpinan untuk verifikasi.`);
      }, 400);
    }
  }, 120);
}

// --- 12. MODAL EDIT & REVISI DOKUMEN ---
let editingDocumentId = null;

window.openEditRevisiModal = function(docId) {
  const doc = documentsData.find(d => d.id === docId);
  if (!doc) return;

  editingDocumentId = docId;
  const modal = document.getElementById("modalEditRevisi");
  if (!modal) return;

  // Fill revision banner
  document.getElementById("revisiNoteTitle").textContent = `Catatan dari: ${doc.revisionBy || 'Pimpinan'}`;
  document.getElementById("revisiNoteBody").textContent = doc.revisionNote || 'Mohon sesuaikan lampiran dokumen sesuai petunjuk.';
  document.getElementById("editJudul").value = doc.title;
  document.getElementById("editKategori").value = doc.category;
  document.getElementById("editTahun").value = doc.year;
  document.getElementById("editPeriode").value = doc.period;
  document.getElementById("editExistingFile").textContent = `Berkas saat ini: ${doc.fileName} (${doc.fileSize})`;

  modal.classList.add("active");
};

window.closeEditRevisiModal = function() {
  const modal = document.getElementById("modalEditRevisi");
  if (modal) modal.classList.remove("active");
  editingDocumentId = null;
};

function executeEditRevisiProcess() {
  if (!editingDocumentId) return;

  const doc = documentsData.find(d => d.id === editingDocumentId);
  if (!doc) return;

  const judulBaru = document.getElementById("editJudul").value.trim();
  const catatanStaff = document.getElementById("editCatatanStaff").value.trim();

  // Update status back to 'pimpinan'
  doc.title = judulBaru;
  doc.status = "pimpinan";
  doc.statusLabel = "Menunggu Pimpinan";
  doc.submitDate = "Hari ini, Baru saja (Revisi)";
  doc.step = 2;

  renderDocumentsTable();
  renderSummaryStats();
  closeEditRevisiModal();

  showToast("success", `Perbaikan dokumen "${doc.code}" berhasil disimpan dan diajukan ulang ke Pimpinan.`);
}

// Submit draft directly
window.submitDraftForVerification = function(docId) {
  const doc = documentsData.find(d => d.id === docId);
  if (!doc) return;

  doc.status = "pimpinan";
  doc.statusLabel = "Menunggu Pimpinan";
  doc.step = 2;
  renderDocumentsTable();
  renderSummaryStats();

  showToast("success", `Dokumen "${doc.title}" berhasil dikirim ke Pimpinan untuk verifikasi tahap 1.`);
};

// --- 13. DETAIL DOKUMEN & STEPPER / TIMELINE ALUR ---
window.openDetailModal = function(docId) {
  const doc = documentsData.find(d => d.id === docId);
  if (!doc) return;

  const modal = document.getElementById("modalDetailDokumen");
  if (!modal) return;

  document.getElementById("detailDocCode").textContent = doc.code;
  document.getElementById("detailDocTitle").textContent = doc.title;
  document.getElementById("detailDocMeta").textContent = `${doc.category} • Tahun Anggaran ${doc.year} (${doc.period}) • ${doc.fileName} (${doc.fileSize})`;

  // Render Stepper nodes
  const step1 = document.getElementById("stepperStep1");
  const step2 = document.getElementById("stepperStep2");
  const step3 = document.getElementById("stepperStep3");
  const step4 = document.getElementById("stepperStep4");

  // Reset
  [step1, step2, step3, step4].forEach(s => {
    s.className = "stepper-item";
  });

  if (doc.status === "draft") {
    step1.classList.add("current");
  } else if (doc.status === "pimpinan") {
    step1.classList.add("completed");
    step2.classList.add("current");
  } else if (doc.status === "eselon") {
    step1.classList.add("completed");
    step2.classList.add("completed");
    step3.classList.add("current");
  } else if (doc.status === "revisi") {
    step1.classList.add("completed");
    if (doc.step === 2) {
      step2.classList.add("rejected");
    } else {
      step2.classList.add("completed");
      step3.classList.add("rejected");
    }
  } else if (doc.status === "selesai" || doc.status === "arsip") {
    step1.classList.add("completed");
    step2.classList.add("completed");
    step3.classList.add("completed");
    step4.classList.add("completed");
  }

  // Render Log Timeline
  const timelineBox = document.getElementById("detailTimelineBox");
  if (timelineBox) {
    timelineBox.innerHTML = `
      <div class="timeline-event success">
        <div class="timeline-header">
          <span>Dokumen Diunggah oleh Staff Satker</span>
          <span class="timeline-time">${doc.submitDate}</span>
        </div>
        <div class="timeline-comment-box">
          Berkas laporan <strong>${doc.fileName}</strong> berhasil diunggah dengan status awal ${doc.status === 'draft' ? 'Draft' : 'Diajukan ke Pimpinan'}.
        </div>
      </div>
      ${doc.status === "revisi" ? `
        <div class="timeline-event warning">
          <div class="timeline-header">
            <span style="color:#B45309;">Pengembalian Berkas (Perlu Perbaikan)</span>
            <span class="timeline-time">${doc.revisionDate || '05 Okt 2026, 14:15'}</span>
          </div>
          <div class="timeline-comment-box" style="background:var(--status-revisi-bg); border-color:var(--status-revisi-border);">
            <strong style="color:var(--status-revisi-text);">${doc.revisionBy || 'Pimpinan Tim Verifikasi'}</strong>:
            <p style="margin-top:4px; color:var(--status-revisi-text);">${doc.revisionNote}</p>
          </div>
        </div>
      ` : ''}
      ${doc.status === "eselon" || doc.status === "selesai" ? `
        <div class="timeline-event success">
          <div class="timeline-header">
            <span>Lolos Verifikasi Pimpinan (Tahap 1)</span>
            <span class="timeline-time">04 Okt 2026, 11:00</span>
          </div>
          <div class="timeline-comment-box">
            Dokumen telah diperiksa dan dinyatakan memenuhi standar kelengkapan berkas untuk dilanjutkan ke Eselon 1.
          </div>
        </div>
      ` : ''}
      ${doc.status === "selesai" ? `
        <div class="timeline-event success">
          <div class="timeline-header">
            <span style="color:#059669;">Disetujui & Diterbitkan oleh Eselon 1</span>
            <span class="timeline-time">05 Okt 2026, 09:15</span>
          </div>
          <div class="timeline-comment-box" style="background:#ECFDF5; border-color:#A7F3D0; color:#065F46;">
            Verifikasi final disetujui. Dokumen telah dipublikasikan ke portal arsip resmi kementerian.
          </div>
        </div>
      ` : ''}
    `;
  }

  modal.classList.add("active");
};

window.closeDetailModal = function() {
  const modal = document.getElementById("modalDetailDokumen");
  if (modal) modal.classList.remove("active");
};

window.downloadDocumentFile = function(fileName) {
  showToast("info", `Mengunduh berkas: ${fileName}...`);
};

// --- 14. NOTIFICATION POPOVER ---
function initNotificationPopover() {
  const notifBtn = document.getElementById("btnNotificationTrigger");
  const popover = document.getElementById("notificationPopover");
  const markAllBtn = document.getElementById("btnMarkAllNotifs");
  const badgeDot = document.getElementById("notifBadgeDot");

  if (!notifBtn || !popover) return;

  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    popover.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!popover.contains(e.target) && !notifBtn.contains(e.target)) {
      popover.classList.remove("active");
    }
  });

  if (markAllBtn) {
    markAllBtn.addEventListener("click", () => {
      unreadNotificationCount = 0;
      if (badgeDot) badgeDot.style.display = "none";
      const unreadItems = popover.querySelectorAll(".notif-item.unread");
      unreadItems.forEach(item => item.classList.remove("unread"));
      showToast("success", "Semua notifikasi telah ditandai dibaca.");
    });
  }

  // Notif tab filter
  const notifTabs = document.querySelectorAll(".notif-tab-btn");
  notifTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      notifTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.dataset.notifFilter;
      const items = popover.querySelectorAll(".notif-item");
      items.forEach(it => {
        if (filter === "all") {
          it.style.display = "flex";
        } else if (filter === "unread") {
          it.style.display = it.classList.contains("unread") ? "flex" : "none";
        } else if (filter === "revisi") {
          it.style.display = it.classList.contains("is-revisi") ? "flex" : "none";
        }
      });
    });
  });
}

// --- 15. HALAMAN PENCATATAN KEUANGAN ---
function initPencatatanPage() {
  const formPencatatan = document.getElementById("formPencatatanBaru");
  if (formPencatatan) {
    formPencatatan.addEventListener("submit", (e) => {
      e.preventDefault();
      const spm = document.getElementById("pencatatanSpm").value.trim();
      const desc = document.getElementById("pencatatanDesc").value.trim();
      const mak = document.getElementById("pencatatanMak").value.trim();
      const type = document.getElementById("pencatatanTipe").value;
      const amount = parseFloat(document.getElementById("pencatatanAmount").value);

      if (!spm || !desc || isNaN(amount)) {
        showToast("error", "Harap lengkapi semua kolom form pencatatan.");
        return;
      }

      const newTrx = {
        id: `TRX-${String(pencatatanData.length + 1).padStart(3, '0')}`,
        date: "Hari ini",
        spm: spm,
        desc: desc,
        mak: mak || "521211",
        type: type,
        amount: amount,
        status: "Tercatat"
      };

      pencatatanData.unshift(newTrx);
      renderPencatatanTable();
      formPencatatan.reset();
      showToast("success", `Transaksi ${spm} berhasil ditambahkan ke buku pembukuan.`);
    });
  }
}

function renderPencatatanTable() {
  const tbody = document.getElementById("pencatatanTableBody");
  if (!tbody) return;

  tbody.innerHTML = pencatatanData.map(trx => `
    <tr>
      <td><span style="font-size:12px; color:var(--text-muted);">${trx.date}</span></td>
      <td><span class="doc-code-pill">${trx.spm}</span></td>
      <td><span style="font-weight:600;">${trx.desc}</span></td>
      <td><span class="category-pill">${trx.mak}</span></td>
      <td>
        <span class="status-badge ${trx.type === 'Debet' ? 'badge-pimpinan' : 'badge-selesai'}">
          ${trx.type}
        </span>
      </td>
      <td style="font-weight:700; text-align:right;">
        Rp ${trx.amount.toLocaleString('id-ID')}
      </td>
      <td>
        <span class="status-badge ${trx.status === 'Tercatat' ? 'badge-selesai' : 'badge-revisi'}">
          <span class="dot"></span>
          ${trx.status}
        </span>
      </td>
    </tr>
  `).join("");
}

// --- 16. HALAMAN REKENING KORAN & REKONSILIASI ---
function initRekeningPage() {
  const filterRekon = document.getElementById("filterRekonStatus");
  if (filterRekon) {
    filterRekon.addEventListener("change", () => {
      renderRekeningTable();
    });
  }
}

function renderRekeningTable() {
  const tbody = document.getElementById("rekeningTableBody");
  if (!tbody) return;

  const filterSelect = document.getElementById("filterRekonStatus");
  const filterVal = filterSelect ? filterSelect.value : "all";

  const filtered = rekeningData.filter(r => {
    if (filterVal === "all") return true;
    return r.status === filterVal;
  });

  tbody.innerHTML = filtered.map(row => {
    let badgeClass = "badge-selesai";
    if (row.status === "Belum Dicocokkan") badgeClass = "badge-draft";
    if (row.status === "Selisih") badgeClass = "badge-revisi";

    return `
      <tr>
        <td><span style="font-size:12px; color:var(--text-muted);">${row.date}</span></td>
        <td><span class="doc-code-pill">${row.ref}</span></td>
        <td><span style="font-weight:600;">${row.desc}</span></td>
        <td style="text-align:right; color:${row.debit > 0 ? '#DC2626' : 'inherit'};">
          ${row.debit > 0 ? `Rp ${row.debit.toLocaleString('id-ID')}` : '-'}
        </td>
        <td style="text-align:right; color:${row.credit > 0 ? '#16A34A' : 'inherit'};">
          ${row.credit > 0 ? `Rp ${row.credit.toLocaleString('id-ID')}` : '-'}
        </td>
        <td style="font-weight:700; text-align:right;">
          Rp ${row.balance.toLocaleString('id-ID')}
        </td>
        <td>
          <span class="status-badge ${badgeClass}">
            <span class="dot"></span>
            ${row.status}
          </span>
        </td>
        <td>
          ${row.status !== "Cocok" ? `
            <button class="btn btn-sm btn-outline" onclick="markReconciled('${row.id}')">
              Cocokkan
            </button>
          ` : `
            <span style="font-size:11.5px; color:var(--color-success); font-weight:600;">Terverifikasi</span>
          `}
        </td>
      </tr>
    `;
  }).join("");
}

window.markReconciled = function(rowId) {
  const item = rekeningData.find(r => r.id === rowId);
  if (!item) return;

  item.status = "Cocok";
  renderRekeningTable();
  showToast("success", `Transaksi ${item.ref} berhasil direkonsiliasi.`);
};

// --- 17. HALAMAN PROFIL & PASSWORD SECURITY ---
function initProfilePage() {
  const pwdInput = document.getElementById("newPasswordInput");
  const strengthBar = document.getElementById("pwdStrengthFill");
  const strengthText = document.getElementById("pwdStrengthText");
  const formPassword = document.getElementById("formGantiPassword");

  if (pwdInput && strengthBar && strengthText) {
    pwdInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (val.length === 0) {
        strengthBar.style.width = "0%";
        strengthText.textContent = "Kekuatan: -";
      } else if (val.length < 6) {
        strengthBar.style.width = "25%";
        strengthBar.style.background = "var(--color-danger)";
        strengthText.textContent = "Kekuatan: Sangat Lemah";
      } else if (val.length < 10) {
        strengthBar.style.width = "60%";
        strengthBar.style.background = "var(--color-warning)";
        strengthText.textContent = "Kekuatan: Cukup (Sedang)";
      } else {
        strengthBar.style.width = "100%";
        strengthBar.style.background = "var(--color-success)";
        strengthText.textContent = "Kekuatan: Sangat Kuat & Aman";
      }
    });
  }

  if (formPassword) {
    formPassword.addEventListener("submit", (e) => {
      e.preventDefault();
      const defaultWarning = document.getElementById("defaultPasswordWarningBanner");
      if (defaultWarning) {
        defaultWarning.style.display = "none";
      }
      formPassword.reset();
      if (strengthBar) strengthBar.style.width = "0%";
      if (strengthText) strengthText.textContent = "Kekuatan: -";
      showToast("success", "Kata sandi berhasil diperbarui. Peringatan password bawaan dinonaktifkan.");
    });
  }
}

// --- 18. TOAST NOTIFICATION STACK ---
window.showToast = function(type, message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E90FF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-text">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 240);
    }
  }, 4200);
};

// Global logout simulation
window.handleLogout = function() {
  if (confirm("Apakah Anda yakin ingin keluar dari sesi Staff FinSight?")) {
    showToast("info", "Sesi berhasil diakhiri. Mengalihkan ke halaman login...");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  }
};
