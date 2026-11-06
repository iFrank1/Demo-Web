//compara las formulas de la web contra valores calculados por el codigo java
//la referencia se genera con tests/java/Referencia.java (ver docs/DOCUMENTACION.md)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluar, validar, alturaValida, clasificarIMC } from '../js/formulas.js';
import { PACIENTES } from '../js/pacientes.js';

const referencia = JSON.parse(readFileSync(new URL('./referencia-java.json', import.meta.url)));
const cerca = (a, b, campo) => assert.ok(Math.abs(a - b) < 1e-4, `${campo}: web ${a} vs java ${b}`);

PACIENTES.forEach((p, i) => {
  test(`${p.nombre} da los mismos resultados que java`, () => {
    const r = evaluar(p);
    const j = referencia[i];
    cerca(r.imc, j.imc, 'imc');
    cerca(r.pesoIdeal, j.pesoIdeal, 'pesoIdeal');
    cerca(r.icc, j.icc, 'icc');
    cerca(r.ict, j.ict, 'ict');
    cerca(r.densidad, j.densidad, 'densidad');
    cerca(r.grasa, j.grasa, 'grasa');
    cerca(r.magra, j.magra, 'magra');
    cerca(r.gasto.geb, j.geb, 'geb');
    cerca(r.gasto.eta, j.eta, 'eta');
    cerca(r.gasto.get, j.get, 'get');
    cerca(r.soma.endo, j.endo, 'endo');
    cerca(r.soma.meso, j.meso, 'meso');
    cerca(r.soma.ecto, j.ecto, 'ecto');
    cerca(r.soma.x, j.x, 'x');
    cerca(r.soma.y, j.y, 'y');
    assert.equal(r.soma.dominante, j.dominante);
  });
});

test('la altura solo se acepta en cm enteros', () => {
  assert.equal(alturaValida(182), true);
  assert.equal(alturaValida(1.82), false);
  assert.equal(alturaValida(0), false);
});

test('valencia no acepta menores de 18', () => {
  const p = { ...PACIENTES[2], edad: 17 };
  assert.ok(validar(p).some((a) => a.includes('Valencia')));
});

test('los pacientes de ejemplo pasan la validacion', () => {
  PACIENTES.forEach((p) => assert.deepEqual(validar(p), []));
});

test('cortes de imc', () => {
  assert.equal(clasificarIMC(18.4).texto, 'Bajo peso');
  assert.equal(clasificarIMC(18.5).texto, 'Normal');
  assert.equal(clasificarIMC(25).texto, 'Sobrepeso');
  assert.equal(clasificarIMC(30).texto, 'Obesidad');
});
