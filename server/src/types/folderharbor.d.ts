export type Session = { userID: number, username: string, sessionID: number, expiry: Date }

declare global {
  namespace Express {
    interface Request {
      session: Session | undefined,
      sessionErr: string | undefined
    }
  }
}
declare module "ftp-srv" {
  interface FtpConnection { userID: number }
}