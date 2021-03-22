import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import db from "../util/firebase";
import ReactMapGL, { Marker, Popup } from "react-map-gl";

mapboxgl.accessToken = `${process.env.REACT_APP_MAPBOX_KEY}`;

const Map = () => {
  //map config
  const mapContainer = useRef();
  const [lng, setLng] = useState(4.9041);
  const [lat, setLat] = useState(52.3676);
  const [zoom, setZoom] = useState(12);

  //chains data
  const [chainData, setChainData] = useState([]);

  const getData = async () => {
    return db
      .collection("chains")
      .get()
      .then(async (snapshot) => {
        const chains = await snapshot.docs.map((x) => x.data());
        setChainData(chains);
        return chains;
      })

      .catch((error) => {
        console.error("Error getting chains: ", error);
      });
  };

  useEffect(async () => {
    let chainData = await getData();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    chainData.forEach((chain) => {
      let chainLatitude = chain.latLon.latitude;
      let chainLongitude = chain.latLon.longitude;
      console.log("latLong", chainLatitude, chainLongitude);

      var marker = new mapboxgl.Marker({
        color: "red",
        draggable: true,
      })
        .setLngLat([chainLongitude, chainLatitude])
        .addTo(map);
    });
  }, []);

  return (
    <div>
      <div className="map-container" ref={mapContainer} />
    </div>
  );
};

export default Map;
