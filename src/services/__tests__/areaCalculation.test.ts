import test from 'node:test';
import assert from 'node:assert';
import {
  calculatePolygonArea,
  formatArea,
} from '../areaCalculationService';
import type { PolygonPoint } from '../../types/geo';

// Constante da Terra WGS84 para conversão de metros em graus
const METERS_PER_DEGREE_LAT = 111319.49079;

test('1. Polígono Conhecido: Campo de Futebol FIFA (105m x 68m = ~7.140 m²)', () => {
  // Coordenadas próximas ao Estádio do Maracanã (-22.912°, -43.230°)
  const lat0 = -22.912;
  const lng0 = -43.230;

  // Em latitude -22.912°, a convergência dos meridianos requer cos(lat)
  const dLat = 68 / METERS_PER_DEGREE_LAT;
  const dLng = 105 / (METERS_PER_DEGREE_LAT * Math.cos((lat0 * Math.PI) / 180));

  const fifaPitch: PolygonPoint[] = [
    { latitude: lat0, longitude: lng0 },
    { latitude: lat0, longitude: lng0 + dLng },
    { latitude: lat0 + dLat, longitude: lng0 + dLng },
    { latitude: lat0 + dLat, longitude: lng0 },
  ];

  const result = calculatePolygonArea(fifaPitch);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.pointsCount, 4);
  // Área esperada é de aproximadamente 7.140 m² (com precisão geodésica em elipsoide WGS84)
  assert.ok(
    result.areaInSquareMeters >= 7100 && result.areaInSquareMeters <= 7150,
    `Área esperada em torno de 7140 m², obtido: ${result.areaInSquareMeters}`
  );
  assert.match(result.formattedArea, /7\.12[0-9],[0-9]{2} m²/);
});

test('2. Polígono Conhecido: Quadrado de 1 Hectare no Equador (100m x 100m = ~10.000 m²)', () => {
  // Na linha do Equador (lat 0°), 100m em latitude e longitude
  const d100 = 100 / METERS_PER_DEGREE_LAT;

  const hectareSquare: PolygonPoint[] = [
    { latitude: 0.0, longitude: 0.0 },
    { latitude: 0.0, longitude: d100 },
    { latitude: d100, longitude: d100 },
    { latitude: d100, longitude: 0.0 },
  ];

  const result = calculatePolygonArea(hectareSquare);

  assert.strictEqual(result.success, true);
  // 1 Hectare geodésico no elipsoide WGS84 (~9.978 m²)
  assert.ok(
    result.areaInSquareMeters >= 9950 && result.areaInSquareMeters <= 10000,
    `Área esperada em torno de 10000 m², obtido: ${result.areaInSquareMeters}`
  );
  assert.match(result.formattedArea, /9\.97[0-9],[0-9]{2} m²/);
});

test('3. Polígono Conhecido: Triângulo Retângulo (Base 80m, Altura 60m = ~2.400 m²)', () => {
  const d60 = 60 / METERS_PER_DEGREE_LAT;
  const d80 = 80 / METERS_PER_DEGREE_LAT;

  const triangle: PolygonPoint[] = [
    { latitude: 0.0, longitude: 0.0 },
    { latitude: 0.0, longitude: d80 },
    { latitude: d60, longitude: 0.0 },
  ];

  const result = calculatePolygonArea(triangle);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.pointsCount, 3);
  // Área geométrica planar esperada = (80 * 60) / 2 = 2400 m²
  assert.ok(
    result.areaInSquareMeters >= 2380 && result.areaInSquareMeters <= 2420,
    `Área esperada em torno de 2400 m², obtido: ${result.areaInSquareMeters}`
  );
  assert.match(result.formattedArea, /2\.39[0-9],[0-9]{2} m²/);
});

