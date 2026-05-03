import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import newRequest from '../../utils/newRequest';
import { toast } from 'react-toastify';
import './VerifyEmail.scss';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await newRequest.get(`/api/auth/verify-email/${token}`);
        setStatus('success');
        toast.success(res.data.message);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (err) {
        setStatus('error');
        toast.error(err.response?.data?.message || "Verification failed");
      }
    };
    verifyToken();
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-card">
        {status === 'verifying' && (
          <>
            <div className="loader"></div>
            <h1>Verifying your email...</h1>
            <p>Please wait a moment while we activate your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="icon success">✅</div>
            <h1>Email Verified!</h1>
            <p>Your account has been successfully activated. Redirecting you to login...</p>
            <button onClick={() => navigate('/')}>Go to Login Now</button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="icon error">❌</div>
            <h1>Verification Failed</h1>
            <p>The link may be invalid or expired. Please try signing up again.</p>
            <button onClick={() => navigate('/')}>Back to Signup</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
