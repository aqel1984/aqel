export default function TestPaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        {children}
      </div>
    </div>
  );
}
