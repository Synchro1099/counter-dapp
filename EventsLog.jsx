// src/components/EventLog.jsx
import React from 'react';

const EventLog = ({ events }) => {
  return (
    <div className="mt-8 bg-gray-900 p-6 rounded-xl border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-gray-500">No events found yet...</p>
        ) : (
          events.map((event, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-blue-400 font-mono text-sm">
                {event.returnValues.by.substring(0, 6)}...{event.returnValues.by.substring(38)}
              </span>
              <span className="text-green-400 font-bold">
                Count: {event.returnValues.newCount.toString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;