import { ArrowUpRight } from 'lucide-react';
export default function StatCard({ icon: Icon, label, value, tone = 'indigo' }) { return <article className={`stat-card ${tone}`}><div className="stat-icon"><Icon size={19} /></div><div><p>{label}</p><strong>{value ?? '—'}</strong></div><ArrowUpRight className="stat-arrow" size={18} /></article>; }
