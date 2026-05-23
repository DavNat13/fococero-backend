export const decodificarGeohash = (
  geohash: string,
): { lat: number; lng: number } => {
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let isEven = true;
  let latMin = -90,
    latMax = 90;
  let lonMin = -180,
    lonMax = 180;

  for (let i = 0; i < geohash.length; i++) {
    const char = geohash[i];
    const cd = BASE32.indexOf(char);

    for (let j = 0; j < 5; j++) {
      const mask = 16 >> j;
      if (isEven) {
        const lonMid = (lonMin + lonMax) / 2;
        if (cd & mask) lonMin = lonMid;
        else lonMax = lonMid;
      } else {
        const latMid = (latMin + latMax) / 2;
        if (cd & mask) latMin = latMid;
        else latMax = latMid;
      }
      isEven = !isEven;
    }
  }

  return {
    lat: (latMin + latMax) / 2,
    lng: (lonMin + lonMax) / 2,
  };
};
