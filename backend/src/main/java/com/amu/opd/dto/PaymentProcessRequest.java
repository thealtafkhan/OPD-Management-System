package com.amu.opd.dto;

public class PaymentProcessRequest {
    private Long appointmentId;
    private String paymentMethod; // CARD, UPI, NET_BANKING, CASH_COUNTER
    private boolean simulateSuccess = true; // For testing retry handling if false

    public PaymentProcessRequest() {}

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public boolean isSimulateSuccess() { return simulateSuccess; }
    public void setSimulateSuccess(boolean simulateSuccess) { this.simulateSuccess = simulateSuccess; }
}
