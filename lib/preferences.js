export const PREFERENCES_STORAGE_KEY = 'concerthub_settings_prefs';
export const DEFAULT_PREFERENCES = {
  language: 'id',
  currency: 'IDR',
  timezone: 'Asia/Jakarta',
  idrPerUsd: 18000,
};

let cachedPreferencesJson;
let cachedPreferences = DEFAULT_PREFERENCES;

const translationPairs = [
  ['Pengaturan Akun', 'Account Settings'],
  ['Pengaturan Umum', 'General Settings'],
  ['Keamanan & Pemeliharaan', 'Security & Maintenance'],
  ['Pengaturan Sistem', 'System Settings'],
  ['Simpan Pengaturan', 'Save Settings'],
  ['Simpan Perubahan', 'Save Changes'],
  ['Simpan', 'Save'],
  ['Batal', 'Cancel'],
  ['Pengaturan', 'Settings'],
  ['Konfigurasi', 'Configuration'],
  ['Kelola pengaturan umum dan keamanan platform.', 'Manage general and security settings for the platform.'],
  ['Nama Situs', 'Site Name'],
  ['Deskripsi Situs', 'Site Description'],
  ['Mata Uang', 'Currency'],
  ['Bahasa', 'Language'],
  ['Verifikasi Email', 'Email Verification'],
  ['Wajibkan verifikasi email untuk pengguna baru', 'Require email verification for new users'],
  ['Autentikasi Dua Faktor', 'Two-Factor Authentication'],
  ['Aktifkan 2FA untuk akun admin', 'Enable 2FA for admin accounts'],
  ['Mode Pemeliharaan', 'Maintenance Mode'],
  ['Aktifkan mode pemeliharaan platform', 'Put the platform in maintenance mode'],
  ['Rupiah Indonesia (Rp)', 'Indonesian Rupiah (Rp)'],
  ['Dolar AS ($)', 'US Dollar ($)'],
  ['Inggris', 'English'],
  ['Bahasa Indonesia', 'Indonesian'],
  ['Dasbor', 'Dashboard'],
  ['Kelola Pengguna', 'Manage Users'],
  ['Verifikasi Penyelenggara', 'Verify Organizer'],
  ['Kelola Pembayaran', 'Manage Payments'],
  ['Laporan', 'Reports'],
  ['Analitik', 'Analytics'],
  ['Keluar', 'Log Out'],
  ['Keluar Akun', 'Log Out'],
  ['Masuk', 'Login'],
  ['Daftar', 'Register'],
  ['Beranda', 'Home'],
  ['Konser', 'Concerts'],
  ['Festival', 'Festival'],
  ['Buka menu profil', 'Open profile menu'],
  ['Bantuan', 'Help'],
  ['Ikon pengguna', 'User Icon'],
  ['Buka atau tutup menu', 'Toggle Dropdown'],
  ['Halaman Utama', 'Dashboard'],
  ['Tiket Saya', 'My Tickets'],
  ['Disimpan', 'Saved'],
  ['Riwayat Pembelian', 'Purchase History'],
  ['Profil Saya', 'My Profile'],
  ['Penonton', 'Customer'],
  ['Pusat Pengaturan', 'Settings Center'],
  ['Sesuaikan preferensi akun, keamanan kata sandi, dan notifikasi konser kamu.', 'Customize your account preferences, password security, and concert notifications.'],
  ['Akun & Preferensi', 'Account & Preferences'],
  ['Bahasa, zona waktu, dan mata uang', 'Language, time zone, and currency'],
  ['Keamanan & Sandi', 'Security & Password'],
  ['Ubah password dan verifikasi 2FA', 'Change your password and 2FA verification'],
  ['Notifikasi', 'Notifications'],
  ['Pengingat konser dan info tiket', 'Concert reminders and ticket information'],
  ['Preferensi Akun & Wilayah', 'Account & Regional Preferences'],
  ['Atur bahasa antarmuka, zona waktu, dan mata uang transaksi', 'Set the interface language, time zone, and transaction currency'],
  ['Zona Waktu', 'Time Zone'],
  ['Memuat pengaturan...', 'Loading settings...'],
  ['Pengaturan sistem berhasil disimpan', 'System settings saved successfully'],
  ['Gagal menyimpan pengaturan', 'Failed to save settings'],
  ['Preferensi akun berhasil disimpan', 'Account preferences saved successfully'],
  ['Gagal menyimpan preferensi di browser', 'Failed to save preferences in this browser'],
  ['Pengguna', 'User'],
  ['Tiket', 'Tickets'],
  ['Halo', 'Hi'],
  ['yuk kita war tiket sekarang!', "let's get tickets now!"],
  ['Mendatang', 'Upcoming'],
  ['Total Pengeluaran', 'Total Spent'],
  ['Mau nonton konser apa hari ini?', 'What concert do you want to see today?'],
  ['Yuk cari tiket konser favoritmu!', 'Find tickets for your favorite concerts!'],
  ['Cari konser yang kamu mau..', 'Search for a concert...'],
  ['Pilih lokasi', 'Choose a location'],
  ['Promo Spesial', 'Special Offer'],
  ['Diskon Hingga', 'Up to'],
  ['Klaim Promo', 'Claim Offer'],
  ['Untuk pembelian minimal 2 tiket, periode terbatas!', 'Limited time offer for purchases of at least 2 tickets!'],
  ['Lihat semua', 'View all'],
  ['Belum ada tiket?', 'No tickets yet?'],
  ['Yuk, cari konser favoritmu dan pesan sekarang', 'Find your favorite concert and book it now'],
  ['Cari Konser', 'Find Concerts'],
  ['Tidak ada konser yang sesuai dengan filter pencarian.', 'No concerts match your search filters.'],
  ['Tidak ada konser rekomendasi saat ini.', 'No recommended concerts right now.'],
  ['Trending Saat Ini', 'Trending Now'],
  ['Jangan lewatkan panggung musik terhangat saat ini!', "Don't miss today's hottest live music!"],
  ['Tidak ada konser trending saat ini.', 'No trending concerts right now.'],
  ['Konser Dalam waktu dekat', 'Upcoming Concerts'],
  ['Penawaran waktu terbatas', 'Limited-time offer'],
  ['Penawaran terbatas - diskon hingga 50% untuk acara-acara tertentu', 'Limited offer - up to 50% off selected events'],
  ['Akan berakhir', 'Ends in'],
  ['Pesanan Terbaru', 'Recent Orders'],
  ['Belum ada riwayat pesanan.', 'No order history yet.'],
  ['Riwayat', 'History'],
  ['AGU', 'AUG'],
  ['Mei', 'May'],
  ['Okt', 'Oct'],
  ['Des', 'Dec'],
  ['Cari konser', 'Search concerts'],
  ['Cari konser...', 'Search concerts...'],
  ['Konser Rekomendasi', 'Recommended Concerts'],
  ['Deretan konser megah siap manjakan telinga kamu.', 'A lineup of spectacular concerts is ready to delight your ears.'],
  ['Lihat semua →', 'View all →'],
  ['Cari', 'Search'],
  ['Semua', 'All'],
  ['Lihat Semua', 'View All'],
  ['Konser Mendatang', 'Upcoming Concerts'],
  ['Konser Populer', 'Popular Concerts'],
  ['Belum ada konser', 'No concerts yet'],
  ['Mulai dari', 'Starting from'],
  ['Tanggal & Waktu', 'Date & Time'],
  ['Deskripsi', 'Description'],
  ['Lokasi Konser', 'Concert Location'],
  ['Kategori Tiket', 'Ticket Category'],
  ['Pilih Tiket', 'Select Tickets'],
  ['Jumlah', 'Quantity'],
  ['Kembali', 'Back'],
  ['Lanjutkan', 'Continue'],
  ['Konfirmasi Pesanan', 'Confirm Order'],
  ['Nama Lengkap', 'Full Name'],
  ['Alamat Email', 'Email Address'],
  ['Nomor Telepon', 'Phone Number'],
  ['Nomor Identitas', 'ID Number'],
  ['Pilih Metode Pembayaran', 'Choose a Payment Method'],
  ['Kode Promo', 'Promo Code'],
  ['Gunakan', 'Apply'],
  ['Total Pembayaran', 'Payment Total'],
  ['Bayar Sekarang', 'Pay Now'],
  ['Menunggu Pembayaran', 'Awaiting Payment'],
  ['Status', 'Status'],
  ['Selesai', 'Completed'],
  ['Tidak ada data', 'No data available'],
  ['Tidak ada pesanan', 'No orders yet'],
  ['Tiket berhasil dibeli', 'Tickets purchased successfully'],
  ['Konser tidak ditemukan', 'Concert not found'],
  ['Pilih kategori tiket terlebih dahulu', 'Please select a ticket category first'],
  ['Silakan login terlebih dahulu', 'Please log in first'],
  ['Pilih jumlah tiket', 'Choose the number of tickets'],
  ['Habis', 'Sold out'],
  ['Penjualan belum dimulai', 'Sales have not started'],
  ['Penjualan berakhir', 'Sales have ended'],
  ['Buat Pesanan & Bayar', 'Place Order & Pay'],
  ['Kode promo tidak valid', 'Invalid promo code'],
  ['Tutup Denah', 'Close Seating Chart'],
  ['Lihat denah', 'View Seating Chart'],
  ['Kembali ke Daftar Konser', 'Back to Concert List'],
  ['Kembali ke Konser Saya', 'Back to My Concerts'],
  ['Lihat Detail', 'View Details'],
  ['Beli Tiket', 'Buy Tickets'],
  ['Pesan Tiket', 'Book Tickets'],
  ['Tanggal', 'Date'],
  ['Lokasi', 'Location'],
  ['Harga', 'Price'],
  ['Total', 'Total'],
  ['Subtotal', 'Subtotal'],
  ['Diskon', 'Discount'],
  ['Biaya layanan', 'Service fee'],
  ['Biaya Layanan', 'Service fee'],
  ['Pembayaran', 'Payment'],
  ['Pesanan', 'Orders'],
  ['Riwayat Pesanan', 'Order History'],
  ['Wishlist', 'Wishlist'],
  ['Profil', 'Profile'],
  ['Organizer', 'Organizer'],
  ['Admin', 'Admin'],
  ['Ringkasan Admin', 'Admin Overview'],
  ['Dasbor Admin', 'Admin Dashboard'],
  ['Pantau statistik pengguna, penyelenggara konser, antrean verifikasi, dan pendapatan platform.', 'Monitor user statistics, concert organizers, verification queues, and platform revenue.'],
  ['Muat Ulang', 'Refresh'],
  ['Total Pengguna', 'Total Users'],
  ['Total Organizer', 'Total Organizers'],
  ['Menunggu Verifikasi', 'Awaiting Verification'],
  ['Total Pendapatan', 'Total Revenue'],
  ['Aktivitas Terbaru', 'Recent Activity'],
  ['Akun yang baru terdaftar di sistem', 'Recently registered accounts'],
  ['terdaftar', 'registered'],
  ['Peran:', 'Role:'],
  ['Belum ada aktivitas terbaru.', 'There is no recent activity.'],
  ['Verifikasi Konser', 'Concert Verification'],
  ['Persetujuan yang perlu ditinjau', 'Approvals that need review'],
  ['Organizer Menunggu', 'Organizers Awaiting Review'],
  ['Konser Menunggu', 'Concerts Awaiting Review'],
  ['Tinjau Konser', 'Review Concerts'],
  ['Memuat dasbor admin...', 'Loading admin dashboard...'],
  ['Data dasbor berhasil diperbarui', 'Dashboard data updated successfully'],
  ['Gagal memuat ulang data dasbor', 'Failed to refresh dashboard data'],
  ['Analisis pertumbuhan pengguna, pendapatan bulanan, dan konser terlaris.', 'Analyze user growth, monthly revenue, and top-selling concerts.'],
  ['Belum ada data pendapatan bulanan.', 'There is no monthly revenue data.'],
  ['Belum ada data penjualan konser.', 'There is no concert sales data.'],
  ['Belum ada data pertumbuhan pengguna.', 'There is no user growth data.'],
  ['Konser Terlaris', 'Top-Selling Concerts'],
  ['Memuat analitik...', 'Loading analytics...'],
  ['Pendapatan Bulanan', 'Monthly Revenue'],
  ['Pertumbuhan Pengguna', 'User Growth'],
  ['Statistik Platform', 'Platform Statistics'],
  ['Aksi', 'Actions'],
  ['Belum ada konser yang terdaftar.', 'No concerts have been listed yet.'],
  ['Kelola Konser', 'Manage Concerts'],
  ['Memproses...', 'Processing...'],
  ['Memuat data konser...', 'Loading concerts...'],
  ['Menunggu Persetujuan', 'Awaiting Approval'],
  ['Moderasi Event', 'Event Moderation'],
  ['Nama Konser', 'Concert Name'],
  ['Setujui', 'Approve'],
  ['Sudah Disetujui', 'Approved'],
  ['Tinjau dan setujui event konser yang diajukan oleh organizer pada platform.', 'Review and approve concert events submitted by organizers on the platform.'],
  ['Tolak', 'Reject'],
  ['Total Konser', 'Total Concerts'],
  ['Tutup modal', 'Close dialog'],
  ['Alasan Penolakan', 'Reason for Rejection'],
  ['Apakah kamu yakin ingin menyetujui dan memverifikasi organizer berikut?', 'Are you sure you want to approve and verify this organizer?'],
  ['Belum ada organizer yang memerlukan verifikasi.', 'There are no organizers awaiting verification.'],
  ['Email', 'Email'],
  ['Konfirmasi Tolak', 'Confirm Rejection'],
  ['Memuat verifikasi organizer...', 'Loading organizer verification...'],
  ['Menolak...', 'Rejecting...'],
  ['Perusahaan', 'Company'],
  ['Pusat Verifikasi', 'Verification Center'],
  ['Setujui Organizer', 'Approve Organizer'],
  ['Tinjau dan setujui pendaftaran Event Organizer baru pada platform.', 'Review and approve new event organizer registrations on the platform.'],
  ['Tolak Organizer', 'Reject Organizer'],
  ['Tuliskan alasan penolakan pendaftaran organizer...', 'Enter the reason for rejecting the organizer registration...'],
  ['Verifikasi Organizer', 'Verify Organizer'],
  ['Alasan Refund', 'Refund Reason'],
  ['Apakah kamu yakin ingin mengonfirmasi pembayaran transaksi berikut?', 'Are you sure you want to confirm this payment?'],
  ['Belum ada data pembayaran.', 'There is no payment data.'],
  ['Kelola konfirmasi pembayaran dan permintaan refund transaksi pengguna.', 'Manage payment confirmations and user transaction refund requests.'],
  ['Konfirmasi', 'Confirm'],
  ['Konfirmasi Bayar', 'Confirm Payment'],
  ['Konfirmasi Pembayaran', 'Payment Confirmation'],
  ['Konfirmasi Refund', 'Confirm Refund'],
  ['Memuat pembayaran...', 'Loading payments...'],
  ['Menunggu Konfirmasi', 'Awaiting Confirmation'],
  ['Metode', 'Method'],
  ['Nominal', 'Amount'],
  ['Pembayaran Selesai', 'Payment Completed'],
  ['Proses Refund', 'Process Refund'],
  ['Refund', 'Refund'],
  ['Total Transaksi', 'Total Transactions'],
  ['Transaksi', 'Transactions'],
  ['Tuliskan alasan pengembalian dana transaksi...', 'Enter the reason for refunding this transaction...'],
  ['Daftar transaksi lengkap, status pembayaran, dan nominal refund dalam format CSV.', 'Complete transaction list, payment statuses, and refund amounts in CSV format.'],
  ['Laporan & Ekspor', 'Reports & Export'],
  ['Laporan Penjualan & Pembayaran', 'Sales & Payment Reports'],
  ['Laporan Platform', 'Platform Reports'],
  ['Lihat ringkasan laporan operasional sistem dan unduh rekap transaksi secara langsung.', 'View the system operations summary and download transaction reports.'],
  ['Memuat laporan...', 'Loading reports...'],
  ['Menyiapkan CSV...', 'Preparing CSV...'],
  ['Unduh CSV', 'Download CSV'],
  ['Akun Aktif', 'Active Accounts'],
  ['Akun Diblokir', 'Blocked Accounts'],
  ['Apakah kamu yakin ingin menghapus akun pengguna berikut secara permanen?', 'Are you sure you want to permanently delete this user account?'],
  ['Cari nama, email, peran, atau status...', 'Search by name, email, role, or status...'],
  ['Filter peran pengguna', 'Filter user role'],
  ['Hapus Akun', 'Delete Account'],
  ['Hapus Akun Pengguna', 'Delete User Account'],
  ['Hapus pengguna', 'Delete user'],
  ['Kelola seluruh akun pengguna terdaftar, ubah status blokir, atau hapus akun secara terpusat.', 'Manage all registered user accounts, change block status, or delete accounts.'],
  ['Manajemen Pengguna', 'User Management'],
  ['Memuat data pengguna...', 'Loading users...'],
  ['Menghapus...', 'Deleting...'],
  ['Nama', 'Name'],
  ['Peran', 'Role'],
  ['Semua Peran', 'All Roles'],
  ['Tidak ada data pengguna yang cocok dengan pencarian atau filter.', 'No users match the search or filters.'],
  ['Tindakan ini tidak dapat dibatalkan', 'This action cannot be undone'],
  ['Total Akun Terdaftar', 'Total Registered Accounts'],
  ['Tutup popup konfirmasi', 'Close confirmation dialog'],
];

