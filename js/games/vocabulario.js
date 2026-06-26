var GameVocabulario = {
  nivel: 0,
  ejercicios: [],
  currentIndex: 0,
  resultados: [],
  listening: false,
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
    this.ejercicios = this.ejercicios.slice(0, Math.min(10, this.ejercicios.length));

    this._render();
    this._mostrarEjercicio();
  },

  _mezclar(arr) {
    const a = arr || this.ejercicios;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  },

  _render() {
    const colores = ['var(--naranja)','var(--azul)','var(--verde)','var(--rosa)','var(--morado)','var(--amarillo)','var(--naranja)'];
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-game-vocabulario" style="background:linear-gradient(180deg, ${colores[this.nivel]}22 0%, transparent 50%);">
        <div class="header">
          <button class="btn btn-icono" id="game-vocab-volver" style="background:var(--gris-claro);width:44px;height:44px;">←</button>
          <span class="header-titulo" style="font-size:1.2rem;">📚 PalabraExplorador</span>
          <div style="width:44px;"></div>
        </div>
        <div class="game-area">
          <div class="game-progreso-ejercicios" id="vocab-progreso"></div>
          <div class="game-imagen" id="vocab-imagen" style="font-size:6rem;animation:flotarSuave 5s ease-in-out infinite;">🦉</div>
          <div style="font-size:0.95rem;color:var(--texto-claro);font-weight:600;">Toca una palabra para escucharla, luego di la correcta:</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:320px;" id="vocab-opciones"></div>
          <div class="game-texto-reconocido" id="vocab-respuesta" style="font-size:1.3rem;">🎤 Di la palabra</div>
          <div class="btn-grabar" id="btn-grabar-vocab" style="width:85px;height:85px;font-size:2.2rem;">🎤</div>
          <div class="feedback-container" id="vocab-feedback-container" style="display:none;flex-direction:column;gap:6px;">
            <div class="feedback-texto" id="vocab-feedback"></div>
            <div class="feedback-score" id="vocab-score">0%</div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('game-vocab-volver').addEventListener('click', () => {
      SoundEffects.play('click');
      SpeechEngine.cancelarHabla();
      App.mostrarSelectorJuegos(this.nivel);
    });

    document.getElementById('btn-grabar-vocab').addEventListener('click', () => {
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

    const ej = this.ejercicios[this.currentIndex];
    this.listening = false;

    const img = document.getElementById('vocab-imagen');
    img.textContent = ej.imagen;
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animation = 'flotarSuave 2.5s ease-in-out infinite';

    document.getElementById('vocab-respuesta').textContent = '🎤 ¿Qué palabra es?';
    document.getElementById('vocab-respuesta').style.borderColor = 'var(--gris-claro)';
    document.getElementById('vocab-respuesta').style.background = 'white';
    document.getElementById('vocab-feedback-container').style.display = 'none';

    const opciones = this._generarOpciones(ej);
    const opcionesHtml = document.getElementById('vocab-opciones');
    const colores = ['btn-naranja', 'btn-azul', 'btn-verde', 'btn-rosa'];
    opcionesHtml.innerHTML = opciones.map((o, i) =>
      `<button class="btn ${colores[i % colores.length]} vocab-opcion" data-texto="${o}" style="font-size:1.2rem;padding:14px 20px;min-width:90px;animation:bounceIn 0.5s var(--bounce);animation-delay:${i * 0.1}s;animation-fill-mode:both;">${o}</button>`
    ).join('');

    opcionesHtml.querySelectorAll('.vocab-opcion').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEffects.play('bubble');
        const texto = btn.dataset.texto;
        SpeechEngine.hablar(texto, 0.65);
      });
    });

    document.getElementById('btn-grabar-vocab').className = 'btn-grabar';
    document.getElementById('btn-grabar-vocab').style.animation = 'pulso 2s ease-in-out infinite';
    this._actualizarProgreso();

    setTimeout(() => {
      SoundEffects.play('click');
      SpeechEngine.hablar(`Busca: ${ej.texto}`, 0.7);
    }, 400);
  },

  _generarOpciones(ej) {
    const correcta = ej.texto;
    const todas = this.ejercicios.map(e => e.texto).filter(t => t !== correcta);
    const disponibles = [...new Set(todas)];
    this._mezclar(disponibles);
    const distractores = disponibles.slice(0, 3);
    const opciones = [correcta, ...distractores];
    this._mezclar(opciones);
    return opciones;
  },

  _iniciarGrabacion() {
    this.listening = true;
    const btn = document.getElementById('btn-grabar-vocab');
    btn.className = 'btn-grabar grabando';
    btn.style.animation = 'none';

    const respuesta = document.getElementById('vocab-respuesta');
    respuesta.textContent = '🎤 Escuchando...';
    respuesta.style.borderColor = 'var(--naranja)';
    respuesta.style.background = 'var(--amarillo-claro)';

    SpeechEngine.escuchar(
      (texto) => {
        if (texto) {
          respuesta.textContent = texto;
          respuesta.style.borderColor = 'var(--azul)';
          respuesta.style.background = 'var(--azul-claro)';
        }
      },
      (error) => {
        this.listening = false;
        btn.className = 'btn-grabar';
        btn.style.animation = 'pulso 2s ease-in-out infinite';
        const texto = respuesta.textContent;
        if (texto && texto !== '🎤 Escuchando...' && texto !== '🎤 ¿Qué palabra es?') {
          this._verificar(texto);
        } else {
          const msg = error ? SpeechEngine.errorTexto(error) : 'Intenta de nuevo';
          respuesta.textContent = '🎤 ' + msg;
          respuesta.style.borderColor = 'var(--rosa)';
          respuesta.style.background = 'var(--rosa-claro)';
          this._resultadoVacio();
        }
      }
    );
  },

  _resultadoVacio() {
    this._verificar('');
  },

  _verificar(texto) {
    const ej = this.ejercicios[this.currentIndex];
    const resultado = AudioProcessor.analizar(ej.texto, texto);
    this.resultados.push({ ejercicio: ej, resultado });
    const acierto = resultado.acierto;

    Store.registrarEjercicio(this.nivel, `voc_${ej.id}`, acierto, resultado.score);
    if (acierto) {
      this.aciertosConsecutivos++;
      SoundEffects.play('correct');
      if (resultado.score >= 60) SoundEffects.play('perfect');
      Store.actualizarMascota(4, 10);
      if (this.aciertosConsecutivos >= 5) Store.desbloquearSticker('sol');
    } else {
      this.aciertosConsecutivos = 0;
      SoundEffects.play('wrong');
      Store.actualizarMascota(-1, -3);
    }

    const container = document.getElementById('vocab-feedback-container');
    const fb = document.getElementById('vocab-feedback');
    const score = document.getElementById('vocab-score');
    const respuesta = document.getElementById('vocab-respuesta');

    container.style.display = 'flex';
    const visual = AudioProcessor.compararConAudioVisual(resultado.score);

    const recText = respuesta.textContent;
    if (acierto) {
      fb.textContent = `✅ ¡${ej.texto.toUpperCase()}! ${visual.texto}`;
      fb.className = 'feedback-texto exito';
      respuesta.style.borderColor = 'var(--verde)';
      respuesta.style.background = 'var(--verde-claro)';
    } else {
      fb.textContent = `🔄 Esperaba "${ej.texto}" — oí "${recText}". ${visual.texto}`;
      fb.className = 'feedback-texto fallo';
      respuesta.style.borderColor = 'var(--naranja)';
      respuesta.style.background = 'var(--amarillo-claro)';
    }

    score.textContent = `${resultado.score}% ${visual.emoji}`;
    score.className = `feedback-score ${resultado.score >= 35 ? 'bien' : resultado.score >= 20 ? 'regular' : 'mal'}`;

    if (acierto && resultado.score >= 60) this._celebrar();
    this._actualizarPunto(this.currentIndex, acierto);
    document.getElementById('btn-grabar-vocab').className = 'btn-grabar';

    setTimeout(() => {
      this.currentIndex++;
      this._mostrarEjercicio();
    }, acierto ? 2000 : 3000);
  },

  _celebrar() {
    const emojis = ['🎉', '⭐', '🌟', '✨', '💫'];
    for (let i = 0; i < 8; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = `position:fixed;font-size:${1.5 + Math.random() * 2}rem;pointer-events:none;z-index:100;
        left:${Math.random() * 100}%;top:${30 + Math.random() * 40}%;
        animation:confetiCaida ${1.5 + Math.random() * 1}s ease-out forwards;
        animation-delay:${Math.random() * 0.3}s;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
  },

  _actualizarProgreso() {
    const container = document.getElementById('vocab-progreso');
    if (!container) return;
    container.innerHTML = this.ejercicios.map((_, i) =>
      `<div class="punto-ejercicio ${i < this.currentIndex ? 'completado' : i === this.currentIndex ? 'actual' : ''}"></div>`
    ).join('');
  },

  _actualizarPunto(index, acierto) {
    const puntos = document.querySelectorAll('#vocab-progreso .punto-ejercicio');
    if (puntos[index]) {
      puntos[index].className = `punto-ejercicio ${acierto ? 'completado' : 'fallado'}`;
    }
  },

  _mostrarResultados() {
    SoundEffects.play('levelup');
    const aciertos = this.resultados.filter(r => r.resultado.acierto).length;
    const total = this.resultados.length;
    const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;

    this._mostrarConfeti();

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" style="background:linear-gradient(135deg, var(--crema), var(--azul-claro), var(--morado-claro));">
        <div class="contenido" style="gap:16px;">
          <div style="font-size:5rem;animation:bounceIn 0.8s var(--bounce);">${pct >= 80 ? '🏆' : '👏'}</div>
          <div class="titulo" style="font-family:var(--font-display);font-size:2.5rem;color:var(--azul);">${pct >= 90 ? '¡VOCABULARIO INCREÍBLE!' : pct >= 70 ? '¡MUY BIEN!' : '¡BUEN TRABAJO!'}</div>
          <div class="card" style="text-align:center;max-width:280px;">
            <div style="font-size:3.5rem;font-weight:900;color:var(--azul);">${aciertos}/${total}</div>
            <div style="font-weight:700;font-size:1.1rem;">palabras correctas</div>
            <div class="barra-progreso" style="margin-top:12px;height:16px;">
              <div class="barra-progreso-lleno" style="width:${pct}%;background:linear-gradient(90deg,var(--azul),var(--verde));"></div>
            </div>
            <div style="margin-top:10px;font-size:2.5rem;">
              ${pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : pct >= 40 ? '⭐' : '💪'}
            </div>
          </div>
          <div class="fila-centro" style="gap:12px;">
            <button class="btn btn-naranja btn-grande" id="btn-reintentar-v" style="font-size:1.2rem;min-width:160px;">🔄 Otra vez</button>
            <button class="btn btn-azul btn-grande" id="btn-volver-v" style="font-size:1.2rem;min-width:160px;">🏠 Menú</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-reintentar-v').addEventListener('click', () => {
      SoundEffects.play('click');
      this.iniciar(this.nivel);
    });
    document.getElementById('btn-volver-v').addEventListener('click', () => {
      SoundEffects.play('click');
      App.mostrarSelectorJuegos(this.nivel);
    });
  },

  _mostrarConfeti() {
    const emojis = ['🎉', '⭐', '🌈', '💫', '📚'];
    for (let i = 0; i < 15; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[i % emojis.length];
      el.style.cssText = `position:fixed;font-size:${1 + Math.random() * 2}rem;pointer-events:none;z-index:100;
        left:${Math.random() * 100}%;top:-20px;
        animation:confetiCaida ${2 + Math.random() * 2}s ease-out forwards;
        animation-delay:${Math.random() * 0.8}s;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }
};
