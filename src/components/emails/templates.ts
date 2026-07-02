// Plantillas de email como HTML puro (string), para enviarlas con `html:` de Resend.
// Evita depender de @react-email/render (que resend necesita para `react:` y no está instalado).

const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );

export function orderConfirmationHtml({ customerName, orderId, total, trackingUrl, intro }: any) {
  const button = trackingUrl
    ? `<a href="${esc(trackingUrl)}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 24px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-top:10px">Seguí tu pedido</a>`
    : '';
  return `
  <div style="font-family:sans-serif;padding:20px;color:#000">
    <h1 style="font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:2px">MUSKA.</h1>
    <p>¡Hola, ${esc(customerName)}!</p>
    <p>${esc(intro || 'Tu pago ha sido confirmado con éxito. Ya estamos preparando tu pedido.')}</p>
    <div style="border:1px solid #eee;padding:15px;margin:20px 0">
      <p style="font-size:10px;font-weight:bold;color:#999;margin:0">ID DE SEGUIMIENTO</p>
      <p style="font-size:16px;font-weight:bold;letter-spacing:1px">${esc(orderId)}</p>
      <p style="font-size:10px;font-weight:bold;color:#999;margin:10px 0 0 0">TOTAL</p>
      <p style="font-size:14px;font-weight:bold">$${esc(total)}</p>
    </div>
    <p style="font-size:12px">Guardá este ID: con él podés seguir el estado de tu pedido cuando quieras.</p>
    ${button}
  </div>`;
}

export function newSaleAdminHtml({ customerName, customerEmail, customerPhone, orderId, total }: any) {
  const phoneBlock = customerPhone
    ? `<p style="font-size:9px;font-weight:bold;color:#999;letter-spacing:1px;text-transform:uppercase;margin:0 0 2px">Teléfono</p>
       <p style="font-size:14px;font-weight:bold;margin:0 0 14px">${esc(customerPhone)}</p>`
    : '';
  return `
  <div style="font-family:sans-serif;padding:24px;color:#000;max-width:480px">
    <p style="font-size:10px;font-weight:bold;color:#999;letter-spacing:2px;text-transform:uppercase;margin:0">Muska · Panel de ventas</p>
    <h1 style="font-size:26px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-1px;margin:8px 0 6px">¡Nueva venta! 🎉</h1>
    <p style="font-size:14px;color:#444;line-height:1.5">Jazmín, acabás de vender. Un cliente completó su compra y el pago ya está confirmado. Acá tenés todos los datos:</p>
    <div style="border:1px solid #eee;border-left:4px solid #000;padding:20px;margin:22px 0">
      <p style="font-size:9px;font-weight:bold;color:#999;letter-spacing:1px;text-transform:uppercase;margin:0 0 2px">Cliente</p>
      <p style="font-size:17px;font-weight:bold;margin:0 0 14px">${esc(customerName)}</p>
      <p style="font-size:9px;font-weight:bold;color:#999;letter-spacing:1px;text-transform:uppercase;margin:0 0 2px">Email</p>
      <p style="font-size:14px;margin:0 0 14px"><a href="mailto:${esc(customerEmail)}" style="color:#000;font-weight:bold">${esc(customerEmail)}</a></p>
      ${phoneBlock}
      <p style="font-size:9px;font-weight:bold;color:#999;letter-spacing:1px;text-transform:uppercase;margin:0 0 2px">ID de seguimiento</p>
      <p style="font-size:14px;font-weight:bold;letter-spacing:1px;margin:0 0 14px">${esc(orderId)}</p>
      <p style="font-size:9px;font-weight:bold;color:#999;letter-spacing:1px;text-transform:uppercase;margin:0 0 2px">Total</p>
      <p style="font-size:20px;font-weight:900;margin:0">$${esc(total)}</p>
    </div>
    <p style="font-size:13px;color:#444;line-height:1.5">Ya podés empezar a preparar el pedido. Cuando lo tengas listo, cambiá el estado en el panel y el cliente lo va a ver en tiempo real desde el seguimiento. 💛</p>
    <p style="font-size:9px;color:#ccc;text-transform:uppercase;letter-spacing:2px;margin-top:26px">Muska — Est. 2026</p>
  </div>`;
}
