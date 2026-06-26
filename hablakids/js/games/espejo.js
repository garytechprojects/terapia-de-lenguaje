var GameEspejo = {
  nivel: 0,
  ejercicios: [],
  currentIndex: 0,
  listening: false,

  POSICIONES_BOCA: {
    'a': { labios: 'abiertos', lengua: 'abajo', desc: 'Boca grande, lengua abajo' },
    'e': { labios: 'estirados', lengua: 'media', desc: 'Sonríe, lengua al medio' },
    'i': { labios: 'estirados', lengua: 'arriba', desc: 'Sonríe fuerte, lengua arriba' },
    'o': { labios: 'redondos', lengua: 'abajo', desc: 'Boca redonda como una O' },
    'u': { labios: 'cerrados', lengua: 'atrás', desc: 'Labios hacia adelante' },
    'm': { labios: 'cerrados', lengua: 'abajo', desc: 'Junta los labios' },
    'p': { labios: 'explotan', lengua: 'abajo', desc: 'Labios se abren rápido' },
    'b': { labios: 'vibran', lengua: 'abajo', desc: 'Labios vibran' },
    't': { labios: 'abiertos', lengua: 'arriba-detras', desc: 'Lengua detrás de dientes' },
    'k': { labios: 'abiertos', lengua: 'atrás', desc: 'Lengua atrás, como tos' },
    'l': { labios: 'abiertos', lengua: 'arriba', desc: 'Lengua en el paladar' },
    's': { labios: 'abiertos', lengua: 'abajo', desc: 'Silba con lengua abajo' }
  },

  iniciar(nivel) {
    this.nivel = nivel;
    this.currentIndex = 0;
    const levelData = window[`Level${nivel}`];
    this.ejercicios = levelData ? [...levelData.obtenerEjercicios()] : Level0.obtenerEjercicios();
    this.ejercicios = this.ejercicios.slice(0, 6);

    this._render();
    this._mostrarEjercicio();
  },

  _render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-game-espejo">
        <div class="header">
          <button class="btn btn-icono" id="espejo-volver" style="background:var(--gris-claro);min-width:44px;min-height:44px;width:44px;height:44px;">←</button>
          <span class="header-titulo">🪞 Boca Mágica</span>
          <div style="width:44px;"></div>
        </div>
        <div class="game-area">
          <div class="game-progreso-ejercicios" id="espejo-progreso"></div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div style="font-size:5rem;line-height:1;" id="espejo-boca">🫦</div>
            <div style="font-size:2rem;font-weight:800;" id="espejo-fonema">A</div>
          </div>
          <div style="background:var(--gris-claro);border-radius:var(--radius);padding:12px 16px;max-width:280px;text-align:center;">
            <div style="font-weight:700;" id="espejo-descripcion">Abre bien la boca</div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;" id="espejo-demostracion">
            <button class="btn btn-azul" id="btn-ver-boca" style="font-size:1rem;">🔊 Escuchar</button>
            <button class="btn-grabar" id="btn-grabar-espejo" style="width:70px;height:70px;font-size:1.8rem;">🎤</button>
          </div>
          <div class="feedback-texto" id="espejo-feedback"></div>
        </div>
      </div>
    `;

    document.getElementById('espejo-volver').addEventListener('click', () => {
      SpeechEngine.cancelarHabla();
      App.mostrarSelectorJuegos(this.nivel);
    });

    document.getElementById('btn-ver-boca').addEventListener('click', () => {
      SpeechEngine.hablar(this.ejercicios[this.currentIndex]?.texto || 'a', 0.6);
    });

    document.getElementById('btn-grabar-espejo').addEventListener('click', () => {
      if (this.listening) return;
      this._iniciarGrabacion();
    });
  },

  _mostrarEjercicio() {
    if (this.currentIndex >= this.ejercicios.length) {
      this._mostrarResultados();
      return;
    }

    const ej = this.ejercicios[this.currentIndex];
    this.listening = false;
    const fonemaBase = ej.texto.charAt(0);
    const boca = this.POSICIONES_BOCA[fonemaBase] || this.POSICIONES_BOCA['a'];

    const bocaEmojis = { 'abiertos': '😮', 'estirados': '😀', 'redondos': '😯', 'cerrados': '😗', 'explotan': '😤', 'vibran': '😬' };
    document.getElementById('espejo-boca').textContent = bocaEmojis[boca.labios] || '🫦';
    document.getElementById('espejo-fonema').textContent = ej.texto.toUpperCase();
    document.getElementById('espejo-descripcion').textContent = `${boca.desc}. ${ej.pista}`;
    document.getElementById('espejo-feedback').textContent = '';
    document.getElementById('btn-grabar-espejo').className = 'btn-grabar';
    this._actualizarProgreso();
  },

  _iniciarGrabacion() {
    this.listening = true;
    const btn = document.getElementById('btn-grabar-espejo');
    btn.classList.add('grabando');
    let textoCapturado = '';

    SpeechEngine.escuchar(
      (texto) => { textoCapturado = texto; },
      (error) => {
        this.listening = false;
        btn.classList.remove('grabando');
        if (textoCapturado) {
          this._verificar(textoCapturado);
        }
      }
    );
  },

  _verificar(texto) {
    const ej = this.ejercicios[this.currentIndex];
    const resultado = AudioProcessor.analizar(ej.texto, texto);
    const acierto = resultado.acierto;

    Store.registrarEjercicio(this.nivel, `espejo_${ej.id}`, acierto, resultado.score);

    const fb = document.getElementById('espejo-feedback');
    fb.textContent = acierto ? `✅ ¡${ej.texto.toUpperCase()}! Bien` : `🔄 Mira la boca y di "${ej.texto}"`;
    fb.className = `feedback-texto ${acierto ? '' : 'fallo'}`;

    setTimeout(() => {
      this.currentIndex++;
      this._mostrarEjercicio();
    }, 2000);
  },

  _actualizarProgreso() {
    const container = document.getElementById('espejo-progreso');
    if (!container) return;
    container.innerHTML = this.ejercicios.map((_, i) =>
      `<div class="punto-ejercicio ${i < this.currentIndex ? 'completado' : i === this.currentIndex ? 'actual' : ''}"></div>`
    ).join('');
  },

  _mostrarResultados() {
    const app = document.getElementById('app');
    const aciertos = 0;
    app.innerHTML = `
      <div class="screen active">
        <div class="contenido" style="gap:20px;">
          <div style="font-size:4rem;">🪞</div>
          <div class="titulo">¡Practicaste tu boca!</div>
          <div class="fila-centro" style="gap:12px;">
            <button class="btn btn-naranja" id="espejo-rep">🔄 Repetir</button>
            <button class="btn btn-azul" id="espejo-vol">🏠 Menú</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('espejo-rep').addEventListener('click', () => this.iniciar(this.nivel));
    document.getElementById('espejo-vol').addEventListener('click', () => App.mostrarSelectorJuegos(this.nivel));
  }
};
