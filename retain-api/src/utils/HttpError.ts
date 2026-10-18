// an error that carries its HTTP status code, so the error handler knows what to send back
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
