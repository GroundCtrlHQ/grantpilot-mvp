import { getUser, clearUser } from "./storage"

export const isAuthenticated = (): boolean => {
  return getUser() !== null
}

export const requireAuth = (): void => {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    window.location.href = "/login"
  }
}

export const logout = (): void => {
  clearUser()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}
