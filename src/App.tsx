/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CRMDatabase, Client, Prospect, Appointment, 
  Session, NoteItem, FileAttachment, UserProfile, 
  ProspectStatus, AppointmentStatus, SessionStatus 
} from './types';
import { INITIAL_DATABASE } from './mockData';
import { 
  loadDatabaseFromLocal, saveDatabaseToDriveAndLocal, 
  syncFromDrive, GOOGLE_DRIVE_FOLDER_ID 
} from './services/googleDrive';
import { getStoredUser, saveStoredUser, signOutUser } from './services/googleAuth';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { ProspectsView } from './components/ProspectsView';
import { AppointmentsView } from './components/AppointmentsView';
import { SessionsView } from './components/SessionsView';
import { CalendarView } from './components/CalendarView';
import { NotesView } from './components/NotesView';
import { ContactDrawer } from './components/ContactDrawer';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { BackupMigrationModal } from './components/BackupMigrationModal';
import { 
  ClientModal, ProspectModal, AppointmentModal, SessionModal 
} from './components/Modals';
import { QuickActionsFAB } from './components/QuickActionsFAB';

export default function App() {
  // 1. User & Authentication
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());

  // 2. Database State
  const [database, setDatabase] = useState<CRMDatabase>(() => 
    loadDatabaseFromLocal(INITIAL_DATABASE)
  );

  // 3. Navigation View ('dashboard' | 'clients' | 'prospects' | 'appointments' | 'sessions' | 'calendar' | 'notes')
  const [activeView, setActiveView] = useState<string>('dashboard');

  // 4. Drive Sync Status
  const [driveSyncStatus, setDriveSyncStatus] = useState<{
    state: 'synced' | 'syncing' | 'error' | 'local_only';
    lastSyncedAt: string | null;
  }>({
    state: 'synced',
    lastSyncedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  });

  // 5. Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false);
  const [prospectToEdit, setProspectToEdit] = useState<Prospect | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [sessionPreselectedClientId, setSessionPreselectedClientId] = useState<string | undefined>();

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraClientId, setCameraClientId] = useState<string | undefined>();
  const [cameraProspectId, setCameraProspectId] = useState<string | undefined>();

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [drawerClient, setDrawerClient] = useState<Client | null>(null);
  const [drawerProspect, setDrawerProspect] = useState<Prospect | null>(null);

  // Sync from Drive when starting or logging in
  useEffect(() => {
    if (user) {
      syncFromDrive(database).then(({ database: freshDb }) => {
        setDatabase(freshDb);
        setDriveSyncStatus({
          state: 'synced',
          lastSyncedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        });
      });
    }
  }, [user]);

  // Helper to persist and sync database
  const updateAndSyncDatabase = async (newDb: CRMDatabase) => {
    setDatabase(newDb);
    setDriveSyncStatus((prev) => ({ ...prev, state: 'syncing' }));

    try {
      const res = await saveDatabaseToDriveAndLocal(newDb);
      setDriveSyncStatus({
        state: 'synced',
        lastSyncedAt: new Date(res.timestamp).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    } catch (e) {
      setDriveSyncStatus((prev) => ({ ...prev, state: 'error' }));
    }
  };

  // Force manual cloud sync
  const handleForceDriveSync = async () => {
    setDriveSyncStatus((prev) => ({ ...prev, state: 'syncing' }));
    const { database: refreshed } = await syncFromDrive(database);
    setDatabase(refreshed);
    setDriveSyncStatus({
      state: 'synced',
      lastSyncedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    });
  };

  // Handle Login
  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    saveStoredUser(loggedInUser);
  };

  // Handle Logout
  const handleSignOut = () => {
    signOutUser();
    setUser(null);
  };

  // ----------------------------------------------------------------------
  // CLIENT HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveClient = (client: Client) => {
    const exists = database.clients.some((c) => c.id === client.id);
    let updatedClients: Client[];

    if (exists) {
      updatedClients = database.clients.map((c) => (c.id === client.id ? client : c));
    } else {
      updatedClients = [client, ...database.clients];
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }

    updateAndSyncDatabase({
      ...database,
      clients: updatedClients
    });

    if (drawerClient && drawerClient.id === client.id) {
      setDrawerClient(client);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    updateAndSyncDatabase({
      ...database,
      clients: database.clients.filter((c) => c.id !== clientId),
      sessions: database.sessions.filter((s) => s.clientId !== clientId)
    });
    if (drawerClient?.id === clientId) {
      setIsContactDrawerOpen(false);
    }
  };

  const handleDeleteAllClients = () => {
    updateAndSyncDatabase({
      ...database,
      clients: [],
      sessions: database.sessions.filter((s) => !s.clientId),
      appointments: database.appointments.filter((a) => a.relatedTo?.type !== 'client'),
      notes: database.notes.filter((n) => n.relatedType !== 'client'),
      files: database.files.filter((f) => f.relatedType !== 'client')
    });
    setDrawerClient(null);
    setIsContactDrawerOpen(false);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleRecordPayment = (client: Client, amount: number) => {
    const newPaid = client.advancePaid + amount;
    const newBalance = Math.max(0, client.totalPrice - newPaid);
    const updated: Client = {
      ...client,
      advancePaid: newPaid,
      balanceDue: newBalance,
      updatedAt: new Date().toISOString()
    };
    handleSaveClient(updated);
  };

  // ----------------------------------------------------------------------
  // PROSPECT HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveProspect = (prospect: Prospect) => {
    const exists = database.prospects.some((p) => p.id === prospect.id);
    let updatedProspects: Prospect[];

    if (exists) {
      updatedProspects = database.prospects.map((p) => (p.id === prospect.id ? prospect : p));
    } else {
      updatedProspects = [prospect, ...database.prospects];
    }

    updateAndSyncDatabase({
      ...database,
      prospects: updatedProspects
    });

    if (drawerProspect && drawerProspect.id === prospect.id) {
      setDrawerProspect(prospect);
    }
  };

  const handleEditProspect = (prospect: Prospect) => {
    setProspectToEdit(prospect);
    setIsProspectModalOpen(true);
  };

  const handleDeleteProspect = (prospectId: string) => {
    updateAndSyncDatabase({
      ...database,
      prospects: database.prospects.filter((p) => p.id !== prospectId)
    });
    if (drawerProspect?.id === prospectId) {
      setIsContactDrawerOpen(false);
    }
  };

  const handleUpdateProspectStatus = (prospectId: string, status: ProspectStatus) => {
    const updated = database.prospects.map((p) =>
      p.id === prospectId ? { ...p, status } : p
    );
    updateAndSyncDatabase({
      ...database,
      prospects: updated
    });
  };

  // Convert Prospect to Client (Featured workflow)
  const handleConvertToClient = (prospect: Prospect) => {
    const newClientId = `cli-${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: prospect.name,
      eventType: prospect.eventType,
      eventDate: prospect.estimatedDate || new Date().toISOString().split('T')[0],
      location: 'Hacienda / Salón por confirmar',
      city: 'Mérida, Yucatán',
      packageContracted: prospect.interestedPackage || 'Paquete Cinematográfico 4K',
      totalPrice: prospect.budget || 35000,
      advancePaid: 10000,
      balanceDue: Math.max(0, (prospect.budget || 35000) - 10000),
      phone: prospect.phone,
      email: prospect.email,
      isVip: prospect.priority === 'Alta',
      notes: `Convertido de prospecto el ${new Date().toLocaleDateString('es-MX')}. ${prospect.notes || ''}`,
      createdAt: new Date().toISOString()
    };

    const updatedProspects = database.prospects.map((p) =>
      p.id === prospect.id ? { ...p, status: 'Ganado' as ProspectStatus, convertedToClientId: newClientId } : p
    );

    updateAndSyncDatabase({
      ...database,
      clients: [newClient, ...database.clients],
      prospects: updatedProspects
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    } catch (e) {}

    // Open drawer with new client
    setDrawerProspect(null);
    setDrawerClient(newClient);
    setIsContactDrawerOpen(true);
  };

  // ----------------------------------------------------------------------
  // APPOINTMENT HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveAppointment = (appointment: Appointment) => {
    const exists = database.appointments.some((a) => a.id === appointment.id);
    const updated = exists
      ? database.appointments.map((a) => (a.id === appointment.id ? appointment : a))
      : [appointment, ...database.appointments];

    updateAndSyncDatabase({
      ...database,
      appointments: updated
    });
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const updated = database.appointments.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    updateAndSyncDatabase({
      ...database,
      appointments: updated
    });
  };

  const handleDeleteAppointment = (id: string) => {
    updateAndSyncDatabase({
      ...database,
      appointments: database.appointments.filter((a) => a.id !== id)
    });
  };

  // ----------------------------------------------------------------------
  // SESSION HANDLERS
  // ----------------------------------------------------------------------
  const handleSaveSession = (session: Session) => {
    const exists = database.sessions.some((s) => s.id === session.id);
    const updated = exists
      ? database.sessions.map((s) => (s.id === session.id ? session : s))
      : [session, ...database.sessions];
    updateAndSyncDatabase({
      ...database,
      sessions: updated
    });
  };

  const handleEditSession = (session: Session) => {
    setSessionToEdit(session);
    setIsSessionModalOpen(true);
  };

  const handleUnlockProspectDate = (prospectId: string) => {
    const p = database.prospects.find((x) => x.id === prospectId);
    if (p) {
      handleSaveProspect({
        ...p,
        estimatedDate: undefined
      });
    }
  };

  const handleUpdateSessionStatus = (id: string, status: SessionStatus) => {
    const updated = database.sessions.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    updateAndSyncDatabase({
      ...database,
      sessions: updated
    });
  };

  const handleDeleteSession = (id: string) => {
    updateAndSyncDatabase({
      ...database,
      sessions: database.sessions.filter((s) => s.id !== id)
    });
  };

  // ----------------------------------------------------------------------
  // NOTE & FILE HANDLERS
  // ----------------------------------------------------------------------
  const handleAddNote = (note: NoteItem) => {
    updateAndSyncDatabase({
      ...database,
      notes: [note, ...database.notes]
    });
  };

  const handleUpdateNote = (updatedNote: NoteItem) => {
    updateAndSyncDatabase({
      ...database,
      notes: database.notes.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    });
  };

  const handleDeleteNote = (id: string) => {
    updateAndSyncDatabase({
      ...database,
      notes: database.notes.filter((n) => n.id !== id)
    });
  };

  const handleSaveFile = (file: FileAttachment) => {
    updateAndSyncDatabase({
      ...database,
      files: [file, ...database.files]
    });
    try {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    } catch (e) {}
  };

  const handleDeleteFile = (id: string) => {
    updateAndSyncDatabase({
      ...database,
      files: database.files.filter((f) => f.id !== id)
    });
  };

  // If user is not logged in, render the login view
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#181715] flex flex-col antialiased selection:bg-[#C85A32]/20 selection:text-[#C85A32]">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        database={database}
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenCamera={() => {
          setCameraClientId(undefined);
          setCameraProspectId(undefined);
          setIsCameraModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onForceDriveSync={handleForceDriveSync}
        driveSyncStatus={driveSyncStatus}
        onSignOut={handleSignOut}
      />

      {/* Main Layout Container (Desktop Sidebar + Main Content) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <Sidebar
            activeView={activeView}
            onNavigate={setActiveView}
            database={database}
            user={user}
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
            onForceDriveSync={handleForceDriveSync}
            driveSyncStatus={driveSyncStatus}
            onSignOut={handleSignOut}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 lg:pb-12">
          {activeView === 'dashboard' && (
            <DashboardView
              database={database}
              onNavigate={setActiveView}
              onOpenNewClient={() => {
                setClientToEdit(null);
                setIsClientModalOpen(true);
              }}
              onOpenNewProspect={() => {
                setProspectToEdit(null);
                setIsProspectModalOpen(true);
              }}
              onOpenNewAppointment={() => {
                setAppointmentToEdit(null);
                setIsAppointmentModalOpen(true);
              }}
              onOpenNewSession={() => {
                setSessionPreselectedClientId(undefined);
                setIsSessionModalOpen(true);
              }}
              onOpenCamera={() => {
                setCameraClientId(undefined);
                setCameraProspectId(undefined);
                setIsCameraModalOpen(true);
              }}
              onOpenBackupModal={() => setIsBackupModalOpen(true)}
              onSelectClient={(c) => {
                setDrawerProspect(null);
                setDrawerClient(c);
                setIsContactDrawerOpen(true);
              }}
              onSelectProspect={(p) => {
                setDrawerClient(null);
                setDrawerProspect(p);
                setIsContactDrawerOpen(true);
              }}
              onConvertToClient={handleConvertToClient}
            />
          )}

          {activeView === 'clients' && (
            <ClientsView
              clients={database.clients}
              sessions={database.sessions}
              files={database.files}
              onOpenNewClient={() => {
                setClientToEdit(null);
                setIsClientModalOpen(true);
              }}
              onEditClient={(c) => {
                setClientToEdit(c);
                setIsClientModalOpen(true);
              }}
              onDeleteClient={handleDeleteClient}
              onDeleteAllClients={handleDeleteAllClients}
              onSelectClient={(c) => {
                setDrawerProspect(null);
                setDrawerClient(c);
                setIsContactDrawerOpen(true);
              }}
              onOpenAddSession={(clientId) => {
                setSessionPreselectedClientId(clientId);
                setIsSessionModalOpen(true);
              }}
              onOpenCamera={(clientId) => {
                setCameraClientId(clientId);
                setCameraProspectId(undefined);
                setIsCameraModalOpen(true);
              }}
              onOpenBackupModal={() => setIsBackupModalOpen(true)}
            />
          )}

          {activeView === 'prospects' && (
            <ProspectsView
              prospects={database.prospects}
              onOpenNewProspect={() => {
                setProspectToEdit(null);
                setIsProspectModalOpen(true);
              }}
              onEditProspect={(p) => {
                setProspectToEdit(p);
                setIsProspectModalOpen(true);
              }}
              onDeleteProspect={handleDeleteProspect}
              onSelectProspect={(p) => {
                setDrawerClient(null);
                setDrawerProspect(p);
                setIsContactDrawerOpen(true);
              }}
              onConvertToClient={handleConvertToClient}
              onUpdateStatus={handleUpdateProspectStatus}
              onNavigateToProspectsCalendar={() => setActiveView('calendar-prospects')}
            />
          )}

          {activeView === 'appointments' && (
            <AppointmentsView
              appointments={database.appointments}
              onOpenNewAppointment={() => {
                setAppointmentToEdit(null);
                setIsAppointmentModalOpen(true);
              }}
              onEditAppointment={handleEditAppointment}
              onSaveAppointment={handleSaveAppointment}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {activeView === 'sessions' && (
            <SessionsView
              sessions={database.sessions}
              clients={database.clients}
              onOpenNewSession={() => {
                setSessionToEdit(null);
                setSessionPreselectedClientId(undefined);
                setIsSessionModalOpen(true);
              }}
              onEditSession={handleEditSession}
              onUpdateStatus={handleUpdateSessionStatus}
              onDeleteSession={handleDeleteSession}
            />
          )}

          {(activeView === 'calendar' || activeView === 'calendar-prospects') && (
            <CalendarView
              clients={database.clients}
              prospects={database.prospects}
              appointments={database.appointments}
              sessions={database.sessions}
              initialTab={activeView === 'calendar-prospects' ? 'prospects' : 'clients'}
              onSelectClient={(c) => {
                setDrawerProspect(null);
                setDrawerClient(c);
                setIsContactDrawerOpen(true);
              }}
              onEditClient={handleEditClient}
              onSelectProspect={(p) => {
                setDrawerClient(null);
                setDrawerProspect(p);
                setIsContactDrawerOpen(true);
              }}
              onEditProspect={handleEditProspect}
              onUnlockProspectDate={handleUnlockProspectDate}
              onConvertToClient={handleConvertToClient}
              onOpenNewProspect={() => {
                setProspectToEdit(null);
                setIsProspectModalOpen(true);
              }}
              onOpenNewAppointment={() => setIsAppointmentModalOpen(true)}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={database.notes}
              files={database.files}
              clients={database.clients}
              prospects={database.prospects}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onOpenCamera={() => {
                setCameraClientId(undefined);
                setCameraProspectId(undefined);
                setIsCameraModalOpen(true);
              }}
              onSaveFile={handleSaveFile}
              onDeleteFile={handleDeleteFile}
            />
          )}
        </main>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <BottomNav
        activeView={activeView}
        onNavigate={setActiveView}
        database={database}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Side Contact Drawer for Client or Prospect Dossier */}
      <ContactDrawer
        isOpen={isContactDrawerOpen}
        onClose={() => setIsContactDrawerOpen(false)}
        client={drawerClient}
        prospect={drawerProspect}
        sessions={database.sessions}
        files={database.files}
        onOpenAddSession={(clientId) => {
          setSessionPreselectedClientId(clientId);
          setIsSessionModalOpen(true);
        }}
        onOpenCameraForContact={(type, id) => {
          if (type === 'client') {
            setCameraClientId(id);
            setCameraProspectId(undefined);
          } else {
            setCameraProspectId(id);
            setCameraClientId(undefined);
          }
          setIsCameraModalOpen(true);
        }}
        onConvertToClient={handleConvertToClient}
        onRecordPayment={handleRecordPayment}
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        clients={database.clients}
        prospects={database.prospects}
        preselectedClientId={cameraClientId}
        preselectedProspectId={cameraProspectId}
        onSaveFile={handleSaveFile}
      />

      {/* Backup and Migration Center Modal */}
      <BackupMigrationModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        database={database}
        onUpdateDatabase={updateAndSyncDatabase}
        onForceDriveSync={handleForceDriveSync}
        driveSyncStatus={driveSyncStatus}
      />

      {/* New / Edit Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
        existingClients={database.clients}
        existingProspects={database.prospects}
        onSave={handleSaveClient}
      />

      {/* New / Edit Prospect Modal */}
      <ProspectModal
        isOpen={isProspectModalOpen}
        onClose={() => setIsProspectModalOpen(false)}
        prospectToEdit={prospectToEdit}
        existingProspects={database.prospects}
        existingClients={database.clients}
        onSave={handleSaveProspect}
      />

      {/* New / Edit Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        appointmentToEdit={appointmentToEdit}
        clients={database.clients}
        prospects={database.prospects}
        onSave={handleSaveAppointment}
      />

      {/* New Photo / Video Session Modal */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSessionToEdit(null);
        }}
        sessionToEdit={sessionToEdit}
        clients={database.clients}
        onSave={handleSaveSession}
      />

      {/* Global Floating Quick Actions Button (FAB) */}
      <QuickActionsFAB
        onOpenNewClient={() => {
          setClientToEdit(null);
          setIsClientModalOpen(true);
        }}
        onOpenNewProspect={() => {
          setProspectToEdit(null);
          setIsProspectModalOpen(true);
        }}
        onOpenNewAppointment={() => {
          setAppointmentToEdit(null);
          setIsAppointmentModalOpen(true);
        }}
        onOpenNewSession={() => {
          setSessionPreselectedClientId(undefined);
          setIsSessionModalOpen(true);
        }}
        onOpenCamera={() => {
          setCameraClientId(undefined);
          setCameraProspectId(undefined);
          setIsCameraModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onNavigate={setActiveView}
      />

    </div>
  );
}
