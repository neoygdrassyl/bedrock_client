import FUNService from '@/app/services/fun.service';
import SubmitService from '@/app/services/submit.service';
import { nextLicenseIdPublic, nextVrId } from '@/shared/utils/consecutives';

/**
 * Prefill values for "Llevar a radicación", computed with the same rules as "Radicar" (fun.js)
 * and "Nueva entrada" (submit_manage.js). The backend revalidates both on radicate.
 */
function lastValue(response, key) {
  const rows = response?.data;
  return Array.isArray(rows) && rows.length ? rows[0]?.[key] ?? null : null;
}

export async function fetchNextLicenseIdPublic() {
  return nextLicenseIdPublic(lastValue(await FUNService.getLastIdPublic(), 'id'));
}

export async function fetchNextVr() {
  return nextVrId(lastValue(await SubmitService.getlastid(), 'vr'));
}
