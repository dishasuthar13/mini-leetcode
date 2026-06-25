import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Circle, SlidersHorizontal } from 'lucide-react';
import api from '../api/axios';

const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' };
const DIFF_DIM = { Easy: 'var(--green-dim)', Medium: 'var(--amber-dim)', Hard: 'var(--red-dim)' };
const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];
const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sort, setSort] = useState('Default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/problems'), api.get('/submissions'), api.get('/submissions/stats')])
      .then(([p, s, st]) => {
        setProblems(p.data);
        setSolvedIds(new Set(s.data.filter(x => x.verdict === 'Accepted').map(x => x.problem?._id)));
        setStats(st.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const allTags = ['All', ...new Set(problems.flatMap(p => p.tags || []))];

  const filtered = problems
    .filter(p => {
      const ms = p.title.toLowerCase().includes(search.toLowerCase());
      const md = filter === 'All' || p.difficulty === filter;
      const mt = selectedTag === 'All' || p.tags?.includes(selectedTag);
      return ms && md && mt;
    })
    .sort((a, b) => {
      if (sort === 'Difficulty ↑') return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
      if (sort === 'Difficulty ↓') return DIFF_ORDER[b.difficulty] - DIFF_ORDER[a.difficulty];
      if (sort === 'Title A-Z') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div style={{ padding: '32px 36px' }}>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Problems</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {solvedIds.size} solved
        </p>
      </motion.div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Easy', val: stats.solvedByDifficulty?.Easy || 0, color: 'var(--green)' },
            { label: 'Medium', val: stats.solvedByDifficulty?.Medium || 0, color: 'var(--amber)' },
            { label: 'Hard', val: stats.solvedByDifficulty?.Hard || 0, color: 'var(--red)' },
          ].map(item => (
            <div key={item.label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label} solved</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              style={{
                width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{
              padding: '8px 12px', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13, outline: 'none',
            }}>
            {['Default', 'Difficulty ↑', 'Difficulty ↓', 'Title A-Z'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <SlidersHorizontal size={13} color="var(--text-muted)" />
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.12s',
              background: filter === f
                ? f === 'Easy' ? 'var(--green)' : f === 'Medium' ? 'var(--amber)' : f === 'Hard' ? 'var(--red)' : 'var(--accent)'
                : 'var(--bg-elevated)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
            }}>{f}</button>
          ))}
          <div style={{ width: 1, height: 14, background: 'var(--border)', margin: '0 2px' }} />
          {allTags.slice(0, 9).map(t => (
            <button key={t} onClick={() => setSelectedTag(t)} style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 11,
              background: selectedTag === t ? 'var(--accent-dim)' : 'transparent',
              color: selectedTag === t ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${selectedTag === t ? 'var(--accent-border)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.12s',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '32px 1fr 180px 100px',
          padding: '10px 18px', borderBottom: '1px solid var(--border)',
          gap: 12,
        }}>
          {['', 'Title', 'Tags', 'Difficulty'].map(h => (
            <span key={h} className="label">{h}</span>
          ))}
        </div>

        {loading && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 13, marginBottom: 12 }}>No problems match your filters</div>
            <button className="btn-ghost" onClick={() => { setFilter('All'); setSearch(''); setSelectedTag('All'); }}>
              Clear filters
            </button>
          </div>
        )}

        <AnimatePresence>
          {filtered.map((p, i) => {
            const color = DIFF_COLOR[p.difficulty];
            const solved = solvedIds.has(p._id);
            return (
              <motion.div key={p._id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              >
                <Link to={`/problems/${p.slug}`}
                  style={{
                    display: 'grid', gridTemplateColumns: '32px 1fr 180px 100px',
                    alignItems: 'center', padding: '13px 18px',
                    borderBottom: '1px solid var(--border)',
                    gap: 12, transition: 'background 0.1s',
                    borderLeft: `2px solid ${solved ? 'var(--green)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>
                    {solved
                      ? <CheckCircle2 size={14} color="var(--green)" />
                      : <Circle size={14} color="var(--text-muted)" />
                    }
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {p.title}
                  </span>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {p.tags?.slice(0, 2).map(t => (
                      <span key={t} style={{
                        fontSize: 11, color: 'var(--text-muted)',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 4, padding: '2px 7px',
                      }}>{t}</span>
                    ))}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color,
                    background: DIFF_DIM[p.difficulty],
                    borderRadius: 5, padding: '3px 9px',
                    display: 'inline-block',
                  }}>{p.difficulty}</span>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
        {filtered.length} problem{filtered.length !== 1 ? 's' : ''} shown
      </p>
    </div>
  );
};

export default Problems;