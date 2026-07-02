import * as React from 'react';

// Mail interno para avisarle a Jazmín cuando se confirma una venta.
export const NewSaleAdminEmail = ({ customerName, customerEmail, customerPhone, orderId, total }: any) => (
  <div style={{ fontFamily: 'sans-serif', padding: '24px', color: '#000', maxWidth: '480px' }}>
    <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
      Muska · Panel de ventas
    </p>
    <h1 style={{ fontSize: '26px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-1px', margin: '8px 0 6px' }}>
      ¡Nueva venta! 🎉
    </h1>
    <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.5 }}>
      Jazmín, acabás de vender. Un cliente completó su compra y el pago ya está confirmado.
      Acá tenés todos los datos:
    </p>

    <div style={{ border: '1px solid #eee', borderLeft: '4px solid #000', padding: '20px', margin: '22px 0' }}>
      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px' }}>Cliente</p>
      <p style={{ fontSize: '17px', fontWeight: 'bold', margin: '0 0 14px' }}>{customerName}</p>

      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px' }}>Email</p>
      <p style={{ fontSize: '14px', margin: '0 0 14px' }}>
        <a href={`mailto:${customerEmail}`} style={{ color: '#000', fontWeight: 'bold' }}>{customerEmail}</a>
      </p>

      {customerPhone && (
        <>
          <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px' }}>Teléfono</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 14px' }}>{customerPhone}</p>
        </>
      )}

      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px' }}>ID de seguimiento</p>
      <p style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', margin: '0 0 14px' }}>{orderId}</p>

      <p style={{ fontSize: '9px', fontWeight: 'bold', color: '#999', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 2px' }}>Total</p>
      <p style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>${total}</p>
    </div>

    <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>
      Ya podés empezar a preparar el pedido. Cuando lo tengas listo, cambiá el estado en el panel
      y el cliente lo va a ver en tiempo real desde el seguimiento. 💛
    </p>
    <p style={{ fontSize: '9px', color: '#ccc', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '26px' }}>
      Muska — Est. 2026
    </p>
  </div>
);
