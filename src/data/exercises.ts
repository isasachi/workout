export type Variant = {
  id: string;
  name: string;
  move: string;
  /** Holds 2 s at the hardest point of each rep. */
  pause?: boolean;
  /** What you need, in plain words. */
  needs?: string;
  cues: string[];
  mistakes: string[];
};

export type Exercise = {
  id: string;
  name: string;
  works: string;
  metric: 'reps' | 'secs';
  perSide?: boolean;
  /** From easiest to hardest. */
  ladder: Variant[];
};

export const EXERCISES: Record<string, Exercise> = {
  squat: {
    id: 'squat',
    name: 'Sentadilla',
    works: 'Piernas y glúteos',
    metric: 'reps',
    ladder: [
      {
        id: 'squat-chair', name: 'Sentadilla a silla', move: 'squat-chair', needs: 'Una silla firme',
        cues: ['Siéntate hacia atrás como si fueras a sentarte', 'Toca la silla sin dejarte caer', 'Sube empujando con los talones'],
        mistakes: ['Dejarte caer en la silla', 'Rodillas hacia dentro'],
      },
      {
        id: 'squat', name: 'Sentadilla libre', move: 'squat',
        cues: ['Pies al ancho de hombros', 'Cadera atrás y pecho alto', 'Rodillas en la dirección de las puntas'],
        mistakes: ['Rodillas hacia dentro', 'Levantar los talones', 'Redondear la espalda abajo'],
      },
      {
        id: 'squat-pause', name: 'Sentadilla con pausa', move: 'squat', pause: true,
        cues: ['Igual que la libre', 'Aguanta 2 s abajo sin rebotar', 'Sube con control'],
        mistakes: ['Rebotar abajo', 'Perder la espalda recta durante la pausa'],
      },
      {
        id: 'squat-backpack', name: 'Sentadilla con mochila', move: 'squat-backpack', needs: 'Mochila con libros',
        cues: ['Mochila bien ajustada a la espalda', 'Misma técnica que la libre', 'Empieza con poco peso'],
        mistakes: ['Inclinarte de más por el peso', 'Mochila suelta que se balancea'],
      },
      {
        id: 'split-squat-bulgarian', name: 'Sentadilla búlgara', move: 'split-squat-bulgarian', needs: 'Una silla firme',
        cues: ['Empeine de atrás sobre la silla', 'Baja en vertical', 'La rodilla de delante sobre el tobillo'],
        mistakes: ['Pie de delante demasiado cerca de la silla', 'Inclinarte hacia delante'],
      },
    ],
  },
  push: {
    id: 'push',
    name: 'Flexión',
    works: 'Pecho, hombros y brazos',
    metric: 'reps',
    ladder: [
      {
        id: 'pushup-wall', name: 'Flexión contra la pared', move: 'pushup-wall', needs: 'Una pared',
        cues: ['Manos a la altura del pecho', 'Cuerpo recto como una tabla', 'Lleva el pecho a la pared'],
        mistakes: ['Doblar la cadera', 'Codos abiertos en cruz'],
      },
      {
        id: 'pushup-counter', name: 'Flexión inclinada', move: 'pushup-counter', needs: 'Mesa firme o encimera',
        cues: ['Manos en el borde, algo más abiertas que los hombros', 'Cuerpo recto de cabeza a talones', 'Codos a 45° del cuerpo'],
        mistakes: ['Cadera hundida', 'Mesa que se mueve', 'Bajar solo la cabeza'],
      },
      {
        id: 'pushup-chair', name: 'Flexión en silla o sofá', move: 'pushup-chair', needs: 'Silla contra la pared o sofá',
        cues: ['Silla apoyada contra la pared para que no se mueva', 'Cuerpo recto', 'Pecho al borde del asiento'],
        mistakes: ['Silla que se desliza', 'Cadera hundida'],
      },
      {
        id: 'pushup-knees', name: 'Flexión con rodillas', move: 'pushup-knees', needs: 'Una toalla bajo las rodillas',
        cues: ['Rodillas detrás de la cadera', 'Línea recta de rodillas a cabeza', 'Pecho al suelo entre las manos'],
        mistakes: ['Cadera en el aire', 'Manos por delante de los hombros'],
      },
      {
        id: 'pushup', name: 'Flexión completa', move: 'pushup',
        cues: ['Manos bajo los hombros', 'Abdomen y glúteos apretados', 'Pecho cerca del suelo'],
        mistakes: ['Cadera hundida', 'Rango corto', 'Cabeza caída'],
      },
    ],
  },
  row: {
    id: 'row',
    name: 'Remo',
    works: 'Espalda y bíceps',
    metric: 'reps',
    ladder: [
      {
        id: 'ytw', name: 'Y-T-W en el suelo', move: 'ytw',
        cues: ['Boca abajo, frente cerca del suelo', 'Y: brazos en diagonal; T: en cruz; W: codos atrás', 'Junta los omóplatos en cada letra'],
        mistakes: ['Levantar la cabeza', 'Hacerlo con impulso'],
      },
      {
        id: 'row-towel-far', name: 'Remo con toalla, pies lejos', move: 'row-towel-far', needs: 'Una toalla y una puerta',
        cues: ['Puerta bien cerrada que se abra hacia el otro lado', 'Pies lejos de la puerta: menos inclinación', 'Tira del pecho hacia la puerta'],
        mistakes: ['Puerta que se abre hacia ti', 'Doblar la cadera', 'Tirar solo con los brazos'],
      },
      {
        id: 'row-towel-near', name: 'Remo con toalla, pies cerca', move: 'row-towel-near', needs: 'Una toalla y una puerta',
        cues: ['Pies cerca de la puerta: más inclinación, más difícil', 'Cuerpo recto como una tabla', 'Codos pegados al cuerpo'],
        mistakes: ['Cadera que se cae', 'Soltar de golpe al bajar'],
      },
    ],
  },
  bridge: {
    id: 'bridge',
    name: 'Puente de glúteo',
    works: 'Glúteos y parte de atrás del muslo',
    metric: 'reps',
    ladder: [
      {
        id: 'bridge-short', name: 'Puente, rango corto', move: 'bridge-short',
        cues: ['Pies cerca de los glúteos', 'Sube solo un poco', 'Aprieta glúteos arriba'],
        mistakes: ['Empujar con la zona lumbar'],
      },
      {
        id: 'bridge', name: 'Puente a dos piernas', move: 'bridge',
        cues: ['Empuja con los talones', 'Hombros, cadera y rodillas en línea', 'Baja despacio'],
        mistakes: ['Arquear la zona lumbar', 'Pies demasiado lejos'],
      },
      {
        id: 'bridge-pause', name: 'Puente con pausa arriba', move: 'bridge', pause: true,
        cues: ['Igual que a dos piernas', 'Aguanta 2 s arriba', 'Glúteos apretados en la pausa'],
        mistakes: ['Bajar la cadera durante la pausa'],
      },
      {
        id: 'bridge-single', name: 'Puente a una pierna', move: 'bridge-single',
        cues: ['Un pie apoyado, la otra pierna estirada', 'La cadera sube recta, sin girar', 'Cambia de pierna'],
        mistakes: ['Cadera torcida', 'Empujar con la punta del pie'],
      },
    ],
  },
  pike: {
    id: 'pike',
    name: 'Flexión pike',
    works: 'Hombros y brazos',
    metric: 'reps',
    ladder: [
      {
        id: 'pike-chair', name: 'Pike con manos en una silla', move: 'pike-chair', needs: 'Silla contra la pared',
        cues: ['Cadera alta', 'Cabeza hacia delante de las manos', 'Codos hacia atrás, no abiertos'],
        mistakes: ['Bajar la cadera', 'Silla que se desliza'],
      },
      {
        id: 'pike', name: 'Flexión pike en el suelo', move: 'pike',
        cues: ['V invertida con la cadera', 'Baja la cabeza delante de las manos', 'Empuja el suelo para subir'],
        mistakes: ['Convertirla en flexión normal', 'Rodillas muy dobladas'],
      },
    ],
  },
  plank: {
    id: 'plank',
    name: 'Plancha',
    works: 'Abdomen',
    metric: 'secs',
    ladder: [
      {
        id: 'plank-wall', name: 'Plancha en la encimera', move: 'plank-wall', needs: 'Encimera o mesa firme',
        cues: ['Manos en el borde, cuerpo recto', 'Aprieta abdomen y glúteos', 'Respira con normalidad'],
        mistakes: ['Cadera hacia atrás', 'Aguantar la respiración'],
      },
      {
        id: 'plank-knees', name: 'Plancha con rodillas', move: 'plank-knees',
        cues: ['Codos bajo los hombros', 'Rodillas apoyadas, cadera alineada', 'Mirada al suelo'],
        mistakes: ['Cadera en el aire', 'Hombros por detrás de los codos'],
      },
      {
        id: 'plank', name: 'Plancha completa', move: 'plank',
        cues: ['Codos bajo los hombros', 'Línea recta de cabeza a talones', 'Aprieta glúteos'],
        mistakes: ['Cadera hundida', 'Cadera muy alta'],
      },
      {
        id: 'plank-taps', name: 'Plancha con toques de hombro', move: 'plank-taps',
        cues: ['Plancha alta, pies separados', 'Toca el hombro contrario', 'La cadera no se mueve'],
        mistakes: ['Balancear la cadera', 'Ir rápido'],
      },
    ],
  },
  rdl: {
    id: 'rdl',
    name: 'Peso muerto rumano',
    works: 'Parte de atrás del muslo y glúteos',
    metric: 'reps',
    perSide: true,
    ladder: [
      {
        id: 'hinge', name: 'Bisagra de cadera a dos piernas', move: 'hinge',
        cues: ['Rodillas un poco flexionadas', 'Cadera hacia atrás, espalda recta', 'Sube llevando la cadera adelante'],
        mistakes: ['Doblar las rodillas como una sentadilla', 'Redondear la espalda'],
      },
      {
        id: 'rdl-support', name: 'A una pierna con apoyo', move: 'rdl-support', needs: 'Una pared al lado',
        cues: ['Una mano en la pared', 'La pierna libre sube en línea con el tronco', 'Baja hasta notar tensión detrás del muslo'],
        mistakes: ['Abrir la cadera hacia el techo', 'Bajar hasta tocar el suelo a costa de la espalda'],
      },
      {
        id: 'rdl-free', name: 'A una pierna sin apoyo', move: 'rdl-free',
        cues: ['Mira un punto fijo en el suelo', 'Movimiento lento', 'Cadera paralela al suelo'],
        mistakes: ['Ir rápido para no perder el equilibrio', 'Rodilla de apoyo bloqueada'],
      },
      {
        id: 'rdl-backpack', name: 'A una pierna con mochila', move: 'rdl-backpack', needs: 'Mochila con libros',
        cues: ['Mochila en la mano contraria a la pierna de apoyo', 'Brazo colgando, sin tirar', 'Misma técnica'],
        mistakes: ['Encoger el hombro', 'Demasiado peso al principio'],
      },
    ],
  },
  lunge: {
    id: 'lunge',
    name: 'Zancada',
    works: 'Piernas y glúteos',
    metric: 'reps',
    perSide: true,
    ladder: [
      {
        id: 'lunge-support', name: 'Zancada inversa con apoyo', move: 'lunge-support', needs: 'Una silla firme al lado',
        cues: ['Una mano en el respaldo de una silla', 'Paso largo hacia atrás', 'Rodilla de atrás hacia el suelo'],
        mistakes: ['Paso demasiado corto', 'Rodilla de delante hacia dentro'],
      },
      {
        id: 'lunge-reverse', name: 'Zancada inversa', move: 'lunge-reverse',
        cues: ['Paso largo hacia atrás', 'Tronco recto', 'Empuja con el pie de delante para volver'],
        mistakes: ['Inclinarte hacia delante', 'Golpear la rodilla contra el suelo'],
      },
      {
        id: 'lunge-forward', name: 'Zancada hacia delante', move: 'lunge-forward',
        cues: ['Paso largo hacia delante', 'Rodilla sobre el tobillo', 'Empuja fuerte para volver'],
        mistakes: ['Rodilla por delante de la punta del pie', 'Paso corto'],
      },
      {
        id: 'lunge-backpack', name: 'Zancada con mochila', move: 'lunge-backpack', needs: 'Mochila con libros',
        cues: ['Mochila ajustada a la espalda', 'Misma técnica que la inversa', 'Empieza con poco peso'],
        mistakes: ['Perder el equilibrio por ir rápido'],
      },
    ],
  },
  back: {
    id: 'back',
    name: 'Superman',
    works: 'Zona lumbar y espalda',
    metric: 'reps',
    ladder: [
      {
        id: 'birddog', name: 'Bird dog', move: 'birddog',
        cues: ['A cuatro patas', 'Estira un brazo y la pierna contraria', 'Espalda quieta como una mesa'],
        mistakes: ['Girar la cadera', 'Arquear la espalda'],
      },
      {
        id: 'superman', name: 'Superman con brazos en Y', move: 'superman',
        cues: ['Boca abajo, brazos en Y', 'Despega brazos, pecho y piernas', 'Aguanta un segundo arriba'],
        mistakes: ['Tirar del cuello hacia arriba', 'Impulso en vez de control'],
      },
    ],
  },
  deadbug: {
    id: 'deadbug',
    name: 'Dead bug',
    works: 'Abdomen',
    metric: 'reps',
    perSide: true,
    ladder: [
      {
        id: 'deadbug-legs', name: 'Dead bug solo con piernas', move: 'deadbug-legs',
        cues: ['Boca arriba, brazos al techo', 'Rodillas dobladas sobre la cadera', 'Baja un pie hasta rozar el suelo'],
        mistakes: ['Separar la zona lumbar del suelo'],
      },
      {
        id: 'deadbug', name: 'Dead bug completo', move: 'deadbug',
        cues: ['Estira una pierna y el brazo contrario', 'La zona lumbar sigue en el suelo', 'Suelta el aire al estirar'],
        mistakes: ['Ir rápido', 'Arquear la espalda'],
      },
    ],
  },
};

