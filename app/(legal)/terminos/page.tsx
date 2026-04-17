import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Historias Infinitas',
  description:
    'Términos y condiciones de uso del servicio Historias Infinitas, conforme a la legislación mexicana aplicable (Código de Comercio, LFPC, LFDA).',
  alternates: { canonical: '/terminos' },
};

const LAST_UPDATED = '17 de abril de 2026';

export default function TerminosPage() {
  return (
    <article className="prose-legal mx-auto max-w-3xl">
      <p className="meta">Última actualización · {LAST_UPDATED}</p>
      <h1>Términos y Condiciones</h1>

      <p>
        Estos Términos y Condiciones (en adelante &ldquo;los Términos&rdquo;) rigen
        el uso del sitio web <strong>historias-infinitas.com</strong> y los
        servicios que se prestan a través de él. Al registrarte o contratar
        cualquiera de nuestros planes declaras haberlos leído, comprendido y
        aceptado íntegramente.
      </p>

      <h2>1. Identificación del proveedor</h2>
      <p>
        <strong>[RAZÓN SOCIAL, S.A. DE C.V.]</strong>, en adelante
        &ldquo;Historias Infinitas&rdquo;, con RFC <strong>[RFC]</strong> y
        domicilio en <strong>[DOMICILIO FISCAL COMPLETO]</strong>, es quien
        presta los servicios descritos aquí.
        <br />
        Contacto: <a href="mailto:hola@historias-infinitas.com">
          hola@historias-infinitas.com
        </a>
      </p>

      <h2>2. Descripción del servicio</h2>
      <p>
        Historias Infinitas es una plataforma que te permite crear un{' '}
        <strong>memorial digital</strong> para un ser querido o una mascota, con
        biografía, fotografías, videos, un retrato generado por Inteligencia
        Artificial y, opcionalmente, un portal de Realidad Aumentada. Cada
        memorial se asocia a una <strong>URL única permanente</strong> y a un
        código QR imprimible.
      </p>
      <p>Ofrecemos tres planes:</p>
      <ul>
        <li>
          <strong>Digital</strong> — memorial en línea + QR digital. Pago único.
        </li>
        <li>
          <strong>Artístico</strong> — incluye Digital + retrato IA en alta
          resolución con archivo descargable. Pago único.
        </li>
        <li>
          <strong>Eterno</strong> — incluye Artístico + placa física en acero
          inoxidable con QR grabado y envío dentro de la República Mexicana.
          Pago único.
        </li>
      </ul>
      <p>
        Opcionalmente puedes añadir el complemento <strong>Portal de Realidad
        Aumentada</strong>.
      </p>

      <h2>3. Registro y cuenta</h2>
      <p>
        Para utilizar el servicio debes crear una cuenta con un correo válido.
        Declaras ser mayor de edad (18 años o más) y tener capacidad legal para
        contratar. Eres responsable de mantener la confidencialidad de tu
        contraseña y de toda actividad realizada desde tu cuenta.
      </p>

      <h2>4. Precios, pago y facturación</h2>
      <p>
        Los precios se muestran en <strong>pesos mexicanos (MXN)</strong> e
        incluyen el IVA cuando aplica. El pago se procesa a través de{' '}
        <strong>Stripe</strong>; no almacenamos datos de tu tarjeta. Al completar
        el pago recibirás un correo de confirmación.
      </p>
      <p>
        Para emitir factura CFDI, solicítala al correo{' '}
        <a href="mailto:facturacion@historias-infinitas.com">
          facturacion@historias-infinitas.com
        </a>{' '}
        <strong>dentro del mes calendario en que realizaste el pago</strong>,
        proporcionando tu Constancia de Situación Fiscal y uso de CFDI.
      </p>

      <h2>5. Activación del memorial</h2>
      <p>
        El memorial permanece en <strong>modo borrador privado</strong> hasta
        que se completa el pago. A partir de la confirmación del pago, el
        memorial se activa y su URL pública y QR quedan disponibles de forma
        permanente, sujeto al cumplimiento continuo de estos Términos.
      </p>

      <h2>6. Derecho de cancelación y reembolsos</h2>
      <p>
        De conformidad con el artículo <strong>56 de la Ley Federal de
        Protección al Consumidor</strong>, tienes derecho a cancelar tu compra
        dentro de los <strong>cinco (5) días hábiles</strong> siguientes al
        pago, sin responsabilidad alguna, siempre que:
      </p>
      <ul>
        <li>No hayamos generado aún el retrato con IA, y</li>
        <li>
          En el caso del plan Eterno, la placa física no haya sido enviada a
          producción.
        </li>
      </ul>
      <p>
        Una vez generado el retrato o iniciada la producción de la placa, la
        compra se considera ejecutada y no procede reembolso, salvo lo previsto
        en nuestra <strong>garantía de satisfacción</strong>: si el retrato IA
        no captura fielmente la esencia del ser querido, lo regeneraremos sin
        costo adicional hasta alcanzar un resultado satisfactorio.
      </p>
      <p>
        Para solicitar cancelación o reembolso escribe a{' '}
        <a href="mailto:hola@historias-infinitas.com">
          hola@historias-infinitas.com
        </a>{' '}
        con el número de orden.
      </p>

      <h2>7. Envío del plan Eterno</h2>
      <p>
        La placa física del plan Eterno se envía dentro de la República Mexicana
        en un plazo estimado de <strong>10 a 21 días hábiles</strong> desde la
        confirmación del pago. Te notificaremos por correo cuando salga del
        taller, con el número de guía de la paquetería. Los tiempos de entrega
        pueden variar por causas ajenas a nosotros (clima, aduanas, huelgas,
        etc.).
      </p>

      <h2>8. Contenido del usuario y licencia</h2>
      <p>
        Eres propietario de las fotografías, videos y textos que subes. Al
        cargarlos nos otorgas una licencia <strong>limitada, no exclusiva, libre
        de regalías y revocable</strong> para procesarlos, alojarlos, mostrarlos
        en la URL pública del memorial y —cuando el plan lo incluya— generar el
        retrato IA derivado. Esta licencia termina al eliminar el memorial.
      </p>
      <p>Al cargar contenido garantizas que:</p>
      <ul>
        <li>
          Eres titular de los derechos o cuentas con autorización para su uso.
        </li>
        <li>
          Cuentas con el consentimiento de las personas identificables que
          aparezcan en el contenido (o de sus deudos, cuando proceda).
        </li>
        <li>
          El contenido no viola derechos de autor, marca, honor, vida privada o
          imagen de terceros.
        </li>
      </ul>

      <h2>9. Usos prohibidos</h2>
      <p>No puedes utilizar la plataforma para:</p>
      <ul>
        <li>Publicar contenido ilícito, ofensivo, difamatorio o que incite al odio.</li>
        <li>Suplantar la identidad de terceros o de personas fallecidas sin autorización.</li>
        <li>
          Distribuir software malicioso, realizar ingeniería inversa o intentar
          vulnerar nuestros sistemas.
        </li>
        <li>Explotar el servicio con fines comerciales no autorizados.</li>
      </ul>
      <p>
        Nos reservamos el derecho de suspender o cerrar cuentas que incumplan
        estas reglas, previa notificación razonable salvo en casos de urgencia.
      </p>

      <h2>10. Propiedad intelectual</h2>
      <p>
        La marca &ldquo;Historias Infinitas&rdquo;, el logotipo, el diseño del
        sitio, el código fuente y los textos institucionales son propiedad de
        Historias Infinitas o de sus licenciantes, protegidos por la{' '}
        <strong>Ley Federal del Derecho de Autor</strong> y la{' '}
        <strong>Ley Federal de Protección a la Propiedad Industrial</strong>.
        Queda prohibida su reproducción total o parcial sin autorización escrita.
      </p>

      <h2>11. Retratos generados con IA</h2>
      <p>
        Los retratos se generan con el modelo de terceros &ldquo;Flux
        Kontext&rdquo; (Black Forest Labs) a través de Replicate, Inc. El
        resultado es una interpretación artística; aunque priorizamos la
        preservación de identidad, no garantizamos una fidelidad absoluta
        respecto a la fotografía original.
      </p>

      <h2>12. Disponibilidad y hosting &ldquo;eterno&rdquo;</h2>
      <p>
        Nos esforzamos por mantener el servicio disponible las 24 horas, los 365
        días del año. El compromiso de hosting &ldquo;eterno&rdquo; de los
        memoriales significa que destinaremos los recursos razonables a
        preservarlos mientras exista Historias Infinitas. En caso de cese de
        operaciones daremos aviso con un mínimo de <strong>90 días</strong> y te
        proporcionaremos una exportación de tus datos.
      </p>

      <h2>13. Limitación de responsabilidad</h2>
      <p>
        En la máxima medida permitida por la ley, la responsabilidad de
        Historias Infinitas por cualquier reclamación relacionada con el
        servicio se limita al importe efectivamente pagado por ti en los últimos
        doce (12) meses. No somos responsables por daños indirectos, incidentales
        o consecuenciales, ni por la pérdida de contenido derivada de causas
        ajenas a nuestro control.
      </p>

      <h2>14. Modificaciones</h2>
      <p>
        Podemos actualizar estos Términos para reflejar cambios legales,
        operativos o de producto. Publicaremos la nueva versión en esta URL y
        actualizaremos la fecha. Si el cambio es sustancial te lo notificaremos
        por correo con al menos <strong>30 días</strong> de anticipación.
      </p>

      <h2>15. Ley aplicable y jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes federales de los{' '}
        <strong>Estados Unidos Mexicanos</strong>. Cualquier controversia se
        someterá a la competencia de los tribunales de{' '}
        <strong>[CIUDAD / ENTIDAD FEDERATIVA]</strong>, renunciando las partes a
        cualquier otro fuero que pudiera corresponderles.
      </p>
      <p>
        Como consumidor, conservas el derecho a acudir ante la Procuraduría
        Federal del Consumidor (<strong>PROFECO</strong>) para la solución de
        controversias derivadas de esta relación.
      </p>

      <h2>16. Contacto</h2>
      <p>
        Para dudas sobre estos Términos escríbenos a{' '}
        <a href="mailto:hola@historias-infinitas.com">
          hola@historias-infinitas.com
        </a>
        {' '}o visita{' '}
        <a href="/contacto">nuestra página de contacto</a>.
      </p>
    </article>
  );
}
