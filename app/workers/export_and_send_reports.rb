class ExportAndSendReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(days_due, quarter, year, time_started)

    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    job = Job.find_by_job_id(time_started)

    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year, films: {send_reports: true})
    reports.each do |report|
      return if Sidekiq.redis {|c| c.exists("cancelled-#{jid}") }
      if (days_due == "all" || report.film.days_statement_due == days_due.to_i) && report.film.export_reports && report.film.licensor
        licensor_folder = "#{Rails.root}/tmp/#{time_started}/#{report.film.licensor.id}"
        FileUtils.mkdir_p(licensor_folder) unless File.exist?(licensor_folder)
        p '---------------------------'
        p "#{report.film.title} (#{jid})"
        p '---------------------------'
        report.calculate!
        report.export!(licensor_folder)
        job.update({current_value: job.current_value + 1})
      end
    end
    job.update({first_line: "Adding Emails to Mailgun Queue", current_value: 0, total_value: Dir.entries(Rails.root.join('tmp', "#{time_started}")).length - 2})
    licensors = Licensor.all.order(:id)
    Dir.foreach("#{Rails.root}/tmp/#{time_started}") do |entry|
      next if entry == "." || entry == ".."
      file_names = Dir.entries(Rails.root.join('tmp', "#{time_started}", entry))
      file_names.select! { |string| (string != '.' && string != '..') }
      attachments = file_names.map { |string| File.open(Rails.root.join('tmp', "#{time_started}", entry, string), "r") }
      royalty_email_text = licensors[entry.to_i - 1].email
      mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
      message_params =  { from: 'michael@filmmovement.com',
                          to: 'plemiszki@gmail.com',
                          subject: "Your Q#{quarter} #{year} statements from Film Movement",
                          text: "#{royalty_email_text}",
                          attachment: attachments
                        }
      begin
        mg_client.send_message 'filmmovement.com', message_params
        job.update({current_value: job.current_value + 1})
      rescue
        p '-------------------------'
        p "FAILED TO SEND EMAIL TO #{licensors[entry.to_i - 1].name}"
        p '-------------------------'
      end
    end
    job.update({first_line: "Done!", second_line: false})
  end
end
