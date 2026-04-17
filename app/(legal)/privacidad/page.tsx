import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad — Historias Infinitas',
  description:
    'Aviso de privacidad integral conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.',
  alternates: { canonical: '/privacidad' },
};

const LAST_UPDATED = '17 de abril de 2026';

export default function PrivacidadPage() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <p className="meta">Última actualización · {LAST_UPDATED}</p>
      <h1>Aviso de Privacidad Integral</h1>

      <p>
        En <strong>Historias Infinitas</strong> sabemos que la información que nos
        confías es tan íntima como los recuerdos que buscas preservar. Este aviso
        explica quién la recibe, con qué fin, qué derechos tienes sobre ella y
        cómo ejercerlos, en cumplimiento de la{' '}
        <strong>Ley Federal de Protección de Datos Personales en Posesión de los
        Particulares</strong> (LFPDPPP), su Reglamento y los Lineamientos emitidos
        por el INAI.
      </p>

      <h2>1. Identidad y domicilio del responsable</h2>
      <p>
        <strong>Historias Infinitas</strong> (en adelante &ldquo;el Responsable&rdquo;),
        con razón social <strong>[RAZÓN SOCIAL, S.A. DE C.V.]</strong>, RFC{' '}
        <strong>[RFC]</strong> y domicilio en <strong>[CALLE, NÚMERO, COLONIA,
        ALCALDÍA/MUNICIPIO, ESTADO, CÓDIGO POSTAL, MÉXICO]</strong>, es el
        responsable del tratamiento de tus datos personales.
      </p>
      <p>
        Para cualquier cuestión relacionada con este aviso, puedes escribirnos a:
        <br />
        Correo: <a href="mailto:privacidad@historias-infinitas.com">privacidad@historias-infinitas.com</a>
        <br />
        Teléfono: <strong>[+52 …]</strong>
      </p>

      <h2>2. Datos personales que recabamos</h2>
      <p>Para prestar nuestros servicios, recabamos los siguientes datos:</p>
      <ul>
        <li>
          <strong>Datos de identificación y contacto:</strong> nombre completo,
          correo electrónico, teléfono y — si adquieres el plan Eterno — domicilio
          de envío.
        </li>
        <li>
          <strong>Datos del ser querido o mascota homenajeado:</strong> nombre,
          fechas de nacimiento y trascendencia, biografía, epitafio, fotografías
          y videos que cargues voluntariamente.
        </li>
        <li>
          <strong>Datos de facturación:</strong> los estrictamente necesarios para
          emitir tu comprobante fiscal. Los datos de tarjeta NO los almacenamos;
          son procesados directamente por Stripe Inc.
        </li>
        <li>
          <strong>Datos de navegación:</strong> dirección IP, tipo de navegador,
          páginas visitadas y tiempo de permanencia, vía cookies propias y de
          terceros.
        </li>
      </ul>
      <p>
        <strong>Datos sensibles:</strong> no recabamos datos sensibles en el
        sentido del Art. 3 fracción VI de la LFPDPPP. Las fotografías de personas
        fallecidas que cargues se tratan con la máxima reserva y únicamente para
        las finalidades aquí descritas.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <h3>Finalidades primarias — necesarias para prestar el servicio</h3>
      <ul>
        <li>Crear y mantener tu cuenta de usuario.</li>
        <li>
          Alojar el memorial digital, generar su URL única, su código QR y, en
          su caso, el retrato con Inteligencia Artificial.
        </li>
        <li>Procesar pagos y emitir comprobantes fiscales.</li>
        <li>
          Si adquieres el plan Eterno, producir y enviar la placa física con el
          QR grabado al domicilio que nos indiques.
        </li>
        <li>Brindar soporte y responder a tus solicitudes.</li>
        <li>Cumplir obligaciones legales, fiscales y contables.</li>
      </ul>

      <h3>Finalidades secundarias — requieren tu consentimiento</h3>
      <ul>
        <li>Enviar comunicaciones sobre novedades y funciones de la plataforma.</li>
        <li>
          Realizar encuestas de calidad y mejora del servicio mediante análisis
          agregado.
        </li>
      </ul>
      <p>
        Si no deseas que tus datos se traten para las finalidades secundarias,
        puedes manifestarlo respondiendo a este aviso en{' '}
        <a href="mailto:privacidad@historias-infinitas.com">
          privacidad@historias-infinitas.com
        </a>
        . La negativa no será motivo para negarte el servicio contratado.
      </p>

      <h2>4. Derechos ARCO y revocación del consentimiento</h2>
      <p>
        Tienes derecho a <strong>A</strong>cceder a tus datos, <strong>R</strong>
        ectificarlos cuando sean inexactos,{' '}
        <strong>C</strong>ancelarlos cuando consideres que no están siendo tratados
        conforme a los principios y deberes legales, y{' '}
        <strong>O</strong>ponerte al uso de los mismos para fines específicos, así
        como revocar el consentimiento que nos hayas otorgado.
      </p>
      <p>
        Para ejercerlos, envía tu solicitud a{' '}
        <a href="mailto:privacidad@historias-infinitas.com">
          privacidad@historias-infinitas.com
        </a>{' '}
        incluyendo:
      </p>
      <ol>
        <li>Nombre completo y correo con el que te registraste.</li>
        <li>Descripción clara del derecho que deseas ejercer.</li>
        <li>
          Copia de identificación oficial vigente (INE, pasaporte o similar) —
          la eliminaremos una vez atendida tu solicitud.
        </li>
        <li>
          Documento que acredite la representación, si actúas a nombre de otra
          persona.
        </li>
      </ol>
      <p>
        Responderemos en un plazo máximo de <strong>20 días hábiles</strong>{' '}
        siguientes a la recepción de la solicitud (Art. 32 LFPDPPP), prorrogables
        por única vez por otros 20 días cuando el caso lo amerite. El ejercicio de
        estos derechos es gratuito, salvo los costos justificados de envío o
        reproducción.
      </p>

      <h2>5. Transferencias de datos</h2>
      <p>
        Transferimos datos personales exclusivamente a los siguientes terceros,
        en términos del Art. 37 LFPDPPP, para ejecutar el servicio que nos
        contrataste:
      </p>
      <ul>
        <li>
          <strong>Stripe Inc.</strong> (EE. UU.) — procesamiento de pagos con
          tarjeta. Cumple con los estándares PCI-DSS nivel 1.
        </li>
        <li>
          <strong>Supabase Inc.</strong> (EE. UU.) — alojamiento de la base de
          datos y archivos multimedia.
        </li>
        <li>
          <strong>Replicate, Inc.</strong> (EE. UU.) — generación de retratos con
          Inteligencia Artificial (proveedor del modelo Flux Kontext).
        </li>
        <li>
          <strong>Resend</strong> (EE. UU.) — envío de correos transaccionales.
        </li>
        <li>
          <strong>Vercel Inc.</strong> (EE. UU.) — alojamiento de la aplicación.
        </li>
        <li>
          <strong>Autoridades competentes</strong> cuando medie requerimiento
          fundado y motivado.
        </li>
      </ul>
      <p>
        Salvo estas transferencias, <strong>no cedemos, vendemos ni rentamos</strong>{' '}
        tus datos personales a terceros.
      </p>

      <h2>6. Seguridad y conservación</h2>
      <p>
        Implementamos medidas de seguridad administrativas, técnicas y físicas
        razonables para proteger tus datos contra accesos no autorizados,
        alteración, pérdida o destrucción, incluyendo cifrado en tránsito (TLS) y
        en reposo, control de accesos basado en roles y registros de auditoría.
      </p>
      <p>
        Conservamos tus datos mientras mantengas tu cuenta activa y por un plazo
        adicional razonable para cumplir obligaciones fiscales (5 años, conforme
        al Código Fiscal de la Federación) y atender posibles controversias.
        Transcurrido dicho plazo, tus datos se bloquean y posteriormente se
        suprimen.
      </p>

      <h2>7. Uso de cookies y tecnologías similares</h2>
      <p>
        Utilizamos cookies estrictamente necesarias para el funcionamiento del
        sitio (sesión, preferencias) y cookies de análisis agregado para entender
        el desempeño de la plataforma. Puedes deshabilitarlas desde tu navegador
        en cualquier momento; algunas funciones pueden verse afectadas.
      </p>

      <h2>8. Instituto y autoridad</h2>
      <p>
        Si consideras que tu derecho a la protección de datos ha sido vulnerado,
        puedes presentar una denuncia ante el{' '}
        <strong>Instituto Nacional de Transparencia, Acceso a la Información y
        Protección de Datos Personales (INAI)</strong> en{' '}
        <a href="https://home.inai.org.mx/" target="_blank" rel="noreferrer">
          home.inai.org.mx
        </a>
        .
      </p>

      <h2>9. Cambios al aviso de privacidad</h2>
      <p>
        Este aviso puede actualizarse para reflejar cambios legales, operativos
        o tecnológicos. Publicaremos cualquier modificación en esta misma URL y
        actualizaremos la fecha al inicio del documento. Te recomendamos
        revisarlo periódicamente.
      </p>

      <hr className="my-10 border-pizarra-100" />
      <p className="text-sm text-pizarra-500">
        Al registrarte o utilizar nuestros servicios manifiestas haber leído y
        aceptado los términos de este Aviso de Privacidad.
      </p>
    </article>
  );
}
