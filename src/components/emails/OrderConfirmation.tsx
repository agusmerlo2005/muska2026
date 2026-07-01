import * as React from 'react';

export const OrderConfirmationEmail = ({ customerName, orderId, total, trackingUrl, intro }: any) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#000' }}>
    <h1 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>MUSKA.</h1>
    <p>¡Hola, {customerName}!</p>
    <p>{intro || 'Tu pago ha sido confirmado con éxito. Ya estamos preparando tu pedido.'}</p>
    <div style={{ border: '1px solid #eee', padding: '15px', margin: '20px 0' }}>
      <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', margin: '0' }}>ID DE SEGUIMIENTO</p>
      <p style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>{orderId}</p>
      <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', margin: '10px 0 0 0' }}>TOTAL</p>
      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>${total}</p>
    </div>
    <p style={{ fontSize: '12px' }}>Guardá este ID: con él podés seguir el estado de tu pedido cuando quieras.</p>
    {trackingUrl && (
      <a
        href={trackingUrl}
        style={{
          display: 'inline-block',
          background: '#000',
          color: '#fff',
          textDecoration: 'none',
          padding: '12px 24px',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginTop: '10px',
        }}
      >
        Seguí tu pedido
      </a>
    )}
  </div>
);
