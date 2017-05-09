class ExportAllReports
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform(days_due, quarter, year, time_started)

    # cancel any other running jobs - i'll have to figure out a different solution for multiple users
    # jobs = Sidekiq::Workers.new.size
    # Sidekiq::Workers.new.each do |pid, tid, work|
    #   job_id = work['payload']['jid']
    #   Sidekiq.redis {|c| c.setex("cancelled-#{job_id}", 86400, 1) }
    # end
    # sleep(3) unless jobs == 0

    # File.delete(Rails.root.join('statements', 'statements.zip')) if File.exist?(Rails.root.join('statements', 'statements.zip'))
    # Pathname.new(Rails.root.join('statements', 'amount due')).children.each { |file| file.unlink unless file.basename.to_s == '.gitignore' }
    # Pathname.new(Rails.root.join('statements', 'no amount due')).children.each { |file| file.unlink unless file.basename.to_s == '.gitignore' }

    FileUtils.mkdir_p("#{Rails.root}/jobs/#{time_started}/amount due")
    FileUtils.mkdir_p("#{Rails.root}/jobs/#{time_started}/no amount due")

    reports = RoyaltyReport.includes(film: [:licensor], royalty_revenue_streams: [:revenue_stream]).where(quarter: quarter, year: year)
    reports.each do |report|
      return if Sidekiq.redis {|c| c.exists("cancelled-#{jid}") }
      if (days_due == "all" || report.film.days_statement_due == days_due.to_i) && report.film.export_reports
        p '---------------------------'
        p "#{report.film.title} (#{jid})"
        p '---------------------------'
        report.calculate!
        report.export!(time_started)
      end
    end

    files = Dir.glob("#{Rails.root}/jobs/#{time_started}/amount due/*.pdf")
    files2 = Dir.glob("#{Rails.root}/jobs/#{time_started}/no amount due/*.pdf")

    require 'zip'
    Zip::File.open(Rails.root.join('jobs', time_started, 'statements.zip'), Zip::File::CREATE) do |zip|
      files.each do |file|
        zip.add("amount due/#{file.split('/')[-1]}", file)
      end
      files2.each do |file|
        zip.add("no amount due/#{file.split('/')[-1]}", file)
      end
    end
  end
end
