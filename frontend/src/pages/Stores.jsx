import { useEffect, useState } from 'react';
import { Building2, Heart, MapPin, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { messageFrom } from '../services/api';
import Pagination from '../components/Pagination';
import RatingStars from '../components/RatingStars';
import { useToast } from '../context/ToastContext';

const categories = [
  'Electronics', 'Grocery', 'Clothing', 'Restaurants', 'Cafes', 'Furniture',
  'Pharmacy', 'Mobile Stores', 'Supermarkets', 'Book Stores', 'Sports',
  'Beauty', 'Home Appliances', 'Automotive', 'Footwear',
];

function storeMapsUrl(store) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(store.name + ', ' + store.address);
}

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ search: '', category: '', hasRated: '', sort: '', order: 'asc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { show } = useToast();

  const load = () => {
    setLoading(true);
    api.get('/user/stores', { params: { ...filters, page, limit: 12 } })
      .then((res) => {
        setStores(res.data.data.items);
        setPagination(res.data.data.pagination);
      })
      .catch((err) => setError(messageFrom(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [filters, page]);

  const update = (name, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  async function toggleFavorite(store) {
    try {
      if (store.isFavorite) {
        await api.delete(`/user/favorites/${store.id}`);
        show('Store removed from favorites');
      } else {
        await api.post(`/user/favorites/${store.id}`);
        show('Store saved to favorites');
      }
      load();
    } catch (err) {
      setError(messageFrom(err));
      show(messageFrom(err), 'error');
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DISCOVER STORES</p>
          <h1>Find your next favorite.</h1>
          <p className="muted">Explore trusted local businesses and share what you find.</p>
        </div>
        <span className="date-pill">{pagination.total ?? 0} stores</span>
      </div>

      <div className="discovery-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search stores by name, address, or category"
          />
        </div>
        <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select value={filters.hasRated} onChange={(e) => update('hasRated', e.target.value)}>
          <option value="">All stores</option>
          <option value="no">Not rated yet</option>
          <option value="yes">Rated by me</option>
        </select>
        <select value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="">Name A-Z</option>
          <option value="newest">Newest</option>
          <option value="popular">Most rated</option>
          <option value="rating">Most reviewed</option>
        </select>
        <button className="button secondary" onClick={() => update('order', filters.order === 'asc' ? 'desc' : 'asc')}>
          <SlidersHorizontal size={16} />
          {filters.order === 'asc' ? 'A-Z' : 'Z-A'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner" />Finding stores</div>
      ) : stores.length ? (
        <div className="store-grid">
          {stores.map((store) => (
            <article className="store-card" key={store.id}>
              <div className="store-card-top">
                <span className="store-icon large"><Building2 size={21} /></span>
                <button
                  className={`icon-button favorite-button ${store.isFavorite ? 'favorite-active' : ''}`}
                  onClick={() => toggleFavorite(store)}
                  aria-label={`${store.isFavorite ? 'Remove' : 'Add'} ${store.name} favorite`}
                >
                  <Heart size={19} fill={store.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3>{store.name}</h3>
              <span className="category-tag">{store.category}</span>
              <p className="address">
                <MapPin size={15} />
                <a className="maps-link" href={storeMapsUrl(store)} target="_blank" rel="noreferrer">
                  {store.address}
                </a>
              </p>
              <div className="store-card-foot">
                <div>
                  <small><Star size={11} /> {store.averageRating ?? 'New'} · {store.totalRatings} ratings</small>
                  <RatingStars value={store.myRating ?? 0} />
                </div>
                <div className="card-actions">
                  <Link to={`/stores/${store.id}`} className="button secondary small">View</Link>
                  <button className="button primary small" onClick={() => setSelected(store)}>
                    {store.myRating ? 'Edit' : 'Rate'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Building2 size={30} />
          <h2>No stores found</h2>
          <p>Try changing your search or filters.</p>
        </div>
      )}

      <Pagination {...pagination} onChange={setPage} />
      {selected && <RatingModal store={selected} close={() => setSelected(null)} refresh={load} />}
    </>
  );
}

function RatingModal({ store, close, refresh }) {
  const { show } = useToast();
  const [value, setValue] = useState(store.myRating ?? 0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!value) return setError('Choose a rating from 1 to 5');
    setSaving(true);
    try {
      if (store.myRating) {
        const ratings = await api.get('/user/ratings');
        const current = ratings.data.data.find((rating) => rating.storeId === store.id);
        await api.put(`/user/ratings/${current.id}`, { rating: value, comment });
        show('Rating updated successfully');
      } else {
        await api.post('/user/ratings', { storeId: store.id, rating: value, comment });
        show('Rating submitted successfully');
      }
      refresh();
      close();
    } catch (err) {
      setError(messageFrom(err));
      show(messageFrom(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={close} aria-label="Close"><X size={18} /></button>
        <p className="eyebrow">SHARE YOUR EXPERIENCE</p>
        <h2>Rate {store.name}</h2>
        <p className="muted">How would you rate this store?</p>
        <div className="modal-rating">
          <RatingStars value={value} interactive onChange={setValue} />
          <strong>{value ? `${value} / 5` : 'Select a rating'}</strong>
        </div>
        <label className="field">
          <span>Optional review</span>
          <textarea
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
          />
          <small className="counter">{comment.length} / 500</small>
        </label>
        {error && <div className="alert error">{error}</div>}
        <div className="modal-actions">
          <button className="button secondary" onClick={close}>Cancel</button>
          <button className="button primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : store.myRating ? 'Update rating' : 'Submit rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
