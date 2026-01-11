import NodeGeocoder from 'node-geocoder';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Переменная для отслеживания последнего запроса (для задержки)
let lastRequestTime = 0;

// Загружаем .env или exempl.env
const envPath = path.resolve(process.cwd(), '.env');
const exemplEnvPath = path.resolve(process.cwd(), 'exempl.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(exemplEnvPath)) {
  dotenv.config({ path: exemplEnvPath });
} else {
  dotenv.config();
}

const geocoder = NodeGeocoder({
  provider: (process.env.GEOCODER_PROVIDER as any) || 'openstreetmap',
  httpAdapter: 'https',
  formatter: null, // Используем дефолтный форматтер
});

// Альтернативный метод через Nominatim API напрямую
async function geocodeViaNominatim(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const https = require('https');
    const querystring = require('querystring');
    
    const url = `https://nominatim.openstreetmap.org/search?${querystring.stringify({
      q: address,
      format: 'json',
      limit: 1,
      addressdetails: 1,
    })}`;
    
    console.log('🌐 Прямой запрос к Nominatim:', url);
    
    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        headers: {
          'User-Agent': 'UserMapApp/1.0',
          'Accept': 'application/json',
          'Accept-Language': 'ru-RU,ru,en',
        },
        timeout: 15000,
      }, (response: any) => {
        // Проверяем статус код
        if (response.statusCode !== 200) {
          console.error(`❌ Nominatim вернул статус ${response.statusCode}`);
          response.resume(); // Освобождаем память
          resolve(null);
          return;
        }
        
        // Проверяем Content-Type
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('application/json')) {
          console.error(`❌ Nominatim вернул не JSON, а ${contentType}`);
          response.resume();
          resolve(null);
          return;
        }
        
        let data = '';
        
        response.on('data', (chunk: any) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            // Проверяем, что это не HTML
            if (data.trim().startsWith('<')) {
              console.error('❌ Nominatim вернул HTML вместо JSON');
              console.error('Первые 200 символов ответа:', data.substring(0, 200));
              resolve(null);
              return;
            }
            
            const results = JSON.parse(data);
            console.log('📍 Nominatim результат:', JSON.stringify(results, null, 2));
            
            if (Array.isArray(results) && results.length > 0) {
              const first = results[0];
              if (first.lat && first.lon) {
                const coords = {
                  lat: parseFloat(first.lat),
                  lon: parseFloat(first.lon),
                };
                console.log('✅ Координаты найдены через Nominatim:', coords);
                resolve(coords);
                return;
              }
            }
            console.warn('⚠️  Nominatim вернул пустой результат');
            resolve(null);
          } catch (parseError: any) {
            console.error('❌ Ошибка парсинга ответа Nominatim:');
            console.error('Сообщение:', parseError.message);
            console.error('Первые 500 символов ответа:', data.substring(0, 500));
            resolve(null); // Не reject, чтобы не ломать весь процесс
          }
        });
      });
      
      request.on('error', (error: any) => {
        console.error('❌ Ошибка запроса к Nominatim:', error.message);
        resolve(null); // Не reject
      });
      
      request.on('timeout', () => {
        request.destroy();
        console.error('❌ Таймаут запроса к Nominatim');
        resolve(null); // Не reject
      });
    });
  } catch (error: any) {
    console.error('❌ Ошибка в geocodeViaNominatim:', error.message);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  // Сначала пробуем через библиотеку node-geocoder
  try {
    console.log('🔍 Геокодинг адреса (через node-geocoder):', address);
    
    // Добавляем таймаут для запроса
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Таймаут геокодинга (15 секунд)')), 15000);
    });
    
    const geocodePromise = geocoder.geocode(address);
    const result = await Promise.race([geocodePromise, timeoutPromise]) as any[];
    
    console.log('📍 Результат геокодинга:', JSON.stringify(result, null, 2));
    console.log('📍 Количество результатов:', result?.length || 0);
    
    if (result && Array.isArray(result) && result.length > 0) {
      const firstResult = result[0];
      console.log('📍 Первый результат:', JSON.stringify(firstResult, null, 2));
      
      if (firstResult.latitude != null && firstResult.longitude != null) {
        const coords = {
          lat: Number(firstResult.latitude),
          lon: Number(firstResult.longitude),
        };
        console.log('✅ Координаты найдены:', coords);
        return coords;
      } else {
        console.warn('⚠️  В результате нет координат (latitude/longitude)');
        console.warn('Структура результата:', Object.keys(firstResult));
      }
    } else {
      console.warn('⚠️  Координаты не найдены через node-geocoder');
    }
  } catch (error: any) {
    console.error('❌ Ошибка геокодинга через node-geocoder:');
    console.error('Сообщение:', error.message);
    console.error('Тип ошибки:', error.constructor.name);
    if (error.response) {
      console.error('HTTP статус:', error.response.status);
      console.error('HTTP данные:', error.response.data);
    }
  }
  
  // Если не получилось через библиотеку, пробуем напрямую через Nominatim
  console.log('🔄 Пробую альтернативный метод (Nominatim API)...');
  
  // Nominatim требует задержку минимум 1 секунда между запросами
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    const delay = 1000 - timeSinceLastRequest;
    console.log(`⏳ Задержка ${delay}ms перед запросом к Nominatim (требование API)`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
  
  const nominatimResult = await geocodeViaNominatim(address);
  if (nominatimResult) {
    return nominatimResult;
  }
  
  console.error('❌ Все методы геокодинга не сработали для адреса:', address);
  return null;
}

