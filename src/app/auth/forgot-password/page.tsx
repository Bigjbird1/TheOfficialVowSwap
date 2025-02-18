import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | VowSwap",
  description: "Reset your VowSwap account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="container mx-auto px-4">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