/** Moves used in warm-ups, cardio and HIIT, with a short name and the main cue. */
export const DRILLS: Record<string, { name: string; move: string; cue: string }> = {
  march: { name: 'Marcha con rodillas altas', move: 'march', cue: 'Rodilla a la cadera, brazo contrario adelante' },
  'jack-step': { name: 'Jumping jack sin salto', move: 'jack-step', cue: 'Paso al lado y brazos arriba' },
  'hip-circles': { name: 'Rotaciones de cadera', move: 'hip-circles', cue: 'Círculos amplios, manos en la cintura' },
  'cat-cow': { name: 'Gato-camello', move: 'cat-cow', cue: 'Redondea y hunde la espalda despacio' },
  thoracic: { name: 'Apertura torácica', move: 'thoracic', cue: 'Lleva el codo al techo y síguelo con la mirada' },
  bridge: { name: 'Puente de glúteo', move: 'bridge', cue: 'Empuja con los talones' },
  'wall-angels': { name: 'Ángeles en la pared', move: 'wall-angels', cue: 'Espalda y brazos pegados a la pared' },
  walk: { name: 'Caminata', move: 'walk', cue: 'Paso ágil, braceo natural' },
  'step-up': { name: 'Step-ups en un escalón', move: 'step-up', cue: 'Pie entero en el escalón, alterna la pierna' },
  'shadow-box': { name: 'Boxeo de sombra', move: 'shadow-box', cue: 'Golpes rectos, puños a la barbilla' },
  'high-knees': { name: 'Rodillas altas', move: 'high-knees', cue: 'Rápido y sin saltar' },
  'squat-fast': { name: 'Sentadillas rápidas', move: 'squat-fast', cue: 'Ritmo vivo, técnica limpia' },
  skater: { name: 'Skaters sin salto', move: 'skater', cue: 'Paso lateral amplio, rodilla flexionada' },
  climber: { name: 'Mountain climbers lentos', move: 'climber', cue: 'Rodilla al pecho, cadera baja' },
  'deep-squat-hold': { name: 'Sentadilla profunda sostenida', move: 'deep-squat-hold', cue: 'Talones abajo, respira' },
  'hip-flexor': { name: 'Estiramiento de flexores de cadera', move: 'hip-flexor', cue: 'Glúteo de atrás apretado, cadera adelante' },
};
