const API_BASE_URL = "http://localhost:9926";

export async function joinSession(username: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/Join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to join session: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Error joining session:", error);
    throw error;
  }
}

interface CheckTokenPayload {
  token: string;
  token_claim: string;
  request_useragent: string;
  request_ip: string;
  request_hostname: string;
  request_path: string;
}

export async function checkToken(payload: CheckTokenPayload): Promise<boolean> {
  try {
    console.log("Sending to /CheckToken:", JSON.stringify(payload, null, 2));
    const response = await fetch(`${API_BASE_URL}/CheckToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseText = "";
    try {
      responseText = await response.text(); // Read text first
    } catch (textError) {
      console.warn("Could not read response text:", textError);

      if (!response.ok) return false;

      throw new Error(
        "Failed to read response text even though response.ok was true."
      );
    }

    if (!response.ok) {
      console.log(
        `Token check failed: HTTP status ${response.status}. Body: ${responseText}`
      );

      try {
        const errorData = JSON.parse(responseText);
        console.log("Error data from non-OK response:", errorData);
      } catch (e) {
        /* Silently ignore if not JSON */
      }
      return false;
    }

    const data = JSON.parse(responseText);
    console.log("Parsed response data (from HTTP 200):", data);

    if (data && (data.status === 403 || data.status === "403")) {
      console.log(
        `Token is banned per response body: ${data.message || "No message"}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in checkToken function:", error);
    return false;
  }
}

// Example of how you might call it in your component:
// const currentToken = "your_actual_token"; // from state or props
// const videoPath = "/bad.mp4"; // or current video src
// const claim = "access-video";

// const isValid = await checkToken({
//   token: currentToken,
//   token_claim: claim,
//   request_useragent: navigator.userAgent,
//   request_ip: "CLIENT_ATTEMPT", // Server should ideally derive this. Consult API docs.
//   request_hostname: window.location.hostname, // Or the specific hostname for the resource
//   request_path: videoPath,
// });
