import React, { useState, useEffect } from "react";

function GeoLocationComponent({ getCords }) {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
  });

  const handleSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setLocation({
      latitude,
      longitude,
      error: null,
    });
    getCords({ latitude, longitude });
  };

  const handleError = (error) => {
    setLocation({
      latitude: null,
      longitude: null,
      error: error.message,
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prevState) => ({
        ...prevState,
        error: "Geolocation is not supported by your browser",
      }));
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }
  }, []);

  return <div>{location.error && <p>Error: {location.error}</p>}</div>;
}

export default GeoLocationComponent;
