import { Metadata } from 'next';
import pool from '@/lib/db';

export const metadata: Metadata = {
  title: 'Dashboard - Library Management System',
  description: 'Library management dashboard',
};

// Force dynamic ensures we don't serve cached counts from build time
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let totalStudents = 0;
  let booksIssued = 0;
  let pendingFees = 0;
  let totalBooks = 0;

  try {
    // We use parameterized queries (?) now to be 100% compatible with the Postgres shim
    const [studentsResult] = await pool.execute('SELECT COUNT(*) as count FROM students');
    totalStudents = Number((studentsResult as any[])[0]?.count || 0);

    const [issuesResult] = await pool.execute('SELECT COUNT(*) as count FROM book_issues WHERE status = ?', ['Issued']);
    booksIssued = Number((issuesResult as any[])[0]?.count || 0);

    const [feesResult] = await pool.execute('SELECT SUM(amount) as total FROM fees WHERE status = ?', ['Pending']);
    pendingFees = parseFloat((feesResult as any[])[0]?.total || 0);

    const [booksResult] = await pool.execute('SELECT SUM(quantity) as count FROM books');
    totalBooks = parseFloat((booksResult as any[])[0]?.count || 0);
  } catch (error) {
    console.error("Dashboard Stats Fetch Error: ", error);
  }

  const stats = [
    { name: 'Total Students', value: totalStudents.toString(), icon: 'Users' },
    { name: 'Books Issued (Active)', value: booksIssued.toString(), icon: 'BookOpen' },
    { name: 'Pending Fees', value: `₹${pendingFees.toFixed(2)}`, icon: 'CreditCard' },
    { name: 'Total Books (Quantity)', value: totalBooks.toString(), icon: 'Library' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/students/register"
            className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">+</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Register New Student</p>
              <p className="text-sm text-gray-600">Add a new student to the system</p>
            </div>
          </a>
          
          <a
            href="/dashboard/book-issue"
            className="flex items-center gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📚</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Issue Book</p>
              <p className="text-sm text-gray-600">Issue a book to a student</p>
            </div>
          </a>
          
          <a
            href="/dashboard/fees/submit"
            className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">₹</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Submit Fee</p>
              <p className="text-sm text-gray-600">Record a fee payment</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
