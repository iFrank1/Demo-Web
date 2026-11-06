//interfaz de la demo: lee el formulario, calcula y pinta resultados
import { evaluar, validar, ACTIVIDAD, ECUACIONES } from './formulas.js';
import { PACIENTES } from './pacientes.js';

const form = document.getElementById('form');
const selEjemplo = document.getElementById('ejemplo');
const selEcuacion = form.elements.ecuacion;
const selActividad = form.elements.actividad;
const svg = document.getElementById('somatocarta');

const num = (v, d = 2) => Number(v).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
const kcal = (v) => `${num(v, 0)} kcal`;

//textos de clasificacion vienen de formulas.js, no del usuario
function tarjeta(titulo, valor, unidad = '', clase = null) {
  const etiqueta = clase ? `<span class="chip ${clase.nivel}">${clase.texto}</span>` : '';
  return `<div class="dato"><span class="titulo">${titulo}</span>
    <span class="valor">${valor}<small>${unidad}</small></span>${etiqueta}</div>`;
}

function llenarActividad(sexo, indice) {
  selActividad.innerHTML = ACTIVIDAD[sexo]
    .map(([n, f], i) => `<option value="${i}">${n} (${f})</option>`).join('');
  selActividad.value = String(indice);
}

function cargarPaciente(p) {
  for (const [k, v] of Object.entries(p)) {
    if (form.elements[k] && k !== 'actividad') form.elements[k].value = v;
  }
  llenarActividad(p.sexo, p.actividad);
  calcular();
}

function leerFormulario() {
  const p = { nombre: selEjemplo.selectedOptions[0].textContent };
  for (const el of form.elements) {
    if (!el.name) continue;
    p[el.name] = el.type === 'number' ? parseFloat(el.value) : el.value;
  }
  p.actividad = Number(p.actividad);
  return p;
}

function calcular() {
  const p = leerFormulario();
  const avisos = validar(p);
  const caja = document.getElementById('avisos');
  caja.hidden = avisos.length === 0;
  caja.innerHTML = avisos.map((a) => `<p>${a}</p>`).join('');
  document.querySelector('.resultados').classList.toggle('apagado', avisos.length > 0);
  if (avisos.length) return;

  const r = evaluar(p);
  pintar(p, r);
  ultimo = { p, r };
}

function pintar(p, r) {
  document.getElementById('antropometria').innerHTML = [
    tarjeta('IMC', num(r.imc), ' kg/m²', r.imcClase),
    tarjeta('Peso ideal', num(r.pesoIdeal), ' kg'),
    tarjeta('Índice cintura/cadera', num(r.icc), '', r.iccClase),
    tarjeta('Índice cintura/talla', num(r.ict), '', r.ictClase),
    tarjeta('% Grasa corporal', num(r.grasa), ' %', r.grasaClase),
    tarjeta('Masa corporal magra', num(r.magra), ' kg'),
  ].join('');

  const g = r.gasto;
  document.getElementById('gasto-nota').textContent =
    `Ecuación de ${p.ecuacion}, factor de actividad ${g.factor}.`;
  document.getElementById('gasto').innerHTML = [
    tarjeta('Gasto basal (GEB)', kcal(g.geb)),
    tarjeta('Efecto térmico (ETA)', kcal(g.eta)),
    tarjeta('Actividad física (EFA)', kcal(g.efa)),
    tarjeta('Gasto total (GET)', kcal(g.get)),
  ].join('');
  const pct = (v) => `${(v / g.get) * 100}%`;
  document.getElementById('barra-get').innerHTML =
    `<span class="geb" style="width:${pct(g.geb)}">GEB</span>` +
    `<span class="eta" style="width:${pct(g.eta)}"></span>` +
    `<span class="efa" style="width:${pct(g.efa)}">EFA</span>`;

  const s = r.soma;
  document.getElementById('soma-valores').innerHTML = [
    tarjeta('Endomorfia', num(s.endo)),
    tarjeta('Mesomorfia', num(s.meso)),
    tarjeta('Ectomorfia', num(s.ecto)),
    tarjeta('Tipo dominante', `<span class="tipo">${s.dominante.replaceAll('/', ' / ')}</span>`),
  ].join('');
  dibujarSomatocarta(s);
}

