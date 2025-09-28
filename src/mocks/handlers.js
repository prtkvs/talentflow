import { http, HttpResponse } from 'msw';
import { db } from '../database/schema';

// Helper function to add artificial latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate random errors
const shouldError = () => Math.random() < 0.1; // 10% error rate

// Helper function to get random latency
const getLatency = () => Math.floor(Math.random() * 1000) + 200; // 200-1200ms

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await delay(getLatency());
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    try {
      let jobs = await db.jobs.orderBy('order').toArray();
      
      // Apply filters
      if (search) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      if (status) {
        jobs = jobs.filter(job => job.status === status);
      }
      
      // Apply sorting
      if (sort === 'title') {
        jobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'createdAt') {
        jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedJobs = jobs.slice(startIndex, endIndex);
      
      return HttpResponse.json({
        data: paginatedJobs,
        pagination: {
          page,
          pageSize,
          total: jobs.length,
          totalPages: Math.ceil(jobs.length / pageSize)
        }
      });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { title, tags = [] } = await request.json();
      
      if (!title) {
        return HttpResponse.json({ error: 'Title is required' }, { status: 400 });
      }
      
      // Generate unique slug
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      // Check if slug already exists
      const existingJob = await db.jobs.where('slug').equals(slug).first();
      if (existingJob) {
        return HttpResponse.json({ error: 'Job with this title already exists' }, { status: 400 });
      }
      
      // Get next order number
      const maxOrder = await db.jobs.orderBy('order').last();
      const order = (maxOrder?.order || 0) + 1;
      
      const job = {
        title,
        slug,
        status: 'active',
        tags,
        order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const id = await db.jobs.add(job);
      
      return HttpResponse.json({ id, ...job }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { id } = params;
      const updates = await request.json();
      
      const job = await db.jobs.get(parseInt(id));
      if (!job) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      const updatedJob = {
        ...job,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.update(parseInt(id), updatedJob);
      
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { id } = params;
      const { toOrder } = await request.json();
      
      const job = await db.jobs.get(parseInt(id));
      if (!job) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      // Update the job's order
      await db.jobs.update(parseInt(id), { order: toOrder });
      
      // Update other jobs' orders if needed
      const allJobs = await db.jobs.toArray();
      const sortedJobs = allJobs.sort((a, b) => a.order - b.order);
      
      // Adjust orders of other jobs
      for (let i = 0; i < sortedJobs.length; i++) {
        if (sortedJobs[i].id !== parseInt(id)) {
          await db.jobs.update(sortedJobs[i].id, { order: i + 1 });
        }
      }
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to reorder job' }, { status: 500 });
    }
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await delay(getLatency());
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    try {
      let candidates = await db.candidates.toArray();
      
      // Apply filters
      if (search) {
        candidates = candidates.filter(candidate => 
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (stage) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCandidates = candidates.slice(startIndex, endIndex);
      
      return HttpResponse.json({
        data: paginatedCandidates,
        pagination: {
          page,
          pageSize,
          total: candidates.length,
          totalPages: Math.ceil(candidates.length / pageSize)
        }
      });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }
  }),

  http.post('/api/candidates', async ({ request }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { name, email, jobId } = await request.json();
      
      if (!name || !email) {
        return HttpResponse.json({ error: 'Name and email are required' }, { status: 400 });
      }
      
      const candidate = {
        name,
        email,
        stage: 'applied',
        jobId: parseInt(jobId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const id = await db.candidates.add(candidate);
      
      // Add to timeline
      await db.candidateTimeline.add({
        candidateId: id,
        stage: 'applied',
        notes: 'Applied to job',
        createdAt: new Date().toISOString()
      });
      
      return HttpResponse.json({ id, ...candidate }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { id } = params;
      const updates = await request.json();
      
      const candidate = await db.candidates.get(parseInt(id));
      if (!candidate) {
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }
      
      const updatedCandidate = {
        ...candidate,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.candidates.update(parseInt(id), updatedCandidate);
      
      // Add to timeline if stage changed
      if (updates.stage && updates.stage !== candidate.stage) {
        await db.candidateTimeline.add({
          candidateId: parseInt(id),
          stage: updates.stage,
          notes: `Moved to ${updates.stage} stage`,
          createdAt: new Date().toISOString()
        });
      }
      
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(getLatency());
    
    try {
      const { id } = params;
      const timeline = await db.candidateTimeline
        .where('candidateId')
        .equals(parseInt(id))
        .orderBy('createdAt')
        .toArray();
      
      return HttpResponse.json(timeline);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
    }
  }),

  // Assessments endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(getLatency());
    
    try {
      const { jobId } = params;
      const assessment = await db.assessments.where('jobId').equals(parseInt(jobId)).first();
      
      return HttpResponse.json(assessment || null);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
    }
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { jobId } = params;
      const { title, sections } = await request.json();
      
      const existingAssessment = await db.assessments.where('jobId').equals(parseInt(jobId)).first();
      
      if (existingAssessment) {
        await db.assessments.update(existingAssessment.id, {
          title,
          sections,
          updatedAt: new Date().toISOString()
        });
        return HttpResponse.json({ id: existingAssessment.id, jobId: parseInt(jobId), title, sections });
      } else {
        const id = await db.assessments.add({
          jobId: parseInt(jobId),
          title,
          sections,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return HttpResponse.json({ id, jobId: parseInt(jobId), title, sections });
      }
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    await delay(getLatency());
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    }
    
    try {
      const { jobId } = params;
      const { candidateId, responses } = await request.json();
      
      const assessment = await db.assessments.where('jobId').equals(parseInt(jobId)).first();
      if (!assessment) {
        return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }
      
      const responseId = await db.assessmentResponses.add({
        assessmentId: assessment.id,
        candidateId: parseInt(candidateId),
        responses,
        submittedAt: new Date().toISOString()
      });
      
      return HttpResponse.json({ id: responseId, success: true });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }
  })
];