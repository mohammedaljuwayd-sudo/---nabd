import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/nabd';
import { nafathService } from './services/nafath';
import { nabdStore } from './services/nabdStore';
import { PortalGateway } from './components/PortalGateway';
import { PortalHeader } from './components/PortalHeader';
import { UnifiedAuthModal } from './components/UnifiedAuthModal';
import { LiveOperationsTicker } from './components/LiveOperationsTicker';
import { CitizenView } from './components/CitizenView';
import { EmployeeView } from './components/EmployeeView';
import { DecisionMakerView } from './components/DecisionMakerView';
import { CostSettingsModal } from './components/CostSettingsModal';
import { NabdLogo } from './components/NabdLogo';
import { Activity } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePortalRole, setActivePortalRole] = useState<UserRole | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'password' | 'nafath'>('nafath');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('citizen');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Initialize Session
  useEffect(() => {
    const user = nafathService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setActivePortalRole(user.role);
    }
  }, []);

  const handleSelectPortalFromGateway = (role: UserRole) => {
    const updatedUser = nafathService.switchDemoRole(role);
    setCurrentUser(updatedUser);
    setActivePortalRole(role);
  };

  const handleOpenAuthModal = (
    tab: 'register' | 'password' | 'nafath',
    role: UserRole = 'citizen'
  ) => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const handleChangePortal = (newRole: UserRole) => {
    const updatedUser = nafathService.switchDemoRole(newRole);
    setCurrentUser(updatedUser);
    setActivePortalRole(newRole);
  };

  const handleReturnToGateway = () => {
    setActivePortalRole(null);
  };

  const handleLogout = async () => {
    await nafathService.logout();
    setCurrentUser(null);
    setActivePortalRole(null);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setActivePortalRole(user.role);
    setIsAuthModalOpen(false);
  };

  // If user is on the Gateway (no active portal selected)
  if (!activePortalRole || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PortalGateway
          onSelectPortal={handleSelectPortalFromGateway}
          onOpenAuthModal={handleOpenAuthModal}
        />

        <UnifiedAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          initialTab={authModalTab}
          initialRole={authModalRole}
        />

        <CostSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>
    );
  }

  // Inside a Dedicated Portal
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-cairo">
      {/* Official Dedicated Portal Header */}
      <PortalHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onReturnToGateway={handleReturnToGateway}
        onChangePortal={handleChangePortal}
      />

      {/* Live Operations Ticker (Busy Day Pulse) */}
      <LiveOperationsTicker />

      {/* Portal Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activePortalRole === 'citizen' && <CitizenView currentUser={currentUser} />}
        {activePortalRole === 'employee' && <EmployeeView currentUser={currentUser} />}
        {activePortalRole === 'decision_maker' && (
          <DecisionMakerView
            currentUser={currentUser}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}
      </main>

      {/* Official Municipal Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            <NabdLogo variant="compact" size="sm" showSubtitle={false} />
            <span className="text-slate-300">·</span>
            <span>أمانة المنطقة الشرقية · حاضرة الدمام</span>
          </div>
          <div>
            <span>جميع الحقوق محفوظة © أمانة المنطقة الشرقية 2026 · تدفق الدخول مصمَّم على النفاذ الوطني</span>
          </div>
        </div>
      </footer>

      {/* Unified Auth & Settings Modals */}
      <UnifiedAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialTab={authModalTab}
        initialRole={activePortalRole}
      />

      <CostSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
