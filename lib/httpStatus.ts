export interface HttpStatus {
  code: number;
  name: string;
  className: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  summary: string;
}

export const HTTP_STATUSES: HttpStatus[] = [
  { code: 100, name: "Continue", className: "1xx", summary: "The server received the request headers and the client should continue sending the body." },
  { code: 101, name: "Switching Protocols", className: "1xx", summary: "The server agrees to switch protocols, such as upgrading an HTTP connection to WebSocket." },
  { code: 200, name: "OK", className: "2xx", summary: "The request succeeded. This is the usual response for a successful GET." },
  { code: 201, name: "Created", className: "2xx", summary: "The request created a new resource. The response often includes a Location header." },
  { code: 202, name: "Accepted", className: "2xx", summary: "The request was accepted for processing, but the work is not finished yet." },
  { code: 204, name: "No Content", className: "2xx", summary: "The request succeeded and there is no response body, common for DELETE and some PUT requests." },
  { code: 301, name: "Moved Permanently", className: "3xx", summary: "The resource has a new permanent URL. Clients and caches should use that URL from now on." },
  { code: 302, name: "Found", className: "3xx", summary: "The resource is temporarily at another URL. The original URL should still be used later." },
  { code: 304, name: "Not Modified", className: "3xx", summary: "The cached copy is still valid, so the server sends no body." },
  { code: 307, name: "Temporary Redirect", className: "3xx", summary: "A temporary redirect that keeps the original HTTP method." },
  { code: 308, name: "Permanent Redirect", className: "3xx", summary: "A permanent redirect that keeps the original HTTP method." },
  { code: 400, name: "Bad Request", className: "4xx", summary: "The server could not understand the request because of invalid syntax or malformed data." },
  { code: 401, name: "Unauthorized", className: "4xx", summary: "Authentication is missing or invalid. The client needs to send valid credentials." },
  { code: 403, name: "Forbidden", className: "4xx", summary: "The server understood the request but refuses to authorize it." },
  { code: 404, name: "Not Found", className: "4xx", summary: "The server cannot find the requested resource." },
  { code: 405, name: "Method Not Allowed", className: "4xx", summary: "The HTTP method is not supported for this resource." },
  { code: 408, name: "Request Timeout", className: "4xx", summary: "The server timed out waiting for the rest of the request." },
  { code: 409, name: "Conflict", className: "4xx", summary: "The request conflicts with the current state of the resource, such as a duplicate create." },
  { code: 410, name: "Gone", className: "4xx", summary: "The resource used to exist but has been permanently removed." },
  { code: 413, name: "Content Too Large", className: "4xx", summary: "The request body is larger than the server is willing to process." },
  { code: 415, name: "Unsupported Media Type", className: "4xx", summary: "The payload format is not supported by this resource." },
  { code: 422, name: "Unprocessable Content", className: "4xx", summary: "The syntax is valid, but the server cannot process the instructions, often a validation error." },
  { code: 429, name: "Too Many Requests", className: "4xx", summary: "The client sent too many requests in a given time. Retry after the indicated delay." },
  { code: 500, name: "Internal Server Error", className: "5xx", summary: "The server hit an unexpected condition and could not complete the request." },
  { code: 501, name: "Not Implemented", className: "5xx", summary: "The server does not support the functionality required to fulfill the request." },
  { code: 502, name: "Bad Gateway", className: "5xx", summary: "A gateway or proxy received an invalid response from an upstream server." },
  { code: 503, name: "Service Unavailable", className: "5xx", summary: "The server is temporarily unable to handle the request, often because it is overloaded or down for maintenance." },
  { code: 504, name: "Gateway Timeout", className: "5xx", summary: "A gateway or proxy did not receive a timely response from an upstream server." },
];

export function filterHttpStatuses(query: string, className: string): HttpStatus[] {
  const needle = query.trim().toLowerCase();
  return HTTP_STATUSES.filter((status) => {
    if (className !== "all" && status.className !== className) return false;
    if (!needle) return true;
    return (
      String(status.code).includes(needle) ||
      status.name.toLowerCase().includes(needle) ||
      status.summary.toLowerCase().includes(needle)
    );
  });
}
