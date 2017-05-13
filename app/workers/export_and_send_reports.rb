class ExportAndSendReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(days_due, quarter, year, time_started)

    FileUtils.mkdir_p("#{Rails.root}/tmp/#{time_started}")

    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year)
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
      end
    end
    licensors = Licensor.all
    Dir.foreach("#{Rails.root}/tmp/#{time_started}") do |entry|
      next if entry == "." || entry == ".."
      p licensors[entry.to_i - 1].name
      # mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
      # message_params =  { from: 'peter@filmmovement.com',
      #                     to:   'plemiszki@gmail.com',
      #                     subject: 'The Ruby SDK is awesome!',
      #                     text:    'It is really easy to send a message!'
      #                   }
      # mg_client.send_message 'filmmovement.com', message_params
    end
  end
end
