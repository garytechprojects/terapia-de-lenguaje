const SpeechEngine = {
  SR: null,
  synthesis: null,
  hablando: false,
  escuchando: false,
  _recognizedText: '',
  _onResult: null,
  _onEnd: null,
  _reintentos: 0,
  _maxReintentos: 3,
  _finalizado: false,
  _timeoutId: null,
  _currentRec: null,

  ERRORES: {
    'no-speech': 'No escuché nada. Habla más fuerte o acércate al micrófono.',
    'no-support': 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.',
    'not-allowed': 'Permiso denegado. Habilita el micrófono en la configuración del navegador.',
    'no-result': 'No entendí lo que dijiste. Intenta de nuevo.',
    'cancelled': 'Se detuvo la escucha. Presiona el botón para intentar de nuevo.',
    'aborted': 'Se canceló la escucha.',
    'audio-capture': 'No se encontró micrófono. Conecta uno e intenta de nuevo.',
    'network': 'Error de red. Verifica tu conexión.',
    'service-not-allowed': 'Servicio de voz no disponible en esta página.',
    'default': 'Error al escuchar. Intenta de nuevo.'
  },

  init() {
    this.SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.synthesis = window.speechSynthesis;
  },

  _finalizar(error) {
    if (this._finalizado) return;
    this._finalizado = true;
    this.escuchando = false;
    if (this._timeoutId) { clearTimeout(this._timeoutId); this._timeoutId = null; }
    if (this._onEnd) {
      const cb = this._onEnd;
      this._onEnd = null;
      cb(error);
    }
  },

  soportado() {
    return !!this.SR;
  },

  disponible() {
    return !!(this.SR && this.synthesis);
  },

  errorTexto(codigo) {
    return this.ERRORES[codigo] || this.ERRORES['default'];
  },

  hablar(texto, velocidad = 0.5, onEnd) {
    if (!this.synthesis) { if (onEnd) onEnd(); return; }
    window.speechSynthesis.cancel();
    const voices = this.synthesis.getVoices();
    const voiceES = voices.find(v => v.lang.startsWith('es'));
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    utterance.rate = velocidad;
    utterance.pitch = 1.3;
    utterance.volume = 1;
    if (voiceES) utterance.voice = voiceES;
    this.hablando = true;
    utterance.onend = () => {
      this.hablando = false;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.hablando = false;
      if (onEnd) onEnd();
    };
    this.synthesis.speak(utterance);
  },

  escuchar(onResult, onEnd, timeoutMs = 8000) {
    if (!this.SR) {
      if (onEnd) onEnd('no-support');
      return;
    }

    this._recognizedText = '';
    this._onResult = onResult;
    this._onEnd = onEnd;
    this._reintentos = 0;
    this._finalizado = false;
    this.escuchando = true;

    this._timeoutId = setTimeout(() => {
      if (this.escuchando && !this._finalizado) {
        this._finalizar('no-speech');
      }
    }, timeoutMs);

    this._startListening();
  },

  _startListening() {
    try {
      const rec = new this.SR();
      rec.lang = 'es-ES';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 5;

      rec.onresult = (e) => {
        let mejor = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal && e.results[i].length > 0) {
            mejor = e.results[i][0].transcript.toLowerCase().trim();
          }
        }
        if (mejor) {
          this._recognizedText = mejor;
          if (this._onResult) this._onResult(mejor);
        }
      };

      rec.onerror = (e) => {
        if (this._finalizado) return;
        if (e.error === 'no-speech' && this._reintentos < this._maxReintentos) {
          this._reintentos++;
          setTimeout(() => {
            if (!this._finalizado) this._startListening();
          }, 500);
          return;
        }
        if (e.error === 'aborted') {
          this._finalizar('cancelled');
          return;
        }
        this._finalizar(e.error);
      };

      rec.onend = () => {
        if (this._finalizado) return;
        if (this._recognizedText) {
          this._finalizar(null);
        } else {
          if (this._reintentos < this._maxReintentos) {
            this._reintentos++;
            setTimeout(() => {
              if (!this._finalizado) this._startListening();
            }, 500);
          } else {
            this._finalizar('no-result');
          }
        }
      };

      this._currentRec = rec;
      rec.start();
    } catch (e) {
      this._finalizar('no-support');
    }
  },

  detener() {
    if (this._timeoutId) { clearTimeout(this._timeoutId); this._timeoutId = null; }
    if (!this._finalizado) {
      if (this._currentRec) {
        try { this._currentRec.stop(); } catch (_) {}
        this._currentRec = null;
      }
      this._finalizar('cancelled');
    }
    this.escuchando = false;
  },

  cancelarHabla() {
    if (this.synthesis) window.speechSynthesis.cancel();
    this.hablando = false;
  }
};
