import * as React from 'react';

export const OrderConfirmationEmail = ({ customerName, orderId, total }: any) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#000' }}>
    <h1 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>MUSKA.</h1>
    <p>¡Hola, {customerName}!</p>
    <p>Tu pago ha sido confirmado con éxito. Ya estamos preparando tu pedido.</p>
    <div style={{ border: '1px solid #eee', padding: '15px', margin: '20px 0' }}>
      <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', margin: '0' }}>ID DEL PEDIDO</p>
      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{orderId}</p>
      <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#999', margin: '10px 0 0 0' }}>TOTAL</p>
      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>${total}</p>
    </div>
    <p style={{ fontSize: '12px' }}>Podés seguir tu pedido desde nuestra web con tu ID.</p>
  </div>
);