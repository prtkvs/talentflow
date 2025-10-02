import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { worker } from './mocks/browser';
import { seedDatabase } from './utils/seedData';

// Components
import JobsBoard from './components/JobsBoard';
import JobDetail from './components/JobDetail';
import CandidatesPage from './components/CandidatesPage';
import CandidateProfile from './components/CandidateProfile';
import AssessmentLanding from './components/AssessmentLanding';
import AssessmentBuilder from './components/AssessmentBuilder';
import AssessmentRuntime from './components/AssessmentRuntime';
import AssessmentPreview from './components/AssessmentPreview';
import Navigation from './components/Navigation';

import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Start MSW worker in dev
        if (process.env.NODE_ENV === 'development') {
          await worker.start();
        }

        // Check if database is empty and seed if needed
        const { db } = await import('./database/schema');
        const jobCount = await db.jobs.count();

        if (jobCount === 0) {
          console.log('Database is empty, seeding data...');
          await seedDatabase();
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading TALENTFLOW...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error Loading Application</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navigation />

        <main className="main-content">
          <Routes>
            {/* Jobs */}
            <Route path="/" element={<JobsBoard />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />

            {/* Candidates */}
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />

            {/* Assessments */}
            <Route path="/assessments" element={<AssessmentLanding />} />
            <Route path="/jobs/:jobId/assessment/manage" element={<AssessmentBuilder />} />
            <Route path="/jobs/:jobId/assessment/preview" element={<AssessmentPreview />} />
            <Route path="/jobs/:jobId/assessment/take" element={<AssessmentRuntime />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
