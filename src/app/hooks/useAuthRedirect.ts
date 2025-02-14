import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export const useAuthRedirect = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleStartSelling = () => {
    if (session) {
      router.push("/seller/create-listing")
    } else {
      router.push("/sign-up-sell")
    }
  }

  return { handleStartSelling }
}
