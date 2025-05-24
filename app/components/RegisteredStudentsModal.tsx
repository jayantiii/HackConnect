import React from 'react';

interface RegisteredStudent {
  userId: number;
  name: string;
  email: string;
  phone: string;
  description: string;
}

interface RegisteredStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathonName: string;
  registeredStudents: RegisteredStudent[];
}

export default function RegisteredStudentsModal({ 
  isOpen, 
  onClose, 
  hackathonName,
  registeredStudents 
}: RegisteredStudentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">Registered Students for {hackathonName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-2">
          {registeredStudents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No students registered yet.</p>
          ) : (
            <div className="space-y-4">
              {registeredStudents.map((student, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <span className="text-sm text-gray-500">{student.email}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <p>Phone: {student.phone}</p>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">About:</p>
                    <p className="bg-white p-2 rounded border">{student.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 