import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, interactive = false, onChange }) {
  return <div className="stars" aria-label={`${value} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <button type="button" className={`star ${star <= value ? 'active' : ''}`} key={star} disabled={!interactive} onClick={() => onChange?.(star)} aria-label={`Rate ${star} out of 5`}><Star size={18} fill={star <= value ? 'currentColor' : 'none'} /></button>)}</div>;
}
