import { ArrowLeft, Building2, Mail, MapPin, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api, { messageFrom } from '../services/api';
import RatingStars from '../components/RatingStars';

export default function AdminUserDetail() {
  const { id } = useParams(); const [user, setUser] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get(`/admin/users/${id}`).then((res) => setUser(res.data.data)).catch((err) => setError(messageFrom(err))); }, [id]);
  if (error) return <div className="empty-state"><h2>Unable to load user</h2><p>{error}</p></div>;
  if (!user) return <div className="loading"><div className="spinner" />Loading user</div>;
  const submitted = user.ratings ?? [];
  return <><Link to="/admin/users" className="back-link"><ArrowLeft size={16} /> Back to users</Link><section className="panel detail-hero"><span className="avatar large-avatar">{user.name.charAt(0)}</span><div className="detail-heading"><span className="role-badge">{user.role}</span><h1>{user.name}</h1><p className="address"><Mail size={15} />{user.email}</p><p className="address"><MapPin size={15} />{user.address}</p></div><div className="detail-rating"><strong>{submitted.length}</strong><small>ratings submitted</small></div></section>{user.role === 'OWNER' ? <section className="panel"><p className="eyebrow">OWNED STORE</p>{user.ownedStores?.length ? user.ownedStores.map((store) => <div className="owner-detail" key={store.id}><span className="store-icon large"><Building2 size={21} /></span><div><h2>{store.name}</h2><p className="muted">{store.address}</p></div><div className="rating-inline"><RatingStars value={Math.round(store.ratings?.length ? store.ratings.reduce((sum, item) => sum + item.rating, 0) / store.ratings.length : 0)} />{store.ratings?.length ? `${(store.ratings.reduce((sum, item) => sum + item.rating, 0) / store.ratings.length).toFixed(1)} average` : 'No ratings yet'}</div></div>) : <div className="empty-inline">No store assigned</div>}</section> : <section className="panel"><div className="panel-head"><div><p className="eyebrow">USER ACTIVITY</p><h2>Recent ratings</h2></div></div>{submitted.length ? submitted.slice(0, 8).map((rating) => <div className="list-row" key={rating.id}><span className="store-icon"><Star size={16} fill="currentColor" /></span><div><strong>{rating.store?.name ?? 'Store'}</strong><small>{rating.comment || 'No written review'}</small></div><RatingStars value={rating.rating} /></div>) : <div className="empty-inline">No ratings submitted yet</div>}</section>}</>;
}
