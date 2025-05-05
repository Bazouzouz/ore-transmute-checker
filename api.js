async function fetchPrices(itemIds, city) {
  const ids = itemIds.join(",");
  const url = `https://west.albion-online-data.com/api/v2/stats/prices/${ids}?locations=${city}&qualities=1`;
  const response = await fetch(url);
  return response.json();
}
// Appels à l'API Albion Online
