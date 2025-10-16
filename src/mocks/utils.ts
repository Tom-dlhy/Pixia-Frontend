import { ID } from "~/models"

export function randomId(): ID {
  return Math.random().toString(36).substring(2, 10)
}

export function randomDate(): number {
  return Date.now() - Math.floor(Math.random() * 1000000000)
}

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
