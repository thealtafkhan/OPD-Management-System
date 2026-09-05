package com.amu.opd.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class IdGenerator {

    public static String generateAppointmentNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "APT-" + datePart + "-" + randPart;
    }

    public static String formatTokenNumber(String prefix, int sequence) {
        return String.format("%s-%03d", prefix, sequence);
    }
}
