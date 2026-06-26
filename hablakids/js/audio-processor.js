const AudioProcessor = {
  FONEMAS_SIMILARES: {
    'p': ['b'], 'b': ['p'],
    't': ['d'], 'd': ['t'],
    'k': ['g'], 'g': ['k'],
    'f': ['j'], 'j': ['f'],
    's': ['z', 'θ'], 'z': ['s'], 'θ': ['s'],
    'r': ['ɾ', 'l'], 'ɾ': ['r', 'l'], 'l': ['r', 'ɾ'],
    'm': ['n'], 'n': ['m', 'ɲ'], 'ɲ': ['n'],
    'tʃ': ['ʃ'], 'ʃ': ['tʃ'],
    'ʎ': ['j'], 'j': ['ʎ'],
    'rr': ['r', 'ɾ'],
    'a': ['e'], 'e': ['a', 'i'], 'i': ['e'],
    'o': ['u'], 'u': ['o']
  },

  normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  aFonemas(texto) {
    const mapa = {
      'ch': 'tʃ', 'll': 'ʎ', 'rr': 'rr', 'qu': 'k',
      'gu': 'g', 'ce': 'θe', 'ci': 'θi',
      'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
      'b': 'b', 'c': 'k', 'd': 'd', 'f': 'f', 'g': 'g',
      'h': '', 'j': 'x', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'ñ': 'ɲ', 'p': 'p', 'r': 'r', 's': 's',
      't': 't', 'v': 'b', 'w': 'w', 'x': 'ks', 'y': 'j',
      'z': 'θ'
    };
    let t = this.normalizar(texto);
    let fonemas = [];
    let i = 0;
    while (i < t.length) {
      if (t[i] === ' ') { fonemas.push(' '); i++; continue; }
      let encontrado = false;
      for (let l = 3; l >= 1; l--) {
        const sub = t.substr(i, l);
        if (mapa[sub] !== undefined) {
          if (mapa[sub]) fonemas.push(...mapa[sub].split(''));
          i += l;
          encontrado = true;
          break;
        }
      }
      if (!encontrado) { fonemas.push(t[i]); i++; }
    }
    return fonemas;
  },

  distanciaFonetica(fonema1, fonema2) {
    if (fonema1 === fonema2) return 0;
    if (this.FONEMAS_SIMILARES[fonema1]?.includes(fonema2)) return 0.15;
    if (this.FONEMAS_SIMILARES[fonema2]?.includes(fonema1)) return 0.15;
    if (fonema1 === ' ' && fonema2 === ' ') return 0;
    return 0.7;
  },

  levenshteinFonetico(esperado, reconocido) {
    const fEsp = typeof esperado === 'string' ? this.aFonemas(esperado) : esperado;
    const fRec = typeof reconocido === 'string' ? this.aFonemas(reconocido) : reconocido;
    const m = fEsp.length, n = fRec.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = this.distanciaFonetica(fEsp[i - 1], fRec[j - 1]);
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  },

  _similitudPalabras(palabraEsp, palabraRec) {
    if (palabraEsp === palabraRec) return 1;
    if (palabraRec.includes(palabraEsp) || palabraEsp.includes(palabraRec)) return 0.85;
    const dist = this.levenshteinFonetico(palabraEsp, palabraRec);
    const maxLen = Math.max(palabraEsp.length, palabraRec.length);
    if (maxLen < 2) return Math.max(0, 1 - dist);
    return Math.max(0, 1 - dist / maxLen);
  },

  _mejorCoincidencia(palabraEsp, palabrasRec) {
    let mejor = 0;
    for (const palabraRec of palabrasRec) {
      const sim = this._similitudPalabras(palabraEsp, palabraRec);
      if (sim > mejor) mejor = sim;
    }
    return mejor;
  },

  analizar(esperado, reconocido) {
    if (!reconocido || reconocido.trim() === '') {
      return { score: 0, acierto: false, detalle: 'No se detectó voz', consejo: 'Habla un poquito más fuerte, ¿vale?' };
    }

    const normEsp = this.normalizar(esperado);
    const normRec = this.normalizar(reconocido);

    if (!normRec) {
      return { score: 0, acierto: false, detalle: 'No se entendió', consejo: 'Acércate al micrófono' };
    }

    const palabrasEsp = normEsp.split(' ').filter(Boolean);
    const palabrasRec = normRec.split(' ').filter(Boolean);

    if (palabrasEsp.length === 0) {
      return { score: 0, acierto: false, detalle: 'Error interno', consejo: 'Intenta de nuevo' };
    }

    let similitudTotal = 0;
    let coincidencias = 0;

    for (const palabraEsp of palabrasEsp) {
      const sim = this._mejorCoincidencia(palabraEsp, palabrasRec);
      similitudTotal += sim;
      if (sim >= 0.5) coincidencias++;
    }

    const pctPalabras = (coincidencias / palabrasEsp.length) * 100;
    const pctFonetico = (similitudTotal / palabrasEsp.length) * 100;

    let score = Math.round(pctFonetico);
    if (coincidencias >= Math.ceil(palabrasEsp.length * 0.7)) score += 10;
    score = Math.min(100, score);

    const consejos = [];
    if (coincidencias === palabrasEsp.length && pctFonetico >= 80) {
      consejos.push('¡Excelente pronunciación!');
    } else if (coincidencias === palabrasEsp.length) {
      consejos.push('¡Bien! Se entiende perfecto');
    } else if (coincidencias >= palabrasEsp.length / 2) {
      consejos.push('Buen avance, casi completo');
    } else {
      consejos.push('Sigue practicando, escucha el ejemplo');
    }

    if (palabrasRec.length > palabrasEsp.length + 1) consejos.push('Dilo más cortito');
    if (palabrasRec.length < palabrasEsp.length) consejos.push('Falta una palabra');

    return {
      score,
      acierto: score >= 35,
      detalle: score >= 60 ? '¡Bien hecho!' : score >= 35 ? '¡Vas bien!' : 'Intenta de nuevo',
      consejo: consejos.join('. '),
      fonemasAcertados: Math.round((score / 100) * 10),
      fonemasTotal: 10,
      reconocido: normRec
    };
  },

  compararConAudioVisual(score) {
    if (score >= 60) return { emoji: '🌟', texto: '¡INCREÍBLE!', color: 'var(--verde)' };
    if (score >= 35) return { emoji: '👍', texto: '¡MUY BIEN!', color: 'var(--azul)' };
    if (score >= 20) return { emoji: '💪', texto: '¡BUEN INTENTO!', color: 'var(--amarillo)' };
    return { emoji: '🔄', texto: '¡INTENTA DE NUEVO!', color: 'var(--naranja)' };
  }
};
