export const MAX_EMAIL_SUBJECT_LENGTH = 120;
export const MAX_EMAIL_MESSAGE_LENGTH = 2000;

export function normalizeEmailAddress(value) {
  const address = typeof value === "string" ? value.trim() : "";
  if (!address) throw createEmailDeliveryError("Enter an email address.", 400);
  if (address.length > 254 || /[\r\n]/.test(address)) {
    throw createEmailDeliveryError("Enter a valid email address.", 400);
  }
  const match = address.match(/^([^\s@]+)@([^\s@]+)$/u);
  if (!match || !match[1] || !match[2].includes(".") || match[2].startsWith(".") || match[2].endsWith(".")) {
    throw createEmailDeliveryError("Enter a valid email address.", 400);
  }
  return `${match[1]}@${match[2].toLowerCase()}`;
}

export function normalizeEmailSender(value) {
  const sender = typeof value === "string" ? value.trim() : "";
  if (!sender || /[\r\n]/.test(sender)) {
    throw createEmailDeliveryError("Configure EMAIL_FROM with a verified sender address.", 500);
  }
  const namedSender = sender.match(/^([^<>]{1,100})<([^<>]+)>$/u);
  if (!namedSender) return normalizeEmailAddress(sender);
  const name = namedSender[1].trim();
  if (!name) throw createEmailDeliveryError("Configure EMAIL_FROM with a valid sender name.", 500);
  return `${name} <${normalizeEmailAddress(namedSender[2])}>`;
}

export function normalizeEmailSubject(value) {
  const subject = typeof value === "string" ? value.trim() : "";
  if (!subject) throw createEmailDeliveryError("Enter an email subject.", 400);
  if (subject.length > MAX_EMAIL_SUBJECT_LENGTH || /[\r\n]/.test(subject)) {
    throw createEmailDeliveryError(
      `Email subjects can contain up to ${MAX_EMAIL_SUBJECT_LENGTH} characters.`,
      400,
    );
  }
  return subject;
}

export function normalizeEmailMessage(value) {
  const message = typeof value === "string" ? value.trim() : "";
  if (!message) throw createEmailDeliveryError("Write an email message.", 400);
  if (message.length > MAX_EMAIL_MESSAGE_LENGTH) {
    throw createEmailDeliveryError(
      `Email messages can contain up to ${MAX_EMAIL_MESSAGE_LENGTH.toLocaleString("en-US")} characters.`,
      400,
    );
  }
  return message;
}

export async function sendTransactionalEmail({
  apiKey,
  from,
  to,
  subject,
  message,
  html = "",
  idempotencyKey = "",
  fetchImpl = fetch,
  timeoutMs = 10_000,
} = {}) {
  const cleanApiKey = typeof apiKey === "string" ? apiKey.trim() : "";
  if (!cleanApiKey) throw createEmailDeliveryError("Email delivery is not configured.", 503);
  const sender = normalizeEmailSender(from);
  const recipient = normalizeEmailAddress(to);
  const cleanSubject = normalizeEmailSubject(subject);
  const cleanMessage = normalizeEmailMessage(message);
  const cleanHtml = typeof html === "string" ? html.trim() : "";
  const cleanIdempotencyKey = typeof idempotencyKey === "string"
    ? idempotencyKey.trim().slice(0, 256)
    : "";

  let response;
  try {
    response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      redirect: "error",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cleanApiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "RoAnalytics-Email-Integration/1.0",
        ...(cleanIdempotencyKey ? { "Idempotency-Key": cleanIdempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        subject: cleanSubject,
        text: cleanMessage,
        ...(cleanHtml ? { html: cleanHtml } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    throw createEmailDeliveryError(
      timedOut
        ? "The email provider took too long to respond. Try again."
        : "Could not reach the email provider. Try again.",
      timedOut ? 504 : 502,
    );
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    // Error mapping below does not require a response body.
  }
  if (!response.ok) throw mapEmailProviderError(response.status, payload);

  return {
    ok: true,
    sentAt: Date.now(),
    emailId: typeof payload?.id === "string" ? payload.id : "",
  };
}

function mapEmailProviderError(status, payload) {
  const providerMessage = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (status === 400 || status === 422) {
    return createEmailDeliveryError(providerMessage || "The email provider rejected this message.", 400);
  }
  if (status === 401 || status === 403) {
    return createEmailDeliveryError("Email delivery is not configured correctly.", 503);
  }
  if (status === 429) {
    return createEmailDeliveryError("The email provider is rate limiting messages. Wait a moment and try again.", 429);
  }
  return createEmailDeliveryError("The email provider could not send this message. Try again.", 502);
}

function createEmailDeliveryError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
