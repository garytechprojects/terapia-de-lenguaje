var Level5 = {
  id: 5,
  nombre: 'Conversación',
  ejercicios: [
    { id: 'c1', objetivo: 'conversación', texto: 'hola, ¿cómo estás?', imagen: '👋', pista: 'HO-LA ¿CÓ-MO ES-TÁS?' },
    { id: 'c2', objetivo: 'conversación', texto: 'estoy muy bien, gracias', imagen: '😊', pista: 'ES-TOY MUY BIEN GRA-CIAS' },
    { id: 'c3', objetivo: 'conversación', texto: '¿cuál es tu nombre?', imagen: '📛', pista: '¿CUÁL ES TU NOM-BRE?' },
    { id: 'c4', objetivo: 'conversación', texto: 'me llamo luna', imagen: '🦉', pista: 'ME LLA-MO LU-NA' },
    { id: 'c5', objetivo: 'conversación', texto: '¿quieres jugar conmigo?', imagen: '🎲', pista: '¿QUIE-RES JU-GAR CON-MI-GO?' },
    { id: 'c6', objetivo: 'conversación', texto: 'sí, vamos a jugar', imagen: '🎉', pista: 'SÍ VA-MOS A JU-GAR' },
    { id: 'c7', objetivo: 'conversación', texto: '¿qué color te gusta?', imagen: '🎨', pista: '¿QUÉ CO-LOR TE GUS-TA?' },
    { id: 'c8', objetivo: 'conversación', texto: 'me gusta el azul', imagen: '🔵', pista: 'ME GUS-TA EL A-ZUL' },
    { id: 'c9', objetivo: 'conversación', texto: '¿cuántos años tienes?', imagen: '🎂', pista: '¿CUÁN-TOS A-ÑOS TIE-NES?' },
    { id: 'c10', objetivo: 'conversación', texto: 'tengo cuatro años', imagen: '4️⃣', pista: 'TEN-GO CU-A-TRO A-ÑOS' },
    { id: 'c11', objetivo: 'conversación', texto: '¿qué hora es?', imagen: '🕐', pista: '¿QUÉ HO-RA ES?' },
    { id: 'c12', objetivo: 'conversación', texto: '¿dónde estás?', imagen: '📍', pista: '¿DÓN-DE ES-TÁS?' },
    { id: 'c13', objetivo: 'conversación', texto: 'tengo hambre', imagen: '🍔', pista: 'TEN-GO HAM-BRE' },
    { id: 'c14', objetivo: 'conversación', texto: 'tengo sed', imagen: '🥤', pista: 'TEN-GO SED' },
    { id: 'c15', objetivo: 'conversación', texto: '¿qué es eso?', imagen: '🤔', pista: '¿QUÉ ES E-SO?' }
  ],

  obtenerEjercicios() { return this.ejercicios; }
};