//somatocarta en coordenadas del svg: x = ecto - endo, y = 2·meso - (endo + ecto); en svg la y va invertida
function dibujarSomatocarta(s) {
  const px = Math.max(-8.8, Math.min(8.8, s.x));
  const py = Math.max(-8.8, Math.min(14.5, s.y));
  svg.innerHTML = `
    <path class="contorno" d="M-6 6 Q-4.8 -4.8 0 -12 Q4.8 -4.8 6 6 Q0 8.5 -6 6 Z"/>
    <path class="ejes" d="M0 0 L-6 6 M0 0 L0 -12 M0 0 L6 6"/>
    <text x="0" y="-12.8">Mesomorfo</text>
    <text x="-6.4" y="7.6">Endomorfo</text>
    <text x="6.4" y="7.6">Ectomorfo</text>
    <circle class="punto" cx="${px}" cy="${-py}" r="0.5"><title>X ${num(s.x)} · Y ${num(s.y)}</title></circle>
    <text class="coord" x="0" y="9.2">X = ${num(s.x)} · Y = ${num(s.y)}</text>`;
}

//la hoja resumen se arma solo para imprimir
let ultimo = null;
function imprimir() {
  if (!ultimo) return;
  const { p, r } = ultimo;
  const filas = [
    ['Sexo', p.sexo], ['Edad', `${p.edad} años`], ['Peso', `${num(p.peso, 1)} kg`], ['Altura', `${p.altura} cm`],
    ['IMC', `${num(r.imc)} kg/m² · ${r.imcClase.texto}`], ['Peso ideal', `${num(r.pesoIdeal)} kg`],
    ['ICC', `${num(r.icc)} · ${r.iccClase.texto}`], ['ICT', `${num(r.ict)} · ${r.ictClase.texto}`],
    ['% Grasa', `${num(r.grasa)} % · ${r.grasaClase.texto}`], ['Masa magra', `${num(r.magra)} kg`],
    ['GEB', kcal(r.gasto.geb)], ['ETA', kcal(r.gasto.eta)], ['EFA', kcal(r.gasto.efa)], ['GET', kcal(r.gasto.get)],
    ['Somatotipo', `${num(r.soma.endo, 1)} – ${num(r.soma.meso, 1)} – ${num(r.soma.ecto, 1)} (${r.soma.dominante})`],
  ];
  document.getElementById('hoja').innerHTML = `
    <h1>NutEval · Hoja resumen</h1>
    <p>${p.nombre} · ${new Date().toLocaleDateString('es-MX')}</p>
    <table>${filas.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>
    <p class="nota">Generado con la demo web de NutEval. Datos ficticios, uso educativo.</p>`;
  window.print();
}

//arranque
selEjemplo.innerHTML = PACIENTES.map((p, i) => `<option value="${i}">${p.nombre}</option>`).join('');
selEcuacion.innerHTML = ECUACIONES.map((e) => `<option>${e}</option>`).join('');

selEjemplo.addEventListener('change', () => cargarPaciente(PACIENTES[selEjemplo.value]));
form.elements.sexo.addEventListener('change', () => llenarActividad(form.elements.sexo.value, selActividad.value));
form.addEventListener('input', calcular);
form.addEventListener('change', calcular);
form.addEventListener('submit', (e) => e.preventDefault());
document.getElementById('imprimir').addEventListener('click', imprimir);

//si todavia no hay video, se muestra un aviso en su lugar
const video = document.getElementById('video-demo');
const sinVideo = () => { video.hidden = true; document.getElementById('sin-video').hidden = false; };
video.addEventListener('error', sinVideo);
if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) sinVideo();

cargarPaciente(PACIENTES[0]);
