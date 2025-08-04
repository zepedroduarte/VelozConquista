'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import Cookies from "js-cookie"

export function AdminToggle() {
  const [show, setShow] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const is = Cookies.get("admin") === "true"
    setIsAdmin(is)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === "l") {
        setShow((s) => !s)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  if (!show && !isAdmin) return null

  return (
    <Link href="/admin" className="transition-colors hover:text-foreground/80">
      Admin
    </Link>
  )
}
