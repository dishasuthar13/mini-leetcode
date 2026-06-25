import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const DIFF_COLOR = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };
const DIFF_BG = { Easy: 'rgba(16,185,129,0.1)', Medium: 'rgba(245,158,11,0.1)', Hard: 'rgba(239,68,68,0.1)' };
const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

const ProblemCard = ({ problem, index, solved }) => {
  const color = DIFF_COLOR[problem.difficulty];
  const bg = DIFF_BG[problem.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Link to={`/problems/${problem.slug}`} style={{ textDecoration: 'none' }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${color}`,
            borderRadius: 12,
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.borderLeftColor = color;
            e.currentTarget.style.boxShadow = `0 0 20px ${color}18`;
            e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.borderLeftColor = color;
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'var(--bg-surface)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {solved ? (
                  <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--border-hover)', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {problem.title}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 22 }}>
                {problem.tags?.slice(0, 3).map(t => (
                  <span key={t} style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 6, padding: '2px 8px', fontFamily: 'JetBrains Mono'
                  }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: color,
                background: bg, borderRadius: 6,
                padding: '3px 10px', border: `1px solid ${color}30`
              }}>
                {problem.difficulty}
              </span>
              <span style={{
                fontSize: 11, color: '#6366F1', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 3,
                opacity: 0, transition: 'opacity 0.15s',
              }} className="solve-cta">
                Solve <ArrowRight size={10} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
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

  const filtered = problems.filter(p => {
    const ms = p.title.toLowerCase().includes(search.toLowerCase());
    const md = filter === 'All' || p.difficulty === filter;
    const mt = selectedTag === 'All' || p.tags?.includes(selectedTag);
    return ms && md && mt;
  });

  return (
    <div style={{ padding: '32px 36px' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>Problems</h1>
       <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, margin: 0 }}>
  {solvedIds.size} solved
</p>
      </motion.div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', val: problems.length, color: 'var(--text-primary)' },
            { label: 'Easy', val: stats.solvedByDifficulty?.Easy || 0, color: '#10B981' },
            { label: 'Medium', val: stats.solvedByDifficulty?.Medium || 0, color: '#F59E0B' },
            { label: 'Hard', val: stats.solvedByDifficulty?.Hard || 0, color: '#EF4444' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 18px', textAlign: 'center'
            }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: item.color }}>{item.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search problems..."
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 9, color: 'var(--text-primary)', fontSize: 13,
                fontFamily: 'Inter', outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366F1'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <SlidersHorizontal size={14} color="var(--text-muted)" style={{ marginRight: 4 }} />
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter',
              background: filter === f
                ? f === 'Easy' ? '#10B981' : f === 'Medium' ? '#F59E0B' : f === 'Hard' ? '#EF4444' : '#6366F1'
                : 'var(--bg-elevated)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'transparent' : 'var(--border)'}`,
            }}>{f}</button>
          ))}
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allTags.slice(0, 8).map(t => (
              <button key={t} onClick={() => setSelectedTag(t)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11,
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'JetBrains Mono',
                background: selectedTag === t ? 'var(--accent-blue-dim)' : 'transparent',
                color: selectedTag === t ? '#6366F1' : 'var(--text-muted)',
                border: `1px solid ${selectedTag === t ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>No problems found</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Try adjusting your filters</div>
          <button onClick={() => { setFilter('All'); setSearch(''); setSelectedTag('All'); }}
            style={{
              padding: '9px 20px', background: '#6366F1', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Inter'
            }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <AnimatePresence>
            {filtered.map((p, i) => (
              <ProblemCard key={p._id} problem={p} index={i} solved={solvedIds.has(p._id)} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Problems;