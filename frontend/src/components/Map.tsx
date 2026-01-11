import React, { useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, GeoObject } from '@pbe/react-yandex-maps';
import { User } from '../types/user';

interface MapProps {
  users: User[];
  foundUserIds?: Set<number>; // ID найденных волонтеров для выделения
  center?: [number, number];
  radius?: number;
}

export const MapComponent: React.FC<MapProps> = ({ users, foundUserIds = new Set(), center, radius }) => {
  const mapRef = useRef<any>(null);
  const defaultCenter: [number, number] = center || [55.7558, 37.6173]; // Москва по умолчанию
  const defaultZoom = center ? 13 : 10;

  useEffect(() => {
    // Центрируем карту при изменении центра
    if (mapRef.current && center) {
      mapRef.current.setCenter(center, 13, { duration: 300 });
    }
  }, [center]);

  // Функция для создания круга из центра и радиуса
  const createCircle = (centerCoords: [number, number], radiusMeters: number) => {
    const points: [number, number][] = [];
    const numPoints = 64; // Количество точек для создания плавного круга
    
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      // Преобразуем радиус из метров в градусы (приблизительно)
      // 1 градус широты ≈ 111 км, 1 градус долготы ≈ 111 км * cos(широта)
      const latOffset = (radiusMeters / 111000) * Math.cos(angle);
      const lonOffset = (radiusMeters / (111000 * Math.cos(centerCoords[0] * Math.PI / 180))) * Math.sin(angle);
      
      points.push([
        centerCoords[0] + latOffset,
        centerCoords[1] + lonOffset
      ]);
    }
    
    return [points]; // Возвращаем массив для Polygon
  };

  // Функция для создания кастомной иконки маркера
  const getMarkerIcon = (isFound: boolean) => {
    const color = isFound ? '#e74c3c' : '#4285F4';
    // Создаем SVG иконку в виде круга с точкой
    const svg = `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2" opacity="0.9"/>
      <circle cx="20" cy="20" r="8" fill="white"/>
    </svg>`;
    const encodedSvg = encodeURIComponent(svg);
    
    return {
      iconLayout: 'default#image',
      iconImageHref: `data:image/svg+xml,${encodedSvg}`,
      iconImageSize: [40, 40],
      iconImageOffset: [-20, -40],
    };
  };

  return (
    <div className="map-container" style={{ height: '100%', width: '100%' }}>
      <YMaps
        query={{
          apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY || '', // API ключ из переменных окружения
          lang: 'ru_RU',
        }}
      >
        <Map
          instanceRef={mapRef}
          defaultState={{
            center: defaultCenter,
            zoom: defaultZoom,
          }}
          width="100%"
          height="100%"
        >
          {/* Круг поиска */}
          {center && radius && (
            <GeoObject
              geometry={{
                type: 'Polygon',
                coordinates: createCircle(center, radius),
              }}
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                strokeColor: '#4285F4',
                strokeWidth: 2,
              }}
            />
          )}

          {/* Маркеры волонтеров */}
          {users.map((user) => {
            const isFound = user.id !== undefined && foundUserIds.has(user.id);
            const markerIcon = getMarkerIcon(isFound);
            
            return (
              <Placemark
                key={user.id}
                geometry={[user.latitude, user.longitude]} // Яндекс.Карты используют [широта, долгота]
                properties={{
                  balloonContentHeader: `<strong>${user.name}</strong>`,
                  balloonContentBody: `
                    ${isFound ? '<span style="color: #e74c3c; font-weight: bold;">✓ В радиусе поиска</span><br/>' : ''}
                    Телефон: ${user.phone}<br/>
                    Адрес: ${user.address}
                    ${user.distance ? `<br/>Расстояние: ${Math.round(user.distance)} м` : ''}
                  `,
                  hintContent: `${user.name}<br/>📞 ${user.phone}<br/>📍 ${user.address}`,
                }}
                options={markerIcon}
                modules={['geoObject.addon.hint']}
              />
            );
          })}
        </Map>
      </YMaps>
    </div>
  );
};
