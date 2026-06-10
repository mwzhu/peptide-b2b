import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryProvider } from './lib/query';
import { AppShell } from './components/AppShell';
import { Login } from './routes/Login';
import { Dashboard } from './routes/Dashboard';
import { Patients } from './routes/Patients';
import { PatientDetail } from './routes/PatientDetail';
import { Protocols } from './routes/Protocols';
import { ProtocolDetail } from './routes/ProtocolDetail';
import { ProtocolBuilder } from './routes/ProtocolBuilder';
import { ProtocolGenerator } from './routes/ProtocolGenerator';
import { Triage } from './routes/Triage';
import { Refills } from './routes/Refills';
import { Inventory } from './routes/Inventory';
import { Messages } from './routes/Messages';
import { Settings } from './routes/Settings';

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="protocols" element={<Protocols />} />
            <Route path="protocols/generate" element={<ProtocolGenerator />} />
            <Route path="protocols/builder" element={<ProtocolBuilder />} />
            <Route path="protocols/:id" element={<ProtocolDetail />} />
            <Route path="triage" element={<Triage />} />
            <Route path="refills" element={<Refills />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:id" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
