import { SignUp } from "@clerk/nextjs"
import { Leaf } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F7F4] px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#4E8B6B] mb-4">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D5C44]">ZYRA</h1>
          <p className="text-[#6B8C7A] mt-1 text-sm">Tu workspace profesional, gratis para empezar</p>
        </div>

        <SignUp
          appearance={{
            elements: {
              socialButtonsRoot: "hidden",
              dividerRow: "hidden",
              card: "shadow-none border border-[#C8DFD2] rounded-2xl bg-white",
              headerTitle: "text-[#2D5C44]",
              headerSubtitle: "text-[#6B8C7A]",
              formFieldInput: "border-[#C8DFD2] focus:border-[#4E8B6B] rounded-xl",
              formButtonPrimary: "bg-[#4E8B6B] hover:bg-[#3D7059] rounded-xl",
              footerActionLink: "text-[#4E8B6B]",
              footer: "hidden",
            },
          }}
        />

        <p className="text-center text-xs text-[#6B8C7A] mt-6">
          Hecho con ♥ en Las Palmas · <span className="font-medium">GeorLabs</span>
        </p>
      </div>
    </div>
  )
}
