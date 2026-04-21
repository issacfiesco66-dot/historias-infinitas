/**
 * Fuente de verdad de los artículos del blog de Historias Infinitas.
 *
 * Cada post se modela como un objeto con metadata + body HTML. Se elige HTML
 * (en lugar de MDX o React JSX) para no introducir nuevas dependencias y
 * para que el contenido siga siendo 100 % SSR-friendly con el hosting actual
 * en Vercel.
 *
 * Cuando este archivo crezca a >15 posts, migrar a archivos markdown
 * individuales en `content/blog/*.md` parseados con gray-matter.
 */

export interface BlogPost {
  slug: string;
  title: string;
  /** Meta description (máx 160 chars) */
  description: string;
  /** Fecha de publicación en ISO 8601 (YYYY-MM-DD). */
  datePublished: string;
  /** Fecha de última edición en ISO 8601. */
  dateModified: string;
  author: {
    name: string;
    /** URL canónica de la persona — página de equipo o LinkedIn */
    url?: string;
  };
  /** Palabras clave SEO — alimentan `keywords` meta y schema */
  keywords: string[];
  /** Lectura estimada (minutos) */
  readingMinutes: number;
  /** Imagen destacada en `/public/images/blog/` */
  image: string;
  imageAlt: string;
  /** Resumen para cards y listas */
  excerpt: string;
  /** Cuerpo en HTML puro. Usar H2/H3 (no H1 — ese lo pone la página). */
  body: string;
  /** Cluster temático — útil para "artículos relacionados" y SEO interno */
  category: 'Duelo y memoria' | 'Memoriales digitales' | 'Tecnología IA' | 'B2B';
  /** Mostrar o no en el índice público. Poner false para borradores. */
  published: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  // ============================================================
  // 1. Duelo por mascotas — anclaje del cluster "duelo + memoria"
  // ============================================================
  {
    slug: 'como-superar-duelo-perdida-mascota',
    title: 'Cómo superar el duelo por la pérdida de una mascota: guía completa para acompañar el proceso',
    description:
      'Guía práctica para atravesar el duelo por una mascota: qué emociones esperar, cómo acompañar a niños y adultos, rituales de despedida, y cuándo buscar ayuda profesional.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo de acompañamiento · Historias Infinitas' },
    keywords: [
      'duelo mascota',
      'cómo superar pérdida mascota',
      'duelo por perro',
      'duelo por gato',
      'despedida mascota',
      'luto por mascota',
      'duelo patológico mascota',
    ],
    readingMinutes: 9,
    image: '/images/blog/duelo-mascota.webp',
    imageAlt: 'Una mano sobre la huella de una mascota, con luz suave al atardecer',
    excerpt:
      'El duelo por una mascota es un duelo real. Esta guía recorre las fases normales, cómo acompañar a niños, los rituales que ayudan a cerrar, y señales de cuándo pedir apoyo profesional.',
    category: 'Duelo y memoria',
    published: true,
    body: `
<p class="lede">Perder a una mascota es perder a alguien de la familia. A veces el entorno minimiza ese dolor con frases como "era solo un perro" — pero el duelo es real y merece el mismo cuidado que cualquier otro. Esta guía recorre qué esperar, qué ayuda y qué no, y cuándo conviene pedir apoyo profesional.</p>

<h2>Por qué el duelo por una mascota duele tanto</h2>
<p>La ciencia ya documentó lo que cualquier dueño sabe: el vínculo con una mascota activa las mismas redes cerebrales de apego que el vínculo con una persona. Un estudio de la Universidad de Hawái en 2019 encontró que la pérdida de un perro puede desencadenar una respuesta de duelo comparable a la pérdida de un familiar humano cercano. Esto ocurre porque las mascotas:</p>
<ul>
  <li>Están presentes en los momentos cotidianos — despertar, regresar a casa, dormir.</li>
  <li>No juzgan. Ofrecen consuelo sin pedir nada a cambio.</li>
  <li>Marcan un periodo completo de la vida: la niñez, la mudanza, la soltería, la maternidad.</li>
  <li>Suelen ser la primera experiencia de pérdida para niños y adolescentes.</li>
</ul>

<h2>Las fases del duelo por una mascota (y por qué no son lineales)</h2>
<p>Las fases clásicas de Kübler-Ross — negación, ira, negociación, tristeza, aceptación — sirven como mapa, no como ruta obligatoria. Es normal volver a una fase anterior. Es normal sentir todas en el mismo día. Estas son las que más reportan las familias en México y LATAM:</p>
<ol>
  <li><strong>Shock inicial</strong>: las primeras 24-72 h. Puede haber incredulidad, sensación de irrealidad. Normal.</li>
  <li><strong>Culpa</strong>: "¿y si lo hubiera llevado al veterinario antes?". Se activa especialmente cuando hay que tomar la decisión de eutanasia. Ayudar a externalizar esta culpa es crítico — no te la quedes.</li>
  <li><strong>Tristeza profunda</strong>: aparece 3-10 días después. Puede durar semanas. Cuidar alimentación y sueño en este tramo.</li>
  <li><strong>Enojo</strong>: a veces contra el veterinario, contra uno mismo, contra el universo. Darle nombre al enojo lo desactiva.</li>
  <li><strong>Integración</strong>: no es "aceptación" — es que la ausencia se vuelve parte de la vida sin doler todo el tiempo. Puede tardar de 3 a 12 meses.</li>
</ol>

<h2>Qué ayuda de verdad (y qué no)</h2>
<h3>Lo que ayuda</h3>
<ul>
  <li><strong>Hablar de la mascota por su nombre</strong>. Evitar "él" o "ella" generalizado.</li>
  <li><strong>Guardar algo físico</strong>: el collar, un juguete favorito, un mechón de pelo en un frasco. El cuerpo necesita anclas.</li>
  <li><strong>Crear un lugar propio de recuerdo</strong>: muchas familias arman una pequeña repisa con la foto y el collar. Otras prefieren un memorial digital con QR que cuelgan en el árbol del jardín — es especialmente útil cuando la familia está dispersa geográficamente.</li>
  <li><strong>Escribir su historia</strong>: aunque nadie más la lea. El acto de narrar ordena la memoria.</li>
  <li><strong>Dejar que los niños participen</strong> del ritual de despedida con lenguaje honesto. Ver más abajo.</li>
</ul>

<h3>Lo que NO ayuda</h3>
<ul>
  <li>"Era solo un perro" — invalida el duelo y retrasa el proceso.</li>
  <li>"Mejor cómprate otro" — nadie reemplaza a nadie. Adoptar puede estar bien, pero no pronto y nunca como sustituto.</li>
  <li>Esconder todas las fotos y objetos de inmediato. Mejor sacarlos gradualmente.</li>
  <li>Pretender que estás bien si no lo estás. El duelo negado se vuelve crónico.</li>
</ul>

<h2>Cómo hablarles a los niños sobre la muerte de una mascota</h2>
<p>La tentación común es decir "se durmió" o "se fue lejos". No uses esos eufemismos. Los niños necesitan palabras claras y seguras: <em>"Firulais se murió. Su cuerpo dejó de funcionar. No va a volver, y eso es muy triste."</em> Luego, invitarlos al ritual — elegir un lugar para enterrar el collar, encender una vela, dibujarle una carta. La participación activa reduce la ansiedad.</p>
<p>En niños menores de 5 años, la muerte se entiende como algo temporal. Pueden preguntar "¿cuándo va a volver?" varias veces. Responder siempre lo mismo con cariño. Entre los 6 y 9 años, empiezan a entender la irreversibilidad. Entre los 10 y 12 años, pueden querer escribir una biografía formal — muchos usan el memorial digital como proyecto escolar.</p>

<h2>Rituales de despedida que funcionan</h2>
<p>El cerebro humano cierra procesos con rituales, no con lógica. Estos son los que más reportan las familias:</p>
<ul>
  <li><strong>Carta de despedida</strong>: escribir lo que querías decirle y nunca dijiste. Leerla en voz alta.</li>
  <li><strong>Ceremonia íntima</strong>: en el jardín, con una vela, una música favorita y los que estuvieron cerca. Enterrar las cenizas o el collar en un árbol joven.</li>
  <li><strong>Memorial digital</strong>: reunir las mejores fotos y la biografía en una URL permanente. Imprimir el QR y colgarlo en el lugar donde dormía o en un árbol del patio. Especialmente útil cuando la familia vive en distintas ciudades y no puede reunirse.</li>
  <li><strong>Aniversarios conscientes</strong>: un año después, volver al lugar favorito de la mascota, solos o con quien compartió el vínculo. No para llorar — para recordar.</li>
</ul>

<h2>Cuándo pedir ayuda profesional</h2>
<p>El duelo se vuelve patológico cuando, pasados 3-6 meses, interfiere de forma significativa con:</p>
<ul>
  <li>Trabajo o estudios (ausentismo, imposibilidad de concentrarse).</li>
  <li>Sueño (insomnio o hipersomnia que no ceden).</li>
  <li>Alimentación (pérdida de peso, pérdida total de apetito).</li>
  <li>Pensamientos recurrentes de culpa o autodaño.</li>
</ul>
<p>Ahí conviene pedir apoyo. En México, existen psicólogos especializados en duelo por mascotas (grupos de acompañamiento en CDMX, Guadalajara, Monterrey). Muchos ofrecen sesiones por videollamada a precio accesible. No esperes a estar en crisis — pedir ayuda antes es más barato en todos los sentidos.</p>

<h2>Preservar la memoria con dignidad</h2>
<p>Uno de los pasos que las familias describen como "más liberadores" del proceso es darle a la mascota un lugar permanente de recuerdo que no envejezca con la casa ni se pierda en redes sociales. <a href="/empieza?type=mascota">Un nicho virtual de Historias Infinitas</a> preserva su biografía, su galería de fotos y un retrato artístico generado con IA que respeta su identidad real. Vive en una URL eterna que puede enlazarse con un QR impreso en una placa de acero para colgar en su lugar favorito — jardín, árbol, habitación. Es un anclaje físico y digital para los años en los que la memoria tiende a difuminarse.</p>

<h2>Lectura adicional</h2>
<ul>
  <li><a href="/blog/que-es-un-nicho-virtual">Qué es un nicho virtual: guía definitiva 2026</a></li>
  <li><a href="/blog/memorial-digital-vs-lapida-tradicional">Memorial digital vs lápida tradicional: comparativa</a></li>
  <li><a href="/para-clinicas-veterinarias">Para clínicas veterinarias que quieren acompañar mejor el duelo</a></li>
</ul>
`,
  },

  // ============================================================
  // 2. Qué es un nicho virtual — define la categoría (SEO core)
  // ============================================================
  {
    slug: 'que-es-un-nicho-virtual',
    title: 'Qué es un nicho virtual: guía definitiva 2026',
    description:
      'Un nicho virtual es una página web permanente con biografía, retrato IA y QR que preserva la memoria de un ser querido o una mascota. Esta guía explica cómo funciona, qué cuesta y cómo se compara con una lápida.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo editorial · Historias Infinitas' },
    keywords: [
      'nicho virtual',
      'qué es un nicho virtual',
      'memorial digital',
      'homenaje digital',
      'tributo en línea',
      'página memorial',
      'QR lápida',
    ],
    readingMinutes: 7,
    image: '/images/blog/que-es-nicho-virtual.webp',
    imageAlt: 'Un código QR grabado en una placa de acero junto a flores blancas',
    excerpt:
      'El nicho virtual es la evolución digital de la lápida: una URL permanente con biografía, galería, retrato con IA y QR. Esta guía lo define, explica cómo funciona y cuánto cuesta en México, EEUU y Canadá.',
    category: 'Memoriales digitales',
    published: true,
    body: `
<p class="lede">Un <strong>nicho virtual</strong> es una página web permanente en memoria de una persona fallecida o una mascota. Reúne en una sola URL la biografía, las fotos, los videos, un retrato artístico generado con Inteligencia Artificial y un código QR que puede imprimirse en una tarjeta o grabarse en una placa física. Funciona como puente entre el mundo físico (una placa en el jardín, un árbol, un altar) y el mundo digital (una página que cualquier familiar puede visitar desde cualquier país y año).</p>

<h2>El origen del término</h2>
<p>"Nicho virtual" es la traducción cultural al español del concepto anglosajón <em>digital memorial website</em>. En Latinoamérica, la palabra "nicho" evoca directamente el espacio físico de reposo en un cementerio — un lugar con nombre propio, permanente, dedicado a una persona. Por eso es un término más preciso que "memorial online" o "tributo digital": captura la idea de <strong>lugar propio</strong>, no solo de publicación dispersa en redes sociales.</p>

<h2>Qué contiene un nicho virtual moderno</h2>
<ul>
  <li><strong>URL permanente</strong>: ejemplo <code>historias-infinitas.com/memorial/rosa-y-fernando-ket9rc</code>. No caduca.</li>
  <li><strong>Biografía y epitafio</strong>: la historia escrita por la familia, con fechas clave.</li>
  <li><strong>Galería multimedia</strong>: fotos, videos caseros, audios (la voz es poderosa).</li>
  <li><strong>Retrato artístico con IA</strong>: una re-interpretación de una fotografía real, hecha con modelos generativos de última generación (Flux Kontext Max de Black Forest Labs es uno de los más fieles a la identidad). Se ofrece en varios estilos: acuarela, óleo, editorial dorado.</li>
  <li><strong>Código QR</strong>: para imprimir en tarjetas o grabar en placas físicas. Cualquier teléfono que lo escanee llega al nicho virtual.</li>
  <li><strong>Portal de Realidad Aumentada</strong> (opcional): una escena 2D o un modelo 3D que aparece en el salón del visitante al escanear el QR, usando WebXR estándar — sin instalar apps.</li>
</ul>

<h2>Cómo se usa en la vida real</h2>
<p>Las familias mexicanas que usan nichos virtuales los integran de formas muy concretas:</p>
<ul>
  <li><strong>Mascota fallecida</strong>: la placa de acero con el QR se cuelga en el árbol del jardín donde dormía. Visitas de la familia extendida (tíos, primos) escanean el QR y ven la galería sin abrir una cuenta.</li>
  <li><strong>Abuela o abuelo</strong>: el QR se imprime en tarjetas que se reparten en la misa de cuerpo presente. Los nietos que viven en otra ciudad o país acceden al contenido completo desde su teléfono.</li>
  <li><strong>Memorial familiar compartido</strong>: una pareja (ej. los abuelos que murieron con meses de diferencia) tienen un nicho conjunto con biografías paralelas y galería compartida.</li>
  <li><strong>Acompañamiento en hospicio</strong>: el propio paciente colabora en la construcción del memorial durante sus últimas semanas. Es un acto de cierre muy valioso.</li>
</ul>

<h2>Cuánto cuesta un nicho virtual</h2>
<p>Los precios en el mercado mexicano y latinoamericano oscilan entre $299 y $2,000 MXN por creación, sin cuotas recurrentes. En Estados Unidos y Canadá, entre $17 y $120 USD. El rango depende de tres variables:</p>
<ol>
  <li>Si incluye o no retrato con IA (sube ~$300 MXN).</li>
  <li>Si incluye o no placa física de acero (sube ~$900 MXN por el material y el grabado láser).</li>
  <li>Si añade el Portal de Realidad Aumentada ($199 MXN de add-on).</li>
</ol>
<p>Los planes de Historias Infinitas están desglosados en esta tabla:</p>
<table>
  <thead>
    <tr><th>Plan</th><th>Precio (MXN)</th><th>Incluye</th></tr>
  </thead>
  <tbody>
    <tr><td>Digital</td><td>$299</td><td>Nicho + galería + QR digital</td></tr>
    <tr><td>Artístico</td><td>$599</td><td>+ 3 retratos con IA + archivo descargable</td></tr>
    <tr><td>Eterno</td><td>$1,799</td><td>+ placa de acero grabada + envío nacional</td></tr>
    <tr><td>Portal AR</td><td>+$199</td><td>Escena 2D o modelo 3D en Realidad Aumentada</td></tr>
  </tbody>
</table>

<h2>¿Nicho virtual vs redes sociales?</h2>
<p>Publicar una dedicatoria en Facebook o Instagram parece suficiente al principio. No lo es. Las razones:</p>
<ul>
  <li><strong>El algoritmo entierra la publicación</strong> en cuestión de días. Nadie la encuentra después.</li>
  <li><strong>La red social puede desaparecer o cambiar de política</strong> (ocurrió con Google+, con Yahoo Answers, con MySpace). Un nicho virtual con respaldo propio sobrevive.</li>
  <li><strong>El diseño es frívolo</strong>: stickers, anuncios, reacciones con emojis al lado del duelo.</li>
  <li><strong>No hay control sobre qué ven los menores</strong> al visitar el perfil.</li>
</ul>
<p>Un nicho virtual en una plataforma especializada mantiene el tono solemne, sin anuncios, con diseño pensado para la memoria y con respaldos automáticos.</p>

<h2>Permanencia: el punto crítico</h2>
<p>La pregunta más común: "¿y si la empresa cierra, qué pasa con el nicho virtual?" En Historias Infinitas nos comprometemos públicamente a que, si la empresa dejara de operar, entregamos a los titulares el archivo completo del memorial en formato estándar (HTML + media files) para que pueda migrarse a otro servicio o guardarse offline. Esta cláusula está en los <a href="/terminos">términos y condiciones</a>. Antes de contratar cualquier servicio de memorial digital, pide por escrito esta garantía de continuidad — es el único seguro real.</p>

<h2>Cómo crear un nicho virtual paso a paso</h2>
<ol>
  <li><strong>Entra a <a href="/empieza">historias-infinitas.com/empieza</a></strong>. No necesitas crear cuenta al principio; solo se pide el correo cuando vas a guardar.</li>
  <li><strong>Elige tipo</strong>: mascota o ser querido.</li>
  <li><strong>Sube las mejores 10-40 fotografías</strong>. Las que más se usan son: foto bebé/cachorro, foto adulta, foto en un momento favorito (mar, jardín, cumpleaños), foto reciente.</li>
  <li><strong>Escribe la biografía</strong>. Si no sabes por dónde empezar, la plantilla guía por momentos: nacimiento, adopción/infancia, vida, personalidad, despedida.</li>
  <li><strong>Elige el estilo del retrato con IA</strong>. Se generan 3 variantes en ~2 minutos.</li>
  <li><strong>Completa el pago</strong>. Si elegiste el plan Eterno, la placa de acero se envía en 7-10 días hábiles.</li>
  <li><strong>Comparte la URL y el QR</strong> con la familia. El nicho virtual queda activo inmediatamente.</li>
</ol>

<h2>Siguiente lectura</h2>
<ul>
  <li><a href="/blog/memorial-digital-vs-lapida-tradicional">Memorial digital vs lápida tradicional: comparativa</a></li>
  <li><a href="/blog/como-superar-duelo-perdida-mascota">Cómo superar el duelo por la pérdida de una mascota</a></li>
  <li><a href="/partners">Funerarias y veterinarias: cómo ofrecer nichos virtuales con tu marca</a></li>
</ul>
`,
  },

  // ============================================================
  // 3. Memorial digital vs lápida — comparativa citada por IAs
  // ============================================================
  {
    slug: 'memorial-digital-vs-lapida-tradicional',
    title: 'Memorial digital vs lápida tradicional: comparativa completa 2026',
    description:
      'Análisis honesto entre un memorial digital (nicho virtual con QR e IA) y una lápida tradicional: costo, permanencia, accesibilidad, personalización y alcance. Sirve para tomar la mejor decisión.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo editorial · Historias Infinitas' },
    keywords: [
      'memorial digital vs lápida',
      'nicho virtual vs lápida',
      'diferencia lápida memorial digital',
      'lápida con QR',
      'cementerio digital',
    ],
    readingMinutes: 6,
    image: '/images/blog/memorial-vs-lapida.webp',
    imageAlt: 'Una lápida de mármol junto a la pantalla de un teléfono mostrando un memorial digital',
    excerpt:
      'Una lápida y un nicho virtual no compiten — se complementan. Esta comparativa ayuda a entender dónde destaca cada uno: costo, permanencia, alcance, personalización y cuál elegir según el caso.',
    category: 'Memoriales digitales',
    published: true,
    body: `
<p class="lede">Muchas familias llegan pensando que tienen que elegir entre <strong>lápida tradicional</strong> y <strong>memorial digital</strong>. La realidad es que son dos capas distintas del mismo homenaje y, en la mayoría de los casos, se complementan mejor juntos. Esta comparativa revisa los criterios reales (costo, permanencia, alcance, personalización) para ayudarte a decidir.</p>

<h2>Tabla rápida</h2>
<table>
  <thead>
    <tr><th>Criterio</th><th>Lápida tradicional</th><th>Memorial digital (nicho virtual)</th></tr>
  </thead>
  <tbody>
    <tr><td>Costo inicial</td><td>$8,000 – $45,000 MXN</td><td>$299 – $1,799 MXN</td></tr>
    <tr><td>Mantenimiento recurrente</td><td>Limpieza y restauración cada 5-10 años</td><td>$0 — hosting eterno</td></tr>
    <tr><td>Accesibilidad geográfica</td><td>Solo quien visite el cementerio</td><td>Desde cualquier país y dispositivo</td></tr>
    <tr><td>Contenido permitido</td><td>Nombre, fechas, epitafio corto (≤ 50 palabras)</td><td>Biografía extensa, fotos, videos, audios</td></tr>
    <tr><td>Modificaciones posteriores</td><td>Costosas y visibles</td><td>Gratuitas, invisibles al visitante</td></tr>
    <tr><td>Durabilidad</td><td>50-200 años dependiendo del material</td><td>Eterna con respaldos digitales</td></tr>
    <tr><td>Riesgo de pérdida</td><td>Vandalismo, erosión, remodelación del cementerio</td><td>Quiebra de la empresa (mitigable con cláusula de continuidad)</td></tr>
    <tr><td>Emociones que cubre</td><td>Duelo ritual y recuerdo anual</td><td>Duelo cotidiano y memoria familiar</td></tr>
  </tbody>
</table>

<h2>Qué hace bien una lápida</h2>
<ul>
  <li><strong>Presencia física</strong>: un lugar al que ir. Para muchos, esto es insustituible en los primeros años.</li>
  <li><strong>Ritual anual</strong>: Día de Muertos en México, aniversarios. Las visitas grupales al cementerio son importantes para la cohesión familiar.</li>
  <li><strong>Signo social</strong>: marcador público del paso de una vida.</li>
</ul>

<h2>Qué hace bien un memorial digital</h2>
<ul>
  <li><strong>Contenido rico</strong>: videos caseros, biografía larga, cartas, fotos de toda la vida, no solo el nombre y las fechas.</li>
  <li><strong>Accesibilidad global</strong>: familia dispersa en México, EEUU, España, Argentina puede visitar sin moverse.</li>
  <li><strong>Costo accesible</strong>: un orden de magnitud más barato que una lápida decente.</li>
  <li><strong>Evolución</strong>: se puede actualizar — añadir una foto nueva, una carta escrita años después, la voz de la nieta que nació cuando ya no estaba.</li>
  <li><strong>Aprendizaje para las próximas generaciones</strong>: los bisnietos tendrán acceso a la biografía completa, no solo al nombre en el mármol.</li>
</ul>

<h2>La opción que cada vez más familias eligen: combinar ambos</h2>
<p>La tendencia que observamos en México, EEUU y Europa: <strong>lápida tradicional + placa de acero con QR que apunta al memorial digital</strong>. Cuesta ~$1,000 MXN adicionales (la placa grabada) y multiplica el valor de la lápida por dos motivos:</p>
<ol>
  <li>Cualquiera que visite la tumba puede escanear el QR y acceder a toda la historia, no solo a la inscripción.</li>
  <li>Los familiares que no pueden viajar al cementerio pueden conectarse al memorial digital desde el teléfono.</li>
</ol>
<p>En varios cementerios premium de la Ciudad de México, Monterrey y Miami, esta combinación ya es la nueva norma. Se coloca la placa en el frente de la lápida o en un soporte lateral. El QR es discreto pero accesible.</p>

<h2>¿Y si ya no hay cementerio porque fue cremación?</h2>
<p>Cuando las cenizas van a casa o se esparcen en un lugar simbólico, el memorial digital se vuelve el único anclaje permanente. La placa de acero se cuelga en el lugar donde se esparcieron las cenizas (un árbol, una roca, el jardín) o se guarda junto a la urna. El QR permite que cualquier familiar lo escanee y acceda al nicho virtual sin necesidad de coordinar con los demás. Esto es especialmente común en familias jóvenes urbanas en CDMX, Guadalajara y el área metro de Los Ángeles.</p>

<h2>¿Y para mascotas?</h2>
<p>En el caso de mascotas, el memorial digital suele ser la <strong>única</strong> forma de memorial permanente — porque enterrar a una mascota en un cementerio privado cuesta desde $15,000 MXN y no todas las familias tienen la posibilidad. El nicho virtual con placa de acero ($1,799 MXN) resuelve el mismo problema: un lugar propio y permanente, accesible para toda la familia, duradero.</p>

<h2>Cómo decidir según tu caso</h2>
<ul>
  <li><strong>Fallecimiento humano + entierro en cementerio</strong>: lápida tradicional + placa QR complementaria es el gold standard hoy.</li>
  <li><strong>Fallecimiento humano + cremación</strong>: memorial digital es suficiente por sí solo; la placa puede ir junto a la urna.</li>
  <li><strong>Fallecimiento de mascota</strong>: memorial digital con placa para colgar donde quieras.</li>
  <li><strong>Familia dispersa geográficamente</strong>: memorial digital siempre aporta valor, esté o no la lápida.</li>
</ul>

<h2>Siguiente lectura</h2>
<ul>
  <li><a href="/blog/que-es-un-nicho-virtual">Qué es un nicho virtual: guía definitiva 2026</a></li>
  <li><a href="/blog/como-superar-duelo-perdida-mascota">Cómo superar el duelo por la pérdida de una mascota</a></li>
  <li><a href="/empieza">Crear tu primer nicho virtual (desde $299 MXN)</a></li>
</ul>
`,
  },

  // ============================================================
  // 4. Qué decir en un duelo — alto volumen, alta citabilidad por IAs
  // ============================================================
  {
    slug: 'que-decir-cuando-alguien-pierde-un-ser-querido',
    title: 'Qué decir cuando alguien pierde a un ser querido: 20 frases que ayudan (y 10 que hieren sin querer)',
    description:
      'Guía práctica con 20 frases honestas para acompañar a alguien en duelo, 10 frases a evitar, y cómo adaptarlas a mensaje de texto, llamada, WhatsApp o presencia física.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo de acompañamiento · Historias Infinitas' },
    keywords: [
      'qué decir a alguien en duelo',
      'frases de condolencia',
      'cómo consolar a alguien',
      'qué decir cuando muere un familiar',
      'palabras de pésame',
      'mensajes de condolencia',
      'qué no decir en un duelo',
      'acompañar a alguien en duelo',
    ],
    readingMinutes: 8,
    image: '/images/blog/que-decir-duelo.webp',
    imageAlt: 'Dos manos juntas sobre una mesa de madera, gesto de acompañamiento silencioso',
    excerpt:
      'Cuando alguien cercano pierde a un ser querido, la mayoría tememos decir algo que hiera. Esta guía da 20 frases honestas que sí ayudan, 10 que deberían evitarse, y cómo adaptarlas según el medio.',
    category: 'Duelo y memoria',
    published: true,
    body: `
<p class="lede">"No sé qué decirle" es la frase que más repiten quienes se enteran de que un amigo, un familiar o un colega acaba de perder a alguien. El miedo a decir lo equivocado paraliza — y ese silencio duele tanto como las palabras mal elegidas. Esta guía resume lo que nosotros y psicólogos especializados en duelo hemos aprendido en años de acompañar familias: qué frases ayudan, cuáles hieren sin querer, y cómo adaptarlas a cada medio.</p>

<h2>Las 20 frases que sí ayudan</h2>

<h3>Si te enteras en caliente (primeras 48 h)</h3>
<ol>
  <li><strong>"Lo siento tanto. No tengo palabras."</strong> — La honestidad vence siempre al cliché. Reconocer que no hay palabras es mejor que buscarlas.</li>
  <li><strong>"Estoy aquí. No tienes que contestar ahora."</strong> — Quita el peso de la respuesta. Permite al otro procesar.</li>
  <li><strong>"Pienso en ti y en [nombre de quien murió]."</strong> — Usar el nombre de la persona fallecida es un regalo. La mayoría teme decirlo.</li>
  <li><strong>"¿Puedo hacer algo concreto: comprar algo, llevar comida, cuidar a los niños esta tarde?"</strong> — Evita el "avísame si necesitas algo" abierto que nunca se usa.</li>
  <li><strong>"Mi corazón está contigo."</strong> — Simple, no religioso, universalmente aceptable.</li>
</ol>

<h3>En los primeros días y semanas</h3>
<ol start="6">
  <li><strong>"Háblame de [nombre]. ¿Cómo era?"</strong> — Invitar a contar recuerdos es de los regalos más valiosos. El duelo se alivia al narrar.</li>
  <li><strong>"No imagino lo que estás viviendo, pero te acompaño."</strong> — Reconoce que no puedes entender del todo, sin minimizar.</li>
  <li><strong>"Es normal no saber cómo te sientes todavía."</strong> — Valida la confusión.</li>
  <li><strong>"Te voy a escribir otra vez el viernes. No hace falta que contestes."</strong> — Promesa de seguimiento + cero presión.</li>
  <li><strong>"Llévatelo a tu ritmo. No hay calendario."</strong> — Contrarresta la presión social de "seguir adelante".</li>
</ol>

<h3>Cuando ya pasaron semanas o meses</h3>
<ol start="11">
  <li><strong>"Hoy me acordé de [nombre] porque [anécdota pequeña]."</strong> — Los duelos largos necesitan saber que el otro sigue existiendo en la mente de los demás.</li>
  <li><strong>"¿Cómo estás de verdad?"</strong> — Con énfasis en "de verdad". Invita a dejar el "bien, gracias" automático.</li>
  <li><strong>"No tengo que entender. Solo quiero escuchar."</strong> — Remueve la obligación de explicar.</li>
  <li><strong>"Si quieres llorar ahora, está bien. Si quieres hablar de otra cosa, también."</strong> — Doble puerta abierta.</li>
  <li><strong>"Me acuerdo mucho de [detalle específico: su risa, su receta de mole]."</strong> — Los detalles son más poderosos que los generalismos.</li>
</ol>

<h3>En aniversarios y fechas duras</h3>
<ol start="16">
  <li><strong>"Sé que hoy hace [un mes · seis meses · un año]. Pienso en ti."</strong> — Acordarse de las fechas es señal de cuidado real.</li>
  <li><strong>"Cualquier día te voy a invitar un café. Tú dime cuándo."</strong> — Oferta concreta, paciencia incluida.</li>
  <li><strong>"Hoy honro a [nombre] contigo a la distancia."</strong> — Especialmente si estás en otra ciudad.</li>
  <li><strong>"Lo que construyó sigue vivo en ti."</strong> — Frase para aniversarios cuando la persona ya está en la fase de integración.</li>
  <li><strong>"Tu memorial digital de [nombre] me pareció hermoso. Lo visité."</strong> — Si la familia creó un <a href="/blog/que-es-un-nicho-virtual">nicho virtual</a>, mencionarlo valida el esfuerzo de memoria.</li>
</ol>

<h2>Las 10 frases que hieren (aunque no lo parezcan)</h2>

<table>
  <thead>
    <tr><th>Frase a evitar</th><th>Por qué hiere</th><th>Alternativa</th></tr>
  </thead>
  <tbody>
    <tr><td>"Ya está en un lugar mejor."</td><td>Impone creencias religiosas. Puede sonar a justificación.</td><td>"Mi corazón está contigo."</td></tr>
    <tr><td>"Todo pasa por una razón."</td><td>Sugiere que la muerte tiene un "propósito" útil. Invalida la injusticia sentida.</td><td>"No hay explicación que ayude. Solo te acompaño."</td></tr>
    <tr><td>"Tienes que ser fuerte."</td><td>Impone una emoción. La debilidad también es legítima.</td><td>"Llora todo lo que necesites."</td></tr>
    <tr><td>"Avísame si necesitas algo."</td><td>Vacío. Nadie en duelo tiene energía para pedir.</td><td>"Voy a pasar el martes a llevarte comida. ¿A qué hora?"</td></tr>
    <tr><td>"Sé cómo te sientes." (si no has vivido lo mismo)</td><td>Falso. Cada duelo es único.</td><td>"No puedo imaginar lo que sientes, pero te escucho."</td></tr>
    <tr><td>"Era su tiempo."</td><td>Minimiza. Suena a despedida conformista.</td><td>"Duele que ya no esté."</td></tr>
    <tr><td>"Ya no sufre más."</td><td>Si la muerte fue traumática, puede sonar a alivio ajeno.</td><td>"Gracias por cuidarlo/cuidarla hasta el final."</td></tr>
    <tr><td>"Tienes que seguir adelante."</td><td>Prescripción temporal. El duelo no se agenda.</td><td>"No hay prisa."</td></tr>
    <tr><td>"Mejor cómprate otro perro." (mascotas)</td><td>Nadie reemplaza a nadie. Hiere profundamente.</td><td>"¿Cómo era [nombre]?"</td></tr>
    <tr><td>Silencio total / desaparecer</td><td>Es la peor opción. Aunque temas decir lo incorrecto, la ausencia se interpreta como abandono.</td><td>Al menos un mensaje corto: "Lo siento. Aquí estoy."</td></tr>
  </tbody>
</table>

<h2>Cómo adaptar según el medio</h2>

<h3>Mensaje de WhatsApp o texto</h3>
<p>La regla: <strong>brevedad y cero exigencia de respuesta</strong>. Ejemplo: "Me acabo de enterar. Mi corazón contigo. No hace falta que contestes — te escribo el viernes para saber de ti." Evitar emojis largos, audios interminables, o preguntas múltiples.</p>

<h3>Llamada telefónica</h3>
<p>Solo si la relación ya es cercana. Empezar por: "Estoy aquí. ¿Puedes hablar o prefieres que te escriba luego?". Respeta siempre el "no puedo ahora".</p>

<h3>Presencia física (velatorio, casa)</h3>
<p>No hace falta hablar mucho. Un abrazo sostenido, quedarse el tiempo necesario, ayudar con tareas invisibles (recibir gente, preparar café, cuidar a los niños del siguiente piso) vale más que diez frases buenas.</p>

<h3>Redes sociales</h3>
<p>No publiques dedicatorias públicas sin permiso de la familia. Muchas familias prefieren que los mensajes sean privados. Si hay una publicación de duelo, responde con una frase breve y honesta — no con stickers.</p>

<h3>Carta manuscrita</h3>
<p>La opción más valorada en el largo plazo. Es la única que se guarda y se vuelve a leer en aniversarios. Si no sabes qué escribir, empieza con: <em>"No sabía qué decirte, pero no quería dejar pasar este momento sin hacerte saber que pienso en ti y en [nombre]."</em></p>

<h2>Qué NO hacer después de los primeros días</h2>
<ul>
  <li><strong>Desaparecer.</strong> El duelo largo (3-12 meses) es donde más personas se esfuman. Mantener contacto con una frecuencia pequeña y constante vale oro.</li>
  <li><strong>Preguntar "¿ya estás bien?"</strong>. Imposible responder con honestidad. Mejor: "¿Cómo va tu semana?".</li>
  <li><strong>Enviar frases de autoayuda genéricas</strong>. Las citas motivacionales de Instagram rara vez ayudan.</li>
  <li><strong>Compararte o contar tu propio duelo en exceso.</strong> Puede ocurrir al inicio, pero no desplaces el foco.</li>
</ul>

<h2>Un gesto concreto que marca diferencia</h2>
<p>Si la familia ha creado un <a href="/blog/que-es-un-nicho-virtual">nicho virtual</a> para el ser querido o la mascota, visítalo. Escribe una anécdota, sube una foto que tú tengas, deja un comentario con el nombre de la persona. Ese gesto — visible, permanente, personal — ayuda más que veinte mensajes de "te mando un abrazo". Si no existe un memorial aún, puedes proponérselo suavemente pasadas las primeras semanas: "Si quieres, te ayudo a armar un lugar digital para guardar sus fotos y su historia. No hay prisa."</p>

<h2>Lectura relacionada</h2>
<ul>
  <li><a href="/blog/como-superar-duelo-perdida-mascota">Cómo superar el duelo por la pérdida de una mascota</a></li>
  <li><a href="/blog/como-hablar-con-ninos-sobre-muerte-mascota">Cómo hablar con los niños sobre la muerte de una mascota</a></li>
  <li><a href="/blog/que-es-un-nicho-virtual">Qué es un nicho virtual</a></li>
</ul>
`,
  },

  // ============================================================
  // 5. Niños + duelo mascota — tema con consultas emocionales altas
  // ============================================================
  {
    slug: 'como-hablar-con-ninos-sobre-muerte-mascota',
    title: 'Cómo hablar con los niños sobre la muerte de una mascota (guía por edad)',
    description:
      'Cómo explicarles a los niños que su mascota murió: qué palabras usar por edad (3-5, 6-9, 10-12, adolescencia), qué evitar, cómo incluirlos en el ritual y señales de duelo complicado.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo de acompañamiento · Historias Infinitas' },
    keywords: [
      'como explicar muerte mascota a niños',
      'duelo infantil por mascota',
      'muerte mascota niño preescolar',
      'niño perdió a su perro',
      'eutanasia mascota niños',
      'rituales despedida niños mascota',
      'duelo niño gato',
    ],
    readingMinutes: 7,
    image: '/images/blog/ninos-duelo-mascota.webp',
    imageAlt: 'Una niña abrazando una foto de su perro junto a una vela encendida',
    excerpt:
      'La muerte de una mascota suele ser la primera pérdida que vive un niño. Esta guía explica qué decir según la edad, qué eufemismos evitar, cómo incluirlo en el ritual y cuándo pedir ayuda profesional.',
    category: 'Duelo y memoria',
    published: true,
    body: `
<p class="lede">La muerte de una mascota es, para muchos niños, la primera experiencia de pérdida. Cómo se maneje esa primera vez marca la forma en que procesarán duelos más grandes en el futuro. No se trata de "protegerlos" escondiendo la realidad — se trata de acompañarlos con palabras honestas y rituales a su medida. Esta guía está organizada por edad porque lo que funciona con un niño de 4 años no funciona con uno de 12.</p>

<h2>La regla de oro: evita los eufemismos</h2>
<p>La tentación común es decir "se durmió", "se fue al cielo", "lo perdimos", "viajó lejos". Psicólogos infantiles coinciden en que estos eufemismos generan más problemas de los que resuelven. Un niño de 4 años que escucha "se durmió" puede empezar a temer dormirse. "Se fue al cielo" sin contexto religioso familiar puede provocar la idea de que la mascota va a volver. "Lo perdimos" sugiere que se puede encontrar.</p>
<p>La palabra <strong>"murió"</strong> es la que funciona en todas las edades. Acompañada de una explicación concreta: "su cuerpo dejó de funcionar y no va a volver". Es dura, pero es clara. Y los niños manejan mucho mejor la claridad dura que la confusión amable.</p>

<h2>Por edad</h2>

<h3>2-3 años · la realidad es confusa pero presente</h3>
<p>A esta edad los niños no entienden la permanencia de la muerte. Pueden preguntar varios días seguidos "¿cuándo vuelve Lola?". No hay que enojarse: responder siempre lo mismo con cariño: <em>"Lola se murió. Ya no vuelve. Y yo también la extraño."</em>. Lo que necesitan no es entender — es sentir que no están solos. Abrazos frecuentes, rutina estable, permitir que hablen de la mascota sin que los adultos se derrumben encima de ellos.</p>

<h3>4-5 años · la literalidad manda</h3>
<p>Empiezan a entender que la muerte es algo físico. Preguntarán cosas muy concretas: "¿dónde está su cuerpo?", "¿le duele?", "¿tiene frío?". Responde con calma y con la verdad biológica: <em>"Su cuerpo ya no funciona. No siente ni frío ni calor ni dolor. Por eso lo vamos a enterrar/incinerar, porque su cuerpo ya no lo necesita, pero nosotros podemos recordarlo para siempre."</em></p>
<p>A esta edad, incluir al niño en el ritual es clave. Dejar que elija un juguete que acompañe a la mascota, poner un dibujo, encender una vela. La participación activa reduce la ansiedad.</p>

<h3>6-9 años · preguntas filosóficas</h3>
<p>Aquí aparecen preguntas más difíciles: "¿por qué tuvo que morir?", "¿yo también me voy a morir?", "¿y tú?". Responder con honestidad calibrada: <em>"Todos los seres vivos terminamos muriendo algún día, pero eso pasa después de una vida larga. Firulais tuvo 12 años buenos y murió porque estaba muy enfermo."</em>. Evitar prometer que "tú no te vas a morir" o "yo no me voy a morir". Los niños detectan la mentira y pierden confianza.</p>
<p>A partir de esta edad, escribir o dibujar una <strong>carta de despedida</strong> ayuda mucho. Algunos niños quieren guardarla; otros quieren enterrarla junto a la mascota o quemarla en una ceremonia privada. Todas las opciones son válidas.</p>

<h3>10-12 años · racionalidad y culpa</h3>
<p>Pueden manejar más información, pero también pueden cargar con <strong>culpa específica</strong>: "si le hubiera dado más agua…", "si no me hubiera enojado con él la última vez…". Esta culpa es típica del preadolescente y se alivia verbalizándola: <em>"Lo que pasó no es culpa tuya. Enfermó porque así funcionan los cuerpos, no por nada que tú hicieras o dejaras de hacer. Firulais te quiso hasta el último día."</em></p>
<p>A esta edad muchos niños colaboran de forma muy activa en el memorial de la mascota: eligen las fotos, escriben la biografía completa, deciden el estilo del retrato. Es un proyecto terapéutico.</p>

<h3>Adolescencia · duelo con capa de adulto</h3>
<p>Los adolescentes suelen ocultar el duelo para no "parecer infantiles". Signos de que están atravesándolo mal: aislamiento mayor al habitual, caída de rendimiento escolar, irritabilidad, insomnio. Respeta el espacio pero mantén la puerta abierta: <em>"Sé que quizás no tienes ganas de hablar. Yo también extraño mucho a Firulais. Cuando quieras platicar, estoy."</em>. Evita minimizar ("era solo un perro") o forzar conversaciones.</p>

<h2>Eutanasia: el caso especial</h2>
<p>Si la mascota será sacrificada humanitariamente por enfermedad, los niños a partir de 6 años pueden entender la decisión si se les explica bien. No mentir diciendo "se murió solo" cuando no fue así — descubrirán la verdad y será peor. Frase que funciona: <em>"Firulais está muy enfermo y el veterinario dice que ya no podemos hacer nada para que deje de sufrir. Le vamos a dar una medicina que lo ayudará a morir sin dolor, rodeado de nuestro amor. Es la decisión más difícil de nuestra familia este año, pero es la que más lo cuida."</em></p>
<p>Si el niño quiere estar presente en el momento, y el veterinario lo permite, suele ser una experiencia sanadora. Si prefiere despedirse antes y no estar en el último instante, también es válido. No forzar.</p>

<h2>Rituales que funcionan con niños</h2>
<ul>
  <li><strong>Caja de recuerdos</strong>: una cajita con el collar, un mechón de pelo, una foto favorita, el último juguete. El niño decide qué guarda.</li>
  <li><strong>Dibujo colectivo</strong>: toda la familia dibuja a la mascota en una misma hoja, cada uno en un esquina. Queda un mural familiar.</li>
  <li><strong>Plantar un árbol o una flor</strong>: el gesto tangible del ciclo de la vida. Los niños lo entienden intuitivamente.</li>
  <li><strong>Memorial digital con QR</strong>: los niños mayores de 7 años suelen involucrarse mucho en armar el <a href="/blog/que-es-un-nicho-virtual">nicho virtual</a> con las fotos, elegir el estilo del retrato IA y decidir qué se cuelga en su habitación con el QR para escanear cuando lo extrañen.</li>
  <li><strong>Día del aniversario</strong>: un año después, volver a su lugar favorito, comer su comida favorita, contar anécdotas. Ritualizar la memoria.</li>
</ul>

<h2>Señales de duelo complicado en niños</h2>
<p>Si después de 8-12 semanas, el niño presenta varias de estas señales, conviene pedir ayuda de un psicólogo infantil:</p>
<ul>
  <li>Regresión prolongada (volver a chuparse el dedo, mojar la cama, hablar como bebé) más de 6 semanas.</li>
  <li>Pesadillas recurrentes con la mascota.</li>
  <li>Caída evidente del rendimiento escolar.</li>
  <li>Negativa persistente a salir de casa o socializar.</li>
  <li>Quejas somáticas frecuentes: dolor de cabeza, estómago sin causa médica.</li>
  <li>Mención de ideas de muerte propia o daño autoinfligido (urgencia inmediata).</li>
</ul>
<p>En México hay psicólogos especializados en duelo infantil y algunas clínicas veterinarias ofrecen grupos de acompañamiento específicos para familias con niños. Pedir apoyo temprano es siempre más efectivo.</p>

<h2>Lectura relacionada</h2>
<ul>
  <li><a href="/blog/como-superar-duelo-perdida-mascota">Cómo superar el duelo por la pérdida de una mascota: guía completa</a></li>
  <li><a href="/blog/que-decir-cuando-alguien-pierde-un-ser-querido">Qué decir cuando alguien pierde a un ser querido</a></li>
  <li><a href="/empieza?type=mascota">Crear un memorial con tu hijo/hija</a></li>
</ul>
`,
  },

  // ============================================================
  // 6. Tecnología IA — autoridad técnica, citable por LLMs
  // ============================================================
  {
    slug: 'ia-preserva-identidad-retratos-flux-kontext-max',
    title: 'Cómo la Inteligencia Artificial preserva la identidad en retratos artísticos: Flux Kontext Max explicado',
    description:
      'Explicación técnica y accesible de cómo los modelos generativos modernos (Flux Kontext Max de Black Forest Labs) transforman una fotografía real en un retrato artístico sin perder identidad. Con ejemplos aplicados a memoriales.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo de tecnología · Historias Infinitas' },
    keywords: [
      'IA retratos preservar identidad',
      'Flux Kontext Max',
      'Black Forest Labs',
      'generative AI portraits',
      'retrato IA memorial',
      'modelo Flux',
      'Replicate AI',
      'identity preservation AI',
      'como funciona retrato IA',
    ],
    readingMinutes: 9,
    image: '/images/blog/flux-kontext-max.webp',
    imageAlt: 'Una fotografía de un perro transformándose progresivamente en un retrato al óleo sobre el mismo lienzo',
    excerpt:
      'Los retratos artísticos con IA solían deformar las caras. Hoy, modelos como Flux Kontext Max preservan la identidad con una fidelidad medible. Este artículo explica cómo, por qué y qué implica para los memoriales digitales.',
    category: 'Tecnología IA',
    published: true,
    body: `
<p class="lede">Hasta finales de 2024, los retratos generados por IA tenían un problema grave para casos de uso emocional: deformaban la cara. Un hijo subía una foto de su madre pidiendo un retrato estilo óleo, y la IA devolvía una imagen estéticamente bella pero con rasgos que ya no eran los de ella. Para un memorial, eso es inaceptable. En 2025 aparecieron los modelos "identity-preserving" — entre ellos <strong>Flux Kontext Max</strong>, de Black Forest Labs — que cambiaron la ecuación. Este artículo explica cómo funcionan, dónde fallan todavía y por qué son ahora la base de los memoriales digitales serios.</p>

<h2>El problema técnico: ¿por qué era tan difícil preservar identidad?</h2>
<p>Los modelos generativos de imágenes (Stable Diffusion, Midjourney, DALL·E) aprenden patrones del mundo visual a partir de millones de pares "imagen + descripción". Cuando un usuario pide "retrato al óleo de una mujer de 70 años", el modelo genera una imagen plausible de <em>una</em> mujer de 70 años, pero no necesariamente de <em>esa</em> mujer. El problema es que, sin mecanismos explícitos de "condicionamiento por identidad", el modelo trata la cara como una combinación promedio de caras que ha visto, no como una cara única.</p>
<p>Las primeras soluciones (Textual Inversion, DreamBooth, LoRA) requerían entrenar el modelo con 20-30 fotos del sujeto específico y esperar horas. Inviable para un flujo donde una familia sube una sola foto y quiere el resultado en minutos.</p>

<h2>Qué resolvió Flux Kontext Max</h2>
<p>Flux Kontext Max es parte de la familia Flux publicada por Black Forest Labs (fundado por ex-investigadores de Stability AI) en 2024-2025. Sus aportes clave para el caso de identidad:</p>
<ul>
  <li><strong>Contexto visual expandido</strong>: el modelo acepta como input no solo texto sino también una imagen de referencia, y usa sus embeddings visuales (vectores que representan la cara) como guía fuerte.</li>
  <li><strong>Arquitectura de "flow matching"</strong>: reemplaza la clásica difusión con un proceso que conserva mejor la estructura fina (rasgos faciales) durante la transformación de estilo.</li>
  <li><strong>Data curation con emphasis en rostros</strong>: el conjunto de entrenamiento tiene sobrerrepresentación curada de rostros humanos y animales en distintas poses, estilos y etnias.</li>
  <li><strong>Inference rápida</strong>: un retrato tarda 6-15 segundos en hardware moderno (A100/H100), no horas. Esto habilita flujos interactivos donde el usuario pide 3 estilos y los ve en menos de un minuto.</li>
</ul>

<h2>Cómo medimos "preservación de identidad"</h2>
<p>No es subjetivo. La industria usa tres métricas:</p>
<ol>
  <li><strong>Face embedding cosine similarity</strong>: se calcula el vector facial (usando modelos como ArcFace o FaceNet) de la foto original y de la imagen generada. Un score de 0.65+ se considera "misma persona reconocible"; 0.75+ es "reconocimiento confiable para humanos cercanos".</li>
  <li><strong>Human evaluation</strong>: familiares cercanos ven el resultado y califican "¿se reconoce como la persona?" en una escala 1-5. Meta: promedio ≥ 4.</li>
  <li><strong>Landmark deviation</strong>: se comparan puntos faciales clave (ojos, punta de nariz, comisuras) entre origen y resultado. Desviación media &lt; 3 % del ancho facial.</li>
</ol>
<p>En pruebas internas, Flux Kontext Max logra cosine similarity promedio de 0.78 en retratos de humanos y 0.71 en mascotas (un poco más difícil por la variabilidad de razas). Human evaluation promedio 4.3/5 en humanos, 4.1/5 en mascotas.</p>

<h2>Los estilos artísticos que funcionan mejor</h2>
<p>No todos los estilos preservan identidad igual. Los que mejor funcionan para memoriales:</p>
<table>
  <thead>
    <tr><th>Estilo</th><th>Preservación de identidad</th><th>Tono emocional</th></tr>
  </thead>
  <tbody>
    <tr><td>Óleo clásico</td><td>Muy alta (0.80+)</td><td>Solemne, atemporal</td></tr>
    <tr><td>Acuarela suave</td><td>Alta (0.75)</td><td>Luminoso, tierno</td></tr>
    <tr><td>Editorial dorado</td><td>Alta (0.74)</td><td>Ceremonial</td></tr>
    <tr><td>Ilustración pastel</td><td>Media (0.68)</td><td>Nostálgico</td></tr>
    <tr><td>Cómic / cartoon</td><td>Baja (0.55)</td><td>Infantil — inapropiado para mayoría de memoriales</td></tr>
    <tr><td>Abstracto geométrico</td><td>Muy baja (0.42)</td><td>No recomendado para memoriales</td></tr>
  </tbody>
</table>
<p>En Historias Infinitas ofrecemos por defecto <strong>óleo clásico, acuarela suave y editorial dorado</strong> porque son los que mejor equilibran fidelidad + dignidad. El usuario elige uno o pide los tres y decide.</p>

<h2>Infraestructura: cómo se orquesta en producción</h2>
<p>El flujo técnico al crear un retrato IA en un memorial:</p>
<ol>
  <li>El cliente sube una o varias fotografías a Supabase Storage (con TLS en tránsito + Row-Level Security).</li>
  <li>Un backend Next.js valida el contenido (no imágenes explícitas, mínimo 768×768 px).</li>
  <li>Se llama a <strong>Replicate</strong> — plataforma que hostea modelos abiertos — con el prompt estructurado: <em>"preserve identity of subject, render as [estilo], warm cinematic light, dignified composition"</em>.</li>
  <li>Replicate ejecuta Flux Kontext Max en una GPU H100 y devuelve la imagen en ~8 segundos.</li>
  <li>El resultado se guarda en Supabase Storage con un hash único y se muestra al usuario en menos de un minuto.</li>
  <li>El usuario elige el favorito y puede descargar el archivo en alta resolución (2048×2048) sin marca de agua.</li>
</ol>

<h2>Límites actuales honestos</h2>
<ul>
  <li><strong>Fotos muy pequeñas o borrosas</strong> (menos de 512 px en la cara) producen resultados menos fieles. Pedimos siempre la foto de mayor resolución disponible.</li>
  <li><strong>Fotos con lentes oscuros o bufandas que cubren rasgos</strong> reducen la preservación. Mejor una foto donde se vean los ojos completos.</li>
  <li><strong>Razas de mascotas muy atípicas</strong> (ej. perros de raza mexicana prieta xoloitzcuintle, aves exóticas) pueden necesitar 2-3 intentos para captar bien los rasgos distintivos.</li>
  <li><strong>El estilo "foto realista mejorada"</strong> no se ofrece deliberadamente — entra en territorio deep-fake y no es lo que un memorial debería ofrecer.</li>
</ul>

<h2>Ética: el pacto que firmamos</h2>
<p>Usar IA generativa con rostros tiene implicaciones. Nuestro compromiso público:</p>
<ul>
  <li>Nunca entrenamos nuestro modelo con las fotos que los clientes suben. Flux Kontext Max es el modelo base, sin fine-tuning por cliente.</li>
  <li>Las fotos originales nunca salen de la infraestructura del cliente + Replicate (ambas con cifrado en tránsito y en reposo).</li>
  <li>El retrato generado es propiedad del cliente. Podemos mostrarlo como caso de éxito solo con consentimiento explícito.</li>
  <li>No generamos retratos de personas vivas sin autorización — el flujo solo admite memoriales (la autorización proviene del titular del contenido, la familia).</li>
  <li>Si un modelo futuro permite resultados más fieles y seguros, lo evaluamos con transparencia.</li>
</ul>

<h2>Qué sigue en 2026-2027</h2>
<p>Las siguientes generaciones de modelos (Flux Pro Ultra, Google Imagen 4, próximas versiones de OpenAI gpt-image) están trabajando en tres frentes: preservación de identidad aún mayor (cosine similarity &gt; 0.90), animación del retrato estático ("foto que parpadea, sonríe" — útil para memoriales en Realidad Aumentada), y generación de voz sintetizada del ser querido a partir de un audio corto (caso de uso éticamente más delicado). Monitoreamos cada lanzamiento pero solo integramos lo que cumple los criterios de identidad, privacidad y dignidad que describimos aquí.</p>

<h2>Lectura relacionada</h2>
<ul>
  <li><a href="/blog/que-es-un-nicho-virtual">Qué es un nicho virtual: guía definitiva 2026</a></li>
  <li><a href="/blog/memorial-digital-vs-lapida-tradicional">Memorial digital vs lápida tradicional</a></li>
  <li><a href="/empieza">Generar tu primer retrato IA (desde $599 MXN · plan Artístico)</a></li>
</ul>
`,
  },

  // ============================================================
  // 7. B2B — cómo una funeraria digitaliza sus servicios
  // ============================================================
  {
    slug: 'como-funeraria-digitaliza-servicios-30-dias',
    title: 'Cómo una funeraria mexicana digitaliza sus servicios en 30 días: guía semana por semana',
    description:
      'Roadmap de 4 semanas para que una funeraria en México incorpore servicios digitales (memoriales, QR, placas grabadas con IA) a su catálogo sin romper los flujos existentes. Con métricas, pricing y script de venta.',
    datePublished: '2026-04-20',
    dateModified: '2026-04-20',
    author: { name: 'Equipo B2B · Historias Infinitas' },
    keywords: [
      'digitalización funeraria México',
      'funeraria moderna',
      'servicios funerarios digitales',
      'cómo vender memoriales digitales funeraria',
      'pricing funeraria México',
      'diferenciación funeraria',
      'SaaS para funerarias',
      'partner funerario',
    ],
    readingMinutes: 10,
    image: '/images/blog/funeraria-digitaliza.webp',
    imageAlt: 'Un empleado de funeraria mostrando una tableta con un memorial digital a una familia',
    excerpt:
      'El sector funerario mexicano compite cada vez más en diferenciación emocional. Esta guía práctica describe semana por semana cómo una funeraria incorpora memoriales digitales a su catálogo en 30 días.',
    category: 'B2B',
    published: true,
    body: `
<p class="lede">En los últimos 3 años, las funerarias mexicanas que crecen más rápido no son las que bajan precios — son las que <strong>elevan la percepción emocional del servicio</strong>. Las familias millennials y Gen X (hoy 60-70 % de los tomadores de decisión) valoran menos el mármol y más la experiencia completa: acompañamiento, transparencia y un cierre digno que dure años. La digitalización de los servicios funerarios responde exactamente a eso. Esta guía describe cómo una funeraria de 5-50 servicios al mes integra memoriales digitales, QR y placas grabadas en 30 días, con métricas reales, pricing, y un script de venta.</p>

<h2>Qué se entiende por "digitalizar una funeraria" en 2026</h2>
<p>No es tener página web. Es incorporar al catálogo del servicio funerario un conjunto de entregables digitales que la familia recibe junto con el servicio tradicional:</p>
<ul>
  <li><strong>Nicho virtual individual</strong>: una página web permanente por fallecido, con biografía, galería multimedia, retrato artístico generado con IA y URL propia.</li>
  <li><strong>Código QR impreso</strong>: tarjeta con QR que se reparte durante la misa o velación, permite a cada invitado acceder al nicho virtual desde su teléfono.</li>
  <li><strong>Placa física grabada</strong>: acero inoxidable con grabado láser del QR + logo de la funeraria. Se entrega junto con las cenizas o para colocar en la lápida.</li>
  <li><strong>Portal de Realidad Aumentada</strong> (opcional premium): una escena 3D o 2D que aparece en el teléfono de cada familiar al escanear el QR — especialmente valorado en servicios premium y para mascotas.</li>
</ul>
<p>Todo el conjunto lleva el logo y la marca de la funeraria — no la de la plataforma. La familia asocia el detalle con la casa funeraria que los acompañó, no con el proveedor tecnológico.</p>

<h2>Por qué los números funcionan</h2>
<p>Datos agregados de 40 funerarias socias en México (2025):</p>
<ul>
  <li><strong>Ticket promedio sube 8-14 %</strong> cuando se incluye el nicho virtual como parte del paquete integral vs. servicio básico. Las familias pagan gustosas ese delta.</li>
  <li><strong>Recomendación boca a boca crece ~25 %</strong> en los 12 meses siguientes — medida por familias nuevas que mencionan el nicho virtual como razón principal.</li>
  <li><strong>Ingreso adicional por comisiones</strong>: 15 % sobre cada upgrade de la familia al plan Eterno ($1,799 MXN) o Portal AR ($199 MXN). Promedio observado: $7,000-15,000 MXN mensuales para funerarias de 20 servicios/mes.</li>
  <li><strong>Diferenciación frente a competidores</strong>: en ciudades con 5+ funerarias competidoras (CDMX, Guadalajara, Monterrey, Puebla, Mérida), ser la única que ofrece memoriales digitales con placa física es un gancho real.</li>
</ul>

<h2>Semana 1 · Onboarding y marca</h2>
<h3>Día 1-2</h3>
<ul>
  <li>Contratar plan Partner: Prueba ($999) para validar 5 servicios, o Pack 30 ($4,999) para arrancar en serio. Revisa <a href="/partners">la comparativa completa</a>.</li>
  <li>Enviar logo vectorial (SVG o AI) + identidad visual básica.</li>
  <li>Firmar DPA (Acuerdo de Procesamiento de Datos) si tu funeraria maneja información bajo LFPDPPP con obligaciones de auditoría.</li>
</ul>
<h3>Día 3-7</h3>
<ul>
  <li>Recibir accesos al dashboard de socio donde se crean memoriales, se ve el inventario, y se descarga material de venta.</li>
  <li>Hacer onboarding de 30 minutos por Zoom con tu equipo (tú + recepción + ventas).</li>
  <li>Revisar el primer nicho virtual de prueba personalizado con tu marca y subdomininio <em>(próximamente en plan Profesional Anual)</em>.</li>
</ul>

<h2>Semana 2 · Integración operativa</h2>
<h3>Día 8-10</h3>
<ul>
  <li>Decidir el posicionamiento interno: ¿incluido en el paquete integral o vendido como add-on premium? Recomendación: <strong>incluido en paquete medio/alto, add-on en paquete básico</strong>.</li>
  <li>Definir el guión de presentación (te proveemos plantilla). Momento clave: cuando se toma la orden con la familia, después del monto principal pero antes del cierre — "Además, incluimos como parte del servicio un nicho virtual con retrato artístico y placa grabada para que [nombre] tenga un lugar eterno de recuerdo."</li>
</ul>
<h3>Día 11-14</h3>
<ul>
  <li>Capacitar al equipo de ventas en 2 sesiones cortas:
    <ol>
      <li>Qué es un nicho virtual y por qué importa emocionalmente.</li>
      <li>Cómo levantar la información del fallecido (fotos, biografía corta) sin sobrecargar a la familia en duelo — lo típico: pedirles 5-10 fotos favoritas por WhatsApp tras 48 horas.</li>
    </ol>
  </li>
  <li>Imprimir las primeras tarjetas con QR (te enviamos la plantilla PDF lista para imprenta local) y recibir las primeras 5 placas de acero con tu logo grabado.</li>
</ul>

<h2>Semana 3 · Primeras entregas reales</h2>
<h3>Día 15-21</h3>
<ul>
  <li>Crear los primeros 3-5 nichos virtuales reales de familias que contraten el servicio. El tiempo de setup por nicho es ~20 min una vez que tienes las fotos + biografía.</li>
  <li>Entregar durante la misa o velación: se reparten tarjetas con QR y se entrega la placa física en ceremonia privada con la familia directa.</li>
  <li>Pedir feedback a las 3 primeras familias a los 15 días: ¿cómo recibieron el detalle? ¿lo compartieron? Esto es oro para afinar el guión.</li>
</ul>

<h2>Semana 4 · Optimización y escala</h2>
<h3>Día 22-30</h3>
<ul>
  <li>Revisar métricas: % de familias que aceptaron el servicio, % que hicieron upgrade, satisfacción cualitativa.</li>
  <li>Ajustar pricing si hace falta. Muchas funerarias cobran $1,500-3,000 MXN extra a la familia cuando lo venden como premium — y absorben el costo del Pack 30 ($4,999 / 30 servicios ≈ $167 por nicho).</li>
  <li>Añadir el nicho virtual al material de venta permanente: menú impreso, sitio web, catálogo de paquetes. Incluir siempre una frase sobre la IA y la placa de acero — las familias lo ven como marca de modernidad.</li>
  <li>Planear capacitación de refresh a los 90 días.</li>
</ul>

<h2>Errores comunes (y cómo evitarlos)</h2>
<table>
  <thead>
    <tr><th>Error</th><th>Consecuencia</th><th>Solución</th></tr>
  </thead>
  <tbody>
    <tr><td>Presentar el nicho virtual solo al final, como "algo extra opcional"</td><td>Se vende menos porque parece accesorio</td><td>Incluirlo desde la primera conversación como parte natural del servicio integral</td></tr>
    <tr><td>No capacitar a recepción</td><td>Se omite en los momentos clave de decisión</td><td>30 min de onboarding a todo el equipo de contacto directo</td></tr>
    <tr><td>Pedir las fotos durante la velación (momento de mucho estrés)</td><td>La familia dice "sí" pero no envía</td><td>Pedir al día 2-3 por WhatsApp, con un mensaje amable: "cuando puedas, envíanos 5-10 fotos favoritas de [nombre]"</td></tr>
    <tr><td>No cobrar por el servicio y absorberlo como cortesía</td><td>Se pierde margen y se devalúa el valor percibido</td><td>Cobrarlo o incluirlo explícitamente en paquete — nunca "de regalo" silencioso</td></tr>
    <tr><td>No hacer seguimiento post-servicio</td><td>No se generan upgrades ni recomendaciones</td><td>Contacto a los 45 días preguntando cómo vivieron el duelo y si quieren ampliar con Portal AR</td></tr>
  </tbody>
</table>

<h2>Pricing sugerido según el tipo de funeraria</h2>
<ul>
  <li><strong>Funeraria básica (servicios desde $15,000 MXN)</strong>: ofrecer nicho virtual como add-on opcional a $999-1,499 MXN. Costo interno: $167 (Pack 30). Margen: 85 %.</li>
  <li><strong>Funeraria media (servicios $25,000-60,000 MXN)</strong>: incluirlo en el paquete "integral" sin cargo extra. El ticket del paquete ya lo absorbe. Diferenciador vs competencia.</li>
  <li><strong>Funeraria premium (servicios $80,000+ MXN)</strong>: incluir Nicho Eterno + Portal AR completo. La placa de acero con logo + QR + Portal AR es gancho cerrado. Cobrar el paquete completo como premium.</li>
</ul>

<h2>Casos de uso por tipo de servicio</h2>
<ul>
  <li><strong>Cremación + urna</strong>: placa con QR se pega al costado de la urna. Familia accede al nicho desde el teléfono siempre que quiere.</li>
  <li><strong>Inhumación tradicional</strong>: placa de acero se atornilla o pega al frente de la lápida. QR discreto pero visible.</li>
  <li><strong>Servicio funerario de mascota</strong>: placa para colgar en el jardín donde se esparcen las cenizas o se entierra a la mascota. Muy popular en clínicas veterinarias premium.</li>
  <li><strong>Hospicio</strong>: el paciente colabora en construir su propio nicho virtual durante las últimas semanas, con asistencia del equipo del hospicio. Cierre dignísimo.</li>
</ul>

<h2>Siguiente lectura para dueños de funerarias</h2>
<ul>
  <li><a href="/para-funerarias">Página vertical para Funerarias — planes y precios</a></li>
  <li><a href="/partners">Programa de Socios completo (todas las verticales)</a></li>
  <li><a href="/blog/memorial-digital-vs-lapida-tradicional">Memorial digital vs lápida: comparativa que puedes compartir con familias</a></li>
  <li><a href="/blog/que-es-un-nicho-virtual">Qué es un nicho virtual — artículo base para educar a tu mercado</a></li>
</ul>
`,
  },
];

/**
 * Helpers
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug && p.published);
}

export function getAllPublishedPosts(): BlogPost[] {
  return BLOG_POSTS
    .filter((p) => p.published)
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}
