import React from 'react';

interface IntakeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  intakeData: any;
  userChoice: string;
}

export const IntakeDetailsModal: React.FC<IntakeDetailsModalProps> = ({
  isOpen,
  onClose,
  intakeData,
  userChoice,
}) => {
  if (!isOpen) return null;

  // Format the user choice for display
  const formatUserChoice = (choice: string) => {
    return choice === 'existing' ? 'Cold Storage Owner' : 'Planning to Build';
  };

  // Format field names to be more readable
  const formatFieldName = (key: string): string => {
    const fieldMap: Record<string, string> = {
      location: 'Location',
      variety: 'Potato Variety',
      capacity_mt: 'Capacity (MT)',
      storage_goal: 'Storage Purpose',
      current_problems: 'Current Challenges',
      current_temperature: 'Current Temperature',
      purpose: 'Storage Purpose',
      storageMethod: 'Storage Method',
      capacity: 'Capacity',
      category: 'Category',
      issues: 'Issues',
      chamberType: 'Chamber Type',
      targetCapacity: 'Target Capacity',
      budget: 'Budget',
      targetUsers: 'Target Users',
    };
    return fieldMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Format field values
  const formatFieldValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Intake Details</h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatUserChoice(userChoice)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            {intakeData && Object.keys(intakeData).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(intakeData).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      {formatFieldName(key)}
                    </div>
                    <div className="text-base text-gray-900">
                      {formatFieldValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No intake data available
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
