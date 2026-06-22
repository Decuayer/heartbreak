// Root admin layout — no auth check here.
// Auth is enforced in app/admin/(protected)/layout.tsx
// This wrapper exists so /admin/login can render without being redirected.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
