var LevelExpert = {
  id: 6,
  nombre: 'Experto',
  ejercicios: [
    { id: 'e1', objetivo: 'narración', texto: 'el gato juega con la pelota roja', imagen: '🐱', pista: 'Di la historia completa' },
    { id: 'e2', objetivo: 'narración', texto: 'la niña salta muy alto en el parque', imagen: '👧', pista: 'Narra lo que ves' },
    { id: 'e3', objetivo: 'narración', texto: 'el perro corre detrás de la mariposa', imagen: '🐕', pista: 'Sigue la historia' },
    { id: 'e4', objetivo: 'narración', texto: 'hoy hace sol y vamos a la playa', imagen: '🏖️', pista: 'Describe el día' },
    { id: 'e5', objetivo: 'narración', texto: 'me gusta comer helado de chocolate', imagen: '🍦', pista: 'Cuéntame tu gusto' },
    { id: 'e6', objetivo: 'narración', texto: 'el pájaro canta en el árbol verde', imagen: '🐦', pista: 'Describe la escena' },
    { id: 'e7', objetivo: 'narración', texto: 'mi mamá me lee un cuento antes de dormir', imagen: '📖', pista: 'Cuenta la rutina' },
    { id: 'e8', objetivo: 'narración', texto: 'las flores del jardín son de colores', imagen: '🌸', pista: 'Describe el jardín' },
    { id: 'e9', objetivo: 'narración', texto: 'el niño tiene un globo azul muy grande', imagen: '🎈', pista: 'Describe el globo' },
    { id: 'e10', objetivo: 'narración', texto: 'la tortuga camina despacio por el pasto', imagen: '🐢', pista: 'Cuenta el paseo' },
    { id: 'e11', objetivo: 'narración', texto: 'mi perro se llama toby y es muy grande', imagen: '🐕', pista: 'Cuéntame de tu mascota' },
    { id: 'e12', objetivo: 'narración', texto: 'el león es el rey de la selva', imagen: '🦁', pista: 'Describe al animal' },
    { id: 'e13', objetivo: 'narración', texto: 'vamos al parque a jugar en la tarde', imagen: '🌳', pista: 'Cuenta el plan' },
    { id: 'e14', objetivo: 'narración', texto: 'las estrellas brillan mucho en la noche', imagen: '⭐', pista: 'Describe la noche' },
    { id: 'e15', objetivo: 'narración', texto: 'mi mamá cocina arroz con pollo todos los días', imagen: '🍳', pista: 'Cuenta la comida' }
  ],

  obtenerEjercicios() { return this.ejercicios; }
};
