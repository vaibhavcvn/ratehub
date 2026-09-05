import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, pages = 1, total = 0, limit = 10, onChange }) {
  if (pages <= 1 && total <= limit) return null;
  const first = total ? (page - 1) * limit + 1 : 0;
  const last = Math.min(page * limit, total);
  return <div className="pagination"><span>Showing {first}-{last} of {total}</span><div className="pagination-actions"><button className="page-button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button><span className="page-count">Page {page} of {pages}</span><button className="page-button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={15} /></button></div></div>;
}
