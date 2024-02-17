import { useMemo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker,LayersControl } from 'react-leaflet'
import Leaflet from 'leaflet'
import "./leaflet.css"
import 'leaflet/dist/leaflet.css';
Leaflet.Icon.Default.imagePath =
  '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/'

/*
// https://logsuke.com/web/programming/leaflet/react-leaflet-marker-customize
// 効かない。。。
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const colorMarker = (color:string) => {
  return L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    className: `default-marker ${color}`,
  });
};
*/

export const PositionMap = (props: {
    positionFixed: boolean,
    currentPosition: [number,number],
    currentPositionMakesCenter:boolean
}) => {
    const {
        positionFixed,
        currentPosition,
        currentPositionMakesCenter        
    } = props
    const [map, setMap] = useState(null)
    useEffect(()=>{
        if (map && currentPositionMakesCenter) {
            // @ts-ignore
            map.setView(currentPosition)
        }
    }, [map, currentPosition,currentPositionMakesCenter])

    const displayMap = useMemo(
        () => {
            try {
                return <>
                    <MapContainer
                        center={currentPosition}
                        zoom={13}
                        scrollWheelZoom={true}
                        // @ts-ignore
                        ref={setMap}
                    >
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="淡色">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
                                />
                            </LayersControl.BaseLayer>

                            <LayersControl.BaseLayer name="白地図">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="標準">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="写真">
                                <TileLayer
                                    attribution="<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
                                    url='https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg                    '
                                />
                            </LayersControl.BaseLayer>
                        </LayersControl>
                        <Marker position={currentPosition}/>
                    </MapContainer>
                </>
            } catch (e) {
                return null
            }
        },
        [currentPosition, setMap, positionFixed]
    )            
    return (
        <div>
            {displayMap}
        </div>
    )
}    
