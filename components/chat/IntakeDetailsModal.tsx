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
    return choice === 'existing' ? 'Potato Cold Storage Owner' : 'Planning to Build a New Cold Storage';
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
          <div className="flex items-start justify-between pt-6 px-6 pb-2 border-b border-gray-50">
            <div>
              <h1 className="text-[18px] font-bold text-gray-900 leading-tight">Intake Details</h1>
              <p className="mt-1.5 text-[13px] font-semibold text-emerald-600">
                {formatUserChoice(userChoice)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pt-2 pb-6 overflow-y-auto max-h-[calc(80vh-140px)] scrollbar-hide">
            {intakeData && Object.keys(intakeData).length > 0 ? (
              <div className="divide-y divide-gray-100">
                {Object.entries(intakeData).map(([key, value]) => (
                  <div key={key} className="py-3 flex flex-col items-start gap-1 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                    <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {formatFieldName(key)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatFieldValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 italic">
                No intake data available
              </div>
            )}
          </div>

          {/* Footer removed for minimalist look as requested */}
        </div>
      </div>
    </>
  );
};
