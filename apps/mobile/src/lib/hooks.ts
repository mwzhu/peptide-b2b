/**
 * Typed data hooks for the patient app. Every hook is scoped to the signed-in
 * patient (`api.currentPatientId`) and goes through the mock API, which a real
 * REST client replaces later without touching call sites.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CheckIn, InjectionSite, MessageCategory, SymptomSeverity } from '@beacon/domain';
import { api } from '@beacon/mock-data';

export const ME = api.currentPatientId;

/* ------------------------------- queries ------------------------------- */

export const useClinic = () => useQuery({ queryKey: ['clinic'], queryFn: api.getClinic });
export const useStaff = () => useQuery({ queryKey: ['staff'], queryFn: api.getStaff });
export const useProducts = () => useQuery({ queryKey: ['products'], queryFn: api.getProducts });
export const useEducation = () => useQuery({ queryKey: ['education'], queryFn: api.getEducation });

export const useMe = () => useQuery({ queryKey: ['patient', ME], queryFn: () => api.getPatient(ME) });
export const useProtocol = () =>
  useQuery({ queryKey: ['protocol', ME], queryFn: () => api.getProtocol(ME) });
export const useOccurrences = () =>
  useQuery({ queryKey: ['occurrences', ME], queryFn: () => api.getOccurrences(ME) });
export const useDoseLogs = () =>
  useQuery({ queryKey: ['doseLogs', ME], queryFn: () => api.getDoseLogs(ME) });
export const useVials = () => useQuery({ queryKey: ['vials', ME], queryFn: () => api.getVials(ME) });
export const useCheckIns = () =>
  useQuery({ queryKey: ['checkIns', ME], queryFn: () => api.getCheckIns(ME) });
export const useSideEffects = () =>
  useQuery({ queryKey: ['sideEffects', ME], queryFn: () => api.getSideEffects(ME) });
export const useOutcomes = () =>
  useQuery({ queryKey: ['outcomes', ME], queryFn: () => api.getOutcomes(ME) });
export const usePhotos = () =>
  useQuery({ queryKey: ['photos', ME], queryFn: () => api.getPhotos(ME) });
export const useLabs = () => useQuery({ queryKey: ['labs', ME], queryFn: () => api.getLabs(ME) });
export const useDocuments = () =>
  useQuery({ queryKey: ['documents', ME], queryFn: () => api.getDocuments(ME) });
export const useAppointments = () =>
  useQuery({ queryKey: ['appointments', ME], queryFn: () => api.getAppointments(ME) });
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications', ME], queryFn: () => api.getNotifications(ME) });
export const useThreads = () =>
  useQuery({ queryKey: ['threads', ME], queryFn: () => api.getThreads(ME) });
export const useThread = (id: string) =>
  useQuery({ queryKey: ['thread', id], queryFn: () => api.getThread(id) });
export const useRefills = () =>
  useQuery({ queryKey: ['refills', ME], queryFn: () => api.getRefills(ME) });
export const useProduct = (id: string) =>
  useQuery({ queryKey: ['product', id], queryFn: () => api.getProduct(id) });

/* ------------------------------ mutations ------------------------------ */

export function useLogDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { occurrenceId: string; site: InjectionSite; note?: string }) =>
      api.logDose(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['occurrences', ME] });
      void qc.invalidateQueries({ queryKey: ['doseLogs', ME] });
      void qc.invalidateQueries({ queryKey: ['vials', ME] });
    },
  });
}

export function useSkipDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceId: string) => api.skipDose(occurrenceId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['occurrences', ME] }),
  });
}

export function useAddCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CheckIn, 'id'>) => api.addCheckIn(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['checkIns', ME] }),
  });
}

export function useAddSideEffect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      type: string;
      severity: SymptomSeverity;
      note?: string;
      protocolItemId?: string;
    }) => api.addSideEffect({ patientId: ME, ...input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['sideEffects', ME] }),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { threadId: string; body: string }) =>
      api.sendMessage({ ...input, authorId: ME, authorRole: 'patient' }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['thread', vars.threadId] });
      void qc.invalidateQueries({ queryKey: ['threads', ME] });
    },
  });
}

export function useStartThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { subject: string; category: MessageCategory; body: string }) =>
      api.startThread({ patientId: ME, ...input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['threads', ME] }),
  });
}

export function useRequestRefill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; protocolId: string }) =>
      api.requestRefill({ patientId: ME, ...input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['refills', ME] }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications', ME] }),
  });
}
