import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, History, CreditCard, FileText, Download, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/fees/all-payments');
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment? The amount will be deducted from the student\'s paid fees.')) {
      try {
        await api.delete(`/fees/payments/${id}`);
        setPayments(payments.filter(p => p._id !== id));
      } catch (error) {
        console.error('Failed to delete payment:', error);
        alert(error.response?.data?.message || 'Failed to delete payment');
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const studentName = (payment.studentId?.name || '').toLowerCase();
    const studentRoom = (payment.studentId?.roomNumber || '').toLowerCase();
    const transactionId = (payment.transactionId || '').toLowerCase();
    const method = (payment.paymentMethod || '').toLowerCase();

    return (
      studentName.includes(searchLower) ||
      studentRoom.includes(searchLower) ||
      transactionId.includes(searchLower) ||
      method.includes(searchLower)
    );
  });

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
            <Input 
              placeholder="Search by name, room, or transaction ID..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-l-lg">Date</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold rounded-r-lg text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-4 text-center">Loading payment history...</td></tr>
              ) : currentPayments.length === 0 ? (
                <tr><td colSpan="7" className="p-4 text-center">No payment records found.</td></tr>
              ) : currentPayments.map((payment, idx) => (
                <motion.tr 
                  key={payment._id || idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                    <div className="text-xs text-black/50 dark:text-white/50">{new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{payment.studentId?.name || 'Unknown'}</div>
                    <div className="text-xs text-black/50 dark:text-white/50">{payment.studentId?.studentId || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.studentId?.roomNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-black/50 dark:text-white/50" />
                      <span>{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-black/60 dark:text-white/60">
                    {payment.transactionId || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ₹{payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(payment._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete Payment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <span className="text-sm text-black/60 dark:text-white/60">
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentHistory;
