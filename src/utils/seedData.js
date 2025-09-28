import faker from 'faker';
import { db } from '../database/schema';

const jobTitles = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Data Scientist',
  'Machine Learning Engineer',
  'Backend Developer',
  'Mobile Developer',
  'QA Engineer',
  'Technical Writer',
  'Solutions Architect',
  'Cloud Engineer',
  'Security Engineer',
  'Database Administrator',
  'System Administrator',
  'Business Analyst',
  'Project Manager',
  'Scrum Master',
  'Sales Engineer',
  'Marketing Manager'
];

const jobTags = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
  'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API', 'Microservices',
  'Agile', 'Scrum', 'CI/CD', 'Git', 'Linux', 'Frontend', 'Backend', 'Full Stack',
  'Mobile', 'iOS', 'Android', 'Flutter', 'React Native', 'Vue.js', 'Angular'
];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const questionTypes = [
  'single-choice',
  'multi-choice', 
  'short-text',
  'long-text',
  'numeric',
  'file-upload'
];

const generateJob = (index) => {
  const title = jobTitles[index % jobTitles.length];
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const tags = faker.random.arrayElements(jobTags, faker.random.number({ min: 2, max: 5 }));
  const status = faker.random.arrayElement(['active', 'archived']);
  
  return {
    title,
    slug,
    status,
    tags,
    order: index + 1,
    createdAt: faker.date.past(2).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
};

const generateCandidate = (jobId) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const name = `${firstName} ${lastName}`;
  const email = faker.internet.email(firstName, lastName);
  const stage = faker.random.arrayElement(stages);
  
  return {
    name,
    email,
    stage,
    jobId,
    createdAt: faker.date.past(1).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
};

const generateTimelineEntry = (candidateId, stage) => {
  const stageNames = {
    applied: 'Applied to job',
    screen: 'Passed initial screening',
    tech: 'Completed technical interview',
    offer: 'Received job offer',
    hired: 'Hired for position',
    rejected: 'Application rejected'
  };
  
  return {
    candidateId,
    stage,
    notes: stageNames[stage] || `Moved to ${stage} stage`,
    createdAt: faker.date.past(0.5).toISOString()
  };
};

const generateQuestion = (sectionIndex, questionIndex) => {
  const type = faker.random.arrayElement(questionTypes);
  const question = {
    id: `q_${sectionIndex}_${questionIndex}`,
    type,
    text: faker.lorem.sentence().replace('.', '?'),
    required: faker.random.boolean(),
    order: questionIndex
  };
  
  if (type === 'single-choice' || type === 'multi-choice') {
    const optionCount = faker.random.number({ min: 2, max: 5 });
    question.options = Array.from({ length: optionCount }, (_, i) => ({
      id: `opt_${sectionIndex}_${questionIndex}_${i}`,
      text: faker.lorem.words(2),
      value: `option_${i}`
    }));
  }
  
  if (type === 'numeric') {
    question.min = faker.random.number({ min: 0, max: 10 });
    question.max = faker.random.number({ min: 20, max: 100 });
  }
  
  if (type === 'short-text' || type === 'long-text') {
    question.maxLength = type === 'short-text' ? 100 : 500;
  }
  
  // Add conditional logic for some questions
  if (questionIndex > 0 && faker.random.boolean()) {
    question.conditional = {
      dependsOn: `q_${sectionIndex}_${questionIndex - 1}`,
      condition: 'equals',
      value: 'Yes'
    };
  }
  
  return question;
};

const generateSection = (sectionIndex) => {
  const questionCount = faker.random.number({ min: 3, max: 8 });
  const questions = Array.from({ length: questionCount }, (_, questionIndex) => 
    generateQuestion(sectionIndex, questionIndex)
  );
  
  return {
    id: `section_${sectionIndex}`,
    title: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    questions,
    order: sectionIndex
  };
};

const generateAssessment = (jobId) => {
  const sectionCount = faker.random.number({ min: 2, max: 4 });
  const sections = Array.from({ length: sectionCount }, (_, sectionIndex) => 
    generateSection(sectionIndex)
  );
  
  return {
    jobId,
    title: `Assessment for ${jobTitles[jobId % jobTitles.length]}`,
    sections,
    createdAt: faker.date.past(1).toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
};

export const seedDatabase = async () => {
  try {
    // Clear existing data
    await db.jobs.clear();
    await db.candidates.clear();
    await db.candidateTimeline.clear();
    await db.assessments.clear();
    await db.assessmentResponses.clear();
    
    // Generate jobs
    const jobs = Array.from({ length: 25 }, (_, index) => generateJob(index));
    await db.jobs.bulkAdd(jobs);
    
    // Generate candidates (1000 total)
    const candidates = [];
    const timelineEntries = [];
    
    for (let i = 0; i < 1000; i++) {
      const jobId = faker.random.number({ min: 1, max: 25 });
      const candidate = generateCandidate(jobId);
      candidates.push(candidate);
      
      // Generate timeline entries for this candidate
      const candidateStages = faker.random.arrayElements(stages, faker.random.number({ min: 1, max: 3 }));
      candidateStages.forEach(stage => {
        timelineEntries.push(generateTimelineEntry(i + 1, stage));
      });
    }
    
    await db.candidates.bulkAdd(candidates);
    await db.candidateTimeline.bulkAdd(timelineEntries);
    
    // Generate assessments for some jobs
    const assessmentJobs = faker.random.arrayElements([...Array(25).keys()], 3);
    const assessments = assessmentJobs.map(jobId => generateAssessment(jobId + 1));
    await db.assessments.bulkAdd(assessments);
    
    console.log('Database seeded successfully!');
    console.log(`- ${jobs.length} jobs created`);
    console.log(`- ${candidates.length} candidates created`);
    console.log(`- ${timelineEntries.length} timeline entries created`);
    console.log(`- ${assessments.length} assessments created`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;
