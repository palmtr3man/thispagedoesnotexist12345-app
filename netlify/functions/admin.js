const { sendInternalNotification } = require("../../server/email");

exports.handler = async (event) => {
  // Extract the sub-route from the path
  const path = event.path.split("/").pop();
  
  if (path === "test-alerts" && event.httpMethod === "POST") {
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {}

    const result = await sendInternalNotification(
      body.email || "test@example.com",
      body.name || "Test User",
      "free"
    );
    return {
      statusCode: result.success ? 200 : 500,
      body: JSON.stringify(result)
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not Found", path })
  };
};
