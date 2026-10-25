export type GuideSection = { id: string; title: string; body: string[] };

export const GUIDE: GuideSection[] = [
  {
    id: 'rir',
    title: 'RIR: cuántas te quedaban',
    body: [
      'RIR son las repeticiones que aún podrías hacer al terminar la serie. RIR 2 quiere decir que te quedaban dos limpias.',
      'Al empezar cuesta calcularlo: quédate corto a propósito (RIR 3) y prioriza aprender la técnica.',
    ],
  },
  {
    id: 'rpe',
    title: 'RPE: cuánto te cuesta, del 1 al 10',
    body: [
      'RPE 4–5: respiras más rápido pero puedes hablar en frases completas. Es el ritmo del cardio moderado.',
      'RPE 8–9: solo te salen palabras sueltas. Es el ritmo de los bloques fuertes del HIIT.',
    ],
  },
  {
    id: 'hr',
    title: 'Frecuencia cardiaca (opcional)',
    body: [
      'Cardio moderado: 60–70 % de tu frecuencia máxima. Bloques del HIIT: 85–95 %.',
      'Estimación de la máxima: 208 − 0,7 × tu edad. Es aproximada; si no coincide con cómo te sientes, manda el RPE.',
    ],
  },
  {
    id: 'progress',
    title: 'Cómo progresar sin pesas',
    body: [
      'Cuando completes todas las series en el tope del rango (por ejemplo 3 × 15 sentadillas) con el RIR indicado, pasa a la siguiente variante y vuelve al límite bajo del rango. La app te avisa cuando toca.',
      'Si un salto se te queda grande, añade una pausa de 2 s abajo o baja en 3 s antes de cambiar de variante.',
    ],
  },
  {
    id: 'missed',
    title: 'Si pierdes un día',
    body: [
      'No lo recuperes juntando dos sesiones: sigue con la siguiente. Si tienes que elegir, prioriza las dos de fuerza y el HIIT.',
    ],
  },
  {
    id: 'signals',
    title: 'Señales para bajar la carga',
    body: [
      'Dolor articular que no se va, varios días durmiendo peor o rendimiento que cae dos semanas seguidas. Si te pasa, adelanta la semana de descarga.',
    ],
  },
  {
    id: 'home',
    title: 'Seguridad en casa',
    body: [
      'Entrena con zapatillas sobre un suelo que no resbale. Usa sillas que no se deslicen, contra la pared si hace falta, y revisa que la puerta del remo esté bien cerrada antes de cada serie.',
      'Si tienes una condición cardiovascular o metabólica, una lesión, o llevas tiempo sin entrenar, consulta con un médico antes de empezar, sobre todo antes del HIIT.',
    ],
  },
  {
    id: 'basics',
    title: 'Proteína y sueño',
    body: ['Una porción de proteína en cada comida y 7–9 h de sueño sostienen la progresión. La constancia pesa más que cualquier detalle del plan.'],
  },
];
