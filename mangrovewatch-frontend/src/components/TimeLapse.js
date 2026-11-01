import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { getTimelapseData } from '../api';

export default function TimeLapse({ selectedYear, setSelectedYear, minYear = 2016, maxYear = 2026 }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  const [timelapseStats, setTimelapseStats] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getTimelapseData();
        if (res && res.data) {
          const map = {};
          res.data.forEach((item) => {
            map[item.year] = item;
          });
          setTimelapseStats(map);
        }
      } catch (err) {
        console.warn('Could not fetch timelapse stats:', err);
      }
    }
    loadStats();
  }, []);

  // Handle animation timer
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(1500 / speed);
      timerRef.current = setInterval(() => {
        setSelectedYear((current) => {
          if (current >= maxYear) {
            setIsPlaying(false);
            return maxYear;
          }
          return current + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, maxYear, setSelectedYear]);

  const togglePlay = () => {
    if (selectedYear >= maxYear && !isPlaying) {
      setSelectedYear(minYear);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const currentStat = timelapseStats[selectedYear] || {
    cumulative_hectares: ((selectedYear - minYear + 1) * 28.4).toFixed(1),
    carbon_loss_tco2: ((selectedYear - minYear + 1) * 12800).toLocaleString(),
  };

  return (
    <div className="timelapse-controls" style={{ zIndex: 1000 }}>
      {/* Play / Pause Button */}
      <button
        type="button"
        className="play-btn"
        onClick={togglePlay}
        title={isPlaying ? 'Pause Timelapse' : 'Play Timelapse (2016-2026)'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Active Year Label */}
      <div className="timelapse-year">
        {selectedYear}
      </div>

      {/* Slider */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            if (isPlaying) setIsPlaying(false);
          }}
          className="timelapse-slider"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>{minYear}</span>
          <span>2019</span>
          <span>2022</span>
          <span>{maxYear}</span>
        </div>
      </div>

      {/* Playback Speed Controls */}
      <div className="speed-control">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            type="button"
            className={`speed-btn ${speed === s ? 'active' : ''}`}
            onClick={() => setSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Cumulative Stats Counter */}
      <div className="timelapse-cumulative">
        <div className="value">
          {Number(currentStat.cumulative_hectares || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} ha
        </div>
        <div className="label">Cumulative Loss</div>
      </div>

      {/* Reset button */}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          setIsPlaying(false);
          setSelectedYear(maxYear);
        }}
        title="Show all years"
        style={{ padding: '6px 10px' }}
      >
        <RotateCcw size={12} />
        <span style={{ fontSize: '10px' }}>All</span>
      </button>
    </div>
  );
}
