import { SiteConfigContracts } from "@/config/site";

interface PrettyError {
  message: string;
  severity: "info" | "error" | undefined;
}

export function errorToPrettyError(
  error: unknown
): PrettyError {
  let message = "An unknown error occurred.";
  let severity: "info" | "error" | undefined = "error";

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
    const anyError = error as any;
    if (anyError?.cause?.shortMessage) {
      message = anyError.cause.shortMessage;
    }
  } else if (typeof error === "object" && error !== null) {
    const e = error as { message?: string; cause?: { shortMessage?: string } };
    if (e?.cause?.shortMessage) {
      message = e.cause.shortMessage;
    } else if (e?.message) {
      message = e.message;
    } else {
      try {
        message = JSON.stringify(error, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        );
      } catch {
        message = "Unserializable error object.";
      }
    }
  }

  return {
    message,
    severity,
  };
}
