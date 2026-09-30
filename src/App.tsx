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
  Calendar, 
  MapPin, 
  BookOpen, 
  User, 
  UserCheck,
  Mic2,
  FileText, 
  Home,
  Save,
  Eraser,
  Search,
  CheckCircle2,
  AlertCircle,
  Zap,
  Moon,
  Sun,
  LayoutGrid,
  Clock,
  Settings2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ColumnConfig {
  id: string;
  label: string;
  abbreviation: string;
  placeholder: string;
  enabled: boolean;
  isRemovable?: boolean;
}

export interface ScheduleItem {
  id: string;
  dayDate: string;
  time?: string;
  host: string;
  address: string;
  notes: string;
  roles: Record<string, string>;
}

export interface PresetTemplate {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  hostLabel: string;
  addressLabel: string;
  showHostSection: boolean;
  columns: ColumnConfig[];
  initialPools: Record<string, string[]>;
}

export const DEFAULT_PRESETS: PresetTemplate[] = [
  {
    id: 'ibadah',
    name: 'Ibadah Lingkungan',
    title: 'Jadwal Ibadah Lingkungan',
    subtitle: 'Generator Jadwal Ibadah Lingkungan/Sektor/Lungguk/Weijk',
    hostLabel: 'Tuan Rumah',
    addressLabel: 'Alamat',
    showHostSection: true,
    columns: [
      { id: 'sermon', label: 'Pengkhotbah', abbreviation: 'K', placeholder: 'Pengkhotbah...', enabled: true, isRemovable: false },
      { id: 'agenda', label: 'Paragenda', abbreviation: 'P', placeholder: 'Pelayan Paragenda...', enabled: true, isRemovable: false },
      { id: 'officials', label: 'Pembawa Acara', abbreviation: 'A', placeholder: 'Pembawa Acara...', enabled: true, isRemovable: false },
    ],
    initialPools: {
      sermon: ['Bp. Andreas', 'Ibu Maria', 'Bp. Yohanes'],
      agenda: ['Bp. Lukas', 'Ibu Marta', 'Bp. Simon'],
      officials: ['Sdr. Petrus', 'Sdri. Elisabeth', 'Bp. Matius'],
    }
  },
  {
    id: 'piket',
    name: 'Piket & Ronda Malam',
    title: 'Jadwal Piket & Ronda Malam',
    subtitle: 'Sistem Rotasi Petugas Keamanan & Pos Ronda Lingkungan',
    hostLabel: 'Pos / Wilayah',
    addressLabel: 'Area Patroli',
    showHostSection: true,
    columns: [
      { id: 'leader', label: 'Komandan Pos', abbreviation: 'KP', placeholder: 'Komandan Pos...', enabled: true, isRemovable: true },
      { id: 'squad_1', label: 'Petugas Utama', abbreviation: 'PU', placeholder: 'Petugas Utama...', enabled: true, isRemovable: true },
      { id: 'squad_2', label: 'Petugas Pendamping', abbreviation: 'PP', placeholder: 'Petugas Pendamping...', enabled: true, isRemovable: true },
    ],
    initialPools: {
      leader: ['Pak RT', 'Pak RW', 'Bp. Herman'],
      squad_1: ['Sdr. Budi', 'Sdr. Joko', 'Sdr. Anton'],
      squad_2: ['Sdr. Doni', 'Sdr. Eko', 'Sdr. Rian'],
    }
  },
  {
    id: 'shift',
    name: 'Shift Kerja Operasional',
    title: 'Jadwal Shift Kerja Operasional',
    subtitle: 'Manajemen Rotasi Work Shift & Petugas On-Duty',
    hostLabel: 'Unit / Cabang',
    addressLabel: 'Lokasi Kerja',
    showHostSection: true,
    columns: [
      { id: 'shift_pagi', label: 'Shift Pagi (08:00 - 16:00)', abbreviation: 'SP', placeholder: 'Petugas Pagi...', enabled: true, isRemovable: true },
      { id: 'shift_siang', label: 'Shift Siang (16:00 - 24:00)', abbreviation: 'SS', placeholder: 'Petugas Siang...', enabled: true, isRemovable: true },
      { id: 'shift_malam', label: 'Shift Malam (00:00 - 08:00)', abbreviation: 'SM', placeholder: 'Petugas Malam...', enabled: true, isRemovable: true },
    ],
    initialPools: {
      shift_pagi: ['Andi', 'Siti', 'Rina'],
      shift_siang: ['Deni', 'Maya', 'Fajar'],
      shift_malam: ['Budi', 'Rudi', 'Gita'],
    }
  },
  {
    id: 'event',
    name: 'Rapat & Event Organisasi',
    title: 'Jadwal Rapat & Kegiatan Organisasi',
    subtitle: 'Manajemen Penanggung Jawab Event & Agenda Rapat',
    hostLabel: 'Tempat / Ruang',
    addressLabel: 'Alamat / Link Meeting',
    showHostSection: true,
    columns: [
      { id: 'mod', label: 'Moderator / Ketua', abbreviation: 'M', placeholder: 'Moderator...', enabled: true, isRemovable: true },
      { id: 'writer', label: 'Notulis / Sekretaris', abbreviation: 'N', placeholder: 'Notulis...', enabled: true, isRemovable: true },
      { id: 'tech', label: 'PJ Logistik / Operator', abbreviation: 'OP', placeholder: 'Operator...', enabled: true, isRemovable: true },
    ],
    initialPools: {
      mod: ['Dr. Aris', 'Ibu Ratna'],
      writer: ['Sdri. Anisa', 'Sdri. Clarissa'],
      tech: ['Sdr. Kevin', 'Sdr. Rizky'],
    }
  },
  {
    id: 'kustom',
    name: 'Kustom / Bebas',
    title: 'Jadwal Pelayanan & Tugas Fleksibel',
    subtitle: 'Generator Jadwal Fleksibel Multi-Kebutuhan',
    hostLabel: 'Lokasi / Penyelenggara',
    addressLabel: 'Alamat / Detail',
    showHostSection: true,
    columns: [
      { id: 'role_1', label: 'Peran Utama', abbreviation: 'P1', placeholder: 'Petugas 1...', enabled: true, isRemovable: true },
      { id: 'role_2', label: 'Peran Pendamping', abbreviation: 'P2', placeholder: 'Petugas 2...', enabled: true, isRemovable: true },
    ],
    initialPools: {
      role_1: ['Tim A1', 'Tim A2', 'Tim A3'],
      role_2: ['Tim B1', 'Tim B2', 'Tim B3'],
    }
  }
];

