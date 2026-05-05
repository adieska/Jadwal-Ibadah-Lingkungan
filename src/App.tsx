/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Calendar as CalendarIcon, 
  MapPin, 
  BookOpen, 
  User, 
  FileText, 
  Home,
  Save,
  Eraser,
  Search,
  CheckCircle2,
  AlertCircle,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScheduleItem {
  id: string;
  dayDate: string;
  host: string;
  address: string;
  sermon: string;
  agenda: string;
  officials: string;
  notes: string;
}

export default function App() {
  const [items, setItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('ibadah_schedule');
    return saved ? JSON.parse(saved) : [];
  });

  const [version, setVersion] = useState<number>(() => {
    const saved = localStorage.getItem('ibadah_version');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem('ibadah_last_updated') || new Date().toISOString();
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ibadah_dark_mode');
    if (saved === null) return false;
    return saved === 'true';
  });

  const [isSaving, setIsSaving] = useState(false);

  const [generatorSettings, setGeneratorSettings] = useState({
    dayOfWeek: 6, // 6 = Saturday (Default)
    startDate: '',
    endDate: '',
  });

  const [ministers, setMinisters] = useState<string[]>(() => {
    const saved = localStorage.getItem('ibadah_ministers');
    return saved ? JSON.parse(saved) : ['Pastor Paroki', 'Ketua Lingkungan', 'Tim Liturgi'];
  });
  const [newMinister, setNewMinister] = useState('');

  const [agendas, setAgendas] = useState<string[]>(() => {
    const saved = localStorage.getItem('ibadah_agendas');
    return saved ? JSON.parse(saved) : ['Pertemuan I', 'Pertemuan II', 'Pertemuan III'];
  });
  const [newAgenda, setNewAgenda] = useState('');

  const [officialsList, setOfficialsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('ibadah_officials');
    return saved ? JSON.parse(saved) : ['Petugas Liturgi', 'Petugas Musik', 'Petugas Multimedia'];
  });
  const [newOfficial, setNewOfficial] = useState('');

  const [hostPool, setHostPool] = useState<{name: string, address: string}[]>(() => {
    const saved = localStorage.getItem('ibadah_host_pool');
    return saved ? JSON.parse(saved) : [];
  });
  const [newHost, setNewHost] = useState({ name: '', address: '' });
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const days = [
    { label: 'Minggu', value: 0 },
    { label: 'Senin', value: 1 },
    { label: 'Selasa', value: 2 },
    { label: 'Rabu', value: 3 },
    { label: 'Kamis', value: 4 },
    { label: 'Jumat', value: 5 },
    { label: 'Sabtu', value: 6 },
  ];

  // Tracking Changes for Auto-Versioning
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setIsSaving(true);
    // Increment version and update timestamp on meaningful changes
    const timer = setTimeout(() => {
      setVersion(v => v + 1);
      setLastUpdated(new Date().toISOString());
      setIsSaving(false);
    }, 1500); // Debounce to avoid excessive increments during rapid typing

    return () => clearTimeout(timer);
  }, [items, ministers, agendas, officialsList, hostPool, generatorSettings]);

  useEffect(() => {
    localStorage.setItem('ibadah_schedule', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ibadah_ministers', JSON.stringify(ministers));
  }, [ministers]);

  useEffect(() => {
    localStorage.setItem('ibadah_agendas', JSON.stringify(agendas));
  }, [agendas]);

  useEffect(() => {
    localStorage.setItem('ibadah_officials', JSON.stringify(officialsList));
  }, [officialsList]);

  useEffect(() => {
    localStorage.setItem('ibadah_host_pool', JSON.stringify(hostPool));
  }, [hostPool]);

  useEffect(() => {
    localStorage.setItem('ibadah_version', version.toString());
  }, [version]);

  useEffect(() => {
    localStorage.setItem('ibadah_last_updated', lastUpdated);
  }, [lastUpdated]);

  useEffect(() => {
    localStorage.setItem('ibadah_dark_mode', darkMode.toString());
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleAddHost = () => {
    if (!newHost.name.trim()) return;
    setHostPool(prev => [...prev, { name: newHost.name.trim(), address: newHost.address.trim() }]);
    setNewHost({ name: '', address: '' });
    notify('Tuan rumah ditambahkan');
  };

  const handleBulkImport = () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    const newEntries = lines.map(line => {
      // Split by comma or tab
      const parts = line.split(/[,\t]/);
      return {
        name: parts[0]?.trim() || '',
        address: parts[1]?.trim() || ''
      };
    }).filter(e => e.name);

    if (newEntries.length === 0) {
      notify('Format tidak valid', 'error');
      return;
    }

    setHostPool(prev => [...prev, ...newEntries]);
    setBulkText('');
    setShowBulkModal(false);
    notify(`Berhasil mengimpor ${newEntries.length} data`);
  };

  const handleDeleteHost = (index: number) => {
    setHostPool(prev => prev.filter((_, i) => i !== index));
    notify('Data dihapus');
  };

  const handleAutoFillHosts = () => {
    if (hostPool.length === 0) {
      notify('Tambahkan daftar tuan rumah terlebih dahulu', 'error');
      return;
    }
    if (items.length === 0) {
      notify('Belum ada baris jadwal yang dibuat', 'error');
      return;
    }

    setItems(prev => prev.map((item, index) => {
      const data = hostPool[index % hostPool.length];
      return {
        ...item,
        host: data.name,
        address: data.address
      };
    }));
    notify('Berhasil mengisi Tuan Rumah & Alamat secara otomatis');
  };

  const handleAddMinister = () => {
    if (!newMinister.trim()) return;
    if (ministers.includes(newMinister.trim())) {
      notify('Nama pelayan sudah ada', 'error');
      return;
    }
    setMinisters(prev => [...prev, newMinister.trim()]);
    setNewMinister('');
    notify('Nama pelayan ditambahkan');
  };

  const handleDeleteMinister = (name: string) => {
    setMinisters(prev => prev.filter(m => m !== name));
    notify('Nama pelayan dihapus');
  };

  const handleAddAgenda = () => {
    if (!newAgenda.trim()) return;
    if (agendas.includes(newAgenda.trim())) {
      notify('Agenda sudah ada', 'error');
      return;
    }
    setAgendas(prev => [...prev, newAgenda.trim()]);
    setNewAgenda('');
    notify('Agenda ditambahkan');
  };

  const handleDeleteAgenda = (name: string) => {
    setAgendas(prev => prev.filter(a => a !== name));
    notify('Agenda dihapus');
  };

  const handleAddOfficial = () => {
    if (!newOfficial.trim()) return;
    if (officialsList.includes(newOfficial.trim())) {
      notify('Nama petugas sudah ada', 'error');
      return;
    }
    setOfficialsList(prev => [...prev, newOfficial.trim()]);
    setNewOfficial('');
    notify('Nama petugas ditambahkan');
  };

  const handleDeleteOfficial = (name: string) => {
    setOfficialsList(prev => prev.filter(o => o !== name));
    notify('Nama petugas dihapus');
  };

  const handleAutoFillMinisters = () => {
    if (ministers.length === 0) {
      notify('Tambahkan nama pelayan terlebih dahulu', 'error');
      return;
    }
    if (items.length === 0) {
      notify('Belum ada baris jadwal yang dibuat', 'error');
      return;
    }

    setItems(prev => prev.map((item, index) => ({
      ...item,
      sermon: ministers[index % ministers.length]
    })));
    notify('Berhasil mengisi pelayan secara otomatis');
  };

  const handleAutoFillAgendas = () => {
    if (agendas.length === 0) {
      notify('Tambahkan pelayan agenda terlebih dahulu', 'error');
      return;
    }
    if (items.length === 0) {
      notify('Belum ada baris jadwal yang dibuat', 'error');
      return;
    }

    setItems(prev => prev.map((item, index) => {
      let agendaIndex = index % agendas.length;
      let selectedAgenda = agendas[agendaIndex];

      // Logic: If the selected agenda minister is the same as the sermon minister,
      // pick the next person in the agendas list.
      if (selectedAgenda === item.sermon && agendas.length > 1) {
        agendaIndex = (agendaIndex + 1) % agendas.length;
        selectedAgenda = agendas[agendaIndex];
      }

      return {
        ...item,
        agenda: selectedAgenda
      };
    }));
    notify('Berhasil mengisi pelayan agenda secara otomatis (tanpa duplikasi tugas)');
  };

  const handleAutoFillOfficials = () => {
    if (officialsList.length === 0) {
      notify('Tambahkan petugas terlebih dahulu', 'error');
      return;
    }
    if (items.length === 0) {
      notify('Belum ada baris jadwal yang dibuat', 'error');
      return;
    }

    setItems(prev => prev.map((item, index) => {
      let officialIndex = index % officialsList.length;
      let selectedOfficial = officialsList[officialIndex];

      // Duplication check across sermon AND agenda
      let attempts = 0;
      while (
        (selectedOfficial === item.sermon || selectedOfficial === item.agenda) && 
        attempts < officialsList.length
      ) {
        officialIndex = (officialIndex + 1) % officialsList.length;
        selectedOfficial = officialsList[officialIndex];
        attempts++;
      }

      return {
        ...item,
        officials: selectedOfficial
      };
    }));
    notify('Berhasil mengisi petugas secara otomatis (tanpa duplikasi tugas)');
  };

  const handleGenerate = () => {
    const { dayOfWeek, startDate, endDate } = generatorSettings;
    if (!startDate || !endDate) {
      notify('Tentukan tanggal mulai dan berakhir', 'error');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      notify('Tanggal mulai tidak boleh lebih besar dari tanggal berakhir', 'error');
      return;
    }

    const newRows: ScheduleItem[] = [];
    const current = new Date(start);

    // Find the first occurrence of the day
    while (current.getDay() !== dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }

    while (current <= end) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const dateString = current.toLocaleDateString('id-ID', options);
      
      newRows.push({
        id: crypto.randomUUID(),
        dayDate: dateString,
        host: '',
        address: '',
        sermon: '',
        agenda: '',
        officials: '',
        notes: '',
      });
      
      current.setDate(current.getDate() + 7);
    }

    if (newRows.length === 0) {
      notify('Tidak ada hari yang cocok dalam rentang tersebut', 'error');
    } else {
      setItems(prev => [...prev, ...newRows]);
      notify(`Berhasil membuat ${newRows.length} baris jadwal baru`);
    }
  };

  const handleUpdateItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    notify('Baris dihapus');
  };

  const handleClearAll = () => {
    if (confirm('Hapus semua jadwal?')) {
      setItems([]);
      notify('Semua jadwal dibersihkan');
    }
  };

  const exportToExcel = () => {
    if (items.length === 0) {
      notify('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const exportData = items.map((item, index) => ({
      'No.': index + 1,
      'Hari/Tanggal': item.dayDate,
      'Tuan Rumah': item.host,
      'Alamat': item.address,
      'Pengkhotbah': item.sermon,
      'Paragenda': item.agenda,
      'Pembawa Acara': item.officials,
      'Keterangan': item.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Ibadah');
    XLSX.writeFile(workbook, `Jadwal_Ibadah_${new Date().toISOString().split('T')[0]}.xlsx`);
    notify('Berhasil mengekspor ke Excel');
  };

  const handlePrint = () => window.print();

  const filteredItems = items.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getDutyCount = (name: string, field: keyof ScheduleItem) => {
    return items.filter(item => item[field] === name).length;
  };

  const getAllStats = () => {
    const stats: Record<string, { sermon: number; agenda: number; officials: number; total: number }> = {};
    
    // Count from actual items
    items.forEach(item => {
      if (item.sermon && item.sermon.trim()) {
        const name = item.sermon.trim();
        if (!stats[name]) stats[name] = { sermon: 0, agenda: 0, officials: 0, total: 0 };
        stats[name].sermon++;
        stats[name].total++;
      }
      if (item.agenda && item.agenda.trim()) {
        const name = item.agenda.trim();
        if (!stats[name]) stats[name] = { sermon: 0, agenda: 0, officials: 0, total: 0 };
        stats[name].agenda++;
        stats[name].total++;
      }
      if (item.officials && item.officials.trim()) {
        const name = item.officials.trim();
        if (!stats[name]) stats[name] = { sermon: 0, agenda: 0, officials: 0, total: 0 };
        stats[name].officials++;
        stats[name].total++;
      }
    });

    return Object.entries(stats)
      .sort((a, b) => b[1].total - a[1].total);
  };

  const allStats = getAllStats();

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-indigo-100 transition-colors duration-500",
      darkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
    )}>
      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 border transition-colors",
              darkMode 
                ? "bg-slate-900 border-slate-800 text-slate-100 shadow-2xl" 
                : "bg-white border-slate-100 text-slate-800 shadow-indigo-100/50"
            )}
          >
            {showNotification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="font-semibold">{showNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Header - Professional Polish Style */}
        <header className={cn(
          "border-b px-8 py-4 sticky top-0 z-40 transition-colors",
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all",
                darkMode ? "bg-indigo-600 shadow-indigo-900/20" : "bg-indigo-600 shadow-lg shadow-indigo-100"
              )}>
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className={cn(
                  "text-xl font-bold tracking-tight transition-colors leading-none mb-1",
                  darkMode ? "text-slate-100" : "text-slate-800"
                )}>Jadwal Ibadah Lingkungan</h1>
                <p className={cn(
                  "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Generator Jadwal Ibadah Lingkungan/Sektor/Lungguk/Weijk</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "p-2.5 border rounded-lg transition-all mr-2",
                  darkMode 
                    ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
                title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 transition-transform hover:rotate-12" />}
              </button>
              <button
                onClick={handlePrint}
                className={cn(
                  "px-4 py-2.5 border rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  darkMode 
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <Printer className="w-4 h-4" />
                Cetak PDF
              </button>
              <button
                onClick={exportToExcel}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95",
                  darkMode 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                )}
              >
                <Download className="w-4 h-4" />
                Ekspor Excel
              </button>
              {items.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    darkMode ? "text-slate-500 hover:text-red-500 hover:bg-red-900/20" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                  )}
                  title="Hapus Semua"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Modal Bulk Import */}
        <AnimatePresence>
          {showBulkModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border transition-all",
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}
              >
                <div className={cn(
                  "p-6 border-b flex justify-between items-center transition-colors",
                  darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-100"
                )}>
                  <h3 className={cn("font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>Bulk Import Tuan Rumah & Alamat</h3>
                  <button onClick={() => setShowBulkModal(false)} className={cn(
                    "transition-colors",
                    darkMode ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
                  )}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p className={cn(
                    "text-xs leading-relaxed italic transition-colors",
                    darkMode ? "text-slate-400" : "text-slate-500"
                  )}>
                    Tempel data dari teks/Excel. Format per baris: <br />
                    <code className={cn(
                      "px-1 rounded transition-colors",
                      darkMode ? "bg-slate-800" : "bg-slate-100"
                    )}>Nama Tuan Rumah, Alamat Lengkap</code>
                  </p>
                  <textarea
                    rows={10}
                    placeholder="Contoh:&#10;Keluarga Bp. Andreas, Jl. Mawar No. 10&#10;Ibu Maria, Jl. Melati Blok C5"
                    className={cn(
                      "w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                      darkMode 
                        ? "bg-slate-950 border-slate-800 text-slate-200" 
                        : "bg-white border-slate-100 text-slate-700 shadow-sm"
                    )}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBulkModal(false)}
                      className={cn(
                        "flex-1 py-3 border rounded-xl text-sm font-bold transition-all",
                        darkMode 
                          ? "border-slate-700 text-slate-400 hover:bg-slate-800" 
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleBulkImport}
                      className={cn(
                        "flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all",
                        darkMode ? "shadow-none" : "shadow-indigo-100"
                      )}
                    >
                      Impor Sekarang
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="max-w-[1600px] mx-auto px-8 py-10 space-y-8">
          {/* Print Title - Visible only when printing */}
          <div className="hidden print:block text-center space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Jadwal Ibadah Lingkungan</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Laporan Jadwal Resmi</p>
            <div className="border-b-2 border-slate-900 w-full mt-4"></div>
          </div>

            {/* Generator Controls - The New Core Feature */}
          <section className={cn(
            "border rounded-2xl p-6 space-y-8 transition-colors",
            darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-sm shadow-indigo-100/30"
          )}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className={cn(
                  "text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Pilih Hari Ibadah Lingkungan</label>
                <select
                  value={generatorSettings.dayOfWeek}
                  onChange={(e) => setGeneratorSettings(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                  className={cn(
                    "w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none",
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-slate-200" 
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200"
                  )}
                >
                  {days.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={cn(
                  "text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Dari Tanggal</label>
                <input
                  type="date"
                  value={generatorSettings.startDate}
                  onChange={(e) => setGeneratorSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className={cn(
                    "w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none",
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-slate-200 color-scheme-dark font-mono" 
                      : "bg-slate-50 border-slate-100 text-slate-700 font-mono"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className={cn(
                  "text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Sampai Tanggal</label>
                <input
                  type="date"
                  value={generatorSettings.endDate}
                  onChange={(e) => setGeneratorSettings(prev => ({ ...prev, endDate: e.target.value }))}
                  className={cn(
                    "w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none",
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-slate-200 color-scheme-dark font-mono" 
                      : "bg-slate-50 border-slate-100 text-slate-700 font-mono"
                  )}
                />
              </div>
              <button
                onClick={handleGenerate}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                  darkMode 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-none" 
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-indigo-100/50"
                )}
              >
                <Plus className="w-5 h-5" />
                Generate Jadwal
              </button>
            </div>

            {/* Host & Address Management Pool */}
            <div className={cn(
              "pt-6 border-t transition-colors",
              darkMode ? "border-slate-800" : "border-slate-100"
            )}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className={cn(
                      "text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors",
                      darkMode ? "text-slate-500" : "text-slate-400"
                    )}>Kelola Daftar Tuan Rumah</label>
                    <button 
                      onClick={() => setShowBulkModal(true)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Paste/Impor Data
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nama Tuan Rumah"
                      className={cn(
                        "w-full border rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-indigo-500",
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-slate-200" 
                          : "bg-white border-slate-200 text-slate-700 shadow-sm"
                      )}
                      value={newHost.name}
                      onChange={(e) => setNewHost(prev => ({...prev, name: e.target.value}))}
                    />
                    <textarea
                      placeholder="Alamat Lengkap"
                      rows={2}
                      className={cn(
                        "w-full border rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-indigo-500",
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-slate-200" 
                          : "bg-white border-slate-200 text-slate-700 shadow-sm"
                      )}
                      value={newHost.address}
                      onChange={(e) => setNewHost(prev => ({...prev, address: e.target.value}))}
                    />
                    <button
                      onClick={handleAddHost}
                      className={cn(
                        "w-full py-2.5 rounded-xl font-bold transition-all font-black uppercase tracking-widest text-[10px]",
                        darkMode 
                          ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" 
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      )}
                    >
                      Tambah ke Daftar
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-end">
                    <label className={cn(
                      "text-[11px] font-bold uppercase tracking-wider ml-1 transition-colors",
                      darkMode ? "text-slate-500" : "text-slate-400"
                    )}>Daftar Slot Tuan Rumah ({hostPool.length})</label>
                    <button
                      onClick={handleAutoFillHosts}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                        darkMode 
                          ? "text-indigo-400 hover:text-indigo-300 bg-indigo-900/20" 
                          : "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                      )}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      Otomatisasi Tuan Rumah & Alamat
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {hostPool.length === 0 ? (
                      <div className={cn(
                        "col-span-full py-10 text-center border-2 border-dashed rounded-2xl text-sm italic transition-colors",
                        darkMode ? "border-slate-800 text-slate-700" : "border-slate-100 text-slate-300"
                      )}>
                        Belum ada daftar tuan rumah
                      </div>
                    ) : (
                      hostPool.map((host, idx) => (
                        <div key={idx} className={cn(
                          "border p-3 rounded-xl flex justify-between items-start group hover:border-indigo-200 transition-all shadow-sm",
                          darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100"
                        )}>
                          <div className="space-y-0.5">
                            <div className={cn(
                              "text-xs font-black",
                              darkMode ? "text-slate-200" : "text-slate-800"
                            )}>{host.name}</div>
                            <div className={cn(
                              "text-[10px]",
                              darkMode ? "text-slate-500" : "text-slate-400"
                            )}>{host.address}</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteHost(idx)}
                            className={cn(
                              "transition-colors opacity-0 group-hover:opacity-100",
                              darkMode ? "text-slate-800 hover:text-red-500" : "text-slate-200 hover:text-red-500"
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* New Minister Management Section */}
          <div className={cn(
            "pt-6 border-t transition-colors",
            darkMode ? "border-slate-800" : "border-slate-100"
          )}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3 space-y-2">
                <label className={cn(
                  "text-[11px] font-bold uppercase tracking-wider ml-1",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Tambah Nama Pengkhotbah</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Bp. Andreas"
                    value={newMinister}
                    onChange={(e) => setNewMinister(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMinister()}
                    className={cn(
                      "flex-1 border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                      darkMode 
                        ? "bg-slate-950 border-slate-800 text-slate-200" 
                        : "bg-white border-slate-100 text-slate-700 shadow-sm"
                    )}
                  />
                  <button
                    onClick={handleAddMinister}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      darkMode ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-end">
                  <label className={cn(
                    "text-[11px] font-bold uppercase tracking-wider ml-1",
                    darkMode ? "text-slate-500" : "text-slate-400"
                  )}>Daftar Pilihan Pelayan</label>
                  <button
                    onClick={handleAutoFillMinisters}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                      darkMode ? "text-indigo-400 hover:text-indigo-300 bg-indigo-900/20" : "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                    )}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Otomatisasi Nama Pengkhotbah
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ministers.length === 0 ? (
                    <span className={cn(
                      "text-xs italic",
                      darkMode ? "text-slate-700" : "text-slate-300"
                    )}>Belum ada nama pelayan yang ditambahkan.</span>
                  ) : (
                    ministers.map((name) => {
                      const count = getDutyCount(name, 'sermon');
                      return (
                        <div 
                          key={name}
                          className={cn(
                            "border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all group",
                            darkMode 
                              ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-900" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                          )}
                        >
                          {name}
                          {count > 0 && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-md",
                              darkMode ? "bg-slate-800 text-slate-400" : "bg-indigo-50 text-indigo-600"
                            )}>
                              {count}x
                            </span>
                          )}
                          <button 
                            onClick={() => handleDeleteMinister(name)}
                            className={cn(
                              "transition-colors",
                              darkMode ? "text-slate-600 hover:text-red-500" : "text-slate-400 hover:text-red-500"
                            )}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Agenda Management Section */}
          <div className={cn(
            "pt-6 border-t transition-colors",
            darkMode ? "border-slate-800" : "border-slate-100"
          )}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3 space-y-2">
                <label className={cn(
                  "text-[11px] font-bold uppercase tracking-wider ml-1",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Tambah Nama Paragenda</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Ibu Maria"
                    value={newAgenda}
                    onChange={(e) => setNewAgenda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAgenda()}
                    className={cn(
                      "flex-1 border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                      darkMode 
                        ? "bg-slate-950 border-slate-800 text-slate-200 shadow-none" 
                        : "bg-white border-slate-100 text-slate-700 shadow-sm"
                    )}
                  />
                  <button
                    onClick={handleAddAgenda}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      darkMode ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm"
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-end">
                  <label className={cn(
                    "text-[11px] font-bold uppercase tracking-wider ml-1",
                    darkMode ? "text-slate-500" : "text-slate-400"
                  )}>Daftar Pilihan Pelayan Paragenda</label>
                  <button
                    onClick={handleAutoFillAgendas}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                      darkMode ? "text-indigo-400 hover:text-indigo-300 bg-indigo-900/20" : "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                    )}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Otomatisasi Nama Paragenda
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agendas.length === 0 ? (
                    <span className={cn(
                      "text-xs italic",
                      darkMode ? "text-slate-700" : "text-slate-300"
                    )}>Belum ada nama pelayan paragenda yang ditambahkan.</span>
                  ) : (
                    agendas.map((name) => {
                      const count = getDutyCount(name, 'agenda');
                      return (
                        <div 
                          key={name}
                          className={cn(
                            "border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all group",
                            darkMode 
                              ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-900" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                          )}
                        >
                          {name}
                          {count > 0 && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-md",
                              darkMode ? "bg-slate-800 text-slate-400" : "bg-indigo-50 text-indigo-600"
                            )}>
                              {count}x
                            </span>
                          )}
                          <button 
                            onClick={() => handleDeleteAgenda(name)}
                            className={cn(
                              "transition-colors",
                              darkMode ? "text-slate-600 hover:text-red-500" : "text-slate-400 hover:text-red-500"
                            )}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Officials Management Section */}
          <div className={cn(
            "pt-6 border-t transition-colors",
            darkMode ? "border-slate-800" : "border-slate-100"
          )}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3 space-y-2">
                <label className={cn(
                  "text-[11px] font-bold uppercase tracking-wider ml-1",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Tambah Nama Pembawa Acara</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Bp. Yohanes"
                    value={newOfficial}
                    onChange={(e) => setNewOfficial(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOfficial()}
                    className={cn(
                      "flex-1 border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                      darkMode 
                        ? "bg-slate-950 border-slate-800 text-slate-200" 
                        : "bg-white border-slate-100 text-slate-700 shadow-sm"
                    )}
                  />
                  <button
                    onClick={handleAddOfficial}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      darkMode ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm"
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-end">
                  <label className={cn(
                    "text-[11px] font-bold uppercase tracking-wider ml-1",
                    darkMode ? "text-slate-500" : "text-slate-400"
                  )}>Daftar Pilihan Pembawa Acara</label>
                  <button
                    onClick={handleAutoFillOfficials}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                      darkMode ? "text-indigo-400 hover:text-indigo-300 bg-indigo-900/20" : "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                    )}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Otomatisasi Nama Pembawa Acara
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {officialsList.length === 0 ? (
                    <span className={cn(
                      "text-xs italic",
                      darkMode ? "text-slate-700" : "text-slate-300"
                    )}>Belum ada nama pembawa acara yang ditambahkan.</span>
                  ) : (
                    officialsList.map((name) => {
                      const count = getDutyCount(name, 'officials');
                      return (
                        <div 
                          key={name}
                          className={cn(
                            "border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all group",
                            darkMode 
                              ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-900" 
                              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                          )}
                        >
                          {name}
                          {count > 0 && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-md",
                              darkMode ? "bg-slate-800 text-slate-400" : "bg-indigo-50 text-indigo-600"
                            )}>
                              {count}x
                            </span>
                          )}
                          <button 
                            onClick={() => handleDeleteOfficial(name)}
                            className={cn(
                              "transition-colors",
                              darkMode ? "text-slate-600 hover:text-red-500" : "text-slate-400 hover:text-red-500"
                            )}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dalam tabel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full border rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none",
                darkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100 shadow-none" 
                  : "bg-white border-slate-200 text-slate-900 shadow-sm shadow-indigo-100/30"
              )}
            />
          </div>
          <div className={cn(
            "flex gap-8 transition-colors",
            darkMode ? "text-slate-500" : "text-slate-400"
          )}>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {items.length > 0 
                  ? `Jumlah Ibadah dari ${items[0].dayDate} sampai ${items[items.length - 1].dayDate}`
                  : "Jumlah Ibadah"
                }
              </span>
              <span className={cn(
                "text-xl font-black tabular-nums transition-colors",
                darkMode ? "text-slate-100" : "text-slate-900"
              )}>{items.length} Kali Sesi Ibadah Lingkungan</span>
            </div>
          </div>
        </div>

        {/* Total Assignment Statistics Summary */}
        {allStats.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "border rounded-2xl p-6 print:hidden transition-colors",
              darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-sm shadow-indigo-100/30"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
              )}>
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-sm",
                  darkMode ? "text-slate-100" : "text-slate-800"
                )}>Ringkasan Statistik Penugasan</h3>
                <p className={cn(
                  "text-[10px] uppercase tracking-widest font-bold",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Total Partisipasi Semua Peran</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allStats.map(([name, data]) => (
                <div key={name} className={cn(
                  "border p-3 rounded-xl hover:border-indigo-200 transition-all group font-black uppercase tracking-widest text-[10px]",
                  darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100 shadow-sm"
                )}>
                  <div className={cn(
                    "text-xs font-black mb-2 truncate group-hover:text-indigo-600 transition-colors",
                    darkMode ? "text-slate-200" : "text-slate-800"
                  )} title={name}>{name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.sermon > 0 && <span className={cn(
                      "text-[9px] border px-1.5 py-0.5 rounded",
                      darkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}>K: {data.sermon}</span>}
                    {data.agenda > 0 && <span className={cn(
                      "text-[9px] border px-1.5 py-0.5 rounded",
                      darkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}>P: {data.agenda}</span>}
                    {data.officials > 0 && <span className={cn(
                      "text-[9px] border px-1.5 py-0.5 rounded",
                      darkMode ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}>A: {data.officials}</span>}
                  </div>
                  <div className={cn(
                    "mt-2 pt-2 border-t flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] transition-colors",
                    darkMode ? "border-slate-800 text-slate-600" : "border-slate-100 text-slate-400"
                  )}>
                    <span>Total</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{data.total}x</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Abbreviation Legend */}
            <div className={cn(
              "mt-6 pt-4 border-t flex flex-wrap gap-6 transition-colors",
              darkMode ? "border-slate-800" : "border-slate-100"
            )}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors",
                  darkMode 
                    ? "bg-slate-800 text-slate-400 border-slate-700" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}>K</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Pengkhotbah</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors",
                  darkMode 
                    ? "bg-slate-800 text-slate-400 border-slate-700" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}>P</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Paragenda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors",
                  darkMode 
                    ? "bg-slate-800 text-slate-400 border-slate-700" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                )}>A</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors",
                  darkMode ? "text-slate-500" : "text-slate-400"
                )}>Pembawa Acara</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Dynamic Table Container */}
        <div className={cn(
          "border rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-slate-300 transition-colors",
          darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-indigo-100/30"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className={cn(
                  "text-[10px] uppercase tracking-[0.15em] font-black transition-colors",
                  darkMode 
                    ? "bg-slate-950 text-slate-200 shadow-sm" 
                    : "bg-slate-50 text-slate-600 border-b border-slate-200"
                )}>
                  <th className={cn(
                    "py-4 px-6 border-r w-16 text-center transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>No</th>
                  <th className={cn(
                    "py-4 px-6 border-r w-48 transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Hari / Tanggal</th>
                  <th className={cn(
                    "py-4 px-6 border-r w-56 transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Tuan Rumah</th>
                  <th className={cn(
                    "py-4 px-6 border-r w-64 transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Alamat</th>
                  <th className={cn(
                    "py-4 px-6 border-r transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Pengkhotbah</th>
                  <th className={cn(
                    "py-4 px-6 border-r transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Paragenda</th>
                  <th className={cn(
                    "py-4 px-6 border-r transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Pembawa Acara</th>
                  <th className={cn(
                    "py-4 px-6 border-r transition-colors",
                    darkMode ? "border-slate-800" : "border-slate-100"
                  )}>Keterangan</th>
                  <th className="py-4 px-6 w-16 text-center print:hidden">X</th>
                </tr>
              </thead>
              <tbody className={cn(
                "text-[13px] font-medium transition-colors",
                darkMode ? "text-slate-400" : "text-slate-600"
              )}>
                <AnimatePresence mode="popLayout">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-colors",
                            darkMode ? "bg-slate-950" : "bg-slate-50"
                          )}>
                            <Plus className={cn("w-8 h-8 transition-colors", darkMode ? "text-slate-800" : "text-slate-200")} />
                          </div>
                          <div className="max-w-xs mx-auto">
                            <h3 className={cn("font-bold text-lg mb-1 transition-colors", darkMode ? "text-slate-100" : "text-slate-900")}>Belum Ada Jadwal</h3>
                            <p className="text-sm">Gunakan generator di atas untuk membuat kerangka jadwal Anda.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "group border-b transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100",
                          index % 2 === 1 
                            ? (darkMode ? "bg-slate-950/40" : "bg-slate-50") 
                            : (darkMode ? "bg-transparent" : "bg-white"),
                          darkMode ? "hover:bg-slate-800/30" : "hover:bg-indigo-50/30"
                        )}
                      >
                        <td className={cn(
                          "py-3 px-3 text-center border-r font-mono text-[11px] transition-colors",
                          darkMode ? "border-slate-800 text-slate-700" : "border-slate-100 text-slate-400"
                        )}>
                          {index + 1}
                        </td>
                        <td className={cn(
                          "py-3 px-4 border-r font-bold transition-colors",
                          darkMode ? "border-slate-800 text-slate-200" : "border-slate-100 text-slate-800"
                        )}>
                          {item.dayDate}
                        </td>
                        <td className={cn(
                          "py-0 px-0 border-r h-full transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100"
                        )}>
                          <input
                            placeholder="Keluarga Bp. ..."
                            value={item.host}
                            onChange={(e) => handleUpdateItem(item.id, 'host', e.target.value)}
                            className={cn(
                              "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all",
                              darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                            )}
                          />
                        </td>
                        <td className={cn(
                          "py-0 px-0 border-r h-full transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100"
                        )}>
                          <textarea
                            placeholder="Alamat lengkap..."
                            value={item.address}
                            onChange={(e) => handleUpdateItem(item.id, 'address', e.target.value)}
                            rows={1}
                            className={cn(
                              "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all resize-none min-h-[52px]",
                              darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                            )}
                          />
                        </td>
                        <td className={cn(
                          "py-0 px-0 border-r h-full transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100"
                        )}>
                          <input
                            placeholder="Pengkhotbah..."
                            list="minister-list"
                            value={item.sermon}
                            onChange={(e) => handleUpdateItem(item.id, 'sermon', e.target.value)}
                            className={cn(
                              "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all font-bold italic",
                              darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                            )}
                          />
                        </td>
                        <td className={cn(
                          "py-0 px-0 border-r h-full transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100"
                        )}>
                          <input
                            placeholder="Pelayan Paragenda..."
                            list="agenda-list"
                            value={item.agenda}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === item.sermon && val !== "") {
                                notify('Peringatan: Pelayan sudah bertugas di Pengkhotbah', 'error');
                              }
                              handleUpdateItem(item.id, 'agenda', val);
                            }}
                            className={cn(
                              "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all font-bold italic",
                              darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                            )}
                          />
                        </td>
                        <td className={cn(
                          "py-0 px-0 border-r h-full transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100"
                        )}>
                          <input
                            placeholder="Pembawa Acara..."
                            list="official-list"
                            value={item.officials}
                            onChange={(e) => {
                              const val = e.target.value;
                              if ((val === item.sermon || val === item.agenda) && val !== "") {
                                notify('Peringatan: Pembawa acara sudah bertugas di kategori lain', 'error');
                              }
                              handleUpdateItem(item.id, 'officials', val);
                            }}
                            className={cn(
                              "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all font-bold italic",
                              darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                            )}
                          />
                        </td>
                        <td className={cn(
                          "py-0 px-0 border-r h-full transition-colors",
                          darkMode ? "border-slate-800" : "border-slate-100"
                        )}>
                          <input
                            placeholder="..."
                            value={item.notes}
                            onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                            className={cn(
                              "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all",
                              darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                            )}
                          />
                        </td>
                        <td className="py-2 px-4 print:hidden text-center">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className={cn(
                              "p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                              darkMode ? "text-slate-700 hover:text-red-500 hover:bg-red-950/20" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <footer className={cn(
          "flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-wider py-10 opacity-60 transition-colors",
          darkMode ? "text-slate-500" : "text-slate-400"
        )}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-green-500">
              <div className="w-2 h-2 rounded-full bg-current"></div>
              Penyimpanan Lokal Aktif
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded font-mono text-[9px] font-bold transition-colors",
                darkMode ? "bg-slate-700 text-white" : "bg-slate-800 text-white"
              )}>
                v1.0.{version}
              </span>
              <div className="transition-all duration-300 flex items-center gap-2">
                {isSaving ? (
                   <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
                    <div className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-ping" />
                    <span>Sinkronisasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Terakhir Diperbarui: {new Date(lastUpdated).toLocaleDateString('id-ID')} {new Date(lastUpdated).toLocaleTimeString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 italic normal-case font-medium">Generator Jadwal Ibadah Lingkungan - Made with ❤️</div>
        </footer>
      </main>

      {/* Minister Datalist for Sermon Field */}
      <datalist id="minister-list">
        {ministers.map(name => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <datalist id="agenda-list">
        {agendas.map(name => (
          <option key={name} value={name} />
        ))}
      </datalist>
      
      <datalist id="official-list">
        {officialsList.map(name => (
          <option key={name} value={name} />
        ))}
      </datalist>

      <style>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          header, section, .sm\\:max-w-md, .print\\:hidden, #bulk-import-modal { display: none !important; }
          footer { border-top: 1px solid #e2e8f0; margin-top: 20px; opacity: 1 !important; visibility: visible !important; display: flex !important; }
          main { max-width: none; width: 100%; padding: 0 !important; margin: 0 !important; }
          .bg-white { border: none !important; box-shadow: none !important; }
          .overflow-x-auto { overflow: visible !important; }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #000 !important; table-layout: fixed !important; min-width: 0 !important; }
          th, td { border: 1px solid #000 !important; padding: 8px 6px !important; color: #000 !important; word-wrap: break-word !important; vertical-align: middle !important; }
          th { background: #f8fafc !important; color: #000 !important; font-weight: 800 !important; font-size: 10px !important; text-transform: uppercase !important; }
          td { font-size: 11px !important; height: auto !important; }
          input, textarea { background: none !important; border: none !important; padding: 0 !important; font-size: 11px !important; width: 100% !important; height: auto !important; color: #000 !important; font-family: inherit !important; resize: none !important; }
          .min-h-screen { min-height: auto; background: white; }
          .group:hover { background: none !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
}
