//formulas copiadas de la app java (rama correcciones-generales)
//cada funcion indica el archivo de origen para poder compararlas

//AppState.alturaValida: la altura va en cm enteros
export function alturaValida(cm) {
  return cm > 0 && Number.isInteger(cm);
}

//PanelIMC.calcularIMC
export function imc(peso, alturaCm) {
  const m = alturaCm / 100;
  return peso / (m * m);
}

//VariablesAnalisis: puntos de corte OMS
export function clasificarIMC(valor) {
  if (valor < 18.5) return { texto: 'Bajo peso', nivel: 'medio' };
  if (valor < 25) return { texto: 'Normal', nivel: 'ok' };
  if (valor < 30) return { texto: 'Sobrepeso', nivel: 'medio' };
  return { texto: 'Obesidad', nivel: 'alerta' };
}

//PanelIMC.calcularIMC (formula de Lorentz)
export function pesoIdeal(sexo, alturaCm) {
  return sexo === 'Hombre'
    ? alturaCm - 100 - (alturaCm - 150) / 4
    : alturaCm - 100 - (alturaCm - 150) / 2;
}

//PanelIMC.calcularCircunferencias
export function icc(cintura, cadera) {
  return cintura / cadera;
}

export function clasificarICC(valor, sexo) {
  const limite = sexo === 'Hombre' ? 0.9 : 0.85;
  return valor < limite
    ? { texto: 'Normal', nivel: 'ok' }
    : { texto: 'Riesgo (obesidad central)', nivel: 'alerta' };
}

export function ict(cintura, alturaCm) {
  return cintura / alturaCm;
}

export function clasificarICT(valor) {
  return valor < 0.5
    ? { texto: 'Normal', nivel: 'ok' }
    : { texto: 'Riesgo (obesidad central)', nivel: 'alerta' };
}

//PanelIMC: jackson & pollock 7 pliegues, el termino cuadratico es (suma)^2
export function densidadCorporal(sexo, edad, pliegues) {
  const suma = pliegues.reduce((a, b) => a + b, 0);
  const sc = suma * suma;
  return sexo === 'Hombre'
    ? 1.112 - 0.00043499 * suma + 0.00000055 * sc - 0.00028826 * edad
    : 1.097 - 0.00046971 * suma + 0.00000056 * sc - 0.00012828 * edad;
}

//PanelIMC: ecuacion de siri
export function porcentajeGrasa(densidad) {
  return 495 / densidad - 450;
}

export function clasificarGrasa(pct, sexo) {
  const [bajo, optimo, moderado] = sexo === 'Hombre' ? [5, 20, 24] : [12, 28, 32];
  if (pct < bajo) return { texto: 'Muy bajo (riesgo hormonal)', nivel: 'alerta' };
  if (pct <= optimo) return { texto: 'Óptimo', nivel: 'ok' };
  if (pct <= moderado) return { texto: 'Moderado', nivel: 'medio' };
  return { texto: 'Alto (riesgo metabólico)', nivel: 'alerta' };
}

export function masaMagra(peso, pctGrasa) {
  return peso - (peso * pctGrasa) / 100;
}

//PanelGastoEnergetico: factores de actividad por sexo
export const ACTIVIDAD = {
  Hombre: [
    ['Sedentaria', 1.2], ['Ligero', 1.4], ['Moderado', 1.6], ['Activo', 1.75], ['Muy activo', 1.95],
  ],
  Mujer: [
    ['Sedentaria', 1.2], ['Ligero', 1.35], ['Moderado', 1.5], ['Activo', 1.65], ['Muy activo', 1.8],
  ],
};

export const ECUACIONES = ['Harris-Benedict', 'Mifflin-St Jeor', 'Valencia'];

//PanelGastoEnergetico.calcularGEB
export function gastoBasal(ecuacion, sexo, peso, alturaCm, edad) {
  const h = sexo === 'Hombre';
  if (ecuacion === 'Harris-Benedict') {
    return h
      ? 66.5 + 13.8 * peso + 5.0 * alturaCm - 6.8 * edad
      : 655.1 + 9.6 * peso + 1.8 * alturaCm - 4.7 * edad;
  }
  if (ecuacion === 'Mifflin-St Jeor') {
    return 10 * peso + 6.25 * alturaCm - 5 * edad + (h ? 5 : -161);
  }
  //valencia: solo usa peso y edad, minimo 18 años
  if (h) {
    if (edad <= 30) return 13.37 * peso + 747;
    if (edad <= 60) return 13.08 * peso + 693;
    return 14.21 * peso + 429;
  }
  if (edad <= 30) return 11.02 * peso + 679;
  if (edad <= 60) return 10.952 * peso + 677;
  return 10.98 * peso + 520;
}

