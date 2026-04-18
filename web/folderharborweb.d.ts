export type Session = {
  webID?: number
  server: string
  token: string
  username: string
  permissions: string[]
}
export type ClientConfig = {
  selfUsernameChanges: boolean
  registration: boolean
}