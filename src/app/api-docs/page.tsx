/**
 * API Documentation Page
 * Static documentation for the QRIS Payment Gateway API
 */
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QP</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              QRIS Payment Gateway API
            </h1>
          </div>
          <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full font-medium text-blue-600">
            v1.0.0
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This API allows you to interact with the QRIS Payment Gateway
            powered by Qiospay. All API requests require authentication via JWT
            token sent in HTTP-Only cookies (automatically handled by the
            browser) or via the{" "}
            <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">
              Authorization
            </code>{" "}
            header.
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> All form submissions require a valid CSRF
              token. Fetch one from{" "}
              <code className="bg-blue-100 px-1 rounded">GET /api/csrf</code>{" "}
              before submitting any POST/PUT request.
            </p>
          </div>

          {/* Login */}
          <EndpointCard
            method="POST"
            path="/api/auth/login"
            description="Authenticate a user and receive a JWT cookie"
            requestBody={`{
  "email": "user@example.com",
  "password": "your-password",
  "csrfToken": "csrf-token-from-api"
}`}
            responseBody={`{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}`}
          />

          {/* Register */}
          <EndpointCard
            method="POST"
            path="/api/auth/register"
            description="Create a new user account"
            requestBody={`{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "min-8-chars",
  "csrfToken": "csrf-token-from-api"
}`}
            responseBody={`{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}`}
          />

          {/* Profile */}
          <EndpointCard
            method="GET"
            path="/api/auth/me"
            description="Get the authenticated user's profile and balance"
            auth
            responseBody={`{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "balance": "150000",
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}`}
          />

          {/* Logout */}
          <EndpointCard
            method="DELETE"
            path="/api/auth/me"
            description="Logout the current user (clears auth cookie)"
            auth
            responseBody={`{
  "message": "Logged out successfully"
}`}
          />
        </section>

        {/* CSRF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            CSRF Token
          </h2>
          <EndpointCard
            method="GET"
            path="/api/csrf"
            description="Get a CSRF token for form submissions. Tokens are single-use and expire after 60 minutes."
            responseBody={`{
  "csrfToken": "hex-encoded-random-token"
}`}
          />
        </section>

        {/* Deposit Tickets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Deposit Tickets
          </h2>

          <EndpointCard
            method="POST"
            path="/api/tickets"
            description="Generate a new deposit ticket. A unique code (1-999) will be appended to the amount. The ticket is valid for 10 minutes. Same amount tickets have a 3-day cooldown per user."
            auth
            requestBody={`{
  "amount": 100000,
  "csrfToken": "csrf-token-from-api"
}`}
            responseBody={`{
  "message": "Deposit ticket created successfully",
  "ticket": {
    "id": "uuid",
    "userId": "uuid",
    "amount": "100000",
    "uniqueCode": 347,
    "totalAmount": "100347",
    "status": "PENDING",
    "expiresAt": "2026-04-12T10:10:00.000Z",
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}`}
          />

          <EndpointCard
            method="GET"
            path="/api/tickets"
            description="Get all deposit tickets for the authenticated user. Expired tickets are automatically updated."
            auth
            responseBody={`{
  "tickets": [
    {
      "id": "uuid",
      "amount": "100000",
      "uniqueCode": 347,
      "totalAmount": "100347",
      "status": "PENDING",
      "refId": null,
      "expiresAt": "2026-04-12T10:10:00.000Z",
      "createdAt": "2026-04-12T10:00:00.000Z"
    }
  ]
}`}
          />
        </section>

        {/* Webhook */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Webhook (Callback)
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> This endpoint is for Qiospay server-to-server
              callbacks only. It validates the X-Signature header and source IP address.
            </p>
          </div>

          <EndpointCard
            method="POST"
            path="/api/callback/qiospay"
            description="Receive payment notification from Qiospay. Validates X-Signature and IP, then matches the payment amount to a pending deposit ticket."
            headers={[
              "X-Signature: hmac-sha256-hex-signature",
              "Content-Type: application/json",
            ]}
            requestBody={`{
  "status": "success",
  "data": {
    "amount": 100347,
    "balance": 100347,
    "fee": 0,
    "issuer": "93600535",
    "name": "senowahyu",
    "nmid": "ID2025408537103",
    "refid": "000000TL0VDN",
    "time": "2026-04-12 21:15:25",
    "type": "CR"
  }
}`}
            responseBody={`{
  "message": "Payment processed successfully",
  "ticketId": "uuid"
}`}
          />
        </section>

        {/* Settings (Admin) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Settings (Admin Only)
          </h2>

          <EndpointCard
            method="GET"
            path="/api/settings"
            description="Get all application settings. Requires ADMIN role."
            auth
            responseBody={`{
  "settings": {
    "merchant_name": "My Merchant",
    "nmid": "ID2025408537103",
    "webhook_secret": "***",
    "allowed_webhook_ips": "103.56.148.0/24"
  }
}`}
          />

          <EndpointCard
            method="PUT"
            path="/api/settings"
            description="Update application settings. Requires ADMIN role."
            auth
            requestBody={`{
  "merchantName": "My Merchant",
  "nmid": "ID2025408537103",
  "webhookSecret": "new-secret-key",
  "allowedWebhookIps": "103.56.148.0/24",
  "csrfToken": "csrf-token-from-api"
}`}
            responseBody={`{
  "message": "Settings updated successfully"
}`}
          />
        </section>

        {/* Status Codes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            HTTP Status Codes
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { code: "200", desc: "Success" },
                  { code: "400", desc: "Bad Request - invalid input" },
                  { code: "401", desc: "Unauthorized - missing or invalid token" },
                  { code: "403", desc: "Forbidden - invalid CSRF / signature / IP" },
                  { code: "409", desc: "Conflict - duplicate resource" },
                  { code: "429", desc: "Too Many Requests - cooldown active" },
                  { code: "500", desc: "Internal Server Error" },
                ].map((item) => (
                  <tr key={item.code}>
                    <td className="px-6 py-3 font-mono font-medium">
                      {item.code}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Reusable Endpoint Documentation Card */
function EndpointCard({
  method,
  path,
  description,
  auth,
  headers,
  requestBody,
  responseBody,
}: {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  headers?: string[];
  requestBody?: string;
  responseBody?: string;
}) {
  const methodColor = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-yellow-100 text-yellow-700",
    DELETE: "bg-red-100 text-red-700",
  }[method] || "bg-gray-100 text-gray-700";

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${methodColor}`}
          >
            {method}
          </span>
          <code className="text-sm font-mono font-medium text-gray-900">
            {path}
          </code>
          {auth && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              Auth Required
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>

      <div className="p-4 space-y-4">
        {headers && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Headers
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
              {headers.join("\n")}
            </pre>
          </div>
        )}

        {requestBody && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Request Body
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
              {requestBody}
            </pre>
          </div>
        )}

        {responseBody && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Response (200)
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
              {responseBody}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
