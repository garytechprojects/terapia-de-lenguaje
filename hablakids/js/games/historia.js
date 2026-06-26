var GameHistoria = {
  nivel: 0,
  historia: null,
  paso: 0,
  listening: false,
  aciertos: 0,

  iniciar(nivel) {
    this.nivel = nivel;
    this.paso = 0;
    this.aciertos = 0;
    const historias = window.HISTORIAS_DATA || [
      {
        id: 1,
        titulo: 'El Gato Viajero',
        escenas: [
          { img: '🐱', texto: 'Había una vez un gato', dice: 'un gato' },
          { img: '🌙', texto: 'que salió de noche', dice: 'de noche' },
          { img: '⭐', texto: 'y vio una estrella', dice: 'una estrella' },
          { img: '🌳', texto: 'subió a un árbol', dice: 'subió al árbol' },
          { img: '🦉', texto: 'conoció a un búho', dice: 'un búho amigo' },
          { img: '🏠', texto: 'y volvió feliz a casa', dice: 'feliz a casa' }
        ]
      }
    ];
    this.historia = historias[0];
    this._render();
    this._mostrarEscena();
  },

  _render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-game-historia">
        <div class="header">
          <button class="btn btn-icono" id="hist-volver" style="background:var(--gris-claro);min-width:44px;min-height:44px;width:44px;height:44px;">←</button>
          <span class="header-titulo">📖 CuentaContigo</span>
          <div style="width:44px;"></div>
        </div>
        <div class="game-area">
          <div style="width:100%;max-width:300px;display:flex;gap:6px;justify-content:center;" id="hist-progreso"></div>
          <div style="font-size:6rem;" id="hist-imagen">📖</div>
          <div style="font-size:1.5rem;font-weight:700;min-height:3rem;" id="hist-texto">...</div>
          <div style="font-size:0.9rem;color:var(--texto-claro);font-weight:600;" id="hist-instruccion">Repite lo que falta</div>
          <div class="game-texto-reconocido" id="hist-respuesta">🎤</div>
          <div class="btn-grabar" id="btn-grabar-hist" style="width:80px;height:80px;font-size:2rem;">🎤</div>
          <div class="feedback-texto" id="hist-feedback"></div>
        </div>
      </div>
    `;

    document.getElementById('hist-volver').addEventListener('click', () => {
      SpeechEngine.cancelarHabla();
      App.mostrarSelectorJuegos(this.nivel);
    });

    document.getElementById('btn-grabar-hist').addEventListener('click', () => {
      if (this.listening) return;
      this._iniciarGrabacion();
    });
  },

  _mostrarEscena() {
    if (this.paso >= this.historia.escenas.length) {
      this._mostrarFinal();
      return;
    }

    const escena = this.historia.escenas[this.paso];
    this.listening = false;

    document.getElementById('hist-imagen').textContent = escena.img;
    document.getElementById('hist-texto').textContent = escena.texto;
    document.getElementById('hist-instruccion').textContent = `Di: "${escena.dice}"`;
    document.getElementById('hist-respuesta').textContent = '🎤';
    document.getElementById('hist-feedback').textContent = '';
    document.getElementById('btn-grabar-hist').className = 'btn-grabar';

    this._actualizarProgreso();

    setTimeout(() => {
      SpeechEngine.hablar(escena.texto, 0.7, () => {
        SpeechEngine.hablar(`Ahora di: ${escena.dice}`, 0.7);
      });
    }, 300);
  },

  _iniciarGrabacion() {
    this.listening = true;
    const btn = document.getElementById('btn-grabar-hist');
    btn.classList.add('grabando');

    SpeechEngine.escuchar(
      (texto) => {
        document.getElementById('hist-respuesta').textContent = texto || '...';
      },
      (error) => {
        this.listening = false;
        btn.classList.remove('grabando');
        const respuesta = document.getElementById('hist-respuesta');
        const texto = respuesta.textContent;
        if (texto && texto !== '🎤') {
          this._verificar(texto);
        } else {
          const msg = error ? SpeechEngine.errorTexto(error) : 'Intenta de nuevo';
          respuesta.textContent = '🎤 ' + msg;
          this._verificar('');
        }
      }
    );
  },

  _verificar(texto) {
    const escena = this.historia.escenas[this.paso];
    const resultado = AudioProcessor.analizar(escena.dice, texto);
    const acierto = resultado.acierto;

    Store.registrarEjercicio(this.nivel, `hist_${this.historia.id}_${this.paso}`, acierto, resultado.score);
    if (acierto) { this.aciertos++; Store.actualizarMascota(4, 10); }

    const fb = document.getElementById('hist-feedback');
    const recText = document.getElementById('hist-respuesta').textContent;
    if (acierto) {
      fb.textContent = `✅ ¡${escena.dice}! Sigue la historia`;
      fb.className = 'feedback-texto';
    } else {
      fb.textContent = `🔄 Esperaba "${escena.dice}" — oí "${recText}"`;
      fb.className = 'feedback-texto fallo';
    }

    setTimeout(() => {
      this.paso++;
      this._mostrarEscena();
    }, 2000);
  },

  _actualizarProgreso() {
    const container = document.getElementById('hist-progreso');
    if (!container) return;
    container.innerHTML = this.historia.escenas.map((_, i) =>
      `<div class="punto-ejercicio ${i < this.paso ? 'completado' : i === this.paso ? 'actual' : ''}"></div>`
    ).join('');
  },

  _mostrarFinal() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active">
        <div class="contenido" style="gap:20px;">
          <div style="font-size:4rem;">📖</div>
          <div class="titulo">¡Terminaste el cuento!</div>
          <div class="card" style="text-align:center;">
            <div style="font-size:2.5rem;font-weight:800;color:var(--morado);">${this.aciertos}/${this.historia.escenas.length}</div>
            <div style="font-weight:700;">partes correctas</div>
          </div>
          <div class="fila-centro" style="gap:12px;">
            <button class="btn btn-naranja" id="hist-rep">🔄 Otro cuento</button>
            <button class="btn btn-azul" id="hist-vol">🏠 Menú</button>
          </div>
        </div>
      </div>
    `;
    const historias = window.HISTORIAS_DATA || [{ id: 1, titulo: 'El Gato Viajero', escenas: [] }];
    document.getElementById('hist-rep').addEventListener('click', () => this.iniciar(this.nivel));
    document.getElementById('hist-vol').addEventListener('click', () => App.mostrarSelectorJuegos(this.nivel));
  }
};
