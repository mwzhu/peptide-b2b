/**
 * Data hooks for the provider console. Unlike the patient app these accept a
 * patient id, since a clinician works across the whole roster. All calls route
 * through the mock API.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RefillRequest, TriageStatus } from '@beacon/domain';
import { api } from '@beacon/mock-data';

/* ------------------------------- clinic-wide --------------------------- */

export const useClinic = () => useQuery({ queryKey: ['clinic'], queryFn: api.getClinic });
export const useStaff = () => useQuery({ queryKey: ['staff'], queryFn: api.getStaff });
export const useProducts = () => useQuery({ queryKey: ['products'], queryFn: api.getProducts });
export const useProtocolTemplates = () =>
  useQuery({ queryKey: ['protocolTemplates'], queryFn: api.getProtocolTemplates });
export const usePatients = () => useQuery({ queryKey: ['patients'], queryFn: api.getPatients });
export const useTriageCases = () =>
  useQuery({ queryKey: ['triage'], queryFn: api.getTriageCases });
export const useRefills = () => useQuery({ queryKey: ['refills'], queryFn: () => api.getRefills() });
export const useOrders = () => useQuery({ queryKey: ['orders'], queryFn: api.getOrders });
export const useInventory = () => useQuery({ queryKey: ['inventory'], queryFn: api.getInventory });
export const useThreads = () => useQuery({ queryKey: ['threads'], queryFn: () => api.getThreads() });
export const useThread = (id: string) =>
  useQuery({ queryKey: ['thread', id], queryFn: () => api.getThread(id) });
export const useAuditEvents = () => useQuery({ queryKey: ['audit'], queryFn: api.getAuditEvents });
export const useAnalytics = () => useQuery({ queryKey: ['analytics'], queryFn: api.getAnalytics });
export const useSubscriptions = () =>
  useQuery({ queryKey: ['subscriptions'], queryFn: api.getSubscriptions });

/* ------------------------------- per patient --------------------------- */

export const usePatient = (id: string) =>
  useQuery({ queryKey: ['patient', id], queryFn: () => api.getPatient(id) });
export const useProtocol = (patientId: string) =>
  useQuery({ queryKey: ['protocol', patientId], queryFn: () => api.getProtocol(patientId) });
export const useOccurrences = (patientId: string) =>
  useQuery({ queryKey: ['occurrences', patientId], queryFn: () => api.getOccurrences(patientId) });
export const useDoseLogs = (patientId: string) =>
  useQuery({ queryKey: ['doseLogs', patientId], queryFn: () => api.getDoseLogs(patientId) });
export const useVials = (patientId: string) =>
  useQuery({ queryKey: ['vials', patientId], queryFn: () => api.getVials(patientId) });
export const useSideEffects = (patientId: string) =>
  useQuery({ queryKey: ['sideEffects', patientId], queryFn: () => api.getSideEffects(patientId) });
export const useCheckIns = (patientId: string) =>
  useQuery({ queryKey: ['checkIns', patientId], queryFn: () => api.getCheckIns(patientId) });
export const useOutcomes = (patientId: string) =>
  useQuery({ queryKey: ['outcomes', patientId], queryFn: () => api.getOutcomes(patientId) });
export const useLabs = (patientId: string) =>
  useQuery({ queryKey: ['labs', patientId], queryFn: () => api.getLabs(patientId) });
export const useDocuments = (patientId: string) =>
  useQuery({ queryKey: ['documents', patientId], queryFn: () => api.getDocuments(patientId) });
export const useAppointments = (patientId: string) =>
  useQuery({ queryKey: ['appointments', patientId], queryFn: () => api.getAppointments(patientId) });
export const usePatientThreads = (patientId: string) =>
  useQuery({ queryKey: ['threads', patientId], queryFn: () => api.getThreads(patientId) });

/* ------------------------------- mutations ----------------------------- */

export function useUpdateTriage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { caseId: string; status: TriageStatus; assignedToId?: string }) =>
      api.updateTriage(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['triage'] }),
  });
}

export function useAdvanceRefill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      refillId: string;
      status: RefillRequest['status'];
      fulfillment?: RefillRequest['fulfillment'];
    }) => api.advanceRefill(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['refills'] }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { threadId: string; body: string }) =>
      api.sendMessage({ ...input, authorId: 'staff_reyes', authorRole: 'staff' }),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['thread', vars.threadId] });
      void qc.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

export function useApproveProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => api.approveProtocol(patientId),
    onSuccess: (_d, patientId) => {
      void qc.invalidateQueries({ queryKey: ['protocol', patientId] });
      void qc.invalidateQueries({ queryKey: ['patient', patientId] });
    },
  });
}
