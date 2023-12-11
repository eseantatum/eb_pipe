//import '../App.css'
import 'leaflet/dist/leaflet.css'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet'
//import MarkerClusterGroup from "react-leaflet-cluster";
import arcades from '../arcades.json'
import apods from '../apods.json'

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const mapCenter = [38, 139.69222];
const zoomSettings = [6, 3, 19];

function Map(props) {
      return (
          <> 
        <MapContainer
          className="full-screen-map"
          center={mapCenter}
          zoom={zoomSettings[0]}
          minZoom={zoomSettings[1]}
          maxZoom={zoomSettings[2]}
          //maxBounds={[[-85.06, -180], [85.06, 180]]}
          scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />

        </MapContainer>
          </>
      );
      }
  
  export default Map;