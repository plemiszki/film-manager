class SendVirtualBookingReport
  include Sidekiq::Worker
  include BookingCalculations
  include ActionView::Helpers::NumberHelper
  include ApplicationHelper
  sidekiq_options retry: false

  def perform(_, args = {})
    job = Job.find_by_job_id(args['time_started'])
    mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
    current_user = User.find(args['current_user_id'])
    virtual_booking = VirtualBooking.find(args['virtual_booking_id'])
    recipient_email_address = (ENV['TEST_MODE'] == 'true' ? ENV['TEST_MODE_EMAIL'] : virtual_booking.email)
    calculations = booking_calculations(virtual_booking)
    deduction_present = virtual_booking.deduction > 0

    copy = Setting.first.virtual_booking_report_text
    copy += "\n\n"
    copy += "Title: #{virtual_booking.film.title}\n"
    copy += "Start Date: #{virtual_booking.start_date.strftime("%-m/%-d/%y")}\n"
    copy += "End Date: #{virtual_booking.end_date.strftime("%-m/%-d/%y")}\n"
    copy += "\n"
    copy += "Total Gross: #{dollarify(calculations[:total_gross])}\n"
    copy += "Terms: #{virtual_booking.terms}\n"
    copy += "Your Share: #{dollarify(calculations[:venue_share] + virtual_booking.deduction)}\n" if deduction_present
    copy += "Deduction: #{dollarify(virtual_booking.deduction)}\n" if deduction_present
    copy += "#{deduction_present ? "Total": "Your Share"}: #{dollarify(calculations[:venue_share])}\n"
    copy += "\n"
    copy += "Kind Regards,\n\n#{current_user.email_signature}"

    # send email
    message_params = {
      from: current_user.email,
      to: recipient_email_address,
      cc: current_user.email,
      subject: "Booking Report",
      text: copy
    }
    begin
      mg_client.send_message 'filmmovement.com', message_params
      virtual_booking.update(report_sent_date: Date.today)
      job.update!({
        status: 'success',
        first_line: 'Report Sent Successfully',
        metadata: {
          showSuccessMessageModal: true,
          entityName: 'virtualBooking',
          updateEntity: {
            reportSentDate: Date.today.strftime("%-m/%-d/%y")
          }
        }
      })
    rescue
      job.update!({
        status: :failed,
        errors_text: "Failed to send report to #{recipient_email_address}."
      })
    end
  end
end
