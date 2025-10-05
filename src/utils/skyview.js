export function skyviewQuicklookURL({ ra, dec, fovDeg = 6, pixels = 800, survey = "DSS2 Red" }) {
  const base = "https://skyview.gsfc.nasa.gov/current/cgi/quicklook.pl";
  const q = new URLSearchParams({
    Position: `${ra},${dec}`,
    Survey: survey,
    Coordinates: "J2000",
    Size: String(fovDeg),
    Pixels: String(pixels),
  });
  return `${base}?${q.toString()}`;
}
