'use client';

import { useState, useEffect, useCallback } from 'react';

interface Student {
  id: number;
  full_name: string;
  mobile_number: string;
}

interface FeeRecord {
  id: number;
  student_id: number;
  amount: number;
  fee_type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function FeeCalculator() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [studentFees, setStudentFees] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState({
    totalPending: 0,
    totalPaid: 0,
    bookIssueFees: 0,
    otherFees: 0,
  });

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  const fetchStudentFees = useCallback(async (studentId: number) => {
    try {
      const response = await fetch(`/api/fees?student_id=${studentId}`);
      const data = await response.json();
      const feesArray = Array.isArray(data) ? data : [];
      setStudentFees(feesArray);

      const newSummary = feesArray.reduce((acc: any, fee: FeeRecord) => {
        if (fee.status === 'Pending') {
          acc.totalPending += parseFloat(fee.amount as any);
        } else if (fee.status === 'Paid') {
          acc.totalPaid += parseFloat(fee.amount as any);
        }
        
        if (fee.fee_type === 'Book Issue') {
          acc.bookIssueFees += parseFloat(fee.amount as any);
        } else {
          acc.otherFees += parseFloat(fee.amount as any);
        }
        return acc;
      }, { totalPending: 0, totalPaid: 0, bookIssueFees: 0, otherFees: 0 });

      setSummary(newSummary);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentFees(selectedStudent);
    } else {
      setStudentFees([]);
      setSummary({ totalPending: 0, totalPaid: 0, bookIssueFees: 0, otherFees: 0 });
    }
  }, [selectedStudent, fetchStudentFees]);

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

  const selectedStudentName = students.find(s => s.id === selectedStudent)?.full_name;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Student</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Student ID or Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={studentSearch}
          onChange={handleStudentSearch}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter ID or mobile number"
        />
        {selectedStudent ? (
          <p className="text-sm font-medium text-green-600 mt-2">
            ✓ Student Found: {selectedStudentName}
          </p>
        ) : studentSearch.length > 0 ? (
          <p className="text-sm font-medium text-red-600 mt-2">No student found.</p>
        ) : null}
      </div>

      {selectedStudent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-red-600 mt-2">₹{summary.totalPending.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-2">₹{summary.totalPaid.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Book Issue Fees</p>
              <p className="text-2xl font-bold text-indigo-600 mt-2">₹{summary.bookIssueFees.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm font-medium text-gray-600">Other Fees</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">₹{summary.otherFees.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Fee Details - {selectedStudentName}</h3>
              <a
                href="/dashboard/fees/submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Submit Fee Payment
              </a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {studentFees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                        No fee records found for this student.
                      </td>
                    </tr>
                  ) : (
                    studentFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{fee.fee_type}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{fee.description || '-'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{parseFloat(fee.amount as any).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            fee.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            fee.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(fee.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
