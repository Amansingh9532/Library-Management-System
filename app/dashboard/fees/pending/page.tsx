'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface PendingStudentSummary {
  student_id: number;
  student_name: string;
  total_pending_amount: number;
  pending_count: number;
}

export default function PendingFees() {
  const [pendingStudents, setPendingStudents] = useState<PendingStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingFees();
  }, []);

  const fetchPendingFees = async () => {
    try {
      const response = await fetch('/api/fees');
      const data = await response.json();
      
      const allFees = Array.isArray(data) ? data : [];
      const pendingFees = allFees.filter(fee => fee.status === 'Pending');
      
      const summaryMap = new Map<number, PendingStudentSummary>();
      
      pendingFees.forEach(fee => {
        if (!summaryMap.has(fee.student_id)) {
          summaryMap.set(fee.student_id, {
            student_id: fee.student_id,
            student_name: fee.student_name,
            total_pending_amount: 0,
            pending_count: 0
          });
        }
        
        const summary = summaryMap.get(fee.student_id)!;
        summary.total_pending_amount += parseFloat(fee.amount as any);
        summary.pending_count += 1;
      });
      
      setPendingStudents(Array.from(summaryMap.values()));
    } catch (error) {
      console.error('Error fetching pending fees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Students with Pending Payments</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : pendingStudents.length === 0 ? (
          <div className="text-center py-8 text-green-600 bg-green-50 rounded-lg border border-green-200">
            ✓ All clear! There are perfectly zero students with pending payments right now.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{student.student_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{student.pending_count} unpaid fees</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">₹{student.total_pending_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link 
                        href="/dashboard/fees/submit" 
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Pay Now
                      </Link>
                    </td>
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
