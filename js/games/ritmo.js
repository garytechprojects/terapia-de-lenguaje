var GameRitmo = {
  nivel: 0,
  patrones: [],
  currentIndex: 0,
  resultados: [],
  listening: false,
  pasoActual: 0,

  PATRONES: [
    { silabas: ['ma', 'ma'], emoji: '🥁' },
    { silabas: ['pa', 'pa', 'pa'], emoji: '🎵' },
    { silabas: ['ta', 'ta', 'ta', 'ta'], emoji: '🎶' },
    { silabas: ['ma', 'ma', 'pa'], emoji: '🎸' },
    { silabas: ['la', 'la', 'la'], emoji: '🎤' },
    { silabas: ['na', 'na', 'na', 'na'], emoji: '🎹' },
    { silabas: ['cha', 'cha', 'cha'], emoji: '💃' },
    { silabas: ['ra', 'ra', 'ra', 'ra'], emoji: '🥁' }
  ],

  iniciar(nivel) {
    this.nivel = nivel;
    this.currentIndex = 0;
    this.resultados = [];
    this.patrones = this.PATRONES.slice(0, Math.min(4 + nivel, this.PATRONES.length));

    this._render();
    this._mostrarPatron();
  },

  _render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-game-ritmo">
        <div class="header">
          <button class="btn btn-icono" id="ritmo-volver" style="background:var(--gris-claro);min-width:44px;min-height:44px;width:44px;height:44px;">←</button>
          <span class="header-titulo">🥁 RitmoLab</span>
          <div style="width:44px;"></div>
        </div>
        <div class="game-area">
          <div class="game-progreso-ejercicios" id="ritmo-progreso"></div>
          <div style="font-size:4rem;" id="ritmo-icono">🥁</div>
          <div style="font-size:1.8rem;font-weight:800;" id="ritmo-patron">ma ma</div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;" id="ritmo-silabas"></div>
          <div style="font-size:0.95rem;color:var(--texto-claro);font-weight:600;">Toca y repite el ritmo</div>
          <div class="fila-centro" style="gap:12px;">
            <button class="btn btn-azul btn-circulo" id="btn-escuchar-ritmo" style="width:70px;height:70px;font-size:1.8rem;">🔊</button>
            <button class="btn-grabar" id="btn-grabar-ritmo" style="width:80px;height:80px;font-size:2rem;">🎤</button>
          </div>
          <div class="feedback-texto" id="ritmo-feedback"></div>
        </div>
      </div>
    `;

    document.getElementById('ritmo-volver').addEventListener('click', () => {
      SpeechEngine.cancelarHabla();
      App.mostrarSelectorJuegos(this.nivel);
    });

    document.getElementById('btn-escuchar-ritmo').addEventListener('click', () => this._reproducirPatron());
    document.getElementById('btn-grabar-ritmo').addEventListener('click', () => {
      if (this.listening) return;
      this._iniciarGrabacion();
    });
  },

  _mostrarPatron() {
    if (this.currentIndex >= this.patrones.length) {
      this._mostrarResultados();
      return;
    }

    const patron = this.patrones[this.currentIndex];
    this.listening = false;
    this.pasoActual = 0;

    document.getElementById('ritmo-icono').textContent = patron.emoji;
    document.getElementById('ritmo-patron').textContent = patron.silabas.join(' ');
    document.getElementById('ritmo-feedback').textContent = '';
    document.getElementById('btn-grabar-ritmo').className = 'btn-grabar';

    this._mostrarSilabas(patron);
    this._actualizarProgreso();

    setTimeout(() => this._reproducirPatron(), 500);
  },

  _mostrarSilabas(patron) {
    const container = document.getElementById('ritmo-silabas');
    container.innerHTML = patron.silabas.map((s, i) =>
      `<div class="punto-ejercicio actual" style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;background:var(--azul);color:white;">${s}</div>`
    ).join('');

    this._animarSilabas(patron);
  },

  _animarSilabas(patron) {
    const silabas = document.querySelectorAll('#ritmo-silabas > div');
    patron.silabas.forEach((_, i) => {
      setTimeout(() => {
        silabas.forEach((el, j) => {
          el.style.background = j === i ? 'var(--naranja)' : 'var(--azul)';
          el.style.transform = j === i ? 'scale(1.2)' : 'scale(1)';
        });
      }, i * 600);
    });
    setTimeout(() => {
      silabas.forEach(el => { el.style.background = 'var(--azul)'; el.style.transform = 'scale(1)'; });
    }, patron.silabas.length * 600 + 200);
  },

  _reproducirPatron() {
    const patron = this.patrones[this.currentIndex];
    const silabas = patron.silabas;
    let i = 0;
    const hablarSiguiente = () => {
      if (i >= silabas.length) return;
      SpeechEngine.hablar(silabas[i], 0.6, () => {
        i++;
        setTimeout(hablarSiguiente, 300);
      });
    };
    hablarSiguiente();
    this._animarSilabas(patron);
  },

  _iniciarGrabacion() {
    this.listening = true;
    const btn = document.getElementById('btn-grabar-ritmo');
    btn.classList.add('grabando');
    const fb = document.getElementById('ritmo-feedback');
    let textoCapturado = '';

    SpeechEngine.escuchar(
      (texto) => { textoCapturado = texto; },
      (error) => {
        this.listening = false;
        btn.classList.remove('grabando');
        if (textoCapturado) {
          this._verificar(textoCapturado);
        } else if (error) {
          fb.textContent = '🎤 ' + SpeechEngine.errorTexto(error);
          fb.className = 'feedback-texto fallo';
        }
      }
    );
  },

  _verificar(texto) {
    const patron = this.patrones[this.currentIndex];
    const textoEsperado = patron.silabas.join(' ');
    const resultado = AudioProcessor.analizar(textoEsperado, texto);
    this.resultados.push({ patron: this.currentIndex, resultado });
    const acierto = resultado.acierto;

    Store.registrarEjercicio(this.nivel, `ritmo_${this.currentIndex}`, acierto, resultado.score);

    const fb = document.getElementById('ritmo-feedback');
    if (acierto) {
      fb.textContent = '✅ ¡Buen ritmo!';
      fb.className = 'feedback-texto';
      Store.actualizarMascota(3, 8);
    } else {
      fb.textContent = `🔄 El ritmo era: "${textoEsperado}"`;
      fb.className = 'feedback-texto fallo';
    }

    setTimeout(() => {
      this.currentIndex++;
      this._mostrarPatron();
    }, 2000);
  },

  _actualizarProgreso() {
    const container = document.getElementById('ritmo-progreso');
    if (!container) return;
    container.innerHTML = this.patrones.map((_, i) =>
      `<div class="punto-ejercicio ${i < this.currentIndex ? 'completado' : i === this.currentIndex ? 'actual' : ''}"></div>`
    ).join('');
  },

  _mostrarResultados() {
    const app = document.getElementById('app');
    const aciertos = this.resultados.filter(r => r.resultado.acierto).length;
    app.innerHTML = `
      <div class="screen active">
        <div class="contenido" style="gap:20px;">
          <div style="font-size:4rem;animation:flotarSuave 5s ease-in-out infinite;">🥁</div>
          <div class="titulo">${aciertos >= 3 ? '¡RITMO PERFECTO!' : '¡SIGUE PRACTICANDO!'}</div>
          <div class="card" style="text-align:center;">
            <div style="font-size:2.5rem;font-weight:800;color:var(--azul);">${aciertos}/${this.resultados.length}</div>
            <div style="font-weight:700;">ritmos correctos</div>
          </div>
          <div class="fila-centro" style="gap:12px;">
            <button class="btn btn-naranja" id="ritmo-rep">🔄 Repetir</button>
            <button class="btn btn-azul" id="ritmo-vol">🏠 Menú</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('ritmo-rep').addEventListener('click', () => this.iniciar(this.nivel));
    document.getElementById('ritmo-vol').addEventListener('click', () => App.mostrarSelectorJuegos(this.nivel));
  }
};
