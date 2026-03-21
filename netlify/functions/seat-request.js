const BASE44_SEAT_REQUEST_URL = process.env.BASE44_SEAT_REQUEST_URL;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const SENDGRID_ACK_TEMPLATE_ID = "d-740595dc07be40129569bc731f1bc454";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { name, email, source } = body;

  // Step 1: Validate required fields
  if (!name || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: name and email are required" })
    };
  }

  const first_name = name.trim().split(" ")[0];
  const request_date = new Date().toISOString();

  // Step 2: Send SendGrid acknowledgement email
  try {
    const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: [{ email: email }],
        from: { email: SENDGRID_FROM_EMAIL },
        template_id: SENDGRID_ACK_TEMPLATE_ID,
        dynamic_template_data: {
          first_name: first_name
        }
      })
    });

    if (!sgResponse.ok) {
      const errBody = await sgResponse.text();
      console.error("SendGrid error:", sgResponse.status, errBody);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to send acknowledgement email" })
      };
    }
  } catch (err) {
    console.error("SendGrid fetch exception:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send acknowledgement email" })
    };
  }

  // Step 3: POST to Base44 SeatRequest entity
  try {
    const b44Response = await fetch(BASE44_SEAT_REQUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        source: source || "unknown",
        status: "pending",
        request_date: request_date
      })
    });

    if (!b44Response.ok) {
      const errBody = await b44Response.text();
      console.error("Base44 write error:", b44Response.status, errBody);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "SeatRequest record creation failed. Acknowledgement email was already sent. Manual reconciliation required."
        })
      };
    }
  } catch (err) {
    console.error("Base44 POST exception:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "SeatRequest record creation failed. Acknowledgement email was already sent. Manual reconciliation required."
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: "Seat request received and acknowledged." })
  };
};
