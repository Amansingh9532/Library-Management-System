'use client';

import { useState, useEffect } from 'react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  issue_fee: number;
}

export default function AllBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Book>>({});

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (book: Book) => {
    setEditingId(book.id);
    setEditFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: book.quantity,
      issue_fee: book.issue_fee,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'issue_fee' ? Number(value) : value
    }));
  };

  const handleSaveEdit = async (bookId: number) => {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setEditingId(null);
        fetchBooks(); // Refresh list
      } else {
        alert('Failed to update book.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating book.');
    }
  };

  const handleDelete = async (bookId: number) => {
    if (!window.confirm('Are you sure you want to completely delete this book from the database? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBooks(); // Refresh list
      } else {
        alert('Failed to delete book.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting book.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">All Registered Books</h3>
          <a
            href="/dashboard/books/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            + Add New Book
          </a>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading library register...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
            No books have been registered in the system yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 group">
                    {editingId === book.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input type="text" name="title" value={editFormData.title || ''} onChange={handleEditChange} className="w-full border rounded p-1 text-sm font-medium" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" name="author" value={editFormData.author || ''} onChange={handleEditChange} className="w-full border rounded p-1 text-sm" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="text" name="category" value={editFormData.category || ''} onChange={handleEditChange} className="w-full border rounded p-1 text-sm placeholder:text-gray-300" placeholder="Optional" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" name="quantity" value={editFormData.quantity ?? ''} onChange={handleEditChange} className="w-16 border rounded p-1 text-sm" min="0" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" name="issue_fee" value={editFormData.issue_fee ?? ''} onChange={handleEditChange} className="w-20 border rounded p-1 text-sm" min="0" step="0.01" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(book.id)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-medium shadow-sm">Save</button>
                            <button onClick={handleCancelEdit} className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-xs shadow-sm">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{book.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{book.author}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{book.category || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{book.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{parseFloat(book.issue_fee as any).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-3">
                            <button onClick={() => handleEditClick(book)} className="text-blue-600 hover:text-blue-900 font-medium">Edit</button>
                            <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
