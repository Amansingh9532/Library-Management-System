'use client';

import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface Student {
  id: number;
  full_name: string;
  mobile_number: string;
}

interface FeeRecord {
  id: number;
  student_id: number;
  student_name: string;
  amount: number;
  fee_type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function SubmitFee() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingFees, setPendingFees] = useState<FeeRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [paymentType, setPaymentType] = useState<'existing' | 'new'>('existing');
  const [selectedFees, setSelectedFees] = useState<number[]>([]);
  const [newFee, setNewFee] = useState({
    amount: '',
    fee_type: 'Other',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchPendingFees(selectedStudent);
    } else {
      setPendingFees([]);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPendingFees = async (studentId: number) => {
    try {
      const response = await fetch(`/api/fees?student_id=${studentId}`);
      const data = await response.json();
      const feesArray = Array.isArray(data) ? data : [];
      setPendingFees(feesArray.filter((f: FeeRecord) => f.status === 'Pending'));
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const handleFeeSelection = (feeId: number) => {
    setSelectedFees(prev => 
      prev.includes(feeId) 
        ? prev.filter(id => id !== feeId)
        : [...prev, feeId]
    );
  };

  const [studentSearch, setStudentSearch] = useState('');

  const handleStudentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.trim();
    setStudentSearch(e.target.value);
    
    if (!term) {
      setSelectedStudent('');
      return;
    }

    const foundStudent = students.find(s => 
      s.mobile_number === term || s.id.toString() === term
    );
    
    if (foundStudent) {
      setSelectedStudent(foundStudent.id);
    } else {
      setSelectedStudent('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (paymentType === 'existing') {
        for (const feeId of selectedFees) {
          await fetch(`/api/fees/${feeId}/pay`, {
            method: 'PUT',
          });
        }
        setMessage(`Successfully paid ${selectedFees.length} fee(s)!`);
        setSelectedFees([]);
      } else {
        const response = await fetch('/api/fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: selectedStudent,
            amount: parseFloat(newFee.amount),
            fee_type: newFee.fee_type,
            description: newFee.description,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          await fetch(`/api/fees/${result.id}/pay`, {
            method: 'PUT',
          });
          setMessage('New fee created and paid successfully!');
          setNewFee({ amount: '', fee_type: 'Other', description: '' });
        }
      }

      if (selectedStudent) {
        fetchPendingFees(selectedStudent);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalSelected = pendingFees
    .filter(f => selectedFees.includes(f.id))
    .reduce((sum, f) => sum + parseFloat(f.amount as any), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Submit Fee Payment</h3>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.includes('success') && <CheckCircle className="h-5 w-5" />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID or Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentSearch}
              onChange={handleStudentSearch}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter ID or mobile number"
            />
            {selectedStudent ? (
              <p className="text-sm font-medium text-green-600 mt-2">
                ✓ Student Found: {students.find(s => s.id === selectedStudent)?.full_name}
              </p>
            ) : studentSearch.length > 0 ? (
              <p className="text-sm font-medium text-red-600 mt-2">No student found.</p>
            ) : null}
          </div>

          {selectedStudent && (
            <>
              <div className="flex gap-4 border-b border-gray-200 pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="existing"
                    checked={paymentType === 'existing'}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Pay Existing Fees</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="new"
                    checked={paymentType === 'new'}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Create & Pay New Fee</span>
                </label>
              </div>

              {paymentType === 'existing' ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Pending Fees</h4>
                  {pendingFees.length === 0 ? (
                    <p className="text-gray-500 text-sm">No pending fees for this student.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingFees.map((fee) => (
                        <label
                          key={fee.id}
                          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedFees.includes(fee.id)
                              ? 'bg-indigo-50 border-indigo-300'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFees.includes(fee.id)}
                              onChange={() => handleFeeSelection(fee.id)}
                              className="text-indigo-600"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{fee.fee_type}</p>
                              <p className="text-sm text-gray-500">{fee.description || '-'}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">₹{parseFloat(fee.amount as any).toFixed(2)}</span>
                        </label>
                      ))}
                      
                      {selectedFees.length > 0 && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total to Pay:</span>
                            <span className="text-xl font-bold text-indigo-600">₹{totalSelected.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newFee.amount}
                      onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fee Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newFee.fee_type}
                      onChange={(e) => setNewFee({ ...newFee, fee_type: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Membership">Membership</option>
                      <option value="Late Fee">Late Fee</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newFee.description}
                      onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || (paymentType === 'existing' && selectedFees.length === 0)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : paymentType === 'existing' ? `Pay ₹${totalSelected.toFixed(2)}` : 'Create & Pay Fee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
