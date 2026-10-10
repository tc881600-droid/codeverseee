import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Layout, { ScrollToTop } from "./components/Layout";
import { ToastProvider, Button, EmptyState } from "./components/ui";
import { useDB } from "./lib/db";
import { currentUser, initializeSession } from "./lib/services";

import Landing from "./pages/Landing";
import { AuthPage, SettingsPage, ProfilePage } from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import { LanguagesPage, LanguageDetailPage, CoursePage, LessonPage } from "./pages/Learn";
import Playground from "./pages/Playground";
import { PracticePage, ChallengePage } from "./pages/Practice";
import { ProjectsPage, ProjectDetailPage } from "./pages/Projects";
import { CommunityPage, CommunityPostPage } from "./pages/Community";
import AITutor from "./pages/AITutor";
import Docs from "./pages/Docs";
import Admin from "./pages/Admin";

function Protected({ children }: { children: React.ReactNode }) {
  const db = useDB();
  const user = currentUser(db);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={<Compass size={30} />}
        title="404 — lost in the verse"
        desc="This route doesn't exist. The dashboard, however, very much does."
        action={<Link to="/"><Button variant="outline">Back home</Button></Link>}
      />
    </div>
  );
}

export default function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize Supabase session on app load
    initializeSession().finally(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade mx-auto mb-4"></div>
          <p className="text-mist">Loading CodeVerse...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <ToastProvider>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />

            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
            <Route path="/profile/:username" element={<ProfilePage />} />

            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/languages/:slug" element={<LanguageDetailPage />} />
            <Route path="/learn/:slug" element={<CoursePage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />

            <Route path="/playground" element={<Playground />} />

            <Route path="/practice" element={<PracticePage />} />
            <Route path="/challenge/:id" element={<ChallengePage />} />

            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />

            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:postId" element={<CommunityPostPage />} />

            <Route path="/ai-tutor" element={<AITutor />} />

            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/:lang" element={<Docs />} />
            <Route path="/docs/:lang/:topic" element={<Docs />} />

            <Route path="/admin" element={<Admin />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </HashRouter>
  );
}
