const api = require('./index');

(async () => {
  const restaurants = await api.getRestaurants("Jyväskylä");
  console.log(restaurants);
})();
