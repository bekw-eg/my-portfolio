import { Router } from 'express';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload, setUploadType } from '../middleware/upload.js';
import * as auth from '../controllers/authController.js';
import * as projects from '../controllers/projectsController.js';
import * as blog from '../controllers/blogController.js';
import * as main from '../controllers/mainController.js';
import * as pub from '../controllers/publicController.js';

const router = Router();

// ============================================================
// AUTH
// ============================================================
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refreshToken);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', authenticate, auth.getMe);
router.put('/auth/password', authenticate, auth.changePassword);

// ============================================================
// PUBLIC — Profile
// ============================================================
router.get('/profile', main.getProfile);

// ============================================================
// PUBLIC — User Portfolio (SEO-friendly)
// ============================================================
router.get('/public/u/:username', pub.getPublicPortfolio);
router.get('/public/portfolio/:username', pub.getPublicPortfolio);

// ============================================================
// LEGACY ADMIN — Profile (бастапқы портфолио өзгермесін)
// ============================================================
router.put('/profile', authenticate, requireAdmin,
  setUploadType('avatars'), upload.single('avatar'), main.updateProfile);

// ============================================================
// ME — Profile (әр қолданушы өз профилін басқарады)
// ============================================================
router.get('/me/profile', authenticate, main.getMyProfile);
router.put('/me/profile', authenticate,
  setUploadType('avatars'), upload.single('avatar'), main.updateMyProfile);
router.get('/me/settings', authenticate, main.getMySettings);
router.put('/me/settings', authenticate, main.updateMySettings);

// ============================================================
// Skills
// ============================================================
router.get('/skills', main.getSkills);
router.post('/skills', authenticate, requireAdmin, main.createSkill);
router.put('/skills/:id', authenticate, requireAdmin, main.updateSkill);
router.delete('/skills/:id', authenticate, requireAdmin, main.deleteSkill);

router.get('/me/skills', authenticate, main.getMySkills);
router.post('/me/skills', authenticate, main.createMySkill);
router.put('/me/skills/:id', authenticate, main.updateMySkill);
router.delete('/me/skills/:id', authenticate, main.deleteMySkill);

// ============================================================
// Projects
// ============================================================
router.get('/projects', optionalAuth, projects.getProjects);
router.get('/projects/:slug', projects.getProject);
router.post('/projects', authenticate, requireAdmin,
  setUploadType('projects'), upload.single('cover_image'), projects.createProject);
router.put('/projects/:id', authenticate, requireAdmin,
  setUploadType('projects'), upload.single('cover_image'), projects.updateProject);
router.delete('/projects/:id', authenticate, requireAdmin, projects.deleteProject);

router.get('/me/projects', authenticate, projects.getMyProjects);
router.get('/me/projects/:id', authenticate, projects.getMyProjectById);
router.post('/me/projects', authenticate,
  setUploadType('projects'), upload.single('cover_image'), projects.createMyProject);
router.put('/me/projects/:id', authenticate,
  setUploadType('projects'), upload.single('cover_image'), projects.updateMyProject);
router.delete('/me/projects/:id', authenticate, projects.deleteMyProject);

// ============================================================
// Experience
// ============================================================
router.get('/experience', main.getExperience);
router.post('/experience', authenticate, requireAdmin, main.createExperience);
router.put('/experience/:id', authenticate, requireAdmin, main.updateExperience);
router.delete('/experience/:id', authenticate, requireAdmin, main.deleteExperience);

router.get('/me/experience', authenticate, main.getMyExperience);
router.post('/me/experience', authenticate, main.createMyExperience);
router.put('/me/experience/:id', authenticate, main.updateMyExperience);
router.delete('/me/experience/:id', authenticate, main.deleteMyExperience);

// ============================================================
// Education
// ============================================================
router.get('/education', main.getEducation);
router.post('/education', authenticate, requireAdmin, main.createEducation);
router.put('/education/:id', authenticate, requireAdmin, main.updateEducation);
router.delete('/education/:id', authenticate, requireAdmin, main.deleteEducation);

router.get('/me/education', authenticate, main.getMyEducation);
router.post('/me/education', authenticate, main.createMyEducation);
router.put('/me/education/:id', authenticate, main.updateMyEducation);
router.delete('/me/education/:id', authenticate, main.deleteMyEducation);

// ============================================================
// Certificates
// ============================================================
router.get('/certificates', main.getCertificates);
router.post('/certificates', authenticate, requireAdmin,
  setUploadType('certificates'), upload.single('image'), main.createCertificate);
router.put('/certificates/:id', authenticate, requireAdmin,
  setUploadType('certificates'), upload.single('image'), main.updateCertificate);
router.delete('/certificates/:id', authenticate, requireAdmin, main.deleteCertificate);

router.get('/me/certificates', authenticate, main.getMyCertificates);
router.post('/me/certificates', authenticate,
  setUploadType('certificates'), upload.single('image'), main.createMyCertificate);
router.put('/me/certificates/:id', authenticate,
  setUploadType('certificates'), upload.single('image'), main.updateMyCertificate);
router.delete('/me/certificates/:id', authenticate, main.deleteMyCertificate);

// ============================================================
// Blog
// ============================================================
router.get('/blog', optionalAuth, blog.getBlogPosts);
router.get('/blog/:slug', blog.getBlogPost);
router.post('/blog', authenticate, requireAdmin,
  setUploadType('blog'), upload.single('cover_image'), blog.createBlogPost);
router.put('/blog/:id', authenticate, requireAdmin,
  setUploadType('blog'), upload.single('cover_image'), blog.updateBlogPost);
router.delete('/blog/:id', authenticate, requireAdmin, blog.deleteBlogPost);

router.get('/me/blog', authenticate, blog.getMyBlogPosts);
router.get('/me/blog/:id', authenticate, blog.getMyBlogPostById);
router.post('/me/blog', authenticate,
  setUploadType('blog'), upload.single('cover_image'), blog.createMyBlogPost);
router.put('/me/blog/:id', authenticate,
  setUploadType('blog'), upload.single('cover_image'), blog.updateMyBlogPost);
router.delete('/me/blog/:id', authenticate, blog.deleteMyBlogPost);

// ============================================================
// Contacts
// ============================================================
router.post('/contacts', main.submitContact);
router.get('/contacts', authenticate, requireAdmin, main.getContacts);
router.put('/contacts/:id/status', authenticate, requireAdmin, main.updateContactStatus);

router.get('/me/contacts', authenticate, main.getMyContacts);
router.put('/me/contacts/:id/status', authenticate, main.updateMyContactStatus);

// ============================================================
// Analytics
// ============================================================
router.get('/analytics', authenticate, requireAdmin, main.getAnalytics);
router.post('/analytics/track', main.trackPageView);

export default router;
