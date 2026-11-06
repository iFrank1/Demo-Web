//pacientes ficticios para la demo; ninguno es una persona real
//si cambias valores aqui, cambia tambien tests/java/Referencia.java y regenera la referencia
const base = (nombre, sexo, edad, peso, altura, cintura, cadera, jp7, somato, actividad, ecuacion) => {
  const [pectoral, axilar, tricipital, subescapular, abdominal, suprailiaco, muslo] = jp7;
  const [supraespinal, plieguePantorrilla, humero, femur, brazo, pantorrilla] = somato;
  return {
    nombre, sexo, edad, peso, altura, cintura, cadera,
    pectoral, axilar, tricipital, subescapular, abdominal, suprailiaco, muslo,
    supraespinal, plieguePantorrilla, humero, femur, brazo, pantorrilla,
    actividad, ecuacion,
  };
};

export const PACIENTES = [
  base('Ana López (demo)', 'Mujer', 21, 58, 162, 70, 96, [10, 11, 18, 14, 20, 15, 24], [12, 16, 6.0, 8.8, 26.5, 34], 1, 'Mifflin-St Jeor'),
  base('Luis García (demo)', 'Hombre', 23, 74, 176, 82, 98, [9, 11, 10, 13, 18, 14, 12], [9, 8, 7.0, 9.6, 31, 37], 2, 'Harris-Benedict'),
  base('Carlos Hernández (demo)', 'Hombre', 20, 92, 172, 98, 106, [20, 24, 18, 26, 34, 28, 22], [22, 15, 7.2, 10.0, 35, 40], 0, 'Valencia'),
  base('Fernanda Martínez (demo)', 'Mujer', 19, 50, 168, 64, 88, [6, 7, 12, 9, 11, 8, 16], [7, 10, 5.8, 8.4, 23.5, 32], 3, 'Mifflin-St Jeor'),
  base('Diego Pérez (demo)', 'Hombre', 22, 68, 181, 76, 92, [5, 6, 6, 8, 9, 7, 8], [5, 5, 6.8, 9.4, 29, 35], 4, 'Harris-Benedict'),
];
