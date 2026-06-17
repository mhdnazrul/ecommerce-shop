interface OrderConfirmationEmailProps {
  name: string
  orderNumber: string
  totalAmount: number
  items: { name: string; quantity: number; price: number }[]
}

export function OrderConfirmationEmail({ name, orderNumber, totalAmount, items }: OrderConfirmationEmailProps) {
  return (
    <table style={{ width: "100%", maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <tr>
        <td style={{ padding: 40, textAlign: "center", backgroundColor: "#4f46e5" }}>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 28 }}>Order Confirmed</h1>
        </td>
      </tr>
      <tr>
        <td style={{ padding: 40, backgroundColor: "#ffffff" }}>
          <h2 style={{ color: "#111", margin: "0 0 8px" }}>Thank you, {name}!</h2>
          <p style={{ color: "#555", margin: "0 0 24px" }}>
            Your order <strong>{orderNumber}</strong> has been placed successfully.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: 12, textAlign: "left", color: "#555", fontSize: 14, borderBottom: "2px solid #e5e7eb" }}>Item</th>
                <th style={{ padding: 12, textAlign: "center", color: "#555", fontSize: 14, borderBottom: "2px solid #e5e7eb" }}>Qty</th>
                <th style={{ padding: 12, textAlign: "right", color: "#555", fontSize: 14, borderBottom: "2px solid #e5e7eb" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#333" }}>{item.name}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #f3f4f6", color: "#555" }}>{item.quantity}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #f3f4f6", color: "#333" }}>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#111", borderTop: "2px solid #e5e7eb" }}>Total</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#111", borderTop: "2px solid #e5e7eb" }}>${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <a
            href={process.env.NEXT_PUBLIC_APP_URL + "/orders"}
            style={{
              display: "inline-block",
              padding: "12px 32px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            View Order
          </a>
        </td>
      </tr>
      <tr>
        <td style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 12 }}>
          &copy; 2026 Shopfinity. All rights reserved.
        </td>
      </tr>
    </table>
  )
}
