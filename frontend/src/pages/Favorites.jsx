import { useEffect, useState } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { messageFrom } from '../services/api';
import RatingStars from '../components/RatingStars';

function mapsUrl(store) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(store.name + ', ' + store.address);
}

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const load = () =>
    api.get('/user/favorites')
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(messageFrom(err)));
  useEffect(() => { load(); }, []);
  async function remove(id) {
    await api.delete(`/user/favorites/${id}`);
    load();
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR SHORTLIST</p>
          <h1>Favorite stores</h1>
          <p className="muted">Keep the places you want to come back to close at hand.</p>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      {items.length ? (
        <div className="store-grid">
          {items.map((store) => (
            <article className="store-card" key={store.id}>
              <div className="store-card-top">
                <span className="store-icon large"><Heart size={20} fill="currentColor" /></span>
                <button className="icon-button favorite-active" onClick={() => remove(store.id)} aria-label={`Remove ${store.name} from favorites`}>
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
              <h3>{store.name}</h3>
              <span className="category-tag">{store.category}</span>
              <p className="address">
                <MapPin size={15} />
                <a className="maps-link" href={mapsUrl(store)} target="_blank" rel="noreferrer">
                  {store.address}
                </a>
              </p>
              <div className="store-card-foot">
                <span className="rating-inline">
                  <Star size={14} fill="currentColor" />
                  {store.averageRating ?? 'New'} ({store.totalRatings})
                </span>
                <Link to={`/stores/${store.id}`} className="button secondary small">View store</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={30} />
          <h2>No favorite stores yet</h2>
          <p>Save stores from Discover Stores to see them here.</p>
          <Link to="/user/stores" className="button primary">Discover stores</Link>
        </div>
      )}
    </>
  );
}
