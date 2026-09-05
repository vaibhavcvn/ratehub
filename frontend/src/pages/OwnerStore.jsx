import { useEffect, useState } from 'react';
import { Building2, Mail, MapPin } from 'lucide-react';
import api, { messageFrom } from '../services/api';

export default function OwnerStore() {
  const [store, setStore] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/owner/store').then((res) => setStore(res.data.data)).catch((err) => setError(messageFrom(err))); }, []);
  if (error) return <div className="empty-state"><h2>Unable to load your store</h2><p>{error}</p></div>;
  if (!store) return <div className="loading"><div className="spinner" />Loading your store</div>;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}`)}`;
  return <><div className="page-heading"><div><p className="eyebrow">OWNER PORTAL</p><h1>My store</h1><p className="muted">The public-facing profile for your business.</p></div></div><section className="panel detail-hero"><div className="detail-icon"><Building2 size={28} /></div><div className="detail-heading"><span className="category-tag">{store.category}</span><h1>{store.name}</h1><p className="address"><MapPin size={16} />{store.address}</p><p className="address"><Mail size={16} />{store.email}</p><a className="button secondary small maps-link" href={mapsUrl} target="_blank" rel="noreferrer">Check on Google Maps</a></div></section><section className="panel about-panel"><p className="eyebrow">ABOUT YOUR STORE</p><h2>Store description</h2><p className="muted">{store.description}</p></section></>;
}
