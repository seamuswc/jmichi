// Domain-specific configuration
export const getDomainConfig = () => {
  // Japan-focused site - default to show Shinjuku and Ginza
  return {
    center: {
      lat: 35.68, // Between Shinjuku (35.69) and Ginza (35.67)
      lng: 139.735 // Between Shinjuku (139.70) and Ginza (139.77)
    },
    placeholder: "e.g., 35.68, 139.735",
    cityName: "Japan",
    siteName: "Jmichi"
  };
};
