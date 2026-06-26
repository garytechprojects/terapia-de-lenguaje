var GameFonetica = {
  nivel: 0,
  ejercicios: [],
  currentIndex: 0,
  currentEjercicio: null,
  listening: false,
  resultados: [],
  aciertosConsecutivos: 0,

  iniciar(nivel) {
    SoundEffects.play('click');
    this.nivel = nivel;
    this.currentIndex = 0;
    this.resultados = [];
    this.aciertosConsecutivos = 0;

    const levelData = window[`Level${nivel}`];
    this.ejercicios = levelData ? [...levelData.obtenerEjercicios()] : Level0.obtenerEjercicios();
    this._mezclar();

    this._render();
    this._mostrarEjercicio();
  },

  _mezclar() {
    for (let i = this.ejercicios.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.ejercicios[i], this.ejercicios[j]] = [this.ejercicios[j], this.ejercicios[i]];
    }
  },

  _render() {
    const colores = ['var(--naranja)','var(--azul)','var(--verde)','var(--rosa)','var(--morado)','var(--amarillo)','var(--naranja)'];
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-game-fonetica" style="background:linear-gradient(180deg, ${colores[this.nivel]}22 0%, transparent 50%);">
        <div class="header">
          <button class="btn btn-icono" id="game-fonetica-volver" style="background:var(--gris-claro);width:44px;height:44px;">←</button>
          <span class="header-titulo">🎤 EcoMágico</span>
          <div style="width:44px;"></div>
        </div>
        <div class="game-area" id="game-fonetica-area">
          <div class="game-progreso-ejercicios" id="game-progreso"></div>
          <div class="game-imagen" id="game-imagen" style="animation:flotarSuave 5s ease-in-out infinite;">🦉</div>
          <div class="game-texto-modelo" id="game-texto-modelo" style="font-family:var(--font-display);">Escucha y repite</div>
          <div class="game-pista" id="game-pista">🎯 Preparado...</div>
          <div class="game-texto-reconocido" id="game-texto-reconocido" style="font-size:1.6rem;">🎤</div>
          <div class="btn-grabar" id="btn-grabar-fonetica">🎤</div>
          <div class="feedback-container" id="feedback-container" style="display:none;flex-direction:column;gap:6px;">
            <div class="feedback-texto" id="feedback-texto"></div>
            <div class="fila-centro">
              <div class="feedback-score" id="feedback-score">0%</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('game-fonetica-volver').addEventListener('click', () => {
      SoundEffects.play('click');
      SpeechEngine.cancelarHabla();
      App.mostrarSelectorJuegos(this.nivel);
    });

    document.getElementById('btn-grabar-fonetica').addEventListener('click', () => {
      if (this.listening) return;
      SoundEffects.play('click');
      this._iniciarGrabacion();
    });
  },

  _mostrarEjercicio() {
    if (this.currentIndex >= this.ejercicios.length) {
      this._mostrarResultados();
      return;
    }

    this.currentEjercicio = this.ejercicios[this.currentIndex];
    this.listening = false;

    const img = document.getElementById('game-imagen');
    const texto = document.getElementById('game-texto-modelo');
    const pista = document.getElementById('game-pista');
    const reconocido = document.getElementById('game-texto-reconocido');

    img.textContent = this.currentEjercicio.imagen;
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animation = 'flotarSuave 3s ease-in-out infinite';

    texto.textContent = `"${this.currentEjercicio.texto}"`;
    pista.textContent = `🎯 ${this.currentEjercicio.pista}`;
    reconocido.textContent = '🎤';
    reconocido.style.borderColor = 'var(--gris-claro)';
    reconocido.style.background = 'white';

    document.getElementById('feedback-container').style.display = 'none';
    document.getElementById('btn-grabar-fonetica').className = 'btn-grabar';
    document.getElementById('btn-grabar-fonetica').style.animation = 'pulso 2s ease-in-out infinite';

    this._actualizarProgreso();

    setTimeout(() => {
      this._reproducirModelo();
    }, 400);
  },

  _reproducirModelo() {
    SoundEffects.play('click');
    SpeechEngine.hablar(this.currentEjercicio.texto, 0.65);
  },

  _iniciarGrabacion() {
    this.listening = true;
    const btn = document.getElementById('btn-grabar-fonetica');
    btn.className = 'btn-grabar grabando';
    btn.style.animation = 'none';

    const reconocido = document.getElementById('game-texto-reconocido');
    reconocido.textContent = '🎤 Escuchando...';
    reconocido.style.borderColor = 'var(--naranja)';
    reconocido.style.background = 'var(--amarillo-claro)';

    SpeechEngine.escuchar(
      (texto) => {
        if (texto) {
          reconocido.textContent = texto;
          reconocido.style.borderColor = 'var(--azul)';
          reconocido.style.background = 'var(--azul-claro)';
        }
      },
      (error) => {
        this.listening = false;
        btn.className = 'btn-grabar';
        btn.style.animation = 'pulso 2s ease-in-out infinite';
        const textoReconocido = reconocido.textContent;
        if (textoReconocido && textoReconocido !== '🎤 Escuchando...' && textoReconocido !== '🎤') {
          this._analizar(textoReconocido);
        } else {
          const msg = error ? SpeechEngine.errorTexto(error) : 'Intenta de nuevo';
          reconocido.textContent = '🎤 ' + msg;
          reconocido.style.borderColor = 'var(--rosa)';
          reconocido.style.background = 'var(--rosa-claro)';
          this._analizar('');
        }
      }
    );
  },

  _analizar(texto) {
    const resultado = AudioProcessor.analizar(this.currentEjercicio.texto, texto);
    this.resultados.push({ ejercicio: this.currentEjercicio, resultado });
    const acierto = resultado.acierto;

    if (acierto) {
      this.aciertosConsecutivos++;
      SoundEffects.play('correct');
      if (resultado.score >= 60) SoundEffects.play('perfect');
      if (this.aciertosConsecutivos >= 5) {
        Store.desbloquearSticker('sol');
      }
      Store.actualizarMascota(5, 12);
    } else {
      this.aciertosConsecutivos = 0;
      SoundEffects.play('wrong');
      Store.actualizarMascota(-2, -5);
    }

    Store.registrarEjercicio(this.nivel, this.currentEjercicio.id, acierto, resultado.score);

    this._mostrarFeedback(resultado);
  },

  _mostrarFeedback(result) {
    const container = document.getElementById('feedback-container');
    const texto = document.getElementById('feedback-texto');
    const score = document.getElementById('feedback-score');
    const btn = document.getElementById('btn-grabar-fonetica');

    container.style.display = 'flex';

    const fb = AudioProcessor.compararConAudioVisual(result.score);
    const recText = document.getElementById('game-texto-reconocido').textContent;
    if (result.acierto) {
      texto.textContent = `🌟 ¡${this.currentEjercicio.texto.toUpperCase()}! ${fb.texto}`;
    } else {
      texto.textContent = `🔄 Esperaba "${this.currentEjercicio.texto}" — oí "${recText}". ${result.consejo}`;
    }
    texto.className = `feedback-texto ${result.acierto ? 'exito' : 'fallo'}`;

    score.textContent = `${result.score}% ${fb.emoji}`;
    score.className = `feedback-score ${result.score >= 35 ? 'bien' : result.score >= 20 ? 'regular' : 'mal'}`;
    score.style.animation = 'none';
    void score.offsetWidth;
    score.style.animation = 'bounceIn 0.5s var(--bounce)';

    btn.className = 'btn-grabar';
    btn.style.animation = 'none';

    if (result.acierto && result.score >= 60) {
      this._celebrar();
    }

    this._actualizarPunto(this.currentIndex, result.acierto);

    const delay = result.acierto ? 2200 : 3200;
    setTimeout(() => {
      this.currentIndex++;
      this._mostrarEjercicio();
    }, delay);
  },

  _celebrar() {
    SoundEffects.play('confetti');
    const emojis = ['🎉', '🎊', '⭐', '🌈', '💫', '🌟', '✨', '🎀'];
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = `position:fixed;font-size:${1.5 + Math.random() * 2}rem;pointer-events:none;z-index:100;
        left:${Math.random() * 100}%;top:${30 + Math.random() * 40}%;
        animation:confetiCaida ${1.5 + Math.random() * 1}s ease-out forwards;
        animation-delay:${Math.random() * 0.4}s;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  },

  _actualizarProgreso() {
    const container = document.getElementById('game-progreso');
    if (!container) return;
    container.innerHTML = this.ejercicios.map((ej, i) => {
      let clase = i < this.currentIndex ? 'completado' : i === this.currentIndex ? 'actual' : '';
      return `<div class="punto-ejercicio ${clase}"></div>`;
    }).join('');
  },

  _actualizarPunto(index, acierto) {
    const puntos = document.querySelectorAll('.punto-ejercicio');
    if (puntos[index]) {
      puntos[index].className = `punto-ejercicio ${acierto ? 'completado' : 'fallado'}`;
    }
  },

  _mostrarResultados() {
    SoundEffects.play('levelup');
    const aciertos = this.resultados.filter(r => r.resultado.acierto).length;
    const total = this.resultados.length;
    const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;

    this._mostrarConfetiContinuo();

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" style="background:linear-gradient(135deg, var(--crema), var(--amarillo-claro), var(--morado-claro));">
        <div class="contenido" style="gap:16px;">
          <div style="font-size:5rem;animation:bounceIn 0.8s var(--bounce);">${pct >= 80 ? '🏆' : '👏'}</div>
          <div class="titulo" style="font-family:var(--font-display);font-size:2.5rem;color:var(--naranja);">${pct >= 90 ? '¡FELICIDADES!' : pct >= 70 ? '¡MUY BIEN!' : '¡BUEN TRABAJO!'}</div>
          <div class="subtitulo" style="font-size:1rem;">Completaste ${this.nombreNivel()}</div>
          <div class="card" style="text-align:center;max-width:280px;">
            <div style="font-size:3.5rem;font-weight:900;color:var(--naranja);">${aciertos}/${total}</div>
            <div style="font-weight:700;font-size:1.1rem;">ejercicios correctos</div>
            <div class="barra-progreso" style="margin-top:12px;height:16px;">
              <div class="barra-progreso-lleno" style="width:${pct}%;"></div>
            </div>
            <div style="margin-top:10px;font-size:2.5rem;">
              ${pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : pct >= 40 ? '⭐' : '💪'}
            </div>
          </div>
          <div class="fila-centro" style="gap:12px;">
            <button class="btn btn-naranja btn-grande" id="btn-reintentar" style="font-size:1.2rem;min-width:160px;">🔄 Repetir</button>
            <button class="btn btn-azul btn-grande" id="btn-volver-niveles" style="font-size:1.2rem;min-width:160px;">🏠 Menú</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-reintentar').addEventListener('click', () => {
      SoundEffects.play('click');
      this.iniciar(this.nivel);
    });
    document.getElementById('btn-volver-niveles').addEventListener('click', () => {
      SoundEffects.play('click');
      App.mostrarSelectorJuegos(this.nivel);
    });
  },

  _mostrarConfetiContinuo() {
    const emojis = ['🎉', '⭐', '🌈', '💫', '🌟'];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = `position:fixed;font-size:${1 + Math.random() * 2}rem;pointer-events:none;z-index:100;
        left:${Math.random() * 100}%;top:-20px;
        animation:confetiCaida ${2 + Math.random() * 2}s ease-out forwards;
        animation-delay:${Math.random() * 1}s;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
  },

  nombreNivel() {
    return ['Sonidos Básicos','Fonemas','Sílabas','Palabras','Frases','Conversación','Experto'][this.nivel] || '';
  }
};
