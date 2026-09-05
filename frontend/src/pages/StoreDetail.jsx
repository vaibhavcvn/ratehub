import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, MapPin, Mail, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api, { messageFrom } from '../services/api';
import RatingStars from '../components/RatingStars';

function mapsUrl(store) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(store.name + ', ' + store.address);
}

export default function StoreDetail() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/user/stores/${id}`)
      .then((res) => setStore(res.data.data))
      .catch((err) => setError(messageFrom(err)));
  }, [id]);
  if (error) return <div className="empty-state"><h2>Unable to load store</h2><p>{error}</p></div>;
  if (!store) return <div className="loading"><div className="spinner" />Loading store</div>;
  const total = store.distribution.reduce((sum, item) => sum + item.count, 0);
  return (
    <>
      <Link to="/user/stores" className="back-link"><ArrowLeft size={16} /> Back to stores</Link>
      <section className="detail-hero panel">
        <div className="detail-icon"><Star size={28} /></div>
        <div className="detail-heading">
          <span className="category-tag">{store.category}</span>
          <h1>{store.name}</h1>
          <a className="address maps-link" href={mapsUrl(store)} target="_blank" rel="noreferrer">
            <MapPin size={16} />{store.address}
          </a>
          <p className="address"><Mail size={16} />{store.email}</p>
        </div>
        <div className="detail-rating">
          <strong>{store.averageRating ?? '—'}</strong>
          <RatingStars value={Math.round(store.averageRating ?? 0)} />
          <small>{store.totalRatings} ratings</small>
        </div>
      </section>
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-head">
            <div><p className="eyebrow">RATING OVERVIEW</p><h2>What the community thinks</h2></div>
          </div>
          <div className="distribution">
            {store.distribution.map((item) => (
              <div className="distribution-row" key={item.rating}>
                <span>{item.rating} <Star size={12} fill="currentColor" /></span>
                <div className="bar"><i style={{ width: total ? `${(item.count / total) * 100}%` : '0%' }} /></div>
                <small>{item.count}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <p className="eyebrow">YOUR EXPERIENCE</p>
          <h2>Your rating</h2>
          <div className="your-rating">
            <RatingStars value={store.myRating ?? 0} />
            <strong>{store.myRating ? `You rated this store ${store.myRating}/5` : 'You have not rated this store yet'}</strong>
          </div>
          <Link to="/user/stores" className="button primary">{store.myRating ? 'Edit rating' : 'Rate this store'}</Link>
        </section>
      </div>
      <section className="panel reviews-panel">
        <div className="panel-head">
          <div><p className="eyebrow">COMMUNITY REVIEWS</p><h2>Recent ratings</h2></div>
        </div>
        {store.reviews.length ? store.reviews.map((review) => (
          <article className="review" key={review.id}>
            <div className="avatar soft">{review.user.name.charAt(0)}</div>
            <div>
              <div className="review-head">
                <strong>{review.user.name}</strong>
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
              <RatingStars value={review.rating} />
              {review.comment && <p>{review.comment}</p>}
            </div>
          </article>
        )) : <div className="empty-inline">No reviews yet</div>}
      </section>
      <section className="panel about-panel">
        <p className="eyebrow">ABOUT THE STORE</p>
        <h2>{store.name}</h2>
        <p className="muted">{store.description}</p>
      </section>
    </>
  );
}
