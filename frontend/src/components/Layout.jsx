import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto pt-16 lg:pt-10">
        {children}
      </main>
    </div>
  );
}

export default Layout;
