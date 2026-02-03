class ExportAndSendLicensorReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(licensor_id, quarter, year, time_started)
    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")
    job = Job.find_by_job_id(time_started)
    licensor = Licensor.find(licensor_id)

    unless licensor.email.present? && !licensor.email.strip.empty?
      job.update({ status: :failed, first_line: 'Error', errors_text: "Licensor #{licensor.name} is missing email." })
      return
    end

    film_ids = Film.where(licensor_id: licensor_id).pluck(:id)
    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream])
                           .where(quarter: quarter, year: year, film_id: film_ids, date_sent: nil)

    if reports.empty?
      job.update({ status: :failed, first_line: 'Error', errors_text: "No unsent reports found for this licensor." })
      return
    end

    licensor_folder = "#{Rails.root}/tmp/#{time_started}/#{licensor.id}"
    FileUtils.mkdir_p(licensor_folder)

    crossed_films_done = []
    crossed_films_hash = {}

    reports.each do |report|
      return if job.reload.status == "killed"
      film = report.film

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

      job.update({ current_value: job.current_value + 1 })
    end

    job.update({ first_line: 'Sending Email', current_value: 0, total_value: 1 })

    file_names = Dir.entries(licensor_folder).reject { |f| f == '.' || f == '..' }
    attachment_paths = file_names.map { |string| Rails.root.join('tmp', "#{time_started}", licensor.id.to_s, string).to_s }

    royalty_email_text = "Hello,\n\nPlease find attached your Q#{quarter} #{year} producer reports. Please let me know if you have any questions, or if this report should be sent to a different person.\n\nKind Regards,\n\nMichael Rosenberg\nPresident\nFilm Movement"
    is_test_mode = ENV['TEST_MODE'] == 'true'
    recipient_email_address = (is_test_mode ? ENV['TEST_MODE_EMAIL'] : licensor.email.strip)
    cc_email_address = (is_test_mode ? nil : 'michael@filmmovement.com')
    email_subject = "Your Q#{quarter} #{year} producer reports from Film Movement"
    sender = User.find_by(email: 'michael@filmmovement.com')

    begin
      emails = SendEmail.new(
        sender: sender,
        recipients: recipient_email_address,
        cc: cc_email_address ? [cc_email_address] : [],
        subject: email_subject,
        body: royalty_email_text,
        attachments: attachment_paths,
        email_type: 'statement',
        metadata: { licensor_id: licensor.id, quarter: quarter, year: year }
      ).call

      report_ids = []
      file_names.each do |file_name|
        film_title = file_name.split('-')[0...-1].join('-').strip
        if match_data = film_title.match(/ package (?<timestamp>\d+)/)
          film_ids = crossed_films_hash[match_data[:timestamp]]
          film_ids.each do |film_id|
            report = RoyaltyReport.find_by(film_id: film_id, quarter: quarter, year: year)
            report.update!(date_sent: Date.today)
            report_ids << report.id
          end
        else
          film = Film.find_by(title: film_title, film_type: ['Feature', 'TV Series'])
          film ||= Film.find_by(title: "#{film_title}?", film_type: ['Feature', 'TV Series'])
          raise "Film with title #{film_title} not found." if film.nil?

          report = RoyaltyReport.find_by(film_id: film.id, quarter: quarter, year: year)
          report.update!(date_sent: Date.today)
          report_ids << report.id
        end
      end

      emails.each do |email|
        email.update!(metadata: email.metadata.merge('report_ids' => report_ids))
      end

      job.update({ status: :success, first_line: 'Done!', second_line: false, current_value: 1, metadata: { showSuccessMessageModal: true } })
    rescue => error
      p '-------------------------'
      p "FAILED TO SEND EMAIL TO #{licensor.name}"
      p "#{error.class}: #{error.message}"
      p error.backtrace.first
      p '-------------------------'
      job.update({ status: :failed, first_line: 'Error', errors_text: "Failed to send email to #{licensor.name}: #{error.message}" })
    end
  end
end
