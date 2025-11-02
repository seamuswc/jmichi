// Domain-specific configuration
export const getDomainConfig = () => {
  // Japan-focused site - default to Tokyo center
  return {
    center: {
      lat: 35.6762, // Tokyo center
      lng: 139.6503
    },
    placeholder: "e.g., 35.6762, 139.6503",
    cityName: "Japan",
    siteName: "Jmichi"
  };
};
