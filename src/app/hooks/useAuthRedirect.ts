import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export const useAuthRedirect = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleStartSelling = () => {
    if (session?.user) {
      router.push("/list-items")
    } else {
      router.push("/sign-up-sell")
    }
  }

  return { handleStartSelling }
}