test('4. Sentido dos Vértices: Sentido Horário e Anti-Horário produzem o mesmo valor positivo', () => {
  const d100 = 100 / METERS_PER_DEGREE_LAT;

  const ccw: PolygonPoint[] = [
    { latitude: 0.0, longitude: 0.0 },
    { latitude: 0.0, longitude: d100 },
    { latitude: d100, longitude: d100 },
    { latitude: d100, longitude: 0.0 },
  ];

  const cw: PolygonPoint[] = [
    { latitude: 0.0, longitude: 0.0 },
    { latitude: d100, longitude: 0.0 },
    { latitude: d100, longitude: d100 },
    { latitude: 0.0, longitude: d100 },
  ];

  const resCCW = calculatePolygonArea(ccw);
  const resCW = calculatePolygonArea(cw);

  assert.strictEqual(resCCW.success, true);
  assert.strictEqual(resCW.success, true);
  assert.ok(resCCW.areaInSquareMeters > 0);
  assert.ok(resCW.areaInSquareMeters > 0);
  assert.ok(
    Math.abs(resCCW.areaInSquareMeters - resCW.areaInSquareMeters) < 0.0001,
    'Áreas em sentidos opostos devem ser idênticas'
  );
});

test('5. Tratamento de Exceção: Polígono Vazio', () => {
  const resultEmpty = calculatePolygonArea([]);
  assert.strictEqual(resultEmpty.success, false);
  assert.strictEqual(resultEmpty.areaInSquareMeters, 0);
  assert.strictEqual(resultEmpty.pointsCount, 0);
  assert.ok(resultEmpty.errorMessage?.includes('Polígono vazio'));

  // Array nulo ou indefinido
  // @ts-expect-error teste de robustez para entradas inválidas
  const resultNull = calculatePolygonArea(null);
  assert.strictEqual(resultNull.success, false);
  assert.strictEqual(resultNull.areaInSquareMeters, 0);
});

test('6. Tratamento de Exceção: Menos de 3 Pontos', () => {
  const onePoint: PolygonPoint[] = [{ latitude: -15.7942, longitude: -47.8822 }];
  const result1 = calculatePolygonArea(onePoint);
  assert.strictEqual(result1.success, false);
  assert.strictEqual(result1.pointsCount, 1);
  assert.ok(result1.errorMessage?.includes('mínimo exigido é 3'));

  const twoPoints: PolygonPoint[] = [
    { latitude: -15.7942, longitude: -47.8822 },
    { latitude: -15.7950, longitude: -47.8830 },
  ];
  const result2 = calculatePolygonArea(twoPoints);
  assert.strictEqual(result2.success, false);
  assert.strictEqual(result2.pointsCount, 2);
  assert.ok(result2.errorMessage?.includes('mínimo exigido é 3'));
});

test('7. Tratamento de Exceção: Pontos com Coordenadas Inválidas', () => {
  // Latitude acima de 90°
  const invalidLat: PolygonPoint[] = [
    { latitude: 95.0, longitude: -47.88 },
    { latitude: 0.0, longitude: -47.88 },
    { latitude: 0.0, longitude: -47.89 },
  ];
  const resLat = calculatePolygonArea(invalidLat);
  assert.strictEqual(resLat.success, false);
  assert.ok(resLat.errorMessage?.includes('fora dos limites terrestres'));

  // Longitude abaixo de -180°
  const invalidLng: PolygonPoint[] = [
    { latitude: -15.0, longitude: -195.0 },
    { latitude: -15.0, longitude: -47.88 },
    { latitude: -15.1, longitude: -47.89 },
  ];
  const resLng = calculatePolygonArea(invalidLng);
  assert.strictEqual(resLng.success, false);

  // Valor NaN
  const invalidNaN: PolygonPoint[] = [
    { latitude: NaN, longitude: -47.88 },
    { latitude: -15.0, longitude: -47.88 },
    { latitude: -15.1, longitude: -47.89 },
  ];
  const resNaN = calculatePolygonArea(invalidNaN);
  assert.strictEqual(resNaN.success, false);
});

test('8. Formatação pt-BR de Área', () => {
  const formatted = formatArea(1243.5678);
  assert.strictEqual(formatted, '1.243,57 m²');

  const zeroFormatted = formatArea(0);
  assert.strictEqual(zeroFormatted, '0,00 m²');
});
