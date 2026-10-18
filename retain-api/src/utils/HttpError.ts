// throw new HttpError(404, 'Expense not found.') and the error handler sends it as JSON
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
