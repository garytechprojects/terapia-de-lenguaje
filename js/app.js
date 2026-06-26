const App = {
  currentScreen: null,
  currentLevel: null,
  currentGame: null,

  init() {
    Store.init();
    SpeechEngine.init();
    SoundEffects.init();

    Store.data.stats.sesiones++;
    Store._save();

    this._renderSplash();

    setTimeout(() => {
      if (Store.data.usuario) {
        this.mostrarHome();
      } else {
        this.mostrarRegistro();
      }
    }, 2500);
  },

  _renderSplash() {
    SoundEffects.play('levelup');
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-splash" style="background:linear-gradient(135deg, var(--naranja), var(--morado), var(--azul));background-size:300% 300%;animation:gradientShift 4s ease infinite;">
        <div class="contenido" style="gap:16px;position:relative;">
          <div style="position:absolute;top:10%;left:10%;font-size:2rem;animation:flotar 2.5s ease-in-out infinite;opacity:0.6;">⭐</div>
          <div style="position:absolute;top:20%;right:15%;font-size:1.5rem;animation:flotar 3s ease-in-out infinite 0.5s;opacity:0.6;">✨</div>
          <div style="position:absolute;bottom:30%;left:8%;font-size:1.8rem;animation:flotar 2.8s ease-in-out infinite 1s;opacity:0.6;">🌟</div>
          <div style="position:absolute;bottom:25%;right:10%;font-size:2rem;animation:flotar 3.2s ease-in-out infinite 1.5s;opacity:0.6;">💫</div>
          <div style="font-size:6rem;animation:flotar 2s ease-in-out infinite;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.15));">🦉</div>
          <div class="titulo" style="color:white;font-family:var(--font-display);font-size:3rem;text-shadow:3px 3px 0 rgba(0,0,0,0.1);letter-spacing:2px;">HablaKids</div>
          <div class="subtitulo" style="color:rgba(255,255,255,0.85);font-size:1.2rem;">¡Aprende a hablar jugando!</div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            ${['🟠','🟣','🔵','🟢','🟡','🔴'].map((c,i) => `<div style="font-size:1.5rem;animation:bounceIn 0.5s var(--bounce);animation-delay:${i*0.1}s;animation-fill-mode:both;">${c}</div>`).join('')}
          </div>
          <div style="width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;margin-top:10px;"></div>
        </div>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;
  },

  mostrarRegistro() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-registro" style="background:linear-gradient(180deg, var(--amarillo-claro) 0%, var(--blanco) 40%, var(--morado-claro) 100%);">
        <div class="contenido" style="gap:20px;">
          <div style="position:fixed;top:10%;left:5%;font-size:2.5rem;animation:flotar 3s ease-in-out infinite;opacity:0.3;">🎈</div>
          <div style="position:fixed;top:15%;right:8%;font-size:2rem;animation:flotar 3.5s ease-in-out infinite 0.5s;opacity:0.3;">🎉</div>
          <div style="position:fixed;bottom:20%;left:10%;font-size:2.2rem;animation:flotar 2.8s ease-in-out infinite 1s;opacity:0.3;">🎊</div>
          <div style="position:fixed;bottom:25%;right:5%;font-size:1.8rem;animation:flotar 3.2s ease-in-out infinite 1.5s;opacity:0.3;">🎈</div>
          <div style="font-size:5rem;animation:flotar 2.5s ease-in-out infinite;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.08));">🦉</div>
          <div class="mascota-burbuja" style="animation:bounceIn 0.6s var(--bounce);">¡Hola! Soy Luna 🦉<br>¿Cómo te llamas?</div>
          <input type="text" class="input-nombre" id="input-nombre" placeholder="Tu nombre" maxlength="20" autocomplete="off" autofocus style="animation:bounceIn 0.5s var(--bounce) 0.2s;animation-fill-mode:both;">
          <div class="subtitulo" style="animation:bounceIn 0.5s var(--bounce) 0.3s;animation-fill-mode:both;">¿Cuántos años tienes?</div>
          <div class="grid-3" id="edad-selector" style="max-width:280px;animation:bounceIn 0.5s var(--bounce) 0.4s;animation-fill-mode:both;">
            ${[2,3,4,5,6,7].map(e => `
              <button class="btn btn-azul btn-edad" data-edad="${e}" style="font-size:1.8rem;padding:16px;min-height:70px;">${'😊'.repeat(Math.max(1,e-1))}<br><span style="font-size:0.9rem;">${e} años</span></button>
            `).join('')}
          </div>
          <button class="btn btn-naranja btn-grande" id="btn-empezar" disabled style="opacity:0.4;animation:bounceIn 0.5s var(--bounce) 0.5s;animation-fill-mode:both;">
            🚀 ¡EMPEZAR!
          </button>
        </div>
      </div>
    `;

    let nombre = '', edad = null;

    document.getElementById('input-nombre').addEventListener('input', (e) => {
      nombre = e.target.value.trim();
      this._actualizarBotonEmpezar(nombre, edad);
    });
    document.getElementById('input-nombre').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && nombre && edad !== null) document.getElementById('btn-empezar').click();
    });

    document.querySelectorAll('.btn-edad').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundEffects.play('click');
        document.querySelectorAll('.btn-edad').forEach(b => { b.style.opacity = '0.5'; b.style.transform = 'scale(0.95)'; });
        edad = parseInt(btn.dataset.edad);
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.05)';
        this._actualizarBotonEmpezar(nombre, edad);
      });
    });

    document.getElementById('btn-empezar').addEventListener('click', () => {
      if (nombre && edad !== null) {
        SoundEffects.play('levelup');
        Store.setUsuario(nombre, edad);
        this.mostrarHome();
      }
    });
  },

  _actualizarBotonEmpezar(nombre, edad) {
    const btn = document.getElementById('btn-empezar');
    if (nombre && edad !== null) {
      btn.disabled = false;
      btn.style.opacity = '1';
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.4';
    }
  },

  mostrarHome() {
    SoundEffects.play('click');
    const u = Store.data.usuario;
    const nivelesDesbloqueados = Store.obtenerNivelesDesbloqueados();
    const nivelActual = Store.obtenerSiguienteNivel();
    const d = Store.data;

    const niveles = [
      { id: 0, nombre: 'Sonidos Básicos', desc: 'a, e, i, o, u', icono: '🔊', color: '#FF6B35' },
      { id: 1, nombre: 'Fonemas', desc: 'm, p, b, t, k, g', icono: '🔤', color: '#4ECDC4' },
      { id: 2, nombre: 'Sílabas', desc: 'ma-má, pa-pá', icono: '🎵', color: '#6BCB77' },
      { id: 3, nombre: 'Palabras', desc: 'Vocabulario esencial', icono: '📖', color: '#FF8FAB' },
      { id: 4, nombre: 'Frases', desc: 'Oraciones cortas', icono: '💬', color: '#C084FC' },
      { id: 5, nombre: 'Conversación', desc: 'Diálogos guiados', icono: '🗣️', color: '#FFD93D' },
      { id: 6, nombre: 'Experto', desc: 'Cuenta cuentos', icono: '🏆', color: '#FF6B35' }
    ];

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-home">
        <div class="header">
          <div style="display:flex;align-items:center;gap:8px;" onclick="SoundEffects.play('bubble')">
            <span style="font-size:1.8rem;animation:flotarSuave 2s ease-in-out infinite;display:inline-block;">🦉</span>
            <span class="header-titulo" style="font-size:1.3rem;">HablaKids</span>
          </div>
          <div class="home-header-derecha">
            <div class="monedas-display">🪙 <span id="monedas-header">${d.monedas}</span></div>
            ${d.racha > 0 ? `<div class="streak-display">🔥 ${d.racha}</div>` : ''}
            <button class="btn btn-morado btn-icono" id="btn-recompensas" style="font-size:1.2rem;width:44px;height:44px;box-shadow:0 3px 0 var(--morado-oscuro);">🏆</button>
            <button class="btn btn-icono" id="btn-panel-padres" style="background:var(--gris-claro);font-size:1.1rem;width:44px;height:44px;color:var(--texto);">👤</button>
          </div>
        </div>
        <div class="contenido contenido-inicio" style="padding-top:0;">
          <div class="home-top">
            <div class="home-mascota-contenedor">
              <div class="home-mascota" id="home-luna" onclick="SoundEffects.play('bubble')">🦉</div>
              <div class="mascota-burbuja" id="home-burbuja" style="font-size:1rem;padding:10px 18px;">
                ${u ? `¡Hola ${u.nombre}! 🌟` : '¡A jugar!'}
              </div>
              <div id="indicador-voz" style="font-size:0.75rem;text-align:center;margin-top:4px;opacity:0.7;"></div>
              <button id="btn-test-mic" style="background:none;border:1px dashed var(--gris);border-radius:12px;padding:4px 12px;font-size:0.7rem;color:var(--texto-claro);margin-top:4px;cursor:pointer;">🎤 Probar micrófono</button>
            </div>
          </div>
          <div class="mapa-niveles">
            ${niveles.map((n, idx) => {
              const nd = d.niveles[n.id];
              const desbloqueado = nivelesDesbloqueados.includes(n.id);
              const completado = nd.completado;
              const clases = ['nivel-item'];
              if (!desbloqueado) clases.push('bloqueado');
              if (completado) clases.push('completado');
              if (n.id === nivelActual && desbloqueado && !completado) clases.push('actual');
              const estrellas = nd.estrellas || 0;
              return `
                ${idx > 0 ? '<div class="conector"></div>' : ''}
                <div class="${clases.join(' ')}" data-nivel="${n.id}">
                  <div class="nivel-circulo" style="${desbloqueado && !completado ? `box-shadow:0 0 0 4px ${n.color}33, var(--sombra-media);` : ''}">
                    ${completado ? '✓' : desbloqueado ? n.id + 1 : '🔒'}
                    ${completado ? '<span class="nivel-circulo-check">⭐</span>' : ''}
                  </div>
                  <div class="nivel-info">
                    <div class="nivel-nombre">${n.icono} ${n.nombre}</div>
                    <div class="nivel-desc">${n.desc}</div>
                  </div>
                  <div class="nivel-estrellas">
                    ${[1,2,3].map(s => `<span class="estrella ${s <= estrellas ? 'activa' : ''}" style="font-size:1.2rem;">${s <= estrellas ? '⭐' : '☆'}</span>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    app.querySelectorAll('.nivel-item:not(.bloqueado)').forEach(el => {
      el.addEventListener('click', () => {
        SoundEffects.play('click');
        const nivel = parseInt(el.dataset.nivel);
        this.mostrarSelectorJuegos(nivel);
      });
    });

    document.getElementById('btn-recompensas').addEventListener('click', () => {
      SoundEffects.play('click');
      this.mostrarRecompensas();
    });
    document.getElementById('btn-panel-padres').addEventListener('click', () => {
      SoundEffects.play('click');
      this.mostrarPanelPadres();
    });

    const ind = document.getElementById('indicador-voz');
    if (ind) {
      if (SpeechEngine.recognition) {
        ind.textContent = '🎤 Voz activa';
        ind.style.color = 'var(--verde)';
      } else if (SpeechEngine.soportado()) {
        ind.textContent = '🎤 Presiona "Probar micrófono"';
        ind.style.color = 'var(--naranja)';
      } else {
        ind.textContent = '❌ Voz no soportada - usa Chrome o Edge';
        ind.style.color = 'var(--rosa)';
      }
    }

    const btnTest = document.getElementById('btn-test-mic');
    if (btnTest) {
      btnTest.addEventListener('click', () => {
        SoundEffects.play('click');
        if (!SpeechEngine.soportado()) {
          alert('❌ Tu navegador NO soporta reconocimiento de voz.\n\nUsa Chrome o Edge en Android, Windows o Mac.\nhttps://chrome.google.com');
          return;
        }
        btnTest.textContent = '🎤 Probando...';
        btnTest.disabled = true;
        const oldEnd = SpeechEngine._onEnd;
        SpeechEngine.escuchar(
          (texto) => {
            btnTest.textContent = '✅ ¡Micrófono funciona! Dijiste: "' + texto + '"';
            btnTest.style.borderColor = 'var(--verde)';
            btnTest.style.color = 'var(--verde)';
            setTimeout(() => { btnTest.textContent = '🎤 Probar micrófono'; btnTest.disabled = false; btnTest.style.borderColor = ''; btnTest.style.color = ''; }, 3000);
          },
          (error) => {
            if (error === 'no-support') {
              btnTest.textContent = '❌ Voz no soportada - usa Chrome';
              btnTest.style.borderColor = 'var(--rosa)';
            } else if (error) {
              btnTest.textContent = '⚠️ ' + SpeechEngine.errorTexto(error);
              btnTest.style.borderColor = 'var(--naranja)';
            } else {
              btnTest.textContent = '✅ Micrófono OK';
              btnTest.style.borderColor = 'var(--verde)';
            }
            setTimeout(() => { btnTest.textContent = '🎤 Probar micrófono'; btnTest.disabled = false; btnTest.style.borderColor = ''; btnTest.style.color = ''; }, 4000);
          },
          5000
        );
      });
    }
  },

  mostrarSelectorJuegos(nivel) {
    SoundEffects.play('click');
    this.currentLevel = nivel;
    const niveles = ['Sonidos Básicos','Fonemas','Sílabas','Palabras','Frases','Conversación','Experto'];
    const colores = ['var(--naranja)','var(--azul)','var(--verde)','var(--rosa)','var(--morado)','var(--amarillo)','var(--naranja)'];
    const juegos = [
      { id: 'fonetica', nombre: 'EcoMágico', desc: 'Escucha y repite', icono: '🎤' },
      { id: 'vocabulario', nombre: 'Palabras', desc: 'Aprende nuevas', icono: '📚' },
      { id: 'historia', nombre: 'Cuentos', desc: 'Narra historias', icono: '📖' },
      { id: 'ritmo', nombre: 'RitmoLab', desc: 'Sigue el ritmo', icono: '🥁' },
      { id: 'espejo', nombre: 'Boca Mágica', desc: 'Mira y aprende', icono: '🪞' }
    ];

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-juegos">
        <div class="header">
          <button class="btn btn-icono" id="btn-volver-juegos" style="background:var(--gris-claro);min-width:44px;min-height:44px;width:44px;height:44px;">←</button>
          <span class="header-titulo">${niveles[nivel]}</span>
          <div style="width:44px;"></div>
        </div>
        <div class="contenido" style="background:linear-gradient(180deg, ${colores[nivel]}15 0%, transparent 40%);">
          <div style="font-size:3.5rem;animation:flotar 2.5s ease-in-out infinite;">🦉</div>
          <div class="mascota-burbuja" style="font-size:0.95rem;padding:12px 18px;">Elige un juego para practicar ${niveles[nivel].toLowerCase()}</div>
          <div class="game-selector-juegos">
            ${juegos.map(j => `
              <div class="juego-card" data-juego="${j.id}">
                <div class="juego-icono">${j.icono}</div>
                <div class="juego-nombre">${j.nombre}</div>
                <div class="juego-desc">${j.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    app.querySelectorAll('.juego-card').forEach(el => {
      el.addEventListener('click', () => {
        SoundEffects.play('click');
        this.currentGame = el.dataset.juego;
        this.iniciarJuego(nivel, this.currentGame);
      });
    });

    document.getElementById('btn-volver-juegos').addEventListener('click', () => {
      SoundEffects.play('click');
      this.mostrarHome();
    });
  },

  iniciarJuego(nivel, juego) {
    const gameFn = window[`Game${juego.charAt(0).toUpperCase() + juego.slice(1)}`];
    if (gameFn && gameFn.iniciar) {
      gameFn.iniciar(nivel);
    } else {
      Games.iniciarGenerico(nivel, juego);
    }
  },

  mostrarRecompensas() {
    SoundEffects.play('click');
    const d = Store.data;
    const stickers = window.STICKERS_DATA || [
      {id:'sol',nombre:'Sol Radiante',icono:'☀️',condicion:'5 aciertos seguidos'},
      {id:'luna',nombre:'Luna Brillante',icono:'🌙',condicion:'Nivel completado'},
      {id:'estrella',nombre:'Super Estrella',icono:'⭐',condicion:'90% en un nivel'},
      {id:'arcoiris',nombre:'Arcoíris Mágico',icono:'🌈',condicion:'Todos los niveles'},
      {id:'corazon',nombre:'Corazón Valiente',icono:'❤️',condicion:'10 ejercicios'},
      {id:'mariposa',nombre:'Mariposa',icono:'🦋',condicion:'5 días seguidos'},
      {id:'fuego',nombre:'Fuego Interior',icono:'🔥',condicion:'7 días seguidos'},
      {id:'trofeo',nombre:'Trofeo de Oro',icono:'🏆',condicion:'Todo completado'},
      {id:'diamante',nombre:'Diamante',icono:'💎',condicion:'200 ejercicios'}
    ];

    const logros = window.REWARDS_DATA?.logros || [];

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-recompensas">
        <div class="header">
          <button class="btn btn-icono" id="btn-volver-rewards" style="background:var(--gris-claro);min-width:44px;min-height:44px;width:44px;height:44px;">←</button>
          <span class="header-titulo">🏆 Recompensas</span>
          <div style="width:44px;"></div>
        </div>
        <div class="contenido contenido-inicio" style="background:linear-gradient(180deg, var(--amarillo-claro) 0%, transparent 30%);">
          <div class="monedas-display" style="font-size:1.3rem;padding:12px 28px;">🪙 ${d.monedas}</div>
          
          <div class="mascota-panel">
            <div class="mascota-visual" onclick="SoundEffects.play('bubble')">🦉</div>
            <div style="font-weight:900;font-size:1.1rem;">Luna</div>
            <div class="mascota-barras">
              <div class="mascota-barra-item">
                <span class="mascota-barra-label">😊 Felicidad</span>
                <div class="barra-progreso"><div class="barra-progreso-lleno" style="width:${d.mascota.felicidad}%;background:linear-gradient(90deg,var(--amarillo),var(--naranja));"></div></div>
              </div>
              <div class="mascota-barra-item">
                <span class="mascota-barra-label">🍎 Hambre</span>
                <div class="barra-progreso"><div class="barra-progreso-lleno" style="width:${d.mascota.hambre}%;background:linear-gradient(90deg,var(--verde),var(--azul));"></div></div>
              </div>
            </div>
          </div>

          <div class="subtitulo" style="margin-top:8px;font-size:1.1rem;">🌟 Pegatinas</div>
          <div class="rewards-grid">
            ${stickers.slice(0,9).map(s => {
              const obtenido = d.stickersObtenidos.includes(s.id);
              return `<div class="reward-item ${obtenido ? 'obtenido' : 'bloqueado'}">
                <div class="reward-icono">${s.icono}</div>
                <div class="reward-nombre">${s.nombre}</div>
                <div class="reward-condicion">${obtenido ? '✅' : s.condicion}</div>
              </div>`;
            }).join('')}
          </div>

          <div class="subtitulo" style="margin-top:8px;font-size:1.1rem;">🏅 Logros</div>
          <div class="logros-lista">
            ${logros.map(l => {
              const completado = d.logros.includes(l.id);
              return `<div class="logro-item ${completado ? 'completado' : ''}">
                <div class="logro-icono" style="opacity:${completado ? 1 : 0.3};">${l.icono}</div>
                <div class="logro-info">
                  <div class="logro-nombre">${l.nombre}</div>
                  <div class="logro-desc">${l.desc}</div>
                </div>
                ${completado ? '<div class="logro-check" style="color:var(--verde);">✅</div>' : '<div style="color:var(--gris);font-size:1.2rem;">🔒</div>'}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-volver-rewards').addEventListener('click', () => {
      SoundEffects.play('click');
      this.mostrarHome();
    });
  },

  mostrarPanelPadres() {
    SoundEffects.play('click');
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="screen active" id="screen-parent">
        <div class="parent-login" id="parent-login">
          <div style="font-size:4rem;animation:flotar 3s ease-in-out infinite;">👤</div>
          <div class="titulo" style="font-size:1.3rem;">Zona de Padres</div>
          <div class="subtitulo">Ingresa el PIN</div>
          <input type="password" class="parent-pin-input" id="parent-pin" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off">
          <div id="parent-pin-error" style="color:var(--rosa);font-weight:700;display:none;animation:wiggle 0.5s;">PIN incorrecto ❌</div>
          <button class="btn btn-morado btn-grande" id="btn-parent-entrar" style="min-width:180px;">🔑 Entrar</button>
          <button class="btn" id="btn-parent-volver" style="background:var(--gris-claro);color:var(--texto);padding:12px 36px;">← Volver</button>
        </div>

        <div class="parent-dashboard" id="parent-dashboard" style="display:none;">
          <div class="header" style="padding:0 0 16px 0;">
            <span class="header-titulo">📊 Progreso</span>
            <button class="btn btn-icono" id="btn-parent-cerrar" style="background:var(--gris-claro);min-width:44px;min-height:44px;width:44px;height:44px;">✕</button>
          </div>

          <div class="parent-stats-grid">
            <div class="parent-stat-card">
              <div class="parent-stat-valor" id="parent-total-ej">0</div>
              <div class="parent-stat-label">🎯 Ejercicios</div>
            </div>
            <div class="parent-stat-card">
              <div class="parent-stat-valor" id="parent-tasa-exito">0%</div>
              <div class="parent-stat-label">📈 Precisión</div>
            </div>
            <div class="parent-stat-card">
              <div class="parent-stat-valor" id="parent-racha">0</div>
              <div class="parent-stat-label">🔥 Racha (días)</div>
            </div>
            <div class="parent-stat-card">
              <div class="parent-stat-valor" id="parent-sesiones">0</div>
              <div class="parent-stat-label">📅 Sesiones</div>
            </div>
          </div>

          <div class="parent-stats-detalle">
            <div class="parent-stats-titulo">📊 Progreso por Nivel</div>
            <div id="parent-niveles-progreso"></div>
          </div>

          <div class="parent-config">
            <div class="parent-stats-titulo">⚙️ Configuración</div>
            <div class="config-item">
              <span class="config-label">🔊 Sonidos</span>
              <div class="config-toggle activo" id="config-sonido"></div>
            </div>
            <div class="config-item">
              <span class="config-label">📳 Vibración</span>
              <div class="config-toggle activo" id="config-vibracion"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button class="btn btn-rosa" id="btn-reiniciar" style="flex:1;font-size:0.85rem;padding:12px;">🔄 Reiniciar</button>
            </div>
            <button class="btn-cerrar-sesion" id="btn-parent-cerrar-sesion">🚪 Cerrar sesión infantil</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-parent-volver').addEventListener('click', () => {
      SoundEffects.play('click');
      this.mostrarHome();
    });
    document.getElementById('btn-parent-entrar').addEventListener('click', () => {
      const pin = document.getElementById('parent-pin').value;
      if (pin === '1234') {
        SoundEffects.play('click');
        document.getElementById('parent-login').style.display = 'none';
        document.getElementById('parent-dashboard').style.display = 'flex';
        document.getElementById('parent-dashboard').style.animation = 'screenIn 0.4s ease';
        this._renderParentDashboard();
      } else {
        const err = document.getElementById('parent-pin-error');
        err.style.display = 'block';
        setTimeout(() => err.style.display = 'none', 2000);
      }
    });

    document.getElementById('parent-pin').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-parent-entrar').click();
    });
  },

  _renderParentDashboard() {
    const d = Store.data;

    document.getElementById('parent-total-ej').textContent = d.stats.totalEjercicios;
    document.getElementById('parent-tasa-exito').textContent = d.stats.totalEjercicios > 0
      ? Math.round((d.stats.totalAciertos / d.stats.totalEjercicios) * 100) + '%' : '0%';
    document.getElementById('parent-racha').textContent = d.racha || 0;
    document.getElementById('parent-sesiones').textContent = d.stats.sesiones;

    const nivelesHtml = document.getElementById('parent-niveles-progreso');
    const nombres = ['Sonidos Básicos','Fonemas','Sílabas','Palabras','Frases','Conversación','Experto'];
    const colores = ['var(--naranja)','var(--azul)','var(--verde)','var(--rosa)','var(--morado)','var(--amarillo)','var(--naranja)'];
    nivelesHtml.innerHTML = nombres.map((nombre, i) => {
      const nd = d.niveles[i];
      const total = window.EJERCICIOS_POR_NIVEL?.[i] || 10;
      const pct = Math.round((nd.ejerciciosCompletados.length / total) * 100);
      return `<div class="parent-nivel-bar">
        <span class="parent-nivel-nombre">${['🔊','🔤','🎵','📖','💬','🗣️','🏆'][i]} ${nombre}</span>
        <div class="parent-nivel-bar-bg">
          <div class="parent-nivel-bar-lleno" style="width:${pct}%;background:${colores[i]};"></div>
        </div>
        <span style="font-size:0.85rem;font-weight:700;width:40px;text-align:right;color:${pct >= 80 ? 'var(--verde)' : 'var(--texto-claro)'};">${pct}%</span>
      </div>`;
    }).join('');

    const configSonido = document.getElementById('config-sonido');
    const configVibracion = document.getElementById('config-vibracion');
    if (d.config.sonidoActivado) configSonido.classList.add('activo');
    if (d.config.vibracionActivada) configVibracion.classList.add('activo');

    configSonido.addEventListener('click', () => {
      const activo = configSonido.classList.toggle('activo');
      Store.setConfig('sonidoActivado', activo);
      SoundEffects.enabled = activo;
    });
    configVibracion.addEventListener('click', () => {
      const activo = configVibracion.classList.toggle('activo');
      Store.setConfig('vibracionActivada', activo);
    });

    document.getElementById('btn-reiniciar').addEventListener('click', () => {
      if (confirm('¿Reiniciar todo el progreso? ¡Esta acción no se puede deshacer!')) {
        Store.reiniciarProgreso();
        this.mostrarHome();
      }
    });

    document.getElementById('btn-parent-cerrar-sesion').addEventListener('click', () => {
      localStorage.removeItem('hablakids');
      Store.init();
      this.mostrarRegistro();
    });

    document.getElementById('btn-parent-cerrar').addEventListener('click', () => {
      SoundEffects.play('click');
      this.mostrarHome();
    });
  }
};

const Games = {
  iniciarGenerico(nivel, juego) {
    App.mostrarSelectorJuegos(nivel);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
