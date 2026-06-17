interface WelcomeEmailProps {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <table style={{ width: "100%", maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <tr>
        <td style={{ padding: 40, textAlign: "center", backgroundColor: "#4f46e5" }}>
          <h1 style={{ color: "#fff", margin: 0, fontSize: 28 }}>Shopfinity</h1>
        </td>
      </tr>
      <tr>
        <td style={{ padding: 40, backgroundColor: "#ffffff" }}>
          <h2 style={{ color: "#111", margin: "0 0 16px" }}>Welcome, {name}!</h2>
          <p style={{ color: "#555", lineHeight: 1.6, margin: "0 0 24px" }}>
            Thank you for creating an account with Shopfinity. You now have access to
            exclusive deals, personalized recommendations, and a seamless shopping experience.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_APP_URL + "/products"}
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
            Start Shopping
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
