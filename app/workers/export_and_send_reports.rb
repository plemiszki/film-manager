class ExportAndSendReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(report_ids, quarter, year, time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    job = Job.find_by_job_id(time_started)
    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(id: report_ids)
    crossed_films_done = []
    crossed_films_hash = {}
    reports.each do |report|
      return if job.reload.status == "killed"
      film = report.film
      licensor = film.licensor
      if licensor
        licensor_folder = "#{Rails.root}/tmp/#{time_started}/#{licensor.id}"
        FileUtils.mkdir_p(licensor_folder) unless File.exist?(licensor_folder)
        p '---------------------------'
        p "#{film.title}"
        p '---------------------------'
        films = nil
        if film.has_crossed_films?
          next if crossed_films_done.include?(film.id)
          report, royalty_revenue_streams, films = RoyaltyReport.calculate_crossed_films_report(film, report.year, report.quarter)
          crossed_films_done += films.pluck(:id)
        else
          royalty_revenue_streams = report.royalty_revenue_streams
        end
        report_name = report.export(directory: licensor_folder, royalty_revenue_streams: royalty_revenue_streams, multiple_films: (films || nil))
        if match_data = report_name.match(/ package (?<timestamp>\d+) /)
          crossed_films_hash[match_data[:timestamp]] = films.pluck(:id)
        end
      else
        new_line = (job.errors_text == '' ? '' : "\n")
        job.update({ errors_text: job.errors_text += (new_line + "Film #{film.title} is missing licensor.") })
      end
      job.update({ current_value: job.current_value + 1 })
    end
    job.update({ first_line: 'Adding Emails to Mailgun Queue', current_value: 0, total_value: Dir.entries(Rails.root.join('tmp', "#{time_started}")).length - 2 })
    Dir.foreach("#{Rails.root}/tmp/#{time_started}") do |entry|
      next if entry == '.' || entry == '..'
      licensor = Licensor.find(entry.to_i)
      if licensor.email && !licensor.email.strip.empty?
        file_names = Dir.entries(Rails.root.join('tmp', "#{time_started}", entry))
        file_names.select! { |string| (string != '.' && string != '..') }
        attachment_paths = file_names.map { |string| Rails.root.join('tmp', "#{time_started}", entry, string).to_s }
        royalty_email_text = "Hello,\n\nPlease find attached your Q#{quarter} #{year} producer reports. Please let me know if you have any questions, or if this report should be sent to a different person.\n\nKind Regards,\n\nMichael Rosenberg\nPresident\nFilm Movement"
        email_subject = "Your Q#{quarter} #{year} producer reports from Film Movement"
        sender = User.find_by(email: 'michael@filmmovement.com')
        begin
          emails = SendEmail.new(
            sender: sender,
            recipients: licensor.email.strip,
            cc: ['michael@filmmovement.com'],
            subject: email_subject,
            body: royalty_email_text,
            attachments: attachment_paths,
            email_type: 'statement',
            metadata: { licensor_id: licensor.id, quarter: quarter, year: year }
          ).call

          film_titles = file_names.map { |file_name| file_name.split('-')[0...-1].join('-').strip }
          sent_report_ids = []
          film_titles.each do |film_title|
            if match_data = film_title.match(/ package (?<timestamp>\d+)/)
              film_ids = crossed_films_hash[match_data[:timestamp]]
              film_ids.each do |film_id|
                report = RoyaltyReport.find_by(film_id: film_id, quarter: quarter, year: year)
                report.update!(date_sent: Date.today)
                sent_report_ids << report.id
              end
            else
              film = Film.find_by(title: film_title, film_type: ['Feature', 'TV Series'])
              film ||= Film.find_by(title: "#{film_title}?", film_type: ['Feature', 'TV Series'])
              raise "Film with title #{film_title} not found." if film.nil?

              film_id = film.id
              report = RoyaltyReport.find_by(film_id: film_id, quarter: quarter, year: year)
              report.update!(date_sent: Date.today)
              sent_report_ids << report.id
            end
          end

          emails.each do |email|
            email.update!(metadata: email.metadata.merge('report_ids' => sent_report_ids))
          end
        rescue => error
          p '-------------------------'
          p "FAILED TO SEND EMAIL TO #{licensor.name}"
          p "#{error.class}: #{error.message}"
          p error.backtrace.first
          p '-------------------------'
          new_line = (job.errors_text == '' ? '' : "\n")
          job.update({ errors_text: job.errors_text += (new_line + "Failed to send email to #{licensor.name}") })
        ensure
          job.update({ current_value: job.current_value + 1})
        end
      else
        new_line = (job.errors_text == '' ? '' : "\n")
        job.update({ errors_text: job.errors_text += (new_line + "Licensor #{licensor.name} is missing email.") })
      end
    end
    if job.errors_text.present?
      job.update({ status: :failed, first_line: 'Errors' })
    else
      job.update({ status: :success, first_line: 'Done!', second_line: false, metadata: { showSuccessMessageModal: true } })
    end
  end
end
