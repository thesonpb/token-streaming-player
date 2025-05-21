import { AUTH } from "@/constants";

const API_BASE_URL = "http://localhost:9926";

export async function joinSession(username: string): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/Join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${AUTH}`,
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

// Define a new interface for the return type
export interface TokenCheckResult {
    isValid: boolean;
    message: string; // We'll always include a message now
    // status?: number; // Optionally include the status code from the JSON body
}

export async function checkToken(
    payload: CheckTokenPayload
): Promise<TokenCheckResult> {
    try {
        console.log(
            "Sending to /CheckToken:",
            JSON.stringify(payload, null, 2)
        );
        const HARPER_DB_USERNAME = "HDB_ADMIN";
        const HARPER_DB_PASSWORD = "son123456";
        const auth = Buffer.from(
            `${HARPER_DB_USERNAME}:${HARPER_DB_PASSWORD}`
        ).toString("base64");
        const response = await fetch(`${API_BASE_URL}/CheckToken`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text(); // Read text first to ensure we can log it

        // Try to parse the response as JSON in any case to get the message
        let responseData: { status?: number | string; message?: string } = {};
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            // If JSON parsing fails, we'll construct a message based on HTTP status
            console.warn(
                "Could not parse response text as JSON:",
                responseText
            );
        }

        const apiMessage =
            responseData.message ||
            response.statusText ||
            "An unknown error occurred";

        if (!response.ok) {
            // HTTP status indicates an error (e.g., 401, 403, 500)
            console.log(
                `Token check failed: HTTP status ${response.status}. Body: ${responseText}`
            );
            return {
                isValid: false,
                message: `Server Error: ${response.status}. ${apiMessage}`,
            };
        }

        // Response.ok is true (HTTP 2xx), now check the internal status from JSON body
        const internalStatus = responseData.status
            ? parseInt(String(responseData.status), 10)
            : 0;

        if (internalStatus === 200) {
            console.log(
                "Token check successful (HTTP 200, internal status 200):",
                responseData
            );
            return { isValid: true, message: apiMessage }; // e.g., "oke"
        } else {
            // HTTP 200, but internal status indicates an issue (e.g., internal status 403)
            console.log(
                `Token check denied by API logic (HTTP 200, internal status ${internalStatus}):`,
                responseData
            );
            return { isValid: false, message: apiMessage }; // e.g., "Token is banned"
        }
    } catch (error) {
        console.error(
            "Error in checkToken function (network or client-side):",
            error
        );
        let errorMessage =
            "Network error or client-side issue during token check.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return {
            isValid: false,
            message: errorMessage,
        };
    }
}
