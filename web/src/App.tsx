import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

const demos = [
  { name: 'MTC ColorPicker (BTC)', tag: 'MTC', bundle: 'MTCColorPicker-BTC.web.bundle' },
  { name: 'MTC ColorPicker (Signal)', tag: 'MTC', bundle: 'MTCColorPicker-Signal.web.bundle' },
  { name: 'MTC ColorPicker (State)', tag: 'MTC', bundle: 'MTCColorPicker-State.web.bundle' },
  { name: 'BTC-MTS ColorPicker (MTS)', tag: 'BTC-MTS', bundle: 'BTCMTSColorPicker-MTSCoord.web.bundle' },
  { name: 'BTC-MTS ColorPicker (BTS)', tag: 'BTC-MTS', bundle: 'BTCMTSColorPicker-BTSCoord.web.bundle' },
  { name: 'BTC-MTS Slider', tag: 'BTC-MTS', bundle: 'BTCMTSSlider.web.bundle' },
  { name: 'BTC Slider', tag: 'BTC', bundle: 'BTCSlider.web.bundle' },
];

export function App() {
  const [selected, setSelected] = useState(demos[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const closeMenu = useCallback(() => {
    // Coalesce multiple rapid close calls so we only ever have one timer.
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, 180);
  }, []);

  // Clear any pending close timer on unmount to avoid setState-after-unmount.
  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
    } else {
      setMenuOpen(true);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [menuOpen, closeMenu]);

  return (
    <div className="container">
      {/* Desktop sidebar */}
      <nav className="sidebar">
        <h1 className="title">MTC Color Picker</h1>
        <div className="demo-list">
          {demos.map((demo) => (
            <button
              key={demo.bundle}
              className={`demo-btn ${selected.bundle === demo.bundle ? 'active' : ''}`}
              onClick={() => setSelected(demo)}
            >
              {demo.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="topbar">
        <button
          className={`topbar-trigger ${menuOpen && !closing ? 'open' : ''}`}
          onClick={toggleMenu}
        >
          <span className="topbar-label">{selected.name}</span>
          <span className="topbar-chevron">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2.5 3.75L5 6.25L7.5 3.75"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {menuOpen && (
          <>
            <div
              className={`overlay ${closing ? 'overlay-exit' : ''}`}
              onClick={closeMenu}
            />
            <div
              ref={dropdownRef}
              className={`dropdown ${closing ? 'dropdown-exit' : ''}`}
            >
              <div className="dropdown-inner">
                {demos.map((demo, i) => (
                  <button
                    key={demo.bundle}
                    className={`dropdown-item ${selected.bundle === demo.bundle ? 'active' : ''}`}
                    style={{ animationDelay: `${i * 20}ms` }}
                    onClick={() => {
                      setSelected(demo);
                      closeMenu();
                    }}
                  >
                    <span className="dropdown-item-name">{demo.name}</span>
                    <span className={`dropdown-tag dropdown-tag--${demo.tag.toLowerCase().replace('-', '')}`}>
                      {demo.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lynx view */}
      <main className="preview">
        <lynx-view
          key={selected.bundle}
          style={{ width: '100%', height: '100%' }}
          url={`/${selected.bundle}`}
        />
      </main>
    </div>
  );
}
