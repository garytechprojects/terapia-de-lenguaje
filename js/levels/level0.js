var Level0 = {
  id: 0,
  nombre: 'Sonidos Básicos',
  ejercicios: [
    { id: 'a1', objetivo: 'sílaba', texto: 'ma', imagen: '👩', pista: 'MA: junta los labios' },
    { id: 'a2', objetivo: 'sílaba', texto: 'pa', imagen: '👨', pista: 'PA: explota los labios' },
    { id: 'a3', objetivo: 'sílaba', texto: 'ta', imagen: '🥁', pista: 'TA: lengua arriba' },
    { id: 'a4', objetivo: 'sílaba', texto: 'ca', imagen: '🏠', pista: 'CA: garganta suave' },
    { id: 'a5', objetivo: 'sílaba', texto: 'ba', imagen: '🛁', pista: 'BA: vibra los labios' },
    { id: 'a6', objetivo: 'sílaba', texto: 'na', imagen: '🍊', pista: 'NA: lengua arriba' },
    { id: 'a7', objetivo: 'sílaba', texto: 'la', imagen: '🌙', pista: 'LA: lengua al paladar' },
    { id: 'a8', objetivo: 'sílaba', texto: 'sa', imagen: '☀️', pista: 'SA: silba suave' },
    { id: 'a9', objetivo: 'sílaba', texto: 'mi', imagen: '🎵', pista: 'MI: labios juntos' },
    { id: 'a10', objetivo: 'sílaba', texto: 'pi', imagen: '👆', pista: 'PI: labios se abren' },
    { id: 'b1', objetivo: 'palabra', texto: 'sol', imagen: '☀️', pista: 'SOL: una sílaba' },
    { id: 'b2', objetivo: 'palabra', texto: 'pan', imagen: '🍞', pista: 'PAN: una sílaba' },
    { id: 'b3', objetivo: 'palabra', texto: 'luna', imagen: '🌙', pista: 'LU-NA: dos sílabas' },
    { id: 'b4', objetivo: 'palabra', texto: 'mesa', imagen: '🪑', pista: 'ME-SA: dos sílabas' },
    { id: 'b5', objetivo: 'palabra', texto: 'cama', imagen: '🛏️', pista: 'CA-MA: dos sílabas' },
    { id: 'b6', objetivo: 'palabra', texto: 'mano', imagen: '✋', pista: 'MA-NO: dos sílabas' },
    { id: 'b7', objetivo: 'palabra', texto: 'pato', imagen: '🦆', pista: 'PA-TO: dos sílabas' },
    { id: 'b8', objetivo: 'palabra', texto: 'casa', imagen: '🏠', pista: 'CA-SA: dos sílabas' }
  ],

  obtenerEjercicios() { return this.ejercicios; }
};