const translations = {
  id: Object.fromEntries(translationPairs.map(([indonesian, english]) => [english, indonesian])),
  en: Object.fromEntries(translationPairs.map(([indonesian, english]) => [indonesian, english])),
};

translations.id['Manage Konser'] = 'Kelola Konser';
translations.en['Manage Konser'] = 'Manage Concerts';
const localizedTextNodes = new WeakMap();
const localizedAttributes = new WeakMap();

export function normalizePreferences(value = {}) {
  const preferences = value && typeof value === 'object' ? value : {};
  const currency = preferences.currency === 'USD' ? 'USD' : 'IDR';
  const language = preferences.language === 'en' ? 'en' : 'id';
  const idrPerUsd = Number(preferences.idrPerUsd);
  return {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    currency,
    language,
    idrPerUsd: Number.isFinite(idrPerUsd) && idrPerUsd > 0
      ? idrPerUsd
      : DEFAULT_PREFERENCES.idrPerUsd,
  };
}

export function getPreferencesSnapshot() {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  try {
    const savedJson = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (savedJson === cachedPreferencesJson) return cachedPreferences;

    cachedPreferencesJson = savedJson;
    const saved = JSON.parse(savedJson || '{}');
    cachedPreferences = normalizePreferences(saved.accountPrefs);
  } catch (error) {
    console.error('Failed to read saved preferences:', error);
    cachedPreferences = DEFAULT_PREFERENCES;
  }
  return cachedPreferences;
}

