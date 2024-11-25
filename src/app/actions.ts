'use server'

export async function submitEmail(email: string) {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Here you would typically send the email to your backend or API
  // For this example, we'll just return a success message

  // Validate email (basic validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.'
    }
  }

  // Simulate successful submission
  return {
    success: true,
    message: `Email ${email} submitted successfully!`
  }
}