var Level1 = {
  id: 1,
  nombre: 'Fonemas',
  ejercicios: [
    { id: 'f1', objetivo: 'r', texto: 'perro', imagen: '🐕', pista: 'PE-RRO: vibra la lengua' },
    { id: 'f2', objetivo: 'rr', texto: 'rapido', imagen: '🏃', pista: 'RÁ-PI-DO: r fuerte' },
    { id: 'f3', objetivo: 'r', texto: 'raíz', imagen: '🌱', pista: 'RA-ÍZ: r suave' },
    { id: 'f4', objetivo: 'z', texto: 'zapato', imagen: '👟', pista: 'ZA-PA-TO: lengua entre dientes' },
    { id: 'f5', objetivo: 's', texto: 'silla', imagen: '🪑', pista: 'SI-LLA: silba' },
    { id: 'f6', objetivo: 'll', texto: 'llave', imagen: '🔑', pista: 'LLA-VE: lengua contra paladar' },
    { id: 'f7', objetivo: 'll', texto: 'lluvia', imagen: '🌧️', pista: 'LLU-VIA: lengua arriba' },
    { id: 'f8', objetivo: 'ch', texto: 'chocolate', imagen: '🍫', pista: 'CHO-CO-LA-TE: ch suave' },
    { id: 'f9', objetivo: 'j', texto: 'jugo', imagen: '🧃', pista: 'JU-GO: garganta rasposa' },
    { id: 'f10', objetivo: 'j', texto: 'jirafa', imagen: '🦒', pista: 'JI-RA-FA: garganta' },
    { id: 'f11', objetivo: 'g', texto: 'gato', imagen: '🐱', pista: 'GA-TO: suave' },
    { id: 'f12', objetivo: 'ñ', texto: 'niño', imagen: '👦', pista: 'NI-ÑO: lengua arriba' },
    { id: 'f13', objetivo: 'f', texto: 'fresa', imagen: '🍓', pista: 'FRE-SA: muerde labio' },
    { id: 'f14', objetivo: 'd', texto: 'dedo', imagen: '👆', pista: 'DE-DO: lengua fuerte' },
    { id: 'f15', objetivo: 'b', texto: 'bebé', imagen: '👶', pista: 'BE-BÉ: labios vibran' },
    { id: 'f16', objetivo: 't', texto: 'taza', imagen: '🍵', pista: 'TA-ZA: lengua arriba' },
    { id: 'f17', objetivo: 'p', texto: 'papá', imagen: '👨', pista: 'PA-PÁ: labios explotan' },
    { id: 'f18', objetivo: 'm', texto: 'mamá', imagen: '👩', pista: 'MA-MÁ: labios juntos' }
  ],

  obtenerEjercicios() { return this.ejercicios; }
};