export function subscribePreferences(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener('showtime-preferences-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('showtime-preferences-change', callback);
  };
}

export function savePreferences(nextPreferences) {
  const saved = JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}');
  const accountPrefs = normalizePreferences({ ...getPreferencesSnapshot(), ...nextPreferences });
  window.localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify({ ...saved, accountPrefs })
  );
  cachedPreferencesJson = null;
  window.dispatchEvent(new Event('showtime-preferences-change'));
  return accountPrefs;
}

export function readPreferences() {
  return getPreferencesSnapshot();
}

export function formatCurrency(amount, currency = readPreferences().currency) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    throw new TypeError('Currency amount must be a finite number');
  }

  const selectedCurrency = currency === 'USD' ? 'USD' : 'IDR';
  const idrPerUsd = Number(readPreferences().idrPerUsd);
  const safeRate = Number.isFinite(idrPerUsd) && idrPerUsd > 0
    ? idrPerUsd
    : DEFAULT_PREFERENCES.idrPerUsd;
  const convertedAmount = selectedCurrency === 'USD' ? numericAmount / safeRate : numericAmount;
  return new Intl.NumberFormat(selectedCurrency === 'USD' ? 'en-US' : 'id-ID', {
    style: 'currency',
    currency: selectedCurrency,
    minimumFractionDigits: selectedCurrency === 'USD' ? 2 : 0,
    maximumFractionDigits: selectedCurrency === 'USD' ? 2 : 0,
  }).format(convertedAmount);
}

