const Store = {
  _data: null,
  _listeners: [],

  init() {
    const saved = localStorage.getItem('hablakids');
    if (saved) {
      this._data = JSON.parse(saved);
    } else {
      this._data = {
        usuario: null,
        niveles: {
          0: { completado: false, estrellas: 0, ejerciciosCompletados: [] },
          1: { completado: false, estrellas: 0, ejerciciosCompletados: [] },
          2: { completado: false, estrellas: 0, ejerciciosCompletados: [] },
          3: { completado: false, estrellas: 0, ejerciciosCompletados: [] },
          4: { completado: false, estrellas: 0, ejerciciosCompletados: [] },
          5: { completado: false, estrellas: 0, ejerciciosCompletados: [] },
          6: { completado: false, estrellas: 0, ejerciciosCompletados: [] }
        },
        monedas: 0,
        racha: 0,
        ultimaVisita: null,
        logros: [],
        stickersObtenidos: [],
        mascota: { hambre: 50, felicidad: 50, vestuario: [] },
        config: { dificultadManual: null, sonidoActivado: true, vibracionActivada: true },
        stats: { totalEjercicios: 0, totalAciertos: 0, sesiones: 0 }
      };
    }
    this._verificarRacha();
    this._notify();
  },

  _save() {
    localStorage.setItem('hablakids', JSON.stringify(this._data));
  },

  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  },

  _notify() {
    this._listeners.forEach(fn => fn(this._data));
  },

  get data() { return this._data; },

  _verificarRacha() {
    const d = this._data;
    if (!d.usuario) return;
    if (!d.ultimaVisita) { d.ultimaVisita = new Date().toISOString(); this._save(); return; }
    const ultima = new Date(d.ultimaVisita);
    const hoy = new Date();
    const diff = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));
    if (diff === 0) return;
    if (diff === 1) {
      d.racha = (d.racha || 0) + 1;
    } else {
      d.racha = 0;
    }
    d.ultimaVisita = hoy.toISOString();
    this._save();
  },

  setUsuario(nombre, edad) {
    this._data.usuario = { nombre, edad };
    this._data.ultimaVisita = new Date().toISOString();
    this._save();
    this._notify();
  },

  registrarEjercicio(nivel, ejercicioId, acierto, score) {
    const d = this._data;
    const nivelData = d.niveles[nivel];
    if (!nivelData.ejerciciosCompletados.includes(ejercicioId)) {
      nivelData.ejerciciosCompletados.push(ejercicioId);
    }
    d.stats.totalEjercicios++;
    if (acierto) d.stats.totalAciertos++;
    if (score > 35 && !nivelData.ejerciciosCompletados.includes(ejercicioId + '_score')) {
      d.monedas += 5;
    } else if (acierto) {
      d.monedas += 2;
    }
    this._actualizarEstrellas(nivel);
    this._save();
    this._notify();
  },

  _actualizarEstrellas(nivel) {
    const nd = this._data.niveles[nivel];
    const total = window.EJERCICIOS_POR_NIVEL?.[nivel] || 10;
    const ratio = nd.ejerciciosCompletados.length / total;
    if (ratio >= 0.9) nd.estrellas = 3;
    else if (ratio >= 0.6) nd.estrellas = 2;
    else if (ratio > 0) nd.estrellas = 1;
    if (nd.estrellas >= 2 && !nd.completado) {
      nd.completado = true;
      this._data.monedas += 20;
    }
  },

  obtenerSiguienteNivel() {
    for (let i = 0; i <= 6; i++) {
      if (!this._data.niveles[i].completado) return i;
    }
    return 6;
  },

  obtenerNivelesDesbloqueados() {
    return [0, 1, 2, 3, 4, 5, 6];
  },

  obtenerLogro(id) {
    return this._data.logros.includes(id);
  },

  desbloquearLogro(id) {
    if (!this._data.logros.includes(id)) {
      this._data.logros.push(id);
      this._data.monedas += 30;
      this._save();
      this._notify();
      return true;
    }
    return false;
  },

  obtenerSticker(id) {
    return this._data.stickersObtenidos.includes(id);
  },

  desbloquearSticker(id) {
    if (!this._data.stickersObtenidos.includes(id)) {
      this._data.stickersObtenidos.push(id);
      this._save();
      this._notify();
      return true;
    }
    return false;
  },

  actualizarMascota(deltaHambre, deltaFelicidad) {
    const m = this._data.mascota;
    m.hambre = Math.max(0, Math.min(100, m.hambre + deltaHambre));
    m.felicidad = Math.max(0, Math.min(100, m.felicidad + deltaFelicidad));
    this._save();
    this._notify();
  },

  setConfig(clave, valor) {
    this._data.config[clave] = valor;
    this._save();
    this._notify();
  },

  reiniciarProgreso() {
    const nombre = this._data.usuario?.nombre;
    const edad = this._data.usuario?.edad;
    localStorage.removeItem('hablakids');
    this.init();
    if (nombre) this._data.usuario = { nombre, edad };
    this._save();
    this._notify();
  }
};

window.EJERCICIOS_POR_NIVEL = { 0: 10, 1: 15, 2: 15, 3: 20, 4: 15, 5: 10, 6: 10 };
