exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const telemetry = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node_version: process.version,
    env: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
    provider: process.env.EMAIL_PROVIDER || "sendgrid"
  };

  // Verify SendGrid connectivity
  let sendgridStatus = "unknown";
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (process.env.EMAIL_PROVIDER === "sendgrid" || !process.env.EMAIL_PROVIDER) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/scopes", {
        headers: { "Authorization": `Bearer ${SENDGRID_API_KEY}` }
      });
      sendgridStatus = response.ok ? "connected" : "error";
    } catch (err) {
      sendgridStatus = "failed";
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "OK",
      sendgrid: sendgridStatus,
      telemetry
    })
  };
};
