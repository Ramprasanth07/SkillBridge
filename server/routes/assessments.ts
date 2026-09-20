import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateJWT, AuthenticatedRequest } from '../auth.js';

const router = Router();

// All assessment routes require student authentication
router.use(authenticateJWT);

// Ensure req.student is resolved or auto-created for authenticated student accounts
router.use((req: AuthenticatedRequest, _res: Response, next) => {
  if (!req.student && req.dbUser && (req.dbUser.role === 'student' || req.user?.role === 'student')) {
    req.student = db.findStudentByUserId(req.dbUser.id) || db.ensureStudentProfileForUser(req.dbUser.id);
  }
  next();
});

// GET /api/assessments - List all assessments with student attempt stats
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const assessments = db.getAllAssessments(student.id);
    const stats = db.getStudentAssessmentStats(student.id);

    return res.json({
      assessments,
      stats
    });
  } catch (err: any) {
    console.error('Error fetching assessments:', err);
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// GET /api/assessments/history - Get student attempt history
router.get('/history', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const history = db.getStudentAssessmentHistory(student.id);
    const stats = db.getStudentAssessmentStats(student.id);

    return res.json({
      history,
      stats
    });
  } catch (err: any) {
    console.error('Error fetching assessment history:', err);
    return res.status(500).json({ error: 'Failed to fetch assessment history' });
  }
});

// GET /api/assessments/:id - Get single assessment metadata
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = db.getAssessmentById(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const student = req.student;
    const all = db.getAllAssessments(student?.id);
    const matched = all.find(a => a.id === id);

    return res.json({
      assessment: matched || assessment
    });
  } catch (err: any) {
    console.error('Error fetching assessment by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch assessment details' });
  }
});

// GET /api/assessments/:id/questions - Get assessment questions for taking the test
router.get('/:id/questions', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const assessment = db.getAssessmentById(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const questions = db.getAssessmentQuestions(id);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions configured for this assessment' });
    }

    return res.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        category: assessment.category,
        total_questions: assessment.total_questions,
        time_limit_minutes: assessment.time_limit_minutes,
        difficulty: assessment.difficulty,
        passing_percentage: assessment.passing_percentage
      },
      questions
    });
  } catch (err: any) {
    console.error('Error fetching assessment questions:', err);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/assessments/:id/submit - Submit answers and calculate score
router.post('/:id/submit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }

    const { id } = req.params;
    const { time_taken_seconds, answers } = req.body;

    if (!answers) {
      return res.status(400).json({ error: 'Answers payload is required' });
    }

    // Format answers into array if passed as key-value object
    let formattedAnswers: Array<{ question_id: string; selected_option_index: number }> = [];

    if (Array.isArray(answers)) {
      formattedAnswers = answers;
    } else if (typeof answers === 'object') {
      formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
        question_id: qId,
        selected_option_index: Number(optIdx)
      }));
    }

    const result = db.submitAssessmentAttempt(
      student.id,
      id,
      Number(time_taken_seconds) || 60,
      formattedAnswers
    );

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    const stats = db.getStudentAssessmentStats(student.id);

    return res.json({
      message: 'Assessment evaluated and submitted successfully',
      attempt: result.attempt,
      assessment: result.assessment,
      stats
    });
  } catch (err: any) {
    console.error('Error submitting assessment:', err);
    return res.status(500).json({ error: 'Failed to evaluate assessment submission' });
  }
});

export default router;