export default function App() {
  // Title & Template Customization States
  const [scheduleTitle, setScheduleTitle] = useState<string>(() => {
    return localStorage.getItem('ibadah_title') || DEFAULT_PRESETS[0].title;
  });

  const [scheduleSubtitle, setScheduleSubtitle] = useState<string>(() => {
    return localStorage.getItem('ibadah_subtitle') || DEFAULT_PRESETS[0].subtitle;
  });

  const [hostLabel, setHostLabel] = useState<string>(() => {
    return localStorage.getItem('ibadah_host_label') || DEFAULT_PRESETS[0].hostLabel;
  });

  const [addressLabel, setAddressLabel] = useState<string>(() => {
    return localStorage.getItem('ibadah_address_label') || DEFAULT_PRESETS[0].addressLabel;
  });

  const [showHostSection, setShowHostSection] = useState<boolean>(() => {
    const saved = localStorage.getItem('ibadah_show_host_section');
    return saved !== null ? saved === 'true' : true;
  });

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('ibadah_columns');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PRESETS[0].columns;
  });

  const [rolePools, setRolePools] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('ibadah_role_pools');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Backward compatibility with previous key pools
    const savedMinisters = localStorage.getItem('ibadah_ministers');
    const savedAgendas = localStorage.getItem('ibadah_agendas');
    const savedOfficials = localStorage.getItem('ibadah_officials');

    return {
      sermon: savedMinisters ? JSON.parse(savedMinisters) : DEFAULT_PRESETS[0].initialPools.sermon,
      agenda: savedAgendas ? JSON.parse(savedAgendas) : DEFAULT_PRESETS[0].initialPools.agenda,
      officials: savedOfficials ? JSON.parse(savedOfficials) : DEFAULT_PRESETS[0].initialPools.officials,
    };
  });

  const [items, setItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('ibadah_schedule');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => {
        const roles: Record<string, string> = item.roles || {};
        if (item.sermon !== undefined && roles.sermon === undefined) roles.sermon = item.sermon;
        if (item.agenda !== undefined && roles.agenda === undefined) roles.agenda = item.agenda;
        if (item.officials !== undefined && roles.officials === undefined) roles.officials = item.officials;
        return {
          id: item.id || crypto.randomUUID(),
          dayDate: item.dayDate || '',
          time: item.time || '',
          host: item.host || '',
          address: item.address || '',
          notes: item.notes || '',
          roles,
        };
      });
    } catch (e) {
      return [];
    }
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
    mode: 'weekly' as 'weekly' | 'monthly_pattern' | 'interval',
    selectedDays: [6] as number[], // Default Saturday
    startDate: '',
    endDate: '',
    defaultTime: '19:00',
    includeTime: false,
    intervalDays: 1,
    monthlyWeeks: [1, 3] as number[], // Default 1st & 3rd week of month
  });

  const [newColumnForm, setNewColumnForm] = useState({ label: '', abbreviation: '' });
  const [newMemberInputs, setNewMemberInputs] = useState<Record<string, string>>({});

  const [hostPool, setHostPool] = useState<{name: string, address: string}[]>(() => {
    const saved = localStorage.getItem('ibadah_host_pool');
    return saved ? JSON.parse(saved) : [];
  });
  const [newHost, setNewHost] = useState({ name: '', address: '' });
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [inIframe, setInIframe] = useState(false);
  const [showKeterangan, setShowKeterangan] = useState<boolean>(() => {
    const saved = localStorage.getItem('ibadah_show_keterangan');
    return saved === 'true';
  });

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
  }, [items, hostPool, generatorSettings, columns, rolePools, scheduleTitle, scheduleSubtitle]);

  useEffect(() => {
    localStorage.setItem('ibadah_schedule', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ibadah_title', scheduleTitle);
  }, [scheduleTitle]);

  useEffect(() => {
    localStorage.setItem('ibadah_subtitle', scheduleSubtitle);
  }, [scheduleSubtitle]);

  useEffect(() => {
    localStorage.setItem('ibadah_host_label', hostLabel);
  }, [hostLabel]);

  useEffect(() => {
    localStorage.setItem('ibadah_address_label', addressLabel);
  }, [addressLabel]);

  useEffect(() => {
    localStorage.setItem('ibadah_show_host_section', showHostSection.toString());
  }, [showHostSection]);

  useEffect(() => {
    localStorage.setItem('ibadah_columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('ibadah_role_pools', JSON.stringify(rolePools));
  }, [rolePools]);

  useEffect(() => {
    localStorage.setItem('ibadah_host_pool', JSON.stringify(hostPool));
  }, [hostPool]);

  useEffect(() => {
    setInIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    localStorage.setItem('ibadah_version', version.toString());
  }, [version]);

  useEffect(() => {
    localStorage.setItem('ibadah_last_updated', lastUpdated);
  }, [lastUpdated]);

  useEffect(() => {
    localStorage.setItem('ibadah_show_keterangan', showKeterangan.toString());
  }, [showKeterangan]);

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
    notify(`${hostLabel} ditambahkan`);
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
      notify(`Tambahkan daftar ${hostLabel} terlebih dahulu`, 'error');
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
    notify(`Berhasil mengisi ${hostLabel} & ${addressLabel} secara otomatis`);
  };

  // Dynamic Role Member Handlers
  const handleAddRoleMember = (columnId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const currentPool = rolePools[columnId] || [];
    if (currentPool.includes(trimmed)) {
      notify('Nama petugas sudah ada di daftar', 'error');
      return;
    }
    setRolePools(prev => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), trimmed]
    }));
    setNewMemberInputs(prev => ({ ...prev, [columnId]: '' }));
    notify('Petugas ditambahkan');
  };

  const handleDeleteRoleMember = (columnId: string, name: string) => {
    setRolePools(prev => ({
      ...prev,
      [columnId]: (prev[columnId] || []).filter(m => m !== name)
    }));
    notify('Petugas dihapus');
  };

  const handleAutoFillRole = (columnId: string) => {
    const pool = rolePools[columnId] || [];
    const activeColumn = columns.find(c => c.id === columnId);
    if (pool.length === 0) {
      notify(`Tambahkan daftar nama untuk ${activeColumn?.label || 'kolom ini'} terlebih dahulu`, 'error');
      return;
    }
    if (items.length === 0) {
      notify('Belum ada baris jadwal yang dibuat', 'error');
      return;
    }

    const enabledCols = columns.filter(c => c.enabled);

    setItems(prev => prev.map((item, index) => {
      let memberIdx = index % pool.length;
      let selectedMember = pool[memberIdx];

      // Cross-role conflict check
      let attempts = 0;
      const alreadyAssigned = new Set<string>();
      enabledCols.forEach(c => {
        if (c.id !== columnId && item.roles[c.id]) {
          alreadyAssigned.add(item.roles[c.id].trim());
        }
      });

      while (alreadyAssigned.has(selectedMember.trim()) && attempts < pool.length) {
        memberIdx = (memberIdx + 1) % pool.length;
        selectedMember = pool[memberIdx];
        attempts++;
      }

      return {
        ...item,
        roles: {
          ...item.roles,
          [columnId]: selectedMember
        }
      };
    }));

    notify(`Berhasil mengisi ${activeColumn?.label || 'petugas'} secara otomatis (Zap ⚡)`);
  };

  // Preset Application Handler
  const handleApplyPreset = (presetId: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setScheduleTitle(preset.title);
    setScheduleSubtitle(preset.subtitle);
    setHostLabel(preset.hostLabel);
    setAddressLabel(preset.addressLabel);
    setShowHostSection(preset.showHostSection);
    setColumns(preset.columns);
    setRolePools(preset.initialPools);
    notify(`Preset "${preset.name}" berhasil diterapkan`);
  };

  // Dynamic Column Customization Controls
  const handleAddColumn = (label: string, abbreviation: string) => {
    if (!label.trim()) return;
    const newId = `col_${Date.now()}`;
    const newCol: ColumnConfig = {
      id: newId,
      label: label.trim(),
      abbreviation: abbreviation.trim() || label.trim().substring(0, 2).toUpperCase(),
      placeholder: `${label.trim()}...`,
      enabled: true,
      isRemovable: true,
    };

    setColumns(prev => [...prev, newCol]);
    setRolePools(prev => ({ ...prev, [newId]: [] }));

    // Ensure existing rows get this column key
    setItems(prev => prev.map(item => ({
      ...item,
      roles: { ...item.roles, [newId]: '' }
    })));

    setNewColumnForm({ label: '', abbreviation: '' });
    notify(`Kolom "${label.trim()}" ditambahkan`);
  };

  const handleToggleColumn = (columnId: string) => {
    setColumns(prev => prev.map(col => col.id === columnId ? { ...col, enabled: !col.enabled } : col));
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;
    setColumns(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const targetCol = columns.find(c => c.id === columnId);
    if (!targetCol) return;
    if (!confirm(`Hapus kolom "${targetCol.label}"?`)) return;

    setColumns(prev => prev.filter(c => c.id !== columnId));
    setRolePools(prev => {
      const copy = { ...prev };
      delete copy[columnId];
      return copy;
    });
    setItems(prev => prev.map(item => {
      const updatedRoles = { ...item.roles };
      delete updatedRoles[columnId];
      return { ...item, roles: updatedRoles };
    }));

    notify(`Kolom "${targetCol.label}" dihapus`);
  };

  const handleToggleDay = (dayValue: number) => {
    setGeneratorSettings(prev => {
      const exists = prev.selectedDays.includes(dayValue);
      return {
        ...prev,
        selectedDays: exists
          ? prev.selectedDays.filter(d => d !== dayValue)
          : [...prev.selectedDays, dayValue]
      };
    });
  };

  const handleToggleWeek = (weekNum: number) => {
    setGeneratorSettings(prev => {
      const exists = prev.monthlyWeeks.includes(weekNum);
      return {
        ...prev,
        monthlyWeeks: exists
          ? prev.monthlyWeeks.filter(w => w !== weekNum)
          : [...prev.monthlyWeeks, weekNum]
      };
    });
  };

  const handleGenerate = () => {
    const { mode, selectedDays, startDate, endDate, defaultTime, includeTime, intervalDays, monthlyWeeks } = generatorSettings;
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

    if (mode === 'weekly') {
      if (selectedDays.length === 0) {
        notify('Pilih minimal satu hari dalam seminggu', 'error');
        return;
      }
      while (current <= end) {
        if (selectedDays.includes(current.getDay())) {
          const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
          const dateString = current.toLocaleDateString('id-ID', options);
          const emptyRoles: Record<string, string> = {};
          columns.forEach(col => { emptyRoles[col.id] = ''; });

          newRows.push({
            id: crypto.randomUUID(),
            dayDate: dateString,
            time: includeTime ? defaultTime : '',
            host: '',
            address: '',
            notes: '',
            roles: emptyRoles,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (mode === 'monthly_pattern') {
      if (selectedDays.length === 0) {
        notify('Pilih minimal satu hari', 'error');
        return;
      }
      if (monthlyWeeks.length === 0) {
        notify('Pilih urutan minggu (misal: Minggu ke-1 & ke-3)', 'error');
        return;
      }
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          const dayOfMonth = current.getDate();
          const weekNum = Math.ceil(dayOfMonth / 7);
          if (monthlyWeeks.includes(weekNum)) {
            const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            const dateString = current.toLocaleDateString('id-ID', options);
            const emptyRoles: Record<string, string> = {};
            columns.forEach(col => { emptyRoles[col.id] = ''; });

            newRows.push({
              id: crypto.randomUUID(),
              dayDate: dateString,
              time: includeTime ? defaultTime : '',
              host: '',
              address: '',
              notes: '',
              roles: emptyRoles,
            });
          }
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (mode === 'interval') {
      const step = Math.max(1, intervalDays);
      while (current <= end) {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const dateString = current.toLocaleDateString('id-ID', options);
        const emptyRoles: Record<string, string> = {};
        columns.forEach(col => { emptyRoles[col.id] = ''; });

        newRows.push({
          id: crypto.randomUUID(),
          dayDate: dateString,
          time: includeTime ? defaultTime : '',
          host: '',
          address: '',
          notes: '',
          roles: emptyRoles,
        });
        current.setDate(current.getDate() + step);
      }
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

  const handleUpdateRole = (id: string, columnId: string, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        roles: {
          ...item.roles,
          [columnId]: value
        }
      };
    }));
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

    const enabledCols = columns.filter(c => c.enabled);

    const exportData = items.map((item, index) => {
      const row: Record<string, any> = {
        'No.': index + 1,
        'Hari / Tanggal': item.time ? `${item.dayDate} (${item.time})` : item.dayDate,
      };

      if (showHostSection) {
        row[hostLabel] = item.host;
        row[addressLabel] = item.address;
      }

      enabledCols.forEach(col => {
        row[col.label] = item.roles[col.id] || '';
      });

      if (showKeterangan) {
        row['Keterangan'] = item.notes;
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const sheetName = scheduleTitle.replace(/[\/\\?%*:|"<>]/g, '').substring(0, 31) || 'Jadwal';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${scheduleTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    notify('Berhasil mengekspor ke Excel');
  };

  const handlePrint = () => {
    notify('Mempersiapkan dokumen...', 'success');
    setTimeout(() => {
      try {
        window.focus();
        window.print();
        setTimeout(() => {
          notify('Tips: Jika dialog cetak tidak muncul, silakan klik tombol "Buka di Tab Baru" di pojok kanan atas.', 'success');
        }, 1500);
      } catch (err) {
        console.error('Print failed:', err);
        notify('Fitur cetak terhalang browser. Silakan buka aplikasi di TAB BARU.', 'error');
      }
    }, 500);
  };

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    const inBasic = item.dayDate.toLowerCase().includes(query) ||
      (item.time && item.time.toLowerCase().includes(query)) ||
      item.host.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query) ||
      item.notes.toLowerCase().includes(query);
    const inRoles = Object.values(item.roles || {}).some(val => val.toLowerCase().includes(query));
    return inBasic || inRoles;
  });

  const getRoleDutyCount = (name: string, columnId: string) => {
    return items.filter(item => item.roles[columnId]?.trim() === name.trim()).length;
  };

  const getAllStats = () => {
    const stats: Record<string, { byRole: Record<string, number>; total: number }> = {};
    const enabledCols = columns.filter(c => c.enabled);

    items.forEach(item => {
      enabledCols.forEach(col => {
        const val = item.roles[col.id]?.trim();
        if (val) {
          if (!stats[val]) {
            stats[val] = { byRole: {}, total: 0 };
          }
          stats[val].byRole[col.id] = (stats[val].byRole[col.id] || 0) + 1;
          stats[val].total += 1;
        }
      });
    });

    return Object.entries(stats).sort((a, b) => b[1].total - a[1].total);
  };

  const allStats = getAllStats();

  const getUnassignedHosts = () => {
    const assignedHostNames = new Set(items.map(item => item.host.trim()).filter(h => h));
    return hostPool.filter(h => !assignedHostNames.has(h.name.trim()));
  };

  const unassignedHosts = getUnassignedHosts();
  const enabledColumns = columns.filter(c => c.enabled);

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
          <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all",
                darkMode ? "bg-indigo-600 shadow-indigo-900/20" : "bg-indigo-600 shadow-lg shadow-indigo-100"
              )}>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <input
                  type="text"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  className={cn(
                    "text-xl font-bold tracking-tight transition-colors leading-none mb-1 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 outline-none w-full",
                    darkMode ? "text-slate-100" : "text-slate-800"
                  )}
                  placeholder="Judul Jadwal..."
                />
                <input
                  type="text"
                  value={scheduleSubtitle}
                  onChange={(e) => setScheduleSubtitle(e.target.value)}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 outline-none w-full",
                    darkMode ? "text-slate-500" : "text-slate-400"
                  )}
                  placeholder="Deskripsi / Subtitle Jadwal..."
                />
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
                  "px-4 py-2.5 border rounded-lg text-sm font-semibold transition-all flex items-center gap-2 relative group",
                  darkMode 
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <Printer className="w-4 h-4" />
                Cetak PDF
                
                {inIframe && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-sm" />
                )}
              </button>

              {inIframe && (
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700",
                    darkMode ? "text-slate-300" : "text-slate-600"
                  )}
                  title="Buka di tab baru untuk fitur Cetak yang lancar"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Buka di Tab Baru
                </a>
              )}

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
                  <h3 className={cn("font-bold", darkMode ? "text-slate-100" : "text-slate-800")}>Bulk Import {hostLabel} & {addressLabel}</h3>
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
                    )}>Nama, Alamat / Detail</code>
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

        <main className="max-w-full mx-auto px-8 py-10 space-y-8">
          {/* Print Title - Visible only when printing */}
          <div className="hidden print:block text-center space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{scheduleTitle}</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{scheduleSubtitle}</p>
            <div className="border-b-2 border-slate-900 w-full mt-4"></div>
          </div>

          {/* Template Preset Quick Selector */}
          <section className="print:hidden space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className={cn("text-xs font-black uppercase tracking-widest", darkMode ? "text-slate-400" : "text-slate-500")}>
                Pilih Preset Template Kebutuhan
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {DEFAULT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all active:scale-95 group",
                    darkMode
                      ? "bg-slate-900 border-slate-800 hover:border-indigo-600 hover:bg-slate-850"
                      : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md"
                  )}
                >
                  <div className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {preset.name}
                  </div>
                  <div className={cn("text-[10px] truncate mt-0.5", darkMode ? "text-slate-500" : "text-slate-400")}>
                    {preset.columns.length} Kolom Tugas
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Generator Controls - Advanced & Flexible */}
          <section className={cn(
            "border rounded-2xl p-6 transition-colors print:hidden space-y-6",
            darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-sm shadow-indigo-100/30"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                )}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>
                    Generator Jadwal Fleksibel
                  </h3>
                  <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Multi-hari, pola mingguan, bulanan, atau interval harian.
                  </p>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className={cn("flex p-1 rounded-xl border text-xs font-bold", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200")}>
                <button
                  onClick={() => setGeneratorSettings(p => ({ ...p, mode: 'weekly' }))}
                  className={cn("px-3 py-1.5 rounded-lg transition-all", generatorSettings.mode === 'weekly' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500")}
                >
                  Pilih Hari (Mingguan)
                </button>
                <button
                  onClick={() => setGeneratorSettings(p => ({ ...p, mode: 'monthly_pattern' }))}
                  className={cn("px-3 py-1.5 rounded-lg transition-all", generatorSettings.mode === 'monthly_pattern' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500")}
                >
                  Pola Bulanan
                </button>
                <button
                  onClick={() => setGeneratorSettings(p => ({ ...p, mode: 'interval' }))}
                  className={cn("px-3 py-1.5 rounded-lg transition-all", generatorSettings.mode === 'interval' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500")}
                >
                  Interval Harian
                </button>
              </div>
            </div>

            {/* Mode Specific Settings */}
            <div className="space-y-4">
              {(generatorSettings.mode === 'weekly' || generatorSettings.mode === 'monthly_pattern') && (
                <div className="space-y-2">
                  <label className={cn("text-[11px] font-bold uppercase tracking-wider", darkMode ? "text-slate-400" : "text-slate-500")}>
                    Pilih Hari yang Diikutsertakan:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {days.map(day => {
                      const selected = generatorSettings.selectedDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          onClick={() => handleToggleDay(day.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                            selected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : (darkMode ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {generatorSettings.mode === 'monthly_pattern' && (
                <div className="space-y-2">
                  <label className={cn("text-[11px] font-bold uppercase tracking-wider", darkMode ? "text-slate-400" : "text-slate-500")}>
                    Pilih Minggu ke berapa dalam Bulan:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(w => {
                      const selected = generatorSettings.monthlyWeeks.includes(w);
                      return (
                        <button
                          key={w}
                          onClick={() => handleToggleWeek(w)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                            selected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : (darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600")
                          )}
                        >
                          Minggu Ke-{w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {generatorSettings.mode === 'interval' && (
                <div className="space-y-2 max-w-xs">
                  <label className={cn("text-[11px] font-bold uppercase tracking-wider", darkMode ? "text-slate-400" : "text-slate-500")}>
                    Ulangi Setiap Berapa Hari:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={generatorSettings.intervalDays}
                    onChange={(e) => setGeneratorSettings(p => ({ ...p, intervalDays: parseInt(e.target.value) || 1 }))}
                    className={cn(
                      "w-full border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500",
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700"
                    )}
                  />
                </div>
              )}
            </div>

            {/* Date Range, Time, and Generate Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className={cn("text-[11px] font-bold uppercase tracking-wider", darkMode ? "text-slate-400" : "text-slate-500")}>Dari Tanggal</label>
                <input
                  type="date"
                  value={generatorSettings.startDate}
                  onChange={(e) => setGeneratorSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className={cn(
                    "w-full border rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none",
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-200 font-mono" : "bg-slate-50 border-slate-100 text-slate-700 font-mono"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <label className={cn("text-[11px] font-bold uppercase tracking-wider", darkMode ? "text-slate-400" : "text-slate-500")}>Sampai Tanggal</label>
                <input
                  type="date"
                  value={generatorSettings.endDate}
                  onChange={(e) => setGeneratorSettings(prev => ({ ...prev, endDate: e.target.value }))}
                  className={cn(
                    "w-full border rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none",
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-200 font-mono" : "bg-slate-50 border-slate-100 text-slate-700 font-mono"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={cn("text-[11px] font-bold uppercase tracking-wider", darkMode ? "text-slate-400" : "text-slate-500")}>Waktu / Jam</label>
                  <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generatorSettings.includeTime}
                      onChange={(e) => setGeneratorSettings(p => ({ ...p, includeTime: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Sertakan Jam</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Contoh: 19:00 WIB"
                  disabled={!generatorSettings.includeTime}
                  value={generatorSettings.defaultTime}
                  onChange={(e) => setGeneratorSettings(prev => ({ ...prev, defaultTime: e.target.value }))}
                  className={cn(
                    "w-full border rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                    !generatorSettings.includeTime && "opacity-40 cursor-not-allowed",
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-100 text-slate-700"
                  )}
                />
              </div>

              <button
                onClick={handleGenerate}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                  darkMode 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-none" 
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-indigo-100/50"
                )}
              >
                <Plus className="w-4 h-4" />
                Generate Jadwal
              </button>
            </div>
          </section>

          {/* Dynamic Column & Custom Role Configurator */}
          <section className={cn(
            "border rounded-2xl p-6 transition-colors print:hidden space-y-6",
            darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-sm shadow-indigo-100/30"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
              )}>
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>
                  Pengaturan Kolom Tugas / Peran
                </h3>
                <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>
                  Atur nama kolom, tambah peran kustom, ubah urutan, dan kontrol visibilitas.
                </p>
              </div>
            </div>

            {/* Column List */}
            <div className="space-y-3">
              {columns.map((col, idx) => (
                <div
                  key={col.id}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all",
                    darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                    <span className={cn("px-2 py-1 rounded text-[10px] font-black uppercase border", darkMode ? "bg-slate-900 border-slate-800 text-indigo-400" : "bg-white border-slate-200 text-indigo-600")}>
                      {col.abbreviation}
                    </span>
                    <input
                      type="text"
                      value={col.label}
                      onChange={(e) => setColumns(prev => prev.map(c => c.id === col.id ? { ...c, label: e.target.value } : c))}
                      className={cn(
                        "font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none flex-1",
                        darkMode ? "text-slate-200" : "text-slate-800"
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleColumn(col.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border",
                        col.enabled
                          ? (darkMode ? "bg-indigo-950/40 text-indigo-400 border-indigo-900" : "bg-indigo-50 text-indigo-600 border-indigo-200")
                          : (darkMode ? "bg-slate-900 text-slate-600 border-slate-800" : "bg-slate-200 text-slate-500 border-slate-300")
                      )}
                    >
                      {col.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {col.enabled ? 'Aktif' : 'Sembunyi'}
                    </button>

                    <button
                      onClick={() => handleMoveColumn(idx, 'up')}
                      disabled={idx === 0}
                      className={cn("p-1.5 rounded-lg border transition-all disabled:opacity-30", darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600")}
                      title="Naikkan Urutan"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleMoveColumn(idx, 'down')}
                      disabled={idx === columns.length - 1}
                      className={cn("p-1.5 rounded-lg border transition-all disabled:opacity-30", darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600")}
                      title="Turunkan Urutan"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>

                    {col.isRemovable !== false && (
                      <button
                        onClick={() => handleDeleteColumn(col.id)}
                        className={cn("p-1.5 rounded-lg transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20")}
                        title="Hapus Kolom"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Custom Column Form */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className={cn("text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-slate-500" : "text-slate-400")}>Nama Kolom Baru</label>
                <input
                  type="text"
                  placeholder="Contoh: Pemusik, Kolekte, Operator Zoom"
                  value={newColumnForm.label}
                  onChange={(e) => setNewColumnForm(p => ({ ...p, label: e.target.value }))}
                  className={cn("w-full border rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500", darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700")}
                />
              </div>
              <div className="w-full sm:w-32 space-y-1">
                <label className={cn("text-[10px] font-bold uppercase tracking-wider", darkMode ? "text-slate-500" : "text-slate-400")}>Singkatan Kode</label>
                <input
                  type="text"
                  placeholder="Misal: PM"
                  value={newColumnForm.abbreviation}
                  onChange={(e) => setNewColumnForm(p => ({ ...p, abbreviation: e.target.value }))}
                  className={cn("w-full border rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500", darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-700")}
                />
              </div>
              <button
                onClick={() => handleAddColumn(newColumnForm.label, newColumnForm.abbreviation)}
                className={cn("w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2", darkMode ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100")}
              >
                <Plus className="w-4 h-4" />
                Tambah Kolom
              </button>
            </div>
          </section>

          {/* Location & Host Section (Optional toggleable) */}
          {showHostSection && (
            <section className={cn(
              "border rounded-2xl p-6 transition-colors print:hidden",
              darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-sm shadow-indigo-100/30"
            )}>
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                )}>
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>
                    Manajemen {hostLabel} & {addressLabel}
                  </h3>
                  <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Daftar lokasi / penyelenggara yang akan dirotasikan.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className={cn("text-[11px] font-bold uppercase tracking-wider ml-1", darkMode ? "text-slate-500" : "text-slate-400")}>
                      Kelola Daftar {hostLabel}
                    </label>
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
                      placeholder={`Nama ${hostLabel}`}
                      className={cn(
                        "w-full border rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-indigo-500",
                        darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-sm"
                      )}
                      value={newHost.name}
                      onChange={(e) => setNewHost(prev => ({...prev, name: e.target.value}))}
                    />
                    <textarea
                      placeholder={`${addressLabel} Lengkap`}
                      rows={2}
                      className={cn(
                        "w-full border rounded-xl px-4 py-2 text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-indigo-500",
                        darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-sm"
                      )}
                      value={newHost.address}
                      onChange={(e) => setNewHost(prev => ({...prev, address: e.target.value}))}
                    />
                    <button
                      onClick={handleAddHost}
                      className={cn(
                        "w-full py-2.5 rounded-xl font-bold transition-all font-black uppercase tracking-widest text-[10px]",
                        darkMode ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      )}
                    >
                      Tambah ke Daftar
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-end">
                    <label className={cn("text-[11px] font-bold uppercase tracking-wider ml-1", darkMode ? "text-slate-500" : "text-slate-400")}>
                      Daftar Slot {hostLabel} ({hostPool.length})
                    </label>
                    <button
                      onClick={handleAutoFillHosts}
                      className={cn(
                        "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                        darkMode ? "text-indigo-400 hover:text-indigo-300 bg-indigo-900/20" : "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                      )}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      Inject {hostLabel} & {addressLabel}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {hostPool.length === 0 ? (
                      <div className={cn("col-span-full py-8 text-center border-2 border-dashed rounded-2xl text-sm italic", darkMode ? "border-slate-800 text-slate-700" : "border-slate-100 text-slate-300")}>
                        Belum ada daftar {hostLabel}
                      </div>
                    ) : (
                      hostPool.map((host, idx) => (
                        <div key={idx} className={cn(
                          "border p-3 rounded-xl flex justify-between items-start group hover:border-indigo-200 transition-all shadow-sm",
                          darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100"
                        )}>
                          <div className="space-y-0.5">
                            <div className={cn("text-xs font-black", darkMode ? "text-slate-200" : "text-slate-800")}>{host.name}</div>
                            <div className={cn("text-[10px]", darkMode ? "text-slate-500" : "text-slate-400")}>{host.address}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteHost(idx)}
                            className={cn("transition-colors opacity-0 group-hover:opacity-100", darkMode ? "text-slate-800 hover:text-red-500" : "text-slate-200 hover:text-red-500")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Reserve Hosts Section */}
          {showHostSection && unassignedHosts.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-6 border rounded-2xl transition-all shadow-xl shadow-amber-500/5 print:hidden",
                darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", darkMode ? "bg-amber-900/20 text-amber-400" : "bg-amber-50 text-amber-600")}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>
                    {hostLabel} Cadangan
                  </h3>
                  <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Belum Masuk ke Dalam Jadwal Utama ({unassignedHosts.length} Data)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unassignedHosts.map((host, idx) => (
                  <div key={idx} className={cn("p-4 rounded-xl border transition-all", darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                    <div className={cn("text-xs font-black mb-1", darkMode ? "text-slate-200" : "text-slate-800")}>{host.name}</div>
                    <div className={cn("text-[10px] leading-relaxed", darkMode ? "text-slate-500" : "text-slate-400")}>{host.address}</div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Dynamic Role Member Pools */}
          {enabledColumns.map(col => {
            const pool = rolePools[col.id] || [];
            const inputValue = newMemberInputs[col.id] || '';

            return (
              <section
                key={col.id}
                className={cn(
                  "border rounded-2xl p-6 transition-colors print:hidden",
                  darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-sm shadow-indigo-100/30"
                )}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs", darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600")}>
                    {col.abbreviation}
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>
                      Daftar Petugas: {col.label}
                    </h3>
                    <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>
                      Kelola nama-nama anggota untuk kolom {col.label}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 space-y-2">
                    <label className={cn("text-[11px] font-bold uppercase tracking-wider ml-1", darkMode ? "text-slate-500" : "text-slate-400")}>
                      Tambah Nama Petugas
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Nama Petugas..."
                        value={inputValue}
                        onChange={(e) => setNewMemberInputs(p => ({ ...p, [col.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRoleMember(col.id, inputValue)}
                        className={cn(
                          "flex-1 border rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                          darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-100 text-slate-700 shadow-sm"
                        )}
                      />
                      <button
                        onClick={() => handleAddRoleMember(col.id, inputValue)}
                        className={cn("p-2.5 rounded-xl transition-all", darkMode ? "bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100")}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-end">
                      <label className={cn("text-[11px] font-bold uppercase tracking-wider ml-1", darkMode ? "text-slate-500" : "text-slate-400")}>
                        Daftar Pilihan ({pool.length})
                      </label>
                      <button
                        onClick={() => handleAutoFillRole(col.id)}
                        className={cn(
                          "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg",
                          darkMode ? "text-indigo-400 hover:text-indigo-300 bg-indigo-900/20" : "text-indigo-600 hover:text-indigo-700 bg-indigo-50"
                        )}
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        Inject {col.label}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pool.length === 0 ? (
                        <span className={cn("text-xs italic", darkMode ? "text-slate-700" : "text-slate-300")}>
                          Belum ada nama petugas yang ditambahkan.
                        </span>
                      ) : (
                        pool.map((name) => {
                          const count = getRoleDutyCount(name, col.id);
                          return (
                            <div
                              key={name}
                              className={cn(
                                "border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all group",
                                darkMode ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-900" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                              )}
                            >
                              {name}
                              {count > 0 && (
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md", darkMode ? "bg-slate-800 text-slate-400" : "bg-indigo-50 text-indigo-600")}>
                                  {count}x
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteRoleMember(col.id, name)}
                                className={cn("transition-colors", darkMode ? "text-slate-600 hover:text-red-500" : "text-slate-400 hover:text-red-500")}
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
              </section>
            );
          })}

          {/* Dynamic Duty Statistics Summary Dashboard */}
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
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600")}>
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>Ringkasan Statistik Penugasan</h3>
                  <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>Total Partisipasi Semua Peran Aktif</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allStats.map(([name, data]) => (
                  <div key={name} className={cn(
                    "border p-3 rounded-xl hover:border-indigo-200 transition-all group font-black uppercase tracking-widest text-[10px]",
                    darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-100 shadow-sm"
                  )}>
                    <div className={cn("text-xs font-black mb-2 truncate group-hover:text-indigo-600 transition-colors", darkMode ? "text-slate-200" : "text-slate-800")} title={name}>{name}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {enabledColumns.map(col => {
                        const cnt = data.byRole[col.id] || 0;
                        if (cnt === 0) return null;
                        return (
                          <span key={col.id} className={cn("text-[9px] border px-1.5 py-0.5 rounded", darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500")}>
                            {col.abbreviation}: {cnt}
                          </span>
                        );
                      })}
                    </div>
                    <div className={cn("mt-2 pt-2 border-t flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] transition-colors", darkMode ? "border-slate-800 text-slate-600" : "border-slate-100 text-slate-400")}>
                      <span>Total</span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{data.total}x</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className={cn("mt-6 pt-4 border-t flex flex-wrap gap-6 transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
                {enabledColumns.map(col => (
                  <div key={col.id} className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors", darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200")}>
                      {col.abbreviation}
                    </span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", darkMode ? "text-slate-500" : "text-slate-400")}>
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Search Bar & Stats Bar */}
          <div className="flex flex-col gap-8 print:hidden border-t pt-8">
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", darkMode ? "bg-indigo-900/20 text-indigo-400" : "bg-indigo-50 text-indigo-600")}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", darkMode ? "text-slate-100" : "text-slate-800")}>Tabel Jadwal Utama</h3>
                <p className={cn("text-[10px] uppercase tracking-widest font-bold", darkMode ? "text-slate-500" : "text-slate-400")}>Cari, edit, dan review draf jadwal.</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full flex-1">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari dalam tabel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full border rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none",
                      darkMode ? "bg-slate-900 border-slate-800 text-slate-100 shadow-none" : "bg-white border-slate-200 text-slate-900 shadow-sm shadow-indigo-100/30"
                    )}
                  />
                </div>

                {/* Dynamic Column Options */}
                <div className="flex items-center gap-3 whitespace-nowrap bg-slate-500/5 px-4 py-2 rounded-xl">
                  <label className={cn("text-[10px] font-bold uppercase tracking-widest", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Sertakan Kolom Keterangan?
                  </label>
                  <button
                    onClick={() => setShowKeterangan(!showKeterangan)}
                    className={cn(
                      "relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none",
                      showKeterangan ? "bg-indigo-600" : (darkMode ? "bg-slate-800" : "bg-slate-200")
                    )}
                  >
                    <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", showKeterangan ? "translate-x-6" : "translate-x-1")} />
                  </button>
                </div>

                {/* Statistics Inline */}
                <div className={cn("flex border-t pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6 transition-colors items-center gap-4 h-auto sm:h-10", darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400")}>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest leading-none mb-1 opacity-70">
                      {items.length > 0 ? `${items[0].dayDate} - ${items[items.length - 1].dayDate}` : "Rentang Jadwal"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={cn("text-base font-black tabular-nums transition-colors leading-none", darkMode ? "text-slate-100" : "text-slate-900")}>{items.length}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">Sesi Terjadwal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dynamic Schedule Table */}
          <div className={cn(
            "border rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-slate-300 transition-colors",
            darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-200 shadow-indigo-100/30"
          )}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className={cn("text-[10px] uppercase tracking-[0.15em] font-black transition-colors", darkMode ? "bg-slate-950 text-slate-200 shadow-sm" : "bg-slate-50 text-slate-600 border-b border-slate-200")}>
                    <th className={cn("py-4 px-6 border-r w-16 text-center transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>No</th>
                    <th className={cn("py-4 px-6 border-r w-48 transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>Hari / Tanggal</th>
                    {showHostSection && (
                      <>
                        <th className={cn("py-4 px-6 border-r w-56 transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>{hostLabel}</th>
                        <th className={cn("py-4 px-6 border-r w-64 transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>{addressLabel}</th>
                      </>
                    )}
                    {enabledColumns.map(col => (
                      <th key={col.id} className={cn("py-4 px-6 border-r transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
                        {col.label}
                      </th>
                    ))}
                    {showKeterangan && (
                      <th className={cn("py-4 px-6 border-r transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>Keterangan</th>
                    )}
                    <th className="py-4 px-6 w-16 text-center print:hidden">X</th>
                  </tr>
                </thead>
                <tbody className={cn("text-[13px] font-medium transition-colors", darkMode ? "text-slate-400" : "text-slate-600")}>
                  <AnimatePresence mode="popLayout">
                    {filteredItems.length === 0 ? (
                      <tr className="print:hidden">
                        <td colSpan={enabledColumns.length + (showHostSection ? 2 : 0) + (showKeterangan ? 1 : 0) + 2} className="py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-colors", darkMode ? "bg-slate-950" : "bg-slate-50")}>
                              <Plus className={cn("w-8 h-8 transition-colors", darkMode ? "text-slate-800" : "text-slate-200")} />
                            </div>
                            <div className="max-w-xs mx-auto">
                              <h3 className={cn("font-bold text-lg mb-1 transition-colors", darkMode ? "text-slate-100" : "text-slate-900")}>Belum Ada Jadwal</h3>
                              <p className="text-sm">Gunakan generator di atas untuk membuat draf jadwal Anda.</p>
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
                            index % 2 === 1 ? (darkMode ? "bg-slate-950/40" : "bg-slate-50") : (darkMode ? "bg-transparent" : "bg-white"),
                            darkMode ? "hover:bg-slate-800/30" : "hover:bg-indigo-50/30"
                          )}
                        >
                          <td className={cn("py-3 px-3 text-center border-r font-mono text-[11px] transition-colors", darkMode ? "border-slate-800 text-slate-700" : "border-slate-100 text-slate-400")}>
                            {index + 1}
                          </td>

                          <td className={cn("py-3 px-4 border-r transition-colors", darkMode ? "border-slate-800 text-slate-200" : "border-slate-100 text-slate-800")}>
                            <div className="font-bold">{item.dayDate}</div>
                            {item.time && (
                              <div className={cn("text-[11px] font-mono flex items-center gap-1 mt-0.5", darkMode ? "text-indigo-400" : "text-indigo-600")}>
                                <Clock className="w-3 h-3" />
                                {item.time}
                              </div>
                            )}
                          </td>

                          {showHostSection && (
                            <>
                              <td className={cn("py-0 px-0 border-r h-full transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
                                <input
                                  placeholder={`Nama ${hostLabel}...`}
                                  value={item.host}
                                  onChange={(e) => handleUpdateItem(item.id, 'host', e.target.value)}
                                  className={cn(
                                    "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all",
                                    darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                                  )}
                                />
                              </td>
                              <td className={cn("py-0 px-0 border-r h-full transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
                                <textarea
                                  placeholder={`${addressLabel}...`}
                                  value={item.address}
                                  onChange={(e) => handleUpdateItem(item.id, 'address', e.target.value)}
                                  rows={1}
                                  className={cn(
                                    "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all resize-none min-h-[52px]",
                                    darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                                  )}
                                />
                              </td>
                            </>
                          )}

                          {enabledColumns.map(col => (
                            <td key={col.id} className={cn("py-0 px-0 border-r h-full transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
                              <input
                                placeholder={col.placeholder}
                                list={`datalist_${col.id}`}
                                value={item.roles[col.id] || ''}
                                onChange={(e) => handleUpdateRole(item.id, col.id, e.target.value)}
                                className={cn(
                                  "w-full h-full p-4 bg-transparent border-none focus:ring-2 focus:ring-inset focus:ring-indigo-500/20 outline-none transition-all font-bold italic",
                                  darkMode ? "text-slate-300 placeholder:text-slate-800" : "text-slate-700 placeholder:text-slate-200"
                                )}
                              />
                            </td>
                          ))}

                          {showKeterangan && (
                            <td className={cn("py-0 px-0 border-r h-full transition-colors", darkMode ? "border-slate-800" : "border-slate-100")}>
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
                          )}

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

          {/* Dynamic Datalists */}
          {enabledColumns.map(col => (
            <datalist key={col.id} id={`datalist_${col.id}`}>
              {(rolePools[col.id] || []).map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          ))}

          {/* Footer Info */}
          <footer className={cn("flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-wider py-10 opacity-60 transition-colors", darkMode ? "text-slate-500" : "text-slate-400")}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-green-500">
                <div className="w-2 h-2 rounded-full bg-current"></div>
                Penyimpanan Lokal Aktif
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded font-mono text-[9px] font-bold transition-colors", darkMode ? "bg-slate-700 text-white" : "bg-slate-800 text-white")}>
                  v1.1.{version}
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
            <div className="mt-4 md:mt-0 italic normal-case font-medium">Generator Jadwal Fleksibel Multi-Kebutuhan - Made with ❤️</div>
          </footer>
        </main>

        <style>{`
          @media print {
            @page { size: landscape; margin: 1cm; }
            body { background: white; -webkit-print-color-adjust: exact; }
            header, .print\\:hidden, #bulk-import-modal { display: none !important; }
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
            tr { page-break-inside: avoid !important; }
          }
        `}</style>
    </div>
  );
}
