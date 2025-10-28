'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import Cookies from "js-cookie"

export function AdminToggle() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const is = Cookies.get("admin") === "true"
    setIsAdmin(is)
  }, [])

  if (isAdmin) {
    return (
        <Link href="/admin/dashboard" className="transition-colors hover:text-foreground/80 font-bold text-red-600">
          Admin
        </Link>
      )
  }

  return null
}