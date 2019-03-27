module.exports.metersToPaces = (meters) => {
  return meters * .75;
};

module.exports.getRandomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

module.exports.getDirectionAndDistance = (from, to) => {
  const directions = {}; // ret value

  // GET DISTANCE ==========================================
  function toRad(x) {
    return x * Math.PI / 180;
  }

  let lon1 = from[0];
  let lat1 = from[1];

  let lon2 = to[0];
  let lat2 = to[1];

  const R = 6371; // km

  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  directions.paces = (d * 1000) * .75;

// GET DIRECTION ================================================
  // endpoint.lat = x1;
  // endpoint.lng = y1;
  // startpoint.lat = x2;
  // startpoint.lng = y2;
  lon1 = to[0];
  lat1 = to[1];
  lon2 = from[0];
  lat2 = from[1];
  
  // function getAtan2(y, x) {
    //   return Math.atan2(y, x);
  // };
    
  const radians = Math.atan2((lon1 - lon2), (lat1 - lat2));
  const compassReading = radians * (180 / Math.PI);

  const coordNames = ["North", "North North-East", "North-East", "East North-East", "East", "East South-East", "South-East", "South South-East", "South", "South South-West", "South-West", "West South-West", "West", "West North-West", "North-West", "North North-West"];
  let coordIndex = Math.round(compassReading / 22.5);
  if (coordIndex < 0) {
    coordIndex = coordIndex + 16
  };

  directions.heading = coordNames[coordIndex];

  return directions;
};

module.exports.functionName = () => { // ---blueprint---
  // functionality...
};
