import React from 'react';
import { format } from 'date-fns';

interface Dispute {
    id: string;
    createdAt: string;
    amount: number;
    status: string;
    reason: string;
    customerName: string;
}

const DisputesList: React.FC = () => {
    // This is a placeholder component. In production, you would fetch real dispute data
    const disputes: Dispute[] = [];

    return (
        <div className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Disputes</h3>
            {disputes.length === 0 ? (
                <p className="text-gray-500">No disputes found</p>
            ) : (
                <div className="space-y-4">
                    {disputes.map((dispute) => (
                        <div key={dispute.id} className="border-b pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{dispute.customerName}</p>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(dispute.createdAt), 'PPP')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">
                                        ${dispute.amount.toFixed(2)}
                                    </p>
                                    <span className={`text-sm ${
                                        dispute.status === 'resolved' 
                                            ? 'text-green-500' 
                                            : 'text-red-500'
                                    }`}>
                                        {dispute.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Reason: {dispute.reason}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DisputesList;
