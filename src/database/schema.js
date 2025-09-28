import Dexie from 'dexie';

export const db = new Dexie('TalentFlowDB');

db.version(1).stores({
  jobs: '++id, title, slug, status, tags, order, createdAt, updatedAt',
  candidates: '++id, name, email, stage, jobId, createdAt, updatedAt',
  candidateTimeline: '++id, candidateId, stage, notes, createdAt',
  assessments: '++id, jobId, title, sections, createdAt, updatedAt',
  assessmentResponses: '++id, assessmentId, candidateId, responses, submittedAt'
});

// Add indexes for better performance
db.version(2).stores({
  jobs: '++id, title, slug, status, tags, order, createdAt, updatedAt',
  candidates: '++id, name, email, stage, jobId, createdAt, updatedAt',
  candidateTimeline: '++id, candidateId, stage, notes, createdAt',
  assessments: '++id, jobId, title, sections, createdAt, updatedAt',
  assessmentResponses: '++id, assessmentId, candidateId, responses, submittedAt'
}).upgrade(tx => {
  // Add indexes for search performance
  return tx.candidates.createIndex(['name', 'email']);
});

export default db;
