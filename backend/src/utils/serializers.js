export const publicUser = ({ password, ...user }) => user;

export function storeSummary(store) {
  const ratings = store.ratings ?? [];
  const average = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : null;
  return {
    id: store.id,
    name: store.name,
    email: store.email,
    address: store.address,
    category: store.category,
    description: store.description,
    owner: store.owner ? publicUser(store.owner) : null,
    averageRating: average === null ? null : Number(average.toFixed(1)),
    totalRatings: ratings.length,
    myRating: store.myRating ?? null,
    isFavorite: Boolean(store.isFavorite),
  };
}
