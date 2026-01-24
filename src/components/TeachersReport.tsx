
import React from 'react';
import { User } from '../types';
import { generateTeachersPdf } from '../utils/teachersGenerator';

interface TeachersReportProps {
  users: User[];
  onClose: () => void;
}

export const TeachersReport: React.FC<TeachersReportProps> = ({ users, onClose }) => {
  const handlePrint = async () => {
    try {
      await generateTeachersPdf(users);
    } catch (error) {
      console.error('Failed to generate teachers report:', error);
      alert('There was an error generating the report. Please try again later.');
    }
  };

  const teachersByGrade = users.reduce((acc, user) => {
    if (user.gradeTaught) {
      const grades = Array.isArray(user.gradeTaught) ? user.gradeTaught : [user.gradeTaught];
      grades.forEach(grade => {
        if (!acc[grade]) {
          acc[grade] = [];
        }
        acc[grade].push(user);
      });
    }
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Teachers by Grade</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(teachersByGrade).map(([grade, teachers]) => (
            <div key={grade} className="mb-4">
              <h3 className="text-lg font-bold border-b pb-2 mb-2">{grade}</h3>
              <ul>
                {teachers.map(teacher => (
                  <li key={teacher.id} className="flex justify-between py-1">
                    <span>{teacher.firstName} {teacher.lastName}</span>
                    <span className="text-gray-500">{teacher.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-all"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
