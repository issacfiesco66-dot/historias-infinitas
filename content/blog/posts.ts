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
