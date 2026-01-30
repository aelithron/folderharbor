export type Session = { userID: number, username: string, sessionID: number }

declare global {
  namespace Express {
    interface Request {
      session: Session | undefined,
      sessionErr: string | undefined
    }
  }
}