import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Sign In to Admin Panel</h1>
      <SignIn path="/sign-in" routing="path" signUpUrl={undefined} />
    </div>
  )
}
