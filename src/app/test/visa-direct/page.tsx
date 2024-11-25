import { VisaDirectPayment } from '@/components/VisaDirectPayment';

export default function VisaDirectTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Test Visa Direct Payment
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Send money instantly using Visa Direct
          </p>
        </div>
        <div className="mt-10">
          <VisaDirectPayment />
        </div>
      </div>
    </div>
  );
}