export function translateText(value, language) {
  if (typeof value !== 'string') return value;
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const normalized = match[2].replace(/\s+/g, ' ');
  const translated = translations[language]?.[normalized];
  return translated ? `${match[1]}${translated}${match[3]}` : value;
}

function getOriginalText(node) {
  const current = node.nodeValue;
  const previous = localizedTextNodes.get(node);
  return previous && current === previous.translated ? previous.original : current;
}

function updateTextNode(node, language, currency) {
  const previousState = localizedTextNodes.get(node);
  if (previousState?.currencyAmount && node.nodeValue === previousState.translated) return;

  const previousNode = node.previousSibling;
  if (
    previousNode?.nodeType === Node.TEXT_NODE
    && /^(.*)\bRp\s*$/.test(getOriginalText(previousNode))
  ) {
    updateTextNode(previousNode, language, currency);
    return;
  }

  const original = getOriginalText(node);
  const nextNode = node.nextSibling;
  const nextOriginal = nextNode?.nodeType === Node.TEXT_NODE ? getOriginalText(nextNode) : '';
  const currencyPrefix = original.match(/^(.*)\bRp\s*$/);

  if (currencyPrefix && /^-?\d[\d.,]*$/.test(nextOriginal.trim())) {
    const amount = Number(nextOriginal.replace(/[^\d-]/g, ''));
    if (Number.isFinite(amount)) {
      const translated = `${currencyPrefix[1]}${formatCurrency(amount, currency)}`;
      if (node.nodeValue !== translated) node.nodeValue = translated;
      if (nextNode.nodeValue !== '') nextNode.nodeValue = '';
      localizedTextNodes.set(node, { original, translated });
      localizedTextNodes.set(nextNode, {
        original: nextOriginal,
        translated: '',
        currencyAmount: true,
      });
      return;
    }
  }

  const formatted = original.replace(
    /(^|[^\w])Rp\s*(-?\d[\d.,]*)(?![\d.,])/g,
    (match, prefix, amountText) => {
      const amount = Number(amountText.replace(/[^\d-]/g, ''));
      return Number.isFinite(amount) ? `${prefix}${formatCurrency(amount, currency)}` : match;
    }
  );
  const translated = translateText(formatted, language);
  if (node.nodeValue !== translated) node.nodeValue = translated;
  localizedTextNodes.set(node, { original, translated });
}

function updateAttribute(element, attribute, language) {
  const current = element.getAttribute(attribute);
  if (current === null) return;

  let state = localizedAttributes.get(element);
  if (!state) {
    state = {};
    localizedAttributes.set(element, state);
  }
  const previous = state[attribute];
  const original = previous && current === previous.translated ? previous.original : current;
  const translated = translateText(original, language);
  if (current !== translated) element.setAttribute(attribute, translated);
  state[attribute] = { original, translated };
}

export function applyPreferencesToDOM(root, language, currency) {
  if (!root || typeof document === 'undefined') return;

  const processText = (node) => {
    const parent = node.parentElement;
    if (parent?.closest('script,style,noscript,textarea,input,[contenteditable="true"]')) return;
    updateTextNode(node, language, currency);
  };
  const processElement = (element) => {
    ['alt', 'aria-label', 'placeholder', 'title'].forEach((attribute) => {
      updateAttribute(element, attribute, language);
    });
  };

  if (root.nodeType === Node.TEXT_NODE) {
    processText(root);
    return;
  }

  if (root.nodeType === Node.ELEMENT_NODE) {
    processElement(root);
    const elements = root.querySelectorAll('*');
    elements.forEach(processElement);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    processText(node);
    node = walker.nextNode();
  }
}
