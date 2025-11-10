import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCopy,
  FaPaste,
  FaLock,
  FaUnlock,
  FaArrowUp,
  FaArrowDown,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaBold,
  FaItalic,
  FaUnderline,
  FaTh,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaMinus,
  FaArrowsAlt,
} from "react-icons/fa";
import {
  MdOutlineTextFields,
  MdZoomIn,
  MdZoomOut,
  MdFullscreen,
} from "react-icons/md";
import toast from "react-hot-toast";

// Font families available in browser
const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "Palatino",
  "Garamond",
  "Comic Sans MS",
  "Impact",
  "Trebuchet MS",
  "Lucida Console",
  "Tahoma",
  "Roboto",
  "Open Sans",
];

// Text effects presets
const TEXT_EFFECTS = [
  { name: "None", shadow: "none", outline: "none" },
  {
    name: "Shadow",
    shadow: "2px 2px 4px rgba(0,0,0,0.5)",
    outline: "none",
  },
  {
    name: "Glow",
    shadow: "0 0 10px currentColor",
    outline: "none",
  },
  {
    name: "Outline",
    shadow: "none",
    outline: "2px solid currentColor",
  },
  {
    name: "3D",
    shadow: "3px 3px 0px rgba(0,0,0,0.3), 6px 6px 0px rgba(0,0,0,0.2)",
    outline: "none",
  },
];

export const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative mb-4">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
      />
    </div>
  );
};

export const ZoomControls = ({ zoom, onZoomChange, onReset }) => {
  const zoomIn = () => {
    if (zoom < 200) onZoomChange(Math.min(zoom + 10, 200));
  };

  const zoomOut = () => {
    if (zoom > 50) onZoomChange(Math.max(zoom - 10, 50));
  };

  return (
    <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2">
      <button
        onClick={zoomOut}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Zoom Out"
      >
        <MdZoomOut className="text-gray-300" />
      </button>
      <span className="text-white text-sm font-medium min-w-[60px] text-center">
        {zoom}%
      </span>
      <button
        onClick={zoomIn}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Zoom In"
      >
        <MdZoomIn className="text-gray-300" />
      </button>
      <button
        onClick={onReset}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Reset Zoom"
      >
        <MdFullscreen className="text-gray-300" />
      </button>
    </div>
  );
};

export const GridToggle = ({ showGrid, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-all ${
        showGrid
          ? "bg-purple-600 text-white"
          : "bg-gray-800 hover:bg-gray-700 text-gray-300"
      }`}
      title="Toggle Grid"
    >
      <FaTh />
    </button>
  );
};

export const FontFamilySelector = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="text-sm text-gray-400 mb-2 block">Font Family</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
      >
        {FONT_FAMILIES.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
};

export const TextAlignment = ({ value, onChange }) => {
  const alignments = [
    { value: "left", icon: FaAlignLeft },
    { value: "center", icon: FaAlignCenter },
    { value: "right", icon: FaAlignRight },
  ];

  return (
    <div className="w-full">
      <label className="text-sm text-gray-400 mb-2 block">Text Alignment</label>
      <div className="flex gap-2">
        {alignments.map(({ value: align, icon: Icon }) => (
          <button
            key={align}
            onClick={() => onChange(align)}
            className={`flex-1 p-2 rounded-lg transition-all ${
              value === align
                ? "bg-purple-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
            title={align.charAt(0).toUpperCase() + align.slice(1)}
          >
            <Icon />
          </button>
        ))}
      </div>
    </div>
  );
};

export const TextEffects = ({ value, onEffectChange }) => {
  const isSelected = (effect) => {
    if (!value) return false;
    return effect.shadow === value.shadow && effect.outline === value.outline;
  };

  return (
    <div className="w-full">
      <label className="text-sm text-gray-400 mb-2 block">Text Effects</label>
      <div className="grid grid-cols-2 gap-2">
        {TEXT_EFFECTS.map((effect) => (
          <button
            key={effect.name}
            onClick={() => onEffectChange(effect)}
            className={`p-2 rounded-lg transition-all text-sm ${
              isSelected(effect)
                ? "bg-purple-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            }`}
          >
            {effect.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export const LayerControls = ({
  currentIndex,
  totalLayers,
  onMoveUp,
  onMoveDown,
  onLock,
  onUnlock,
  isLocked,
}) => {
  return (
    <div className="flex gap-2 w-full">
      <button
        onClick={onMoveUp}
        disabled={currentIndex === totalLayers - 1}
        className="flex-1 p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-all"
        title="Move Up"
      >
        <FaArrowUp />
      </button>
      <button
        onClick={onMoveDown}
        disabled={currentIndex === 0}
        className="flex-1 p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-all"
        title="Move Down"
      >
        <FaArrowDown />
      </button>
      <button
        onClick={isLocked ? onUnlock : onLock}
        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
        title={isLocked ? "Unlock" : "Lock"}
      >
        {isLocked ? <FaLock /> : <FaUnlock />}
      </button>
    </div>
  );
};

export const CopyPasteControls = ({ onCopy, onPaste, canPaste }) => {
  return (
    <div className="flex gap-2 w-full">
      <button
        onClick={onCopy}
        className="flex-1 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
        title="Copy (Ctrl+C)"
      >
        <FaCopy />
        <span className="text-xs">Copy</span>
      </button>
      <button
        onClick={onPaste}
        disabled={!canPaste}
        className="flex-1 p-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center justify-center gap-2"
        title="Paste (Ctrl+V)"
      >
        <FaPaste />
        <span className="text-xs">Paste</span>
      </button>
    </div>
  );
};

export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: "Ctrl+Z", action: "Undo" },
    { key: "Ctrl+Y", action: "Redo" },
    { key: "Ctrl+C", action: "Copy" },
    { key: "Ctrl+V", action: "Paste" },
    { key: "Delete", action: "Delete Element" },
    { key: "Ctrl+D", action: "Duplicate" },
    { key: "Ctrl+S", action: "Save" },
    { key: "Ctrl+G", action: "Toggle Grid" },
    { key: "Ctrl+Plus", action: "Zoom In" },
    { key: "Ctrl+Minus", action: "Zoom Out" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#1f1f21] to-[#18181a] border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div
              key={key}
              className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg"
            >
              <span className="text-gray-300">{action}</span>
              <kbd className="px-2 py-1 bg-gray-900 text-purple-400 rounded text-sm font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  SearchBar,
  ZoomControls,
  GridToggle,
  FontFamilySelector,
  TextAlignment,
  TextEffects,
  LayerControls,
  CopyPasteControls,
  KeyboardShortcutsModal,
};