//PanelGastoEnergetico.realizarCalculo: GET = GEB + ETA (10%) + EFA
export function gastoEnergetico(ecuacion, sexo, peso, alturaCm, edad, indiceActividad) {
  const geb = gastoBasal(ecuacion, sexo, peso, alturaCm, edad);
  const factor = ACTIVIDAD[sexo][indiceActividad][1];
  const eta = geb * 0.1;
  const efa = geb * (factor - 1);
  return { geb, eta, efa, get: geb + eta + efa, factor };
}

//PanelSomatotipo.Somatotipo (heath-carter)
export function endomorfia(tricipital, subescapular, supraespinal, alturaCm) {
  const x = (tricipital + subescapular + supraespinal) * (170.18 / alturaCm);
  const v = -0.7182 + 0.1451 * x - 0.00068 * x ** 2 + 0.0000014 * x ** 3;
  return Math.max(0, v);
}

export function mesomorfia(humero, femur, brazo, pantorrilla, tricipital, plieguePantorrilla, alturaCm) {
  const brazoCorregido = brazo - tricipital / 10;
  const pantorrillaCorregida = pantorrilla - plieguePantorrilla / 10;
  return 0.858 * humero + 0.601 * femur + 0.188 * brazoCorregido + 0.161 * pantorrillaCorregida - 0.131 * alturaCm + 4.5;
}

export function ectomorfia(alturaCm, peso) {
  const ip = alturaCm / Math.cbrt(peso);
  if (ip >= 40.75) return 0.732 * ip - 28.58;
  if (ip > 38.25) return 0.463 * ip - 17.63;
  return 0.1;
}

//ResultadoSomatotipo.determinarTipoDominante: todos los que quedan a 2 puntos o menos del maximo
export function tipoDominante(endo, meso, ecto) {
  const max = Math.max(endo, meso, ecto);
  return [['ENDOMORFO', endo], ['MESOMORFO', meso], ['ECTOMORFO', ecto]]
    .filter(([, v]) => Math.abs(v - max) <= 2)
    .map(([n]) => n)
    .join('/');
}

export function somatotipo(m) {
  const endo = endomorfia(m.tricipital, m.subescapular, m.supraespinal, m.altura);
  const meso = mesomorfia(m.humero, m.femur, m.brazo, m.pantorrilla, m.tricipital, m.plieguePantorrilla, m.altura);
  const ecto = ectomorfia(m.altura, m.peso);
  return {
    endo, meso, ecto,
    //coordenadas de la somatocarta
    x: ecto - endo,
    y: 2 * meso - (endo + ecto),
    dominante: tipoDominante(endo, meso, ecto),
  };
}

//junta todo lo que muestra la demo a partir de un paciente
export function evaluar(p) {
  const pliegues7 = [p.pectoral, p.axilar, p.tricipital, p.subescapular, p.abdominal, p.suprailiaco, p.muslo];
  const vImc = imc(p.peso, p.altura);
  const vIcc = icc(p.cintura, p.cadera);
  const vIct = ict(p.cintura, p.altura);
  const dc = densidadCorporal(p.sexo, p.edad, pliegues7);
  const grasa = porcentajeGrasa(dc);
  return {
    imc: vImc, imcClase: clasificarIMC(vImc),
    pesoIdeal: pesoIdeal(p.sexo, p.altura),
    icc: vIcc, iccClase: clasificarICC(vIcc, p.sexo),
    ict: vIct, ictClase: clasificarICT(vIct),
    densidad: dc,
    grasa, grasaClase: clasificarGrasa(grasa, p.sexo),
    magra: masaMagra(p.peso, grasa),
    gasto: gastoEnergetico(p.ecuacion, p.sexo, p.peso, p.altura, p.edad, p.actividad),
    soma: somatotipo(p),
  };
}

//revisa los datos antes de calcular; regresa la lista de avisos
export function validar(p) {
  const avisos = [];
  const numericos = ['edad', 'peso', 'altura', 'cintura', 'cadera', 'pectoral', 'axilar', 'tricipital',
    'subescapular', 'abdominal', 'suprailiaco', 'muslo', 'supraespinal', 'plieguePantorrilla',
    'humero', 'femur', 'brazo', 'pantorrilla'];
  if (numericos.some((k) => !(p[k] > 0))) avisos.push('Todos los campos deben ser números mayores a 0.');
  if (p.altura > 0 && !alturaValida(p.altura)) avisos.push('La altura va en centímetros enteros (ej. 182, no 1.82).');
  if (p.ecuacion === 'Valencia' && p.edad < 18) avisos.push('La ecuación de Valencia tiene como edad mínima 18 años.');
  return avisos;
}
