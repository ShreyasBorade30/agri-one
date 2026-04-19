import React, { useEffect, useState } from 'react';
import './AppointmentHistory.scss';
import newRequest from '../../utils/newRequest.js';
import ExpertSidebar from '../../components/expertSidebar/ExpertSidebar.jsx';
import ExpertNavbar from '../../components/expertNavbar/ExpertNavbar.jsx';

const AppointmentHistory = ({ setUserRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await newRequest.get('/api/appointments/expert');
        // Filter out pending appointments to show only historical (accepted/declined)
        const history = response.data.filter(app => app.status !== 'pending');
        setAppointments(history);
      } catch (err) {
        console.error("Error fetching appointment history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="history-page">
      <ExpertSidebar setUserRole={setUserRole} />
      <div className="history-container">
        <ExpertNavbar />
        <div className="content">
          <h1>Appointment Booking History</h1>
          {loading ? (
            <p>Loading history...</p>
          ) : appointments.length > 0 ? (
            <div className="history-list">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Farmer Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((app) => (
                    <tr key={app._id} className={app.status}>
                      <td>{new Date(app.date).toLocaleDateString()}</td>
                      <td>{app.farmerId?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No appointment history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;
