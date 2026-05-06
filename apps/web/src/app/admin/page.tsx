export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl shadow-sm bg-card text-card-foreground">
          <h3 className="text-lg font-medium text-muted-foreground">Total Views</h3>
          <p className="text-4xl font-bold mt-2">124.5K</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card text-card-foreground">
          <h3 className="text-lg font-medium text-muted-foreground">Active Premium Users</h3>
          <p className="text-4xl font-bold mt-2">1,245</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card text-card-foreground">
          <h3 className="text-lg font-medium text-muted-foreground">Published Blogs</h3>
          <p className="text-4xl font-bold mt-2">184</p>
        </div>
      </div>
    </div>
  );
}
