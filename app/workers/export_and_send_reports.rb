class ExportAndSendReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(days_due, quarter, year, time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year, films: {export_reports: true, send_reports: true}, date_sent: nil)
    reports.each do |report|
      return if Sidekiq.redis {|c| c.exists("cancelled-#{jid}") }
      film = report.film
      if (days_due == "all" || film.days_statement_due == days_due.to_i)
        licensor = film.licensor
        if licensor
          licensor_folder = "#{Rails.root}/tmp/#{time_started}/#{licensor.id}"
          FileUtils.mkdir_p(licensor_folder) unless File.exist?(licensor_folder)
          p '---------------------------'
          p "#{film.title} (#{jid})"
          p '---------------------------'
          report.calculate!
          report.export!(licensor_folder)
        else
          new_line = (job.errors_text == "" ? "" : "\n")
          job.update({errors_text: job.errors_text += (new_line + "Film #{film.title} is missing licensor.")})
        end
        job.update({current_value: job.current_value + 1})
      end
    end
    job.update({first_line: "Adding Emails to Mailgun Queue", current_value: 0, total_value: Dir.entries(Rails.root.join('tmp', "#{time_started}")).length - 2})
    licensors = Licensor.all.order(:id)
    Dir.foreach("#{Rails.root}/tmp/#{time_started}") do |entry|
      next if entry == "." || entry == ".."
      licensor = licensors[entry.to_i - 1]
      if licensor.email && licensor.email != ""
        file_names = Dir.entries(Rails.root.join('tmp', "#{time_started}", entry))
        file_names.select! { |string| (string != '.' && string != '..') }
        attachments = file_names.map { |string| File.open(Rails.root.join('tmp', "#{time_started}", entry, string), "r") }
        royalty_email_text = "Hello,\n\nPlease find attached your Q#{quarter} #{year} producer reports. Please let me know if you have any questions, or if this report should be sent to a different person.\n\nKind Regards,\n\nMichael Rosenberg\nPresident\nFilm Movement"
        mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
        message_params =  { from: 'michael@filmmovement.com',
                            # to: licensor.email.strip,
                            to: 'plemiszki@gmail.com',
                            # cc: "michael@filmmovement.com",
                            subject: "Your Q#{quarter} #{year} producer reports from Film Movement",
                            text: "#{royalty_email_text}",
                            attachment: attachments
                          }
        begin
          mg_client.send_message 'filmmovement.com', message_params
          film_titles = file_names.map { |file_name| file_name.split('-')[0...-1].join('-').strip }
          film_titles.each do |film_title|
            film_id = Film.find_by_title(film_title).id
            report = RoyaltyReport.find_by(film_id: film_id, quarter: quarter, year: year)
            report.update!(date_sent: Date.today)
          end
        rescue
          p '-------------------------'
          p "FAILED TO SEND EMAIL TO #{licensors[entry.to_i - 1].name}"
          p '-------------------------'
          new_line = (job.errors_text == "" ? "" : "\n")
          job.update({errors_text: job.errors_text += (new_line + "Failed to send email to #{licensors[entry.to_i - 1].name}")})
        ensure
          job.update({current_value: job.current_value + 1})
        end
      else
        new_line = (job.errors_text == "" ? "" : "\n")
        job.update({errors_text: job.errors_text += (new_line + "Licensor #{licensor.name} is missing email.")})
      end
    end
    job.update({first_line: "Done!", second_line: false})
  end
end