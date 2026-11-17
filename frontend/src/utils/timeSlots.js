/**
 * OPD 10-Minute Consultation Slots Utility
 * Aligned with standard Hospital Outpatient Department (AIIMS ORS / JNMCH AMU)
 */

export const OPD_10_MIN_SLOTS = [
  '08:30 AM - 08:40 AM',
  '08:40 AM - 08:50 AM',
  '08:50 AM - 09:00 AM',
  '09:00 AM - 09:10 AM',
  '09:10 AM - 09:20 AM',
  '09:20 AM - 09:30 AM',
  '09:30 AM - 09:40 AM',
  '09:40 AM - 09:50 AM',
  '09:50 AM - 10:00 AM',
  '10:00 AM - 10:10 AM',
  '10:10 AM - 10:20 AM',
  '10:20 AM - 10:30 AM',
  '10:30 AM - 10:40 AM',
  '10:40 AM - 10:50 AM',
  '10:50 AM - 11:00 AM',
  '11:00 AM - 11:10 AM',
  '11:10 AM - 11:20 AM',
  '11:20 AM - 11:30 AM',
  '11:30 AM - 11:40 AM',
  '11:40 AM - 11:50 AM',
  '11:50 AM - 12:00 PM',
  '12:00 PM - 12:10 PM',
  '12:10 PM - 12:20 PM',
  '12:20 PM - 12:30 PM',
  '12:30 PM - 12:40 PM',
  '12:40 PM - 12:50 PM',
  '12:50 PM - 01:00 PM',
  '01:00 PM - 01:10 PM',
  '01:10 PM - 01:20 PM',
  '01:20 PM - 01:30 PM',
  '01:30 PM - 01:40 PM',
  '01:40 PM - 01:50 PM',
  '01:50 PM - 02:00 PM'
];

/**
 * Backward compatibility alias
 */
export const OPD_15_MIN_SLOTS = OPD_10_MIN_SLOTS;

/**
 * Parses a doctor's shift string (e.g. "09:00 AM - 01:00 PM")
 * into discrete 10-minute consultation appointment slots.
 *
 * @param {string} availableTimeSlot - e.g. "09:00 AM - 01:00 PM"
 * @returns {string[]} Array of 10-minute slots
 */
export function getDoctor10MinSlots(availableTimeSlot) {
  if (!availableTimeSlot || typeof availableTimeSlot !== 'string') {
    return OPD_10_MIN_SLOTS;
  }

  try {
    const parts = availableTimeSlot.split('-').map(s => s.trim());
    if (parts.length !== 2) return OPD_10_MIN_SLOTS;

    const parseMinutes = (timeStr) => {
      // Expected format: "09:00 AM" or "9:00 AM" or "01:30 PM"
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return NaN;

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const modifier = match[3].toUpperCase();

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const formatMinutes = (totalMinutes) => {
      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const modifier = hours >= 12 ? 'PM' : 'AM';
      let h12 = hours % 12;
      if (h12 === 0) h12 = 12;

      const hh = String(h12).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      return `${hh}:${mm} ${modifier}`;
    };

    const startMinutes = parseMinutes(parts[0]);
    const endMinutes = parseMinutes(parts[1]);

    if (isNaN(startMinutes) || isNaN(endMinutes) || startMinutes >= endMinutes) {
      return OPD_10_MIN_SLOTS;
    }

    const generatedSlots = [];
    for (let m = startMinutes; m + 10 <= endMinutes; m += 10) {
      generatedSlots.push(`${formatMinutes(m)} - ${formatMinutes(m + 10)}`);
    }

    return generatedSlots.length > 0 ? generatedSlots : OPD_10_MIN_SLOTS;
  } catch (err) {
    return OPD_10_MIN_SLOTS;
  }
}

/**
 * Backward compatibility alias for 10-minute slots
 */
export const getDoctor15MinSlots = getDoctor10MinSlots;
