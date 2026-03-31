'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: number;
  full_name: string;
  mobile_number: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  issue_fee: number;
}

interface BookIssue {
  id: number;
  student_name: string;
  book_title: string;
  issue_date: string;
  due_date: string;
  status: string;
  fee_charged: number;
}

export default function BookIssue() {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  
  const [studentPhone, setStudentPhone] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [issueFee, setIssueFee] = useState<string>('');
  
  const [formData, setFormData] = useState({
    student_id: '',
    book_id: '',
    issue_date: '',
    due_date: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchBooks();
    fetchBookIssues();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchBookIssues = async () => {
    try {
      const response = await fetch('/api/book-issues');
      const data = await response.json();
      setBookIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching book issues:', error);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setStudentPhone(phone);
    
    // Auto-fetch/match student by phone number
    const foundStudent = students.find(s => s.mobile_number === phone);
    if (foundStudent) {
      setFormData(prev => ({ ...prev, student_id: foundStudent.id.toString() }));
    } else {
      setFormData(prev => ({ ...prev, student_id: '' }));
    }
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setBookTitle(title);
    
    // Auto-fetch/match book by exact title
    const foundBook = books.find(b => b.title.trim().toLowerCase() === title.trim().toLowerCase());
    if (foundBook) {
      setFormData(prev => ({ ...prev, book_id: foundBook.id.toString() }));
      setIssueFee(foundBook.issue_fee.toString());
    } else {
      setFormData(prev => ({ ...prev, book_id: '' }));
      setIssueFee('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id) {
      setMessage('Error: Invalid student phone number. No student found.');
      return;
    }
    if (!formData.book_id) {
      setMessage('Error: Invalid book name. Book not found.');
      return;
    }
    if (issueFee === '' || parseFloat(issueFee) < 0) {
      setMessage('Error: Please set a valid issue fee.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/book-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, issue_fee: parseFloat(issueFee) }),
      });

      if (response.ok) {
        setMessage('Book issued successfully!');
        setFormData({ student_id: '', book_id: '', issue_date: '', due_date: '' });
        setStudentPhone('');
        setBookTitle('');
        setIssueFee('');
        fetchBookIssues();
      } else {
        setMessage('Failed to issue book. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue New Book</h3>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={studentPhone}
              onChange={handlePhoneChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter mobile number"
            />
            {formData.student_id ? (
              <p className="text-sm font-medium text-green-600 mt-2">
                ✓ Student Found: {students.find(s => s.id.toString() === formData.student_id)?.full_name}
              </p>
            ) : studentPhone.length >= 10 ? (
              <p className="text-sm font-medium text-red-600 mt-2">No student found with this phone number.</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="booksList"
              value={bookTitle}
              onChange={handleBookChange}
              required
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Start typing or select book"
            />
            <datalist id="booksList">
              {books.map(b => (
                 <option key={b.id} value={b.title} />
              ))}
            </datalist>
            {books.length === 0 ? (
              <p className="text-sm font-medium text-orange-600 mt-2">No books available in the database. Please add a book first.</p>
            ) : formData.book_id ? (
              <p className="text-sm font-medium text-green-600 mt-2">
                ✓ Book Available: {books.find(b => b.id.toString() === formData.book_id)?.title}
              </p>
            ) : bookTitle.length > 0 ? (
               <p className="text-sm font-medium text-gray-500 mt-2">Typing... Please match exactly or select from suggestions.</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price of Issued Book (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={issueFee}
              onChange={(e) => setIssueFee(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">This fee will be added to the student's pending fees.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading || !formData.student_id || !formData.book_id}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Issuing...' : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Issued Books History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    No books issued yet.
                  </td>
                </tr>
              ) : (
                bookIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{issue.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{issue.book_title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(issue.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(issue.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        issue.status === 'Issued' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'Returned' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{issue.fee_charged}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
